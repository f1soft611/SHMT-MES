-- Migration script to add error_stack_trace and retry_count columns to scheduler_history table (MySQL)
-- This script should be run on existing databases to add the missing columns

-- Add error_stack_trace column if it doesn't exist
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'scheduler_history'
        AND table_schema = DATABASE()
        AND column_name = 'error_stack_trace'
    ) > 0,
    "SELECT 'error_stack_trace column already exists' AS msg;",
    "ALTER TABLE scheduler_history ADD COLUMN error_stack_trace TEXT NULL AFTER error_message;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add retry_count column if it doesn't exist
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'scheduler_history'
        AND table_schema = DATABASE()
        AND column_name = 'retry_count'
    ) > 0,
    "SELECT 'retry_count column already exists' AS msg;",
    "ALTER TABLE scheduler_history ADD COLUMN retry_count INT DEFAULT 0 NULL AFTER execution_time_ms;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
