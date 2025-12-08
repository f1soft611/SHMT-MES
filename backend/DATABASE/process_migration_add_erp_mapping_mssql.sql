-- 공정 테이블에 ERP 공정 매핑 컬럼 추가
-- 작성일: 2025-12-08
-- 설명: ERP 공정 매핑 기능 추가를 위한 컬럼 추가

-- 1. TPR102 테이블에 ERP_PROCESS_MAPPING 컬럼 추가
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'TPR102') 
    AND name = 'ERP_PROCESS_MAPPING'
)
BEGIN
    ALTER TABLE TPR102
    ADD ERP_PROCESS_MAPPING NVARCHAR(50) NULL;
    
    PRINT 'TPR102 테이블에 ERP_PROCESS_MAPPING 컬럼이 추가되었습니다.';
END
ELSE
BEGIN
    PRINT 'TPR102 테이블에 ERP_PROCESS_MAPPING 컬럼이 이미 존재합니다.';
END
GO

-- 2. 컬럼 설명 추가
IF NOT EXISTS (
    SELECT * FROM sys.extended_properties 
    WHERE major_id = OBJECT_ID('TPR102') 
    AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('TPR102') AND name = 'ERP_PROCESS_MAPPING')
    AND name = N'MS_Description'
)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'ERP 공정 매핑 코드 (공통코드 com008 참조)', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR102',
        @level2type = N'COLUMN', @level2name = N'ERP_PROCESS_MAPPING';
    
    PRINT 'ERP_PROCESS_MAPPING 컬럼 설명이 추가되었습니다.';
END
GO

-- 3. 인덱스 생성 (선택사항 - ERP 공정 매핑으로 조회가 빈번한 경우)
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'TPR102') 
    AND name = N'IX_TPR102_ERP_PROCESS_MAPPING'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_TPR102_ERP_PROCESS_MAPPING
    ON TPR102 (ERP_PROCESS_MAPPING)
    WHERE ERP_PROCESS_MAPPING IS NOT NULL;
    
    PRINT 'ERP_PROCESS_MAPPING 인덱스가 생성되었습니다.';
END
GO

PRINT '공정 테이블 ERP 매핑 컬럼 추가 마이그레이션이 완료되었습니다.';
GO
