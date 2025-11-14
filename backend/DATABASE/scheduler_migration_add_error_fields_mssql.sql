-- Migration script to add ERROR_STACK_TRACE and RETRY_COUNT columns to SCHEDULER_HISTORY table (MSSQL)
-- This script should be run on existing databases to add the missing columns

-- Check if columns exist before adding them
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'SCHEDULER_HISTORY') 
    AND name = 'ERROR_STACK_TRACE'
)
BEGIN
    ALTER TABLE SCHEDULER_HISTORY
    ADD ERROR_STACK_TRACE TEXT NULL;
    PRINT 'Added ERROR_STACK_TRACE column to SCHEDULER_HISTORY table';
END
ELSE
BEGIN
    PRINT 'ERROR_STACK_TRACE column already exists in SCHEDULER_HISTORY table';
END

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'SCHEDULER_HISTORY') 
    AND name = 'RETRY_COUNT'
)
BEGIN
    ALTER TABLE SCHEDULER_HISTORY
    ADD RETRY_COUNT INT DEFAULT 0 NULL;
    PRINT 'Added RETRY_COUNT column to SCHEDULER_HISTORY table';
END
ELSE
BEGIN
    PRINT 'RETRY_COUNT column already exists in SCHEDULER_HISTORY table';
END
