-- 정부 로그인 이력 전송 스케줄러 등록
-- 30분마다 실행: 최신 미전송 로그인 이력 1건을 정부 로그 API(JSON)로 전송

IF NOT EXISTS (
    SELECT 1
    FROM SCHEDULER_CONFIG
    WHERE SCHEDULER_NAME = 'GOV_LOGIN_HISTORY_INTERFACE'
)
BEGIN
    INSERT INTO SCHEDULER_CONFIG (
        SCHEDULER_NAME,
        SCHEDULER_DESCRIPTION,
        CRON_EXPRESSION,
        JOB_CLASS_NAME,
        IS_ENABLED,
        REG_DT,
        REG_USER_ID
    ) VALUES (
        'GOV_LOGIN_HISTORY_INTERFACE',
        '정부 로그인 이력 연동 스케줄러 (최신 로그인 이력 1건 JSON 전송)',
        '0 */30 * * * *',
        'egovframework.let.uat.loginhistory.service.LoginHistoryGovInterfaceService.executeInterface',
        'Y',
        GETDATE(),
        'admin'
    );
END
GO
