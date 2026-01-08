-- MES 로그인 이력 관리 테이블
-- 로그인 이력 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MES_LOGIN_HISTORY]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MES_LOGIN_HISTORY] (
        [LOGIN_HISTORY_ID] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [FACTORY_CODE] NVARCHAR(20) NOT NULL DEFAULT '000001',
        [USER_ID] NVARCHAR(20) NOT NULL,
        [USER_NAME] NVARCHAR(100) NULL,
        [LOGIN_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [LOGIN_IP] NVARCHAR(50) NULL,
        [LOGIN_TYPE] NVARCHAR(20) NULL,  -- 'JWT', 'SESSION'
        [USER_AGENT] NVARCHAR(500) NULL,
        [LOGIN_RESULT] NCHAR(1) NOT NULL DEFAULT 'Y',  -- Y: 성공, N: 실패
        [FAIL_REASON] NVARCHAR(200) NULL,
        [LOGOUT_DT] DATETIME2 NULL,
        [SESSION_TIME] INT NULL,  -- 세션 유지 시간(분)
        
        INDEX [IDX_MES_LOGIN_HISTORY_USER] ([USER_ID], [LOGIN_DT] DESC),
        INDEX [IDX_MES_LOGIN_HISTORY_DATE] ([LOGIN_DT] DESC)
    );
END
GO

-- 로그인 이력 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('MES_LOGIN_HISTORY') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'MES 로그인 이력 관리 테이블', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY';
END
GO

-- 컬럼 설명 추가
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그인 이력 ID(자동증가)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGIN_HISTORY_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'회사 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'FACTORY_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용자 이름', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'USER_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그인 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGIN_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그인 IP', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGIN_IP';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그인 타입(JWT/SESSION)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGIN_TYPE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용자 에이전트(브라우저 정보)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'USER_AGENT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그인 결과(Y:성공, N:실패)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGIN_RESULT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'실패 사유', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'FAIL_REASON';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'로그아웃 일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'LOGOUT_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'세션 유지 시간(분)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'MES_LOGIN_HISTORY', @level2type = N'COLUMN', @level2name = N'SESSION_TIME';
GO
