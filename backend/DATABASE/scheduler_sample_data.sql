-- 샘플 스케쥴러 데이터 삽입

-- 1. ERP to MES 인터페이스 스케쥴러 (매시간 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    created_date, 
    created_by
) VALUES (
    'ERP_TO_MES_INTERFACE',
    'ERP에서 MES로 데이터를 가져오는 인터페이스 스케쥴러',
    '0 0 * * * *',
    'egovframework.let.scheduler.service.ErpToMesInterfaceService',
    'Y',
    NOW(),
    'admin'
);

-- 2. 생산실적 집계 스케쥴러 (매일 자정 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    created_date, 
    created_by
) VALUES (
    'PRODUCTION_SUMMARY',
    '일일 생산실적을 집계하는 스케쥴러',
    '0 0 0 * * *',
    'egovframework.let.scheduler.service.ProductionSummaryService',
    'N',
    NOW(),
    'admin'
);

-- 3. 로그 정리 스케쥴러 (매주 일요일 새벽 2시 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    created_date, 
    created_by
) VALUES (
    'LOG_CLEANUP',
    '오래된 로그 데이터를 정리하는 스케쥴러',
    '0 0 2 * * SUN',
    'egovframework.let.scheduler.service.LogCleanupService',
    'N',
    NOW(),
    'admin'
);

-- 샘플 실행 이력 데이터 (선택사항)
-- 스케쥴러가 실행되면 자동으로 이력이 생성되므로 수동으로 삽입할 필요는 없습니다.
