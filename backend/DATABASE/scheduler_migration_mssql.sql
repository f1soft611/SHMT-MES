-- Migration script to update scheduler tables from old column names to new names
-- Run this script if you have existing scheduler_config and scheduler_history tables

-- ======================================
-- MSSQL Migration Script
-- ======================================

-- Rename columns in scheduler_config table
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'scheduler_config') AND name = 'created_date')
BEGIN
    EXEC sp_rename 'scheduler_config.created_date', 'reg_dt', 'COLUMN';
    PRINT 'Renamed scheduler_config.created_date to reg_dt';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'scheduler_config') AND name = 'created_by')
BEGIN
    EXEC sp_rename 'scheduler_config.created_by', 'reg_user_id', 'COLUMN';
    PRINT 'Renamed scheduler_config.created_by to reg_user_id';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'scheduler_config') AND name = 'updated_date')
BEGIN
    EXEC sp_rename 'scheduler_config.updated_date', 'upd_dt', 'COLUMN';
    PRINT 'Renamed scheduler_config.updated_date to upd_dt';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'scheduler_config') AND name = 'updated_by')
BEGIN
    EXEC sp_rename 'scheduler_config.updated_by', 'upd_user_id', 'COLUMN';
    PRINT 'Renamed scheduler_config.updated_by to upd_user_id';
END

-- Rename columns in scheduler_history table
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'scheduler_history') AND name = 'created_date')
BEGIN
    EXEC sp_rename 'scheduler_history.created_date', 'reg_dt', 'COLUMN';
    PRINT 'Renamed scheduler_history.created_date to reg_dt';
END

PRINT 'Migration completed successfully!';
