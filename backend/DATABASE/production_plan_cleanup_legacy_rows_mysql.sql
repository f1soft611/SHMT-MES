-- Legacy cleanup for old createDays-expanded production plans
-- Rule:
--  1) keep the newest row per planGroupId for each original master when multiple rows were created by createDays
--  2) preserve the parent master row and summary totals
--  3) keep row mapping data consistent with the new 1:1 storage model

START TRANSACTION;

-- Only canonical rows remain; duplicates created by createDays are removed.
WITH ranked AS (
    SELECT
        p.PRODPLAN_ID,
        p.PRODPLAN_DETAIL_ID,
        ROW_NUMBER() OVER (
            PARTITION BY p.PRODPLAN_ID, p.PLAN_GROUP_ID, p.PLAN_DATE
            ORDER BY p.PRODPLAN_SEQ DESC, p.PRODPLAN_DETAIL_ID DESC
        ) AS rn
    FROM TPR301 p
    WHERE p.CREATE_DAYS > 1
)
DELETE FROM TPR301
WHERE PRODPLAN_DETAIL_ID IN (
    SELECT PRODPLAN_DETAIL_ID
    FROM ranked
    WHERE rn > 1
);

UPDATE TPR301M
SET CREATE_DAYS = 1,
    TOTAL_GROUP_COUNT = 1,
    ITEM_INPUT_TYPE = COALESCE(ITEM_INPUT_TYPE, 'NORMAL')
WHERE CREATE_DAYS > 1;

UPDATE TPR301
SET CREATE_DAYS = 1,
    GROUP_SEQ = 1,
    TOTAL_GROUP_COUNT = 1,
    ITEM_INPUT_TYPE = COALESCE(ITEM_INPUT_TYPE, 'NORMAL')
WHERE CREATE_DAYS > 1;

COMMIT;
SELECT 'Legacy createDays duplicate rows cleaned and normalized to single-row storage.' AS result;
