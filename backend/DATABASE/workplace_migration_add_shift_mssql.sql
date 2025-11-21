-- 작업장 작업자 테이블에 근무구분(shift) 컬럼 추가
-- Migration script for adding shift column to TB_WORKPLACE_WORKER table

-- TB_WORKPLACE_WORKER 테이블에 SHIFT 컬럼 추가 (MSSQL)
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TB_WORKPLACE_WORKER]') 
    AND name = 'SHIFT'
)
BEGIN
    ALTER TABLE [dbo].[TB_WORKPLACE_WORKER]
    ADD [SHIFT] NVARCHAR(20) NULL;
    
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'근무구분 (DAY/NIGHT/SWING)', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', 
        @level2type = N'COLUMN', @level2name = N'SHIFT';
END
GO

-- TPR106 테이블에 SHIFT 컬럼 추가 (MSSQL - 실제 운영 테이블명이 TPR106인 경우)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR106]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[TPR106]') 
        AND name = 'SHIFT'
    )
    BEGIN
        ALTER TABLE [dbo].[TPR106]
        ADD [SHIFT] NVARCHAR(20) NULL;
        
        EXEC sys.sp_addextendedproperty 
            @name = N'MS_Description', 
            @value = N'근무구분 (DAY/NIGHT/SWING)', 
            @level0type = N'SCHEMA', @level0name = N'dbo', 
            @level1type = N'TABLE', @level1name = N'TPR106', 
            @level2type = N'COLUMN', @level2name = N'SHIFT';
    END
END
GO

PRINT 'Shift column migration completed successfully';
