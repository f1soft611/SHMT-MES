-- Scheduler Configuration Table (MSSQL)
CREATE TABLE SCHEDULER_CONFIG (
                                  SCHEDULER_ID BIGINT IDENTITY(1,1) NOT NULL,
                                  SCHEDULER_NAME VARCHAR(100) NOT NULL,
                                  SCHEDULER_DESCRIPTION VARCHAR(500),
                                  CRON_EXPRESSION VARCHAR(100) NOT NULL,
                                  JOB_CLASS_NAME VARCHAR(255) NOT NULL,
                                  IS_ENABLED CHAR(1) NOT NULL DEFAULT 'Y',
                                  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
                                  REG_USER_ID VARCHAR(20) NOT NULL,
                                  UPD_DT DATETIME,
                                  UPD_USER_ID VARCHAR(20),
                                  PRIMARY KEY (SCHEDULER_ID),
                                  CONSTRAINT UK_SCHEDULER_NAME UNIQUE (SCHEDULER_NAME)
);

-- Scheduler Execution History Table (MSSQL)
CREATE TABLE SCHEDULER_HISTORY (
                                   HISTORY_ID BIGINT IDENTITY(1,1) NOT NULL,
                                   SCHEDULER_ID BIGINT NOT NULL,
                                   SCHEDULER_NAME VARCHAR(100) NOT NULL,
                                   START_TIME DATETIME NOT NULL,
                                   END_TIME DATETIME,
                                   STATUS VARCHAR(20) NOT NULL,
                                   ERROR_MESSAGE TEXT,
                                   ERROR_STACK_TRACE TEXT,
                                   EXECUTION_TIME_MS BIGINT,
                                   RETRY_COUNT INT DEFAULT 0,
                                   REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
                                   PRIMARY KEY (HISTORY_ID),
                                   CONSTRAINT FK_SCHEDULER_HISTORY_CONFIG FOREIGN KEY (SCHEDULER_ID)
                                       REFERENCES SCHEDULER_CONFIG (SCHEDULER_ID) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IDX_SCHEDULER_ID ON SCHEDULER_HISTORY(SCHEDULER_ID);
CREATE INDEX IDX_START_TIME ON SCHEDULER_HISTORY(START_TIME);
CREATE INDEX IDX_STATUS ON SCHEDULER_HISTORY(STATUS);

-- TSA308 생산 의뢰 테이블 (Production Request Table)
CREATE TABLE TSA308 (
    FACTORY_CODE VARCHAR(10) NOT NULL,                 -- 공장코드
    ORDER_NO NVARCHAR(200) NOT NULL,                   -- 생산의뢰번호
    ORDER_SEQNO INT NOT NULL,                          -- 생산의뢰코드
    ORDER_HISTNO INT NOT NULL,                         -- 생산의뢰순번
    ITEM_CODE VARCHAR(20),                             -- 품목내부코드
    ITEM_NO NVARCHAR(200),                             -- 품목번호
    ITEM_NAME NVARCHAR(200),                           -- 품목명
    ITEM_SPEC NVARCHAR(200),                           -- 품목규격
    ITEM_FLAG CHAR(1),                                 -- 품목구분
    CUSTOMER_CODE VARCHAR(20),                         -- 거래처코드
    EMPLYR_ID VARCHAR(50),                             -- 의뢰자
    ORDER_QTY REAL,                                    -- 의뢰수량
    ORDER_PRICE MONEY,                                 -- 단가
    ORDER_AMOUNT MONEY,                                -- 금액
    UNIT_CODE VARCHAR(20),                             -- 단위코드
    SHIP_ORDER_QTY REAL,                               -- 출하수량
    CLOSING_FLAG CHAR(1),                              -- 마감여부
    DELIVERY_DATE CHAR(8),                             -- 납기일
    VAT_FLAG CHAR(1),                                  -- 부가세여부
    PROD_PLAN_DATE VARCHAR(50),                        -- 생산계획일
    END_DATE VARCHAR(8),                               -- 완료요청일
    OPMAN_CODE VARCHAR(20),                            -- 작업자코드
    OPTIME DATETIME2,                                  -- 작업시간
    OPMAN_CODE2 VARCHAR(20),                           -- 수정자코드
    OPTIME2 DATETIME2,                                 -- 수정시간
    PRIMARY KEY (FACTORY_CODE, ORDER_SEQNO)
);

-- Create indexes for TSA308
CREATE INDEX IDX_TSA308_ORDER_NO ON TSA308(ORDER_NO);
CREATE INDEX IDX_TSA308_ITEM_CODE ON TSA308(ITEM_CODE);
CREATE INDEX IDX_TSA308_CUSTOMER_CODE ON TSA308(CUSTOMER_CODE);
CREATE INDEX IDX_TSA308_DELIVERY_DATE ON TSA308(DELIVERY_DATE);

-- Insert IDS for sequence (if using IDS table for ID generation)
-- Note: IDENTITY columns in MSSQL handle auto-increment automatically
-- The IDS table entries are optional and only needed if your framework requires them
IF EXISTS (SELECT * FROM SYS.OBJECTS WHERE OBJECT_ID = OBJECT_ID(N'IDS') AND TYPE IN (N'U'))
BEGIN
  IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'SCHEDULER_CONFIG')
    INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('SCHEDULER_CONFIG', 1);

  IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'SCHEDULER_HISTORY')
    INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('SCHEDULER_HISTORY', 1);
END