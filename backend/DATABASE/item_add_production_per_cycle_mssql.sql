-- 품목 테이블(TCO403)에 가공 1회당 생산량 컬럼 추가
-- 실행일: 2026-02-03

-- 컬럼이 존재하지 않을 경우만 추가
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('TCO403') 
    AND name = 'PRODUCTION_PER_CYCLE'
)
BEGIN
    ALTER TABLE TCO403
    ADD PRODUCTION_PER_CYCLE NVARCHAR(20) NULL DEFAULT '0';
    
    PRINT 'PRODUCTION_PER_CYCLE 컬럼이 추가되었습니다.';
END
ELSE
BEGIN
    PRINT 'PRODUCTION_PER_CYCLE 컬럼이 이미 존재합니다.';
END
GO

-- 컬럼 설명 추가
IF NOT EXISTS (
    SELECT 1 
    FROM sys.extended_properties 
    WHERE major_id = OBJECT_ID('TCO403') 
    AND minor_id = (
        SELECT column_id 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('TCO403') 
        AND name = 'PRODUCTION_PER_CYCLE'
    )
    AND name = 'MS_Description'
)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'가공 1회당 생산량 (설비에서 한번 찍을때마다 생산되는 수량)', 
        @level0type = N'SCHEMA', 
        @level0name = N'dbo', 
        @level1type = N'TABLE', 
        @level1name = N'TCO403', 
        @level2type = N'COLUMN', 
        @level2name = N'PRODUCTION_PER_CYCLE';
        
    PRINT '컬럼 설명이 추가되었습니다.';
END
GO
