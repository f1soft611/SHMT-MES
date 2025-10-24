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
                                   EXECUTION_TIME_MS BIGINT,
                                   REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
                                   PRIMARY KEY (HISTORY_ID),
                                   CONSTRAINT FK_SCHEDULER_HISTORY_CONFIG FOREIGN KEY (SCHEDULER_ID)
                                       REFERENCES SCHEDULER_CONFIG (SCHEDULER_ID) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IDX_SCHEDULER_ID ON SCHEDULER_HISTORY(SCHEDULER_ID);
CREATE INDEX IDX_START_TIME ON SCHEDULER_HISTORY(START_TIME);
CREATE INDEX IDX_STATUS ON SCHEDULER_HISTORY(STATUS);

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