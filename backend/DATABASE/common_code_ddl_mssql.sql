-- MES 공통코드 관리 테이블
-- 메인 공통코드 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MES_CCMMN_CODE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MES_CCMMN_CODE] (
        [CODE_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [CODE_ID_NM] NVARCHAR(100) NOT NULL,
        [CODE_ID_DC] NVARCHAR(500) NULL,
        [USE_AT] NCHAR(1) NOT NULL DEFAULT 'Y',
        [CL_CODE] NVARCHAR(20) NULL,
        [FRST_REGIST_PNTTM] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [FRST_REGISTER_ID] NVARCHAR(20) NULL,
        [LAST_UPDT_PNTTM] DATETIME2 NULL,
        [LAST_UPDUSR_ID] NVARCHAR(20) NULL
    );
END
GO

-- 메인 공통코드 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('MES_CCMMN_CODE') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'MES 공통코드 메인 테이블', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE';
END
GO

-- 상세 공통코드 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MES_CCMMNDETAIL_CODE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MES_CCMMNDETAIL_CODE] (
        [CODE_ID] NVARCHAR(20) NOT NULL,
        [CODE] NVARCHAR(50) NOT NULL,
        [CODE_NM] NVARCHAR(100) NOT NULL,
        [CODE_DC] NVARCHAR(500) NULL,
        [USE_AT] NCHAR(1) NOT NULL DEFAULT 'Y',
        [FRST_REGIST_PNTTM] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [FRST_REGISTER_ID] NVARCHAR(20) NULL,
        [LAST_UPDT_PNTTM] DATETIME2 NULL,
        [LAST_UPDUSR_ID] NVARCHAR(20) NULL,
        
        CONSTRAINT [PK_MES_CCMMNDETAIL_CODE] PRIMARY KEY ([CODE_ID], [CODE]),
        CONSTRAINT [FK_MES_CCMMNDETAIL_CODE] FOREIGN KEY ([CODE_ID]) 
            REFERENCES [dbo].[MES_CCMMN_CODE]([CODE_ID]) ON DELETE CASCADE
    );
END
GO

-- 상세 공통코드 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('MES_CCMMNDETAIL_CODE') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'MES 공통코드 상세 테이블', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE';
END
GO

-- 컬럼별 설명 추가 (MES_CCMMN_CODE)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드 ID (PK)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'CODE_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드 ID 명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'CODE_ID_NM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드 ID 설명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'CODE_ID_DC';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'USE_AT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'분류 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'CL_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최초 등록 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'FRST_REGIST_PNTTM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최초 등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'FRST_REGISTER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최종 수정 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'LAST_UPDT_PNTTM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최종 수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMN_CODE', @level2type = N'COLUMN', @level2name = N'LAST_UPDUSR_ID';
GO

-- 컬럼별 설명 추가 (MES_CCMMNDETAIL_CODE)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드 ID (FK)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'CODE_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'CODE_NM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'코드 설명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'CODE_DC';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'USE_AT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최초 등록 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'FRST_REGIST_PNTTM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최초 등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'FRST_REGISTER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최종 수정 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'LAST_UPDT_PNTTM';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'최종 수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_CCMMNDETAIL_CODE', @level2type = N'COLUMN', @level2name = N'LAST_UPDUSR_ID';
GO

-- ID 생성을 위한 테이블 데이터 추가 (IDS 테이블이 존재한다고 가정)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- MES_CCMMN_CODE ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'MES_CCMMN_CODE')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('MES_CCMMN_CODE', 1);
    END
    
    -- MES_CCMMNDETAIL_CODE는 복합키이므로 ID 생성 불필요
END
GO

-- 인덱스 추가 (성능 향상을 위해)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('MES_CCMMN_CODE') AND name = 'IX_MES_CCMMN_CODE_USE_AT')
BEGIN
    CREATE INDEX IX_MES_CCMMN_CODE_USE_AT ON MES_CCMMN_CODE (USE_AT);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('MES_CCMMNDETAIL_CODE') AND name = 'IX_MES_CCMMNDETAIL_CODE_USE_AT')
BEGIN
    CREATE INDEX IX_MES_CCMMNDETAIL_CODE_USE_AT ON MES_CCMMNDETAIL_CODE (USE_AT);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('MES_CCMMNDETAIL_CODE') AND name = 'IX_MES_CCMMNDETAIL_CODE_CODE_ID')
BEGIN
    CREATE INDEX IX_MES_CCMMNDETAIL_CODE_CODE_ID ON MES_CCMMNDETAIL_CODE (CODE_ID);
END
GO

-- 샘플 데이터 삽입 (불량코드, 검사항목, 중지항목용)
IF NOT EXISTS (SELECT 1 FROM MES_CCMMN_CODE WHERE CODE_ID = 'DEFECT_CODE')
BEGIN
INSERT INTO MES_CCMMN_CODE (CODE_ID, CODE_ID_NM, CODE_ID_DC, USE_AT, CL_CODE, FRST_REGISTER_ID) 
VALUES 
    ('DEFECT_CODE', '불량코드', '공정별 불량 코드 관리', 'Y', 'PROCESS', 'socra710'),
    ('INSPECTION_CODE', '검사항목코드', '공정별 검사 항목 관리', 'Y', 'PROCESS', 'socra710'),
    ('STOP_ITEM_CODE', '중지항목코드', '공정별 중지 항목 관리', 'Y', 'PROCESS', 'socra710');
END
GO

-- 불량코드 상세 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM MES_CCMMNDETAIL_CODE WHERE CODE_ID = 'DEFECT_CODE' AND CODE = 'DF001')
BEGIN
INSERT INTO MES_CCMMNDETAIL_CODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGISTER_ID) 
VALUES 
    ('DEFECT_CODE', 'DF001', '조립불량', '부품 조립 불량', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF002', '치수불량', '치수 규격 미달', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF003', '도장불량', '도장 표면 불량', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF004', '외관불량', '외관 검사 불합격', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF005', '긁힘', '제품 표면 긁힘', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF006', '찍힘', '제품 표면 찍힘', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF007', '변형', '제품 변형', 'Y', 'socra710'),
    ('DEFECT_CODE', 'DF008', '오염', '제품 오염', 'Y', 'socra710');
END
GO

-- 검사항목 상세 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM MES_CCMMNDETAIL_CODE WHERE CODE_ID = 'INSPECTION_CODE' AND CODE = 'INS001')
BEGIN
INSERT INTO MES_CCMMNDETAIL_CODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGISTER_ID) 
VALUES 
    ('INSPECTION_CODE', 'INS001', '조립강도', '조립 강도 측정', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS002', '치수정밀도', '치수 정밀도 측정', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS003', '도막두께', '도막 두께 측정', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS004', '외관검사', '육안 외관 검사', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS005', '중량검사', '제품 중량 검사', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS006', '경도검사', '재질 경도 검사', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS007', '전기저항', '전기 저항 측정', 'Y', 'socra710'),
    ('INSPECTION_CODE', 'INS008', '내압검사', '내압 시험', 'Y', 'socra710');
END
GO

-- 중지항목 상세 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM MES_CCMMNDETAIL_CODE WHERE CODE_ID = 'STOP_ITEM_CODE' AND CODE = 'ST001')
BEGIN
INSERT INTO MES_CCMMNDETAIL_CODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGISTER_ID) 
VALUES 
    ('STOP_ITEM_CODE', 'ST001', '설비고장', '설비 고장으로 인한 중지', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST002', '자재부족', '원자재 또는 부자재 부족', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST003', '품질문제', '품질 이슈로 인한 작업 중지', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST004', '인력부족', '작업 인력 부족', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST005', '금형교체', '금형 또는 지그 교체', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST006', '정전', '전력 공급 중단', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST007', '점검정비', '정기 점검 및 정비', 'Y', 'socra710'),
    ('STOP_ITEM_CODE', 'ST008', '기타', '기타 사유', 'Y', 'socra710');
END
GO
