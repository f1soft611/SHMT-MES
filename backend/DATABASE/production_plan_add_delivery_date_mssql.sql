-- TPR301 테이블에 DELIVERY_DATE 컬럼 추가

-- DELIVERY_DATE 컬럼이 없는 경우에만 추가
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TPR301]') 
    AND name = 'DELIVERY_DATE'
)
BEGIN
    ALTER TABLE [dbo].[TPR301]
    ADD [DELIVERY_DATE] NVARCHAR(8) NULL;  -- 납기일 (YYYYMMDD)
    
    PRINT 'TPR301 테이블에 DELIVERY_DATE 컬럼이 추가되었습니다.';
END
ELSE
BEGIN
    PRINT 'TPR301 테이블에 DELIVERY_DATE 컬럼이 이미 존재합니다.';
END
GO

-- 컬럼 설명 추가
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TPR301]') 
    AND name = 'DELIVERY_DATE'
)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'납기일 (YYYYMMDD)', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR301',
        @level2type = N'COLUMN', @level2name = N'DELIVERY_DATE';
END
GO
