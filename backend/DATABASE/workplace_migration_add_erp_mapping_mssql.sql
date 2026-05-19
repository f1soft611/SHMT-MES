-- ============================================================================
-- SHMT-MES: 작업장관리 ERP 작업장 매핑 필드 추가 마이그레이션
-- ============================================================================
-- 설명: TPR101 테이블에 ERP_WORKPLACE_MAPPING 컬럼 추가
-- 작성일: 2026-05-19
-- DB: MSSQL Server
-- ============================================================================

-- 1. ERP_WORKPLACE_MAPPING 컬럼 추가 (이미 없는 경우에만 추가)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TPR101' AND COLUMN_NAME = 'ERP_WORKPLACE_MAPPING')
BEGIN
    ALTER TABLE TPR101
    ADD ERP_WORKPLACE_MAPPING NVARCHAR(50) NULL;
    
    PRINT 'Column ERP_WORKPLACE_MAPPING added to TPR101 successfully.';
END
ELSE
BEGIN
    PRINT 'Column ERP_WORKPLACE_MAPPING already exists in TPR101.';
END;

-- 2. (선택사항) 성능 최적화를 위한 인덱스 생성
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR101_ERP_WORKPLACE_MAPPING')
BEGIN
    CREATE NONCLUSTERED INDEX IX_TPR101_ERP_WORKPLACE_MAPPING
    ON TPR101 (ERP_WORKPLACE_MAPPING) 
    WHERE ERP_WORKPLACE_MAPPING IS NOT NULL;
    
    PRINT 'Index IX_TPR101_ERP_WORKPLACE_MAPPING created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_TPR101_ERP_WORKPLACE_MAPPING already exists.';
END;

-- 3. 검증: 컬럼 추가 확인
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TPR101' AND COLUMN_NAME = 'ERP_WORKPLACE_MAPPING';
