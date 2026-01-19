-- =============================================
-- 생산실적 관리 DDL (MSSQL)
-- =============================================
-- TPR601: 생산실적
-- TPR601W: 생산실적 작업자
-- TPR601M: 생산실적 투입자재

-- =============================================
-- 생산실적 테이블 (TPR601)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR601]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR601] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [PRODWORK_SEQ] INT NOT NULL,                            -- 작업순번
        [WORK_SEQ] INT NOT NULL,                                -- 공정순번
        [PROD_SEQ] INT NOT NULL,                                -- 실적순번
        [ITEM_CODE] NVARCHAR(50) NULL,                          -- 품목 코드
        [WORK_CODE] NVARCHAR(20) NULL,                          -- 공정 코드
        [PROD_STIME] DATETIME2 NULL,                            -- 생산시작시간
        [PROD_ETIME] DATETIME2 NULL,                            -- 생산종료시간
        [ORDER_FLAG] NCHAR(1) NULL DEFAULT '0',                 -- 작업지시 플래그
        [PROD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,            -- 생산수량
        [GOOD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,            -- 양품수량
        [BAD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,             -- 불량수량
        [RCV_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,             -- 입고수량
        [WORKORDER_SEQ] INT NULL,                               -- 작업지시순번
        [TPR601ID] NVARCHAR(20) NOT NULL,                       -- 생산실적 ID (PR + YYYYMMDD + 0000)
        [TPR504ID] NVARCHAR(20) NULL,                           -- 생산지시 ID
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR601] PRIMARY KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ])
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR601_TPR601ID] ON [dbo].[TPR601] ([TPR601ID]);
    CREATE INDEX [IX_TPR601_TPR504ID] ON [dbo].[TPR601] ([TPR504ID]);
    CREATE INDEX [IX_TPR601_ITEM_CODE] ON [dbo].[TPR601] ([ITEM_CODE]);
    CREATE INDEX [IX_TPR601_WORK_CODE] ON [dbo].[TPR601] ([WORK_CODE]);
    CREATE INDEX [IX_TPR601_PROD_TIME] ON [dbo].[TPR601] ([PROD_STIME], [PROD_ETIME]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산실적 테이블 - 생산 실적 정보 관리', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR601';
END
GO

-- =============================================
-- 생산실적 작업자 테이블 (TPR601W)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR601W]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR601W] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [PRODWORK_SEQ] INT NOT NULL,                            -- 작업순번
        [WORK_SEQ] INT NOT NULL,                                -- 공정순번
        [PROD_SEQ] INT NOT NULL,                                -- 실적순번
        [WORKER_SEQ] INT NOT NULL,                              -- 작업자순번
        [WORKER_CODE] NVARCHAR(20) NOT NULL,                    -- 작업자 코드
        [TPR601WID] NVARCHAR(20) NOT NULL,                      -- 생산실적 작업자 ID (PRW + YYYYMMDD + 000)
        [TPR601ID] NVARCHAR(20) NOT NULL,                       -- 생산실적 ID
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        
        CONSTRAINT [PK_TPR601W] PRIMARY KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ], [WORKER_SEQ]),
        CONSTRAINT [FK_TPR601W_TPR601] FOREIGN KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ]) 
            REFERENCES [dbo].[TPR601]([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR601W_TPR601ID] ON [dbo].[TPR601W] ([TPR601ID]);
    CREATE INDEX [IX_TPR601W_WORKER] ON [dbo].[TPR601W] ([WORKER_CODE]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산실적 작업자 테이블 - 생산실적별 작업자 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR601W';
END
GO

-- =============================================
-- 생산실적 투입자재 테이블 (TPR601M)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR601M]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR601M] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [PRODWORK_SEQ] INT NOT NULL,                            -- 작업순번
        [WORK_SEQ] INT NOT NULL,                                -- 공정순번
        [PROD_SEQ] INT NOT NULL,                                -- 실적순번
        [MATERIAL_SEQ] INT NOT NULL,                            -- 자재순번
        [MATERIAL_CODE] NVARCHAR(50) NOT NULL,                  -- 자재 코드
        [LOT_NO] NVARCHAR(50) NULL,                             -- LOT 번호
        [USE_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,             -- 사용수량
        [UNIT] NVARCHAR(10) NULL,                               -- 단위
        [TPR601MID] NVARCHAR(20) NOT NULL,                      -- 생산실적 자재 ID
        [TPR601ID] NVARCHAR(20) NOT NULL,                       -- 생산실적 ID
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        
        CONSTRAINT [PK_TPR601M] PRIMARY KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ], [MATERIAL_SEQ]),
        CONSTRAINT [FK_TPR601M_TPR601] FOREIGN KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ]) 
            REFERENCES [dbo].[TPR601]([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ], [WORK_SEQ], [PROD_SEQ]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR601M_TPR601ID] ON [dbo].[TPR601M] ([TPR601ID]);
    CREATE INDEX [IX_TPR601M_MATERIAL] ON [dbo].[TPR601M] ([MATERIAL_CODE]);
    CREATE INDEX [IX_TPR601M_LOT] ON [dbo].[TPR601M] ([LOT_NO]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산실적 투입자재 테이블 - 생산실적별 투입 자재 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR601M';
END
GO

-- =============================================
-- IDS 테이블 초기값 설정
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- TPR601 초기값
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR601')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR601', 1);
    END
    
    -- TPR601W 초기값
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR601W')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR601W', 1);
    END
    
    -- TPR601M 초기값
    IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'TPR601M')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TPR601M', 1);
    END
END
GO
