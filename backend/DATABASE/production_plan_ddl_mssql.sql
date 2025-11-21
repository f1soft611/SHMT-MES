-- 생산계획 테이블 DDL (MSSQL)
-- TPR301M: 생산계획 마스터
-- TPR301: 생산계획 상세
-- TPR301R: 생산계획 실적

-- 생산계획 마스터 테이블 (TPR301M)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR301M]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR301M] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PLAN_NO] NVARCHAR(20) NOT NULL,                        -- 계획번호
        [PLAN_DATE] NVARCHAR(8) NOT NULL,                       -- 계획일자 (YYYYMMDD)
        [WORKPLACE_CODE] NVARCHAR(20) NOT NULL,                 -- 작업장 코드
        [WORKPLACE_NAME] NVARCHAR(100) NULL,                    -- 작업장명
        [PLAN_STATUS] NVARCHAR(20) NOT NULL DEFAULT 'PLANNED',  -- 계획상태 (PLANNED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)
        [TOTAL_PLAN_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,      -- 총 계획수량
        [REMARK] NVARCHAR(500) NULL,                            -- 비고
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용 여부
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301M] PRIMARY KEY ([FACTORY_CODE], [PLAN_NO])
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301M_PLAN_DATE] ON [dbo].[TPR301M] ([PLAN_DATE]);
    CREATE INDEX [IX_TPR301M_WORKPLACE] ON [dbo].[TPR301M] ([WORKPLACE_CODE]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산계획 마스터', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR301M';
END
GO

-- 생산계획 상세 테이블 (TPR301)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR301]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR301] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PLAN_NO] NVARCHAR(20) NOT NULL,                        -- 계획번호
        [PLAN_SEQ] INT NOT NULL,                                -- 계획순번
        [PLAN_DATE] NVARCHAR(8) NOT NULL,                       -- 계획일자 (YYYYMMDD)
        [ITEM_CODE] NVARCHAR(50) NOT NULL,                      -- 품목코드
        [ITEM_NAME] NVARCHAR(200) NOT NULL,                     -- 품목명
        [PLANNED_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,         -- 계획수량
        [ACTUAL_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,          -- 실적수량
        [EQUIPMENT_CODE] NVARCHAR(20) NOT NULL,                 -- 설비코드
        [EQUIPMENT_NAME] NVARCHAR(100) NULL,                    -- 설비명
        [SHIFT] NVARCHAR(20) NULL,                              -- 근무구분 (DAY/NIGHT/SWING)
        [WORKER_CODE] NVARCHAR(20) NULL,                        -- 작업자 코드
        [WORKER_NAME] NVARCHAR(100) NULL,                       -- 작업자명
        [ORDER_NO] NVARCHAR(20) NULL,                           -- 생산의뢰번호
        [ORDER_SEQNO] INT NULL,                                 -- 생산의뢰순번
        [ORDER_HISTNO] INT NULL,                                -- 생산의뢰이력번호
        [LOT_NO] NVARCHAR(30) NULL,                             -- LOT번호
        [CUSTOMER_CODE] NVARCHAR(20) NULL,                      -- 거래처 코드
        [CUSTOMER_NAME] NVARCHAR(200) NULL,                     -- 거래처명
        [REMARK] NVARCHAR(500) NULL,                            -- 비고
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용 여부
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301] PRIMARY KEY ([FACTORY_CODE], [PLAN_NO], [PLAN_SEQ]),
        CONSTRAINT [FK_TPR301_TPR301M] FOREIGN KEY ([FACTORY_CODE], [PLAN_NO]) 
            REFERENCES [dbo].[TPR301M]([FACTORY_CODE], [PLAN_NO]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301_PLAN_DATE] ON [dbo].[TPR301] ([PLAN_DATE]);
    CREATE INDEX [IX_TPR301_ITEM] ON [dbo].[TPR301] ([ITEM_CODE]);
    CREATE INDEX [IX_TPR301_EQUIPMENT] ON [dbo].[TPR301] ([EQUIPMENT_CODE]);
    CREATE INDEX [IX_TPR301_ORDER] ON [dbo].[TPR301] ([ORDER_NO]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산계획 상세', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR301';
END
GO

-- 생산계획 실적 테이블 (TPR301R)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR301R]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR301R] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PLAN_NO] NVARCHAR(20) NOT NULL,                        -- 계획번호
        [PLAN_SEQ] INT NOT NULL,                                -- 계획순번
        [RESULT_SEQ] INT NOT NULL,                              -- 실적순번
        [RESULT_DATE] NVARCHAR(8) NOT NULL,                     -- 실적일자 (YYYYMMDD)
        [RESULT_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,          -- 실적수량
        [GOOD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,            -- 양품수량
        [BAD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,             -- 불량수량
        [WORKER_CODE] NVARCHAR(20) NULL,                        -- 작업자 코드
        [WORKER_NAME] NVARCHAR(100) NULL,                       -- 작업자명
        [START_TIME] DATETIME2 NULL,                            -- 작업시작시간
        [END_TIME] DATETIME2 NULL,                              -- 작업종료시간
        [REMARK] NVARCHAR(500) NULL,                            -- 비고
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용 여부
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301R] PRIMARY KEY ([FACTORY_CODE], [PLAN_NO], [PLAN_SEQ], [RESULT_SEQ]),
        CONSTRAINT [FK_TPR301R_TPR301] FOREIGN KEY ([FACTORY_CODE], [PLAN_NO], [PLAN_SEQ]) 
            REFERENCES [dbo].[TPR301]([FACTORY_CODE], [PLAN_NO], [PLAN_SEQ]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301R_RESULT_DATE] ON [dbo].[TPR301R] ([RESULT_DATE]);
    CREATE INDEX [IX_TPR301R_WORKER] ON [dbo].[TPR301R] ([WORKER_CODE]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산계획 실적', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR301R';
END
GO

-- ID 생성을 위한 테이블 데이터 추가
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR301M')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR301M', 1);
    END
    
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR301')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR301', 1);
    END
    
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR301R')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR301R', 1);
    END
END
GO

PRINT 'Production plan tables created successfully';
