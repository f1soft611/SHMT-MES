-- Migration script to update scheduler tables from old column names to new names
-- Run this script if you have existing scheduler_config and scheduler_history tables

-- ======================================
-- MySQL Migration Script
-- ======================================

-- Rename columns in scheduler_config table
ALTER TABLE scheduler_config 
  CHANGE COLUMN created_date reg_dt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN created_by reg_user_id VARCHAR(20) NOT NULL,
  CHANGE COLUMN updated_date upd_dt DATETIME,
  CHANGE COLUMN updated_by upd_user_id VARCHAR(20);

-- Rename columns in scheduler_history table
ALTER TABLE scheduler_history 
  CHANGE COLUMN created_date reg_dt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Verify changes
SELECT 'scheduler_config columns:' AS info;
SHOW COLUMNS FROM scheduler_config;

SELECT 'scheduler_history columns:' AS info;
SHOW COLUMNS FROM scheduler_history;

SELECT 'Migration completed successfully!' AS result;
