-- Legacy cleanup for old createDays-expanded production plans
-- Rule:
--  1) keep the newest row per planGroupId for each original master when multiple rows were created by createDays
--  2) preserve the parent master row and summary totals
--  3) keep row mapping data consistent with the new 1:1 storage model

BEGIN TRY
    BEGIN TRANSACTION;

    -- Step 1: mark duplicated plan rows created by the old createDays expansion flow.
    WITH ranked AS (
        SELECT
            p.[PRODPLAN_ID],
            p.[PRODPLAN_DETAIL_ID],
            p.[PRODPLAN_SEQ],
            p.[PRODPLAN_DATE],
            p.[CREATE_DAYS],
            ROW_NUMBER() OVER (
                PARTITION BY p.[PRODPLAN_ID], p.[PLAN_GROUP_ID], p.[PLAN_DATE]
                ORDER BY p.[PRODPLAN_SEQ] DESC, p.[PRODPLAN_DETAIL_ID] DESC
            ) AS rn
        FROM [dbo].[TPR301] p
        WHERE p.[CREATE_DAYS] > 1
    )
    UPDATE p
    SET p.[NOTE] = COALESCE(p.[NOTE], '') + '[LEGACY_DUPLICATE_CANDIDATE]'
    FROM [dbo].[TPR301] p
    INNER JOIN ranked r
        ON p.[PRODPLAN_DETAIL_ID] = r.[PRODPLAN_DETAIL_ID]
    WHERE r.rn > 1;

    -- Step 2: normalize legacy group rows to a single row per master plan.
    WITH dedup AS (
        SELECT
            m.[PRODPLAN_ID],
            MIN(m.[PRODPLAN_DETAIL_ID]) AS KEEP_DETAIL_ID,
            MAX(m.[PRODPLAN_SEQ]) AS KEEP_SEQ,
            SUM(CAST(m.[PLAN_QTY] AS BIGINT)) AS TOTAL_PLAN_QTY
        FROM [dbo].[TPR301] m
        WHERE m.[PLAN_GROUP_ID] IS NOT NULL
          AND m.[CREATE_DAYS] > 1
        GROUP BY m.[PRODPLAN_ID]
    )
    UPDATE d
    SET d.[PLAN_QTY] = dedup.[TOTAL_PLAN_QTY]
    FROM [dbo].[TPR301] d
    INNER JOIN dedup
        ON d.[PRODPLAN_DETAIL_ID] = dedup.[KEEP_DETAIL_ID];

    -- Step 3: keep only the canonical row and clear legacy repeated createDays rows.
    WITH canonical AS (
        SELECT
            p.[PRODPLAN_ID],
            MIN(p.[PRODPLAN_DETAIL_ID]) AS KEEP_DETAIL_ID
        FROM [dbo].[TPR301] p
        WHERE p.[CREATE_DAYS] > 1
        GROUP BY p.[PRODPLAN_ID]
    )
    DELETE FROM p
    FROM [dbo].[TPR301] p
    INNER JOIN canonical c
        ON p.[PRODPLAN_ID] = c.[PRODPLAN_ID]
    WHERE p.[PRODPLAN_DETAIL_ID] <> c.[KEEP_DETAIL_ID]
      AND p.[CREATE_DAYS] > 1;

    UPDATE [dbo].[TPR301M]
    SET [CREATE_DAYS] = 1,
        [TOTAL_GROUP_COUNT] = 1,
        [ITEM_INPUT_TYPE] = COALESCE([ITEM_INPUT_TYPE], 'NORMAL')
    WHERE [CREATE_DAYS] > 1;

    UPDATE [dbo].[TPR301]
    SET [CREATE_DAYS] = 1,
        [GROUP_SEQ] = 1,
        [TOTAL_GROUP_COUNT] = 1,
        [ITEM_INPUT_TYPE] = COALESCE([ITEM_INPUT_TYPE], 'NORMAL')
    WHERE [CREATE_DAYS] > 1;

    COMMIT TRANSACTION;
    PRINT 'Legacy createDays duplicate rows cleaned and normalized to single-row storage.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR('Legacy cleanup failed: %s', 16, 1, @msg);
END CATCH;
GO
