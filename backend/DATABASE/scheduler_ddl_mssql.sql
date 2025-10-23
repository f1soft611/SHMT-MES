-- Scheduler Configuration Table (MSSQL)
CREATE TABLE scheduler_config (
  scheduler_id BIGINT IDENTITY(1,1) NOT NULL,
  scheduler_name VARCHAR(100) NOT NULL,
  scheduler_description VARCHAR(500),
  cron_expression VARCHAR(100) NOT NULL,
  job_class_name VARCHAR(255) NOT NULL,
  is_enabled CHAR(1) NOT NULL DEFAULT 'Y',
  reg_dt DATETIME NOT NULL DEFAULT GETDATE(),
  reg_user_id VARCHAR(20) NOT NULL,
  upd_dt DATETIME,
  upd_user_id VARCHAR(20),
  PRIMARY KEY (scheduler_id),
  CONSTRAINT uk_scheduler_name UNIQUE (scheduler_name)
);

-- Scheduler Execution History Table (MSSQL)
CREATE TABLE scheduler_history (
  history_id BIGINT IDENTITY(1,1) NOT NULL,
  scheduler_id BIGINT NOT NULL,
  scheduler_name VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  execution_time_ms BIGINT,
  reg_dt DATETIME NOT NULL DEFAULT GETDATE(),
  PRIMARY KEY (history_id),
  CONSTRAINT fk_scheduler_history_config FOREIGN KEY (scheduler_id) 
    REFERENCES scheduler_config (scheduler_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_scheduler_id ON scheduler_history(scheduler_id);
CREATE INDEX idx_start_time ON scheduler_history(start_time);
CREATE INDEX idx_status ON scheduler_history(status);

-- Insert IDS for sequence (if using IDS table for ID generation)
-- Note: IDENTITY columns in MSSQL handle auto-increment automatically
-- The IDS table entries are optional and only needed if your framework requires them
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'IDS') AND type in (N'U'))
BEGIN
  IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'scheduler_config')
    INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('scheduler_config', 1);
  
  IF NOT EXISTS (SELECT * FROM IDS WHERE TABLE_NAME = 'scheduler_history')
    INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('scheduler_history', 1);
END
