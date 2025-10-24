-- 공정 관리 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_PROCESS]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_PROCESS] (
        [PROCESS_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [PROCESS_CODE] NVARCHAR(50) NOT NULL,
        [PROCESS_NAME] NVARCHAR(100) NOT NULL,
        [DESCRIPTION] NVARCHAR(500) NULL,
        [PROCESS_TYPE] NVARCHAR(50) NULL,
        [EQUIPMENT_INTEGRATION_YN] NCHAR(1) NOT NULL DEFAULT 'N',
        [STATUS] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [SORT_ORDER] INT NULL,
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [UK_PROCESS_CODE] UNIQUE ([PROCESS_CODE])
    );
END
GO

-- 공정 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_PROCESS') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'공정 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_PROCESS';
END
GO

-- 공정별 작업장 매핑 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_PROCESS_WORKPLACE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_PROCESS_WORKPLACE] (
        [PROCESS_WORKPLACE_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [PROCESS_ID] NVARCHAR(20) NOT NULL,
        [WORKPLACE_ID] NVARCHAR(20) NOT NULL,
        [WORKPLACE_NAME] NVARCHAR(100) NOT NULL,
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [FK_PROCESS_WORKPLACE_PROCESS] FOREIGN KEY ([PROCESS_ID]) 
            REFERENCES [dbo].[TB_PROCESS]([PROCESS_ID]) ON DELETE CASCADE,
        CONSTRAINT [UK_PROCESS_WORKPLACE] UNIQUE ([PROCESS_ID], [WORKPLACE_ID])
    );
END
GO

-- 공정별 작업장 매핑 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_PROCESS_WORKPLACE') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'공정별 작업장 매핑 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_PROCESS_WORKPLACE';
END
GO

-- 공정별 불량코드 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_PROCESS_DEFECT]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_PROCESS_DEFECT] (
        [PROCESS_DEFECT_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [PROCESS_ID] NVARCHAR(20) NOT NULL,
        [DEFECT_CODE] NVARCHAR(50) NOT NULL,
        [DEFECT_NAME] NVARCHAR(100) NOT NULL,
        [DEFECT_TYPE] NVARCHAR(50) NULL,
        [DESCRIPTION] NVARCHAR(500) NULL,
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [FK_PROCESS_DEFECT_PROCESS] FOREIGN KEY ([PROCESS_ID]) 
            REFERENCES [dbo].[TB_PROCESS]([PROCESS_ID]) ON DELETE CASCADE,
        CONSTRAINT [UK_PROCESS_DEFECT_CODE] UNIQUE ([PROCESS_ID], [DEFECT_CODE])
    );
END
GO

-- 공정별 불량코드 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_PROCESS_DEFECT') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'공정별 불량코드 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_PROCESS_DEFECT';
END
GO

-- 공정별 검사항목 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_PROCESS_INSPECTION]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_PROCESS_INSPECTION] (
        [PROCESS_INSPECTION_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [PROCESS_ID] NVARCHAR(20) NOT NULL,
        [INSPECTION_CODE] NVARCHAR(50) NOT NULL,
        [INSPECTION_NAME] NVARCHAR(100) NOT NULL,
        [INSPECTION_TYPE] NVARCHAR(50) NULL,
        [STANDARD_VALUE] NVARCHAR(100) NULL,
        [UPPER_LIMIT] DECIMAL(18, 4) NULL,
        [LOWER_LIMIT] DECIMAL(18, 4) NULL,
        [UNIT] NVARCHAR(20) NULL,
        [DESCRIPTION] NVARCHAR(500) NULL,
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [FK_PROCESS_INSPECTION_PROCESS] FOREIGN KEY ([PROCESS_ID]) 
            REFERENCES [dbo].[TB_PROCESS]([PROCESS_ID]) ON DELETE CASCADE,
        CONSTRAINT [UK_PROCESS_INSPECTION_CODE] UNIQUE ([PROCESS_ID], [INSPECTION_CODE])
    );
END
GO

-- 공정별 검사항목 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_PROCESS_INSPECTION') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'공정별 검사항목 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_PROCESS_INSPECTION';
END
GO

-- 컬럼별 설명 추가 (TB_PROCESS)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'PROCESS_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'PROCESS_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'PROCESS_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정 설명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'DESCRIPTION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정 타입', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'PROCESS_TYPE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비연동공정 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'EQUIPMENT_INTEGRATION_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'공정 상태 (ACTIVE/INACTIVE)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'STATUS';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'USE_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'정렬 순서', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'SORT_ORDER';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'REG_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'REG_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'UPD_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_PROCESS', @level2type = N'COLUMN', @level2name = N'UPD_DT';
GO

-- ID 생성을 위한 테이블 데이터 추가 (IDS 테이블이 존재한다고 가정)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- TB_PROCESS ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_PROCESS')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_PROCESS', 1);
    END
    
    -- TB_PROCESS_WORKPLACE ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_PROCESS_WORKPLACE')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_PROCESS_WORKPLACE', 1);
    END
    
    -- TB_PROCESS_DEFECT ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_PROCESS_DEFECT')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_PROCESS_DEFECT', 1);
    END
    
    -- TB_PROCESS_INSPECTION ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_PROCESS_INSPECTION')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_PROCESS_INSPECTION', 1);
    END
END
GO

-- 인덱스 추가 (성능 향상을 위해)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_PROCESS') AND name = 'IX_TB_PROCESS_STATUS')
BEGIN
    CREATE INDEX IX_TB_PROCESS_STATUS ON TB_PROCESS (STATUS);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_PROCESS') AND name = 'IX_TB_PROCESS_USE_YN')
BEGIN
    CREATE INDEX IX_TB_PROCESS_USE_YN ON TB_PROCESS (USE_YN);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_PROCESS_WORKPLACE') AND name = 'IX_TB_PROCESS_WORKPLACE_PROCESS_ID')
BEGIN
    CREATE INDEX IX_TB_PROCESS_WORKPLACE_PROCESS_ID ON TB_PROCESS_WORKPLACE (PROCESS_ID);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_PROCESS_DEFECT') AND name = 'IX_TB_PROCESS_DEFECT_PROCESS_ID')
BEGIN
    CREATE INDEX IX_TB_PROCESS_DEFECT_PROCESS_ID ON TB_PROCESS_DEFECT (PROCESS_ID);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_PROCESS_INSPECTION') AND name = 'IX_TB_PROCESS_INSPECTION_PROCESS_ID')
BEGIN
    CREATE INDEX IX_TB_PROCESS_INSPECTION_PROCESS_ID ON TB_PROCESS_INSPECTION (PROCESS_ID);
END
GO

-- 샘플 데이터 삽입
IF NOT EXISTS (SELECT 1 FROM TB_PROCESS WHERE PROCESS_ID = 'PR001')
BEGIN
INSERT INTO TB_PROCESS (
    PROCESS_ID, PROCESS_CODE, PROCESS_NAME, DESCRIPTION,
    PROCESS_TYPE, EQUIPMENT_INTEGRATION_YN, STATUS, USE_YN, SORT_ORDER, REG_USER_ID
) VALUES
      ('PR001', 'BODY-COMP', 'BODY-COMP 조립', '차체 조립 공정', '조립', 'N', 'ACTIVE', 'Y', 1, 'socra710'),
      ('PR002', 'PAINTING', '도장', '표면 도장 처리 공정', '도장', 'Y', 'ACTIVE', 'Y', 2, 'socra710'),
      ('PR003', 'CUTTING', 'CUTTING 가공', '금속 절단 가공 공정', '가공', 'Y', 'ACTIVE', 'Y', 3, 'socra710'),
      ('PR004', 'QC-INSPECTION', 'QC 검사', '품질 검사 공정', '검사', 'N', 'ACTIVE', 'Y', 4, 'socra710'),
      ('PR005', 'PACKAGING', '포장', '최종 포장 공정', '포장', 'N', 'ACTIVE', 'Y', 5, 'socra710');
END
GO

-- 공정별 작업장 매핑 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM TB_PROCESS_WORKPLACE WHERE PROCESS_WORKPLACE_ID = 'PW001')
BEGIN
INSERT INTO TB_PROCESS_WORKPLACE (
    PROCESS_WORKPLACE_ID, PROCESS_ID, WORKPLACE_ID, WORKPLACE_NAME,
    USE_YN, REG_USER_ID
) VALUES
      ('PW001', 'PR001', 'WP001', '1공장 조립라인', 'Y', 'socra710'),
      ('PW002', 'PR002', 'WP003', '3공장 도장부', 'Y', 'socra710'),
      ('PW003', 'PR004', 'WP004', '품질검사실', 'Y', 'socra710');
END
GO

-- 공정별 불량코드 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM TB_PROCESS_DEFECT WHERE PROCESS_DEFECT_ID = 'PD001')
BEGIN
INSERT INTO TB_PROCESS_DEFECT (
    PROCESS_DEFECT_ID, PROCESS_ID, DEFECT_CODE, DEFECT_NAME,
    DEFECT_TYPE, DESCRIPTION, USE_YN, REG_USER_ID
) VALUES
      ('PD001', 'PR001', 'DF001', '조립불량', '조립', '부품 조립 불량', 'Y', 'socra710'),
      ('PD002', 'PR001', 'DF002', '치수불량', '치수', '치수 규격 미달', 'Y', 'socra710'),
      ('PD003', 'PR002', 'DF003', '도장불량', '도장', '도장 표면 불량', 'Y', 'socra710'),
      ('PD004', 'PR004', 'DF004', '외관불량', '외관', '외관 검사 불합격', 'Y', 'socra710');
END
GO

-- 공정별 검사항목 샘플 데이터
IF NOT EXISTS (SELECT 1 FROM TB_PROCESS_INSPECTION WHERE PROCESS_INSPECTION_ID = 'PI001')
BEGIN
INSERT INTO TB_PROCESS_INSPECTION (
    PROCESS_INSPECTION_ID, PROCESS_ID, INSPECTION_CODE, INSPECTION_NAME,
    INSPECTION_TYPE, STANDARD_VALUE, UPPER_LIMIT, LOWER_LIMIT, UNIT,
    DESCRIPTION, USE_YN, REG_USER_ID
) VALUES
      ('PI001', 'PR001', 'INS001', '조립강도', '물리', '100', 110, 90, 'N', '조립 강도 측정', 'Y', 'socra710'),
      ('PI002', 'PR001', 'INS002', '치수정밀도', '치수', '±0.5', 0.5, -0.5, 'mm', '치수 정밀도 측정', 'Y', 'socra710'),
      ('PI003', 'PR002', 'INS003', '도막두께', '도장', '50', 60, 40, 'μm', '도막 두께 측정', 'Y', 'socra710'),
      ('PI004', 'PR004', 'INS004', '외관검사', '외관', 'PASS', NULL, NULL, NULL, '육안 외관 검사', 'Y', 'socra710');
END
GO
