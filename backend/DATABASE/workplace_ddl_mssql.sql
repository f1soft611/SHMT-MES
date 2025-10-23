-- 작업장 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_WORKPLACE]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_WORKPLACE] (
        [WORKPLACE_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [WORKPLACE_CODE] NVARCHAR(50) NOT NULL,
        [WORKPLACE_NAME] NVARCHAR(100) NOT NULL,
        [DESCRIPTION] NVARCHAR(500) NULL,
        [LOCATION] NVARCHAR(200) NULL,
        [WORKPLACE_TYPE] NVARCHAR(50) NULL,
        [STATUS] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [UK_WORKPLACE_CODE] UNIQUE ([WORKPLACE_CODE])
    );
END
GO

-- 작업장 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_WORKPLACE') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'작업장 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_WORKPLACE';
END
GO

-- 작업장별 작업자 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_WORKPLACE_WORKER]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_WORKPLACE_WORKER] (
        [WORKPLACE_WORKER_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [WORKPLACE_ID] NVARCHAR(20) NOT NULL,
        [WORKER_ID] NVARCHAR(20) NOT NULL,
        [WORKER_NAME] NVARCHAR(100) NOT NULL,
        [POSITION] NVARCHAR(50) NULL,
        [ROLE] NVARCHAR(20) NOT NULL DEFAULT 'MEMBER',
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [FK_WORKPLACE_WORKER_WORKPLACE] FOREIGN KEY ([WORKPLACE_ID]) 
            REFERENCES [dbo].[TB_WORKPLACE]([WORKPLACE_ID]) ON DELETE CASCADE,
        CONSTRAINT [UK_WORKPLACE_WORKER] UNIQUE ([WORKPLACE_ID], [WORKER_ID])
    );
END
GO

-- 작업장별 작업자 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_WORKPLACE_WORKER') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'작업장별 작업자 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER';
END
GO

-- 컬럼별 설명 추가 (TB_WORKPLACE)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'WORKPLACE_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'WORKPLACE_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'WORKPLACE_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 설명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'DESCRIPTION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 위치', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'LOCATION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 타입', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'WORKPLACE_TYPE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 상태 (ACTIVE/INACTIVE)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'STATUS';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'USE_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'REG_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'REG_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'UPD_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE', @level2type = N'COLUMN', @level2name = N'UPD_DT';
GO

-- 컬럼별 설명 추가 (TB_WORKPLACE_WORKER)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 작업자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'WORKPLACE_WORKER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업장 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'WORKPLACE_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'WORKER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업자명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'WORKER_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'직책', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'POSITION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'역할 (LEADER/MEMBER)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'ROLE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'USE_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'REG_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'REG_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'UPD_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_WORKPLACE_WORKER', @level2type = N'COLUMN', @level2name = N'UPD_DT';
GO

-- ID 생성을 위한 테이블 데이터 추가 (IDS 테이블이 존재한다고 가정)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- TB_WORKPLACE ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_WORKPLACE')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_WORKPLACE', 1);
    END
    
    -- TB_WORKPLACE_WORKER ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_WORKPLACE_WORKER')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_WORKPLACE_WORKER', 1);
    END
END
GO

-- 인덱스 추가 (성능 향상을 위해)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_WORKPLACE') AND name = 'IX_TB_WORKPLACE_STATUS')
BEGIN
    CREATE INDEX IX_TB_WORKPLACE_STATUS ON TB_WORKPLACE (STATUS);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_WORKPLACE') AND name = 'IX_TB_WORKPLACE_USE_YN')
BEGIN
    CREATE INDEX IX_TB_WORKPLACE_USE_YN ON TB_WORKPLACE (USE_YN);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_WORKPLACE_WORKER') AND name = 'IX_TB_WORKPLACE_WORKER_WORKPLACE_ID')
BEGIN
    CREATE INDEX IX_TB_WORKPLACE_WORKER_WORKPLACE_ID ON TB_WORKPLACE_WORKER (WORKPLACE_ID);
END
GO

-- 샘플 데이터 삽입 (테스트용)