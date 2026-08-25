-- Production plan v2 migration for 1:1 TPR301M / TPR301 storage + direct-item grouping support
-- Purpose:
-- 1) keep historical plan rows compatible
-- 2) new plans store a single TPR301 row per plan
-- 3) allow UI to group direct item selections without creating extra DB rows

IF COL_LENGTH('dbo.TPR301M', 'ITEM_INPUT_TYPE') IS NULL
BEGIN
    ALTER TABLE [dbo].[TPR301M]
        ADD [ITEM_INPUT_TYPE] NVARCHAR(20) NOT NULL DEFAULT 'NORMAL';
END
GO

IF COL_LENGTH('dbo.TPR301M', 'DIRECT_GROUP_ID') IS NULL
BEGIN
    ALTER TABLE [dbo].[TPR301M]
        ADD [DIRECT_GROUP_ID] NVARCHAR(50) NULL;
END
GO

IF COL_LENGTH('dbo.TPR301', 'ITEM_INPUT_TYPE') IS NULL
BEGIN
    ALTER TABLE [dbo].[TPR301]
        ADD [ITEM_INPUT_TYPE] NVARCHAR(20) NOT NULL DEFAULT 'NORMAL';
END
GO

IF COL_LENGTH('dbo.TPR301', 'DIRECT_GROUP_ID') IS NULL
BEGIN
    ALTER TABLE [dbo].[TPR301]
        ADD [DIRECT_GROUP_ID] NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_TPR301M_DIRECT_GROUP'
      AND object_id = OBJECT_ID('dbo.TPR301M')
)
BEGIN
    CREATE INDEX IX_TPR301M_DIRECT_GROUP
        ON [dbo].[TPR301M] ([DIRECT_GROUP_ID]);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_TPR301_DIRECT_GROUP'
      AND object_id = OBJECT_ID('dbo.TPR301')
)
BEGIN
    CREATE INDEX IX_TPR301_DIRECT_GROUP
        ON [dbo].[TPR301] ([DIRECT_GROUP_ID]);
END
GO

UPDATE [dbo].[TPR301M]
SET [ITEM_INPUT_TYPE] = 'NORMAL'
WHERE [ITEM_INPUT_TYPE] IS NULL OR [ITEM_INPUT_TYPE] = '';
GO

UPDATE [dbo].[TPR301]
SET [ITEM_INPUT_TYPE] = 'NORMAL'
WHERE [ITEM_INPUT_TYPE] IS NULL OR [ITEM_INPUT_TYPE] = '';
GO

PRINT 'Production plan v2 migration completed successfully';
GO
