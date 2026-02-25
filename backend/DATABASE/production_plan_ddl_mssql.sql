-- 생산계획 테이블 DDL (MSSQL)
-- TPR301M: 생산계획 마스터
-- TPR301: 생산계획 상세
-- TPR301R: 생산계획 실적(주문연결)

-- 생산계획 마스터 테이블 (TPR301M)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR301M]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR301M] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [PRODPLAN_ID] NVARCHAR(20) NOT NULL,                    -- 계획번호
        [ORDER_FLAG] NVARCHAR(20) NOT NULL DEFAULT 'PLANNED',   -- 계획상태 (PLANNED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)
        [BIGO] NVARCHAR(500) NULL,                              -- 비고
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301M] PRIMARY KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]),
        CONSTRAINT [CK_TPR301M_ORDER_FLAG] CHECK ([ORDER_FLAG] IN ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301M_PRODPLAN_ID] ON [dbo].[TPR301M] ([PRODPLAN_ID]);
    CREATE INDEX [IX_TPR301M_PRODPLAN_DATE] ON [dbo].[TPR301M] ([PRODPLAN_DATE]);
    
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
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [PRODWORK_SEQ] INT NOT NULL,                            -- 작업순번
        [PRODPLAN_ID] NVARCHAR(20) NOT NULL,                    -- 계획번호 (TPR301M 참조)
        [PRODPLAN_DETAIL_ID] NVARCHAR(20) NULL,                 -- 계획상세번호 (PLD로 시작)
        [PROD_DATE] NVARCHAR(8) NOT NULL,                       -- 생산일자 (YYYYMMDD)
        [ITEM_CODE] NVARCHAR(50) NOT NULL,                      -- 품목코드
        [ITEM_NAME] NVARCHAR(200) NOT NULL,                     -- 품목명
        [PROD_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,            -- 계획수량
        [WORKCENTER_CODE] NVARCHAR(20) NOT NULL,                -- 작업장 코드
        [WORK_CODE] NVARCHAR(20) NULL,                          -- 공정 코드
        [EQUIP_SYS_CD] NVARCHAR(20) NULL,                       -- 설비코드
        [WORKER_TYPE] NVARCHAR(20) NULL,                        -- 작업자 구분
        [WORKER_CODE] NVARCHAR(20) NULL,                        -- 작업자 코드
        [WORKER_NAME] NVARCHAR(100) NULL,                       -- 작업자명
        [ORDER_NO] NVARCHAR(20) NULL,                           -- 생산의뢰번호
        [ORDER_SEQNO] INT NULL,                                 -- 생산의뢰순번
        [ORDER_HISTNO] INT NULL,                                -- 생산의뢰이력번호
        [LOT_NO] NVARCHAR(30) NULL,                             -- LOT번호
        [WORKORDER_SEQ] INT NULL,                               -- 작업지시순번
        [DELIVERY_DATE] NVARCHAR(8) NULL,                       -- 납기일자
        [BIGO] NVARCHAR(500) NULL,                              -- 비고
        [SEL_CUSTOMER_NAMES] NVARCHAR(500) NULL,                -- 선택 거래처명들
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301] PRIMARY KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ], [PRODWORK_SEQ]),
        CONSTRAINT [FK_TPR301_TPR301M] FOREIGN KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]) 
            REFERENCES [dbo].[TPR301M]([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301_PRODPLAN_ID] ON [dbo].[TPR301] ([PRODPLAN_ID]);
    CREATE INDEX [IX_TPR301_PROD_DATE] ON [dbo].[TPR301] ([PROD_DATE]);
    CREATE INDEX [IX_TPR301_ITEM] ON [dbo].[TPR301] ([ITEM_CODE]);
    CREATE INDEX [IX_TPR301_WORKCENTER] ON [dbo].[TPR301] ([WORKCENTER_CODE]);
    CREATE INDEX [IX_TPR301_EQUIP] ON [dbo].[TPR301] ([EQUIP_SYS_CD]);
    CREATE INDEX [IX_TPR301_ORDER] ON [dbo].[TPR301] ([ORDER_NO]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산계획 상세', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TPR301';
END
GO

-- 생산계획 실적(주문연결) 테이블 (TPR301R)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR301R]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR301R] (
        [FACTORY_CODE] NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
        [ORDER_NO] NVARCHAR(20) NOT NULL,                       -- 생산의뢰번호
        [ORDER_SEQNO] INT NOT NULL,                             -- 생산의뢰순번
        [ORDER_HISTNO] INT NOT NULL,                            -- 생산의뢰이력번호
        [CUSTOMER_CODE] NVARCHAR(20) NULL,                      -- 거래처 코드
        [PRODPLAN_DATE] NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
        [PRODPLAN_SEQ] INT NOT NULL,                            -- 계획순번
        [ORDER_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,           -- 주문수량(양품수량)
        [WORKDT_QTY] DECIMAL(18,3) NOT NULL DEFAULT 0,          -- 작업수량(실적수량)
        [REPRESENT_ORDER] NCHAR(1) NULL DEFAULT 'N',            -- 대표주문여부
        [OPMAN_CODE] NVARCHAR(20) NULL,                         -- 등록자 ID
        [OPTIME] DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
        [OPMAN_CODE2] NVARCHAR(20) NULL,                        -- 수정자 ID
        [OPTIME2] DATETIME2 NULL,                               -- 수정일시
        
        CONSTRAINT [PK_TPR301R] PRIMARY KEY ([FACTORY_CODE], [ORDER_NO], [ORDER_SEQNO], [ORDER_HISTNO]),
        CONSTRAINT [FK_TPR301R_TPR301M] FOREIGN KEY ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]) 
            REFERENCES [dbo].[TPR301M]([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]) ON DELETE CASCADE
    );
    
    -- 인덱스 생성
    CREATE INDEX [IX_TPR301R_PRODPLAN] ON [dbo].[TPR301R] ([PRODPLAN_DATE], [PRODPLAN_SEQ]);
    CREATE INDEX [IX_TPR301R_CUSTOMER] ON [dbo].[TPR301R] ([CUSTOMER_CODE]);
    
    -- 테이블 설명 추가
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'생산계획 실적(주문연결)', 
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

