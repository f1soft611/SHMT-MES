-- Scheduler Configuration Table
CREATE TABLE scheduler_config (
  scheduler_id BIGINT NOT NULL AUTO_INCREMENT,
  scheduler_name VARCHAR(100) NOT NULL,
  scheduler_description VARCHAR(500),
  cron_expression VARCHAR(100) NOT NULL,
  job_class_name VARCHAR(255) NOT NULL,
  is_enabled CHAR(1) NOT NULL DEFAULT 'Y',
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(20) NOT NULL,
  updated_date DATETIME,
  updated_by VARCHAR(20),
  PRIMARY KEY (scheduler_id),
  UNIQUE KEY uk_scheduler_name (scheduler_name)
);

-- Scheduler Execution History Table
CREATE TABLE scheduler_history (
  history_id BIGINT NOT NULL AUTO_INCREMENT,
  scheduler_id BIGINT NOT NULL,
  scheduler_name VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  execution_time_ms BIGINT,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_scheduler_id (scheduler_id),
  KEY idx_start_time (start_time),
  KEY idx_status (status),
  CONSTRAINT fk_scheduler_history_config FOREIGN KEY (scheduler_id) REFERENCES scheduler_config (scheduler_id) ON DELETE CASCADE
);

-- Insert IDS for sequence
INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('scheduler_config', 1);
INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('scheduler_history', 1);
