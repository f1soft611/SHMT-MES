-- 샘플 스케쥴러 데이터 삽입

-- 1. ERP to MES 인터페이스 스케쥴러 (매시간 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    reg_dt, 
    reg_user_id
) VALUES (
    'ERP_TO_MES_INTERFACE',
    'ERP에서 MES로 데이터를 가져오는 인터페이스 스케쥴러 (작업지시, 자재, BOM 연동)',
    '0 0 2 * * *',
    'egovframework.let.scheduler.service.ErpToMesInterfaceService',
    'N',
    NOW(),
    'admin'
);

-- 2. ERP 작업지시 연동 스케쥴러 (30분마다 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    reg_dt, 
    reg_user_id
) VALUES (
    'ERP_WORK_ORDER_SYNC',
    'ERP 작업지시 정보만 연동하는 스케쥴러',
    '0 */30 * * * *',
    'egovframework.let.scheduler.service.ErpToMesInterfaceService.syncWorkOrders',
    'N',
    NOW(),
    'admin'
);

-- 3. ERP 자재 연동 스케쥴러 (매일 새벽 1시 실행)
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    reg_dt, 
    reg_user_id
) VALUES (
    'ERP_MATERIAL_SYNC',
    'ERP 자재 정보만 연동하는 스케쥴러',
    '0 0 1 * * *',
    'egovframework.let.scheduler.service.ErpToMesInterfaceService.syncMaterials',
    'N',
    NOW(),
    'admin'
);

-- 4. 로그 정리 스케쥴러 (매주 일요일 새벽 2시 실행)
-- 주의: job_class_name은 실제 구현된 서비스 클래스명으로 변경해야 합니다.
INSERT INTO scheduler_config (
    scheduler_name, 
    scheduler_description, 
    cron_expression, 
    job_class_name, 
    is_enabled, 
    reg_dt, 
    reg_user_id
) VALUES (
    'LOG_CLEANUP',
    '오래된 로그 데이터를 정리하는 스케쥴러 (샘플 - 구현 필요)',
    '0 0 2 * * 0',
    'egovframework.let.scheduler.service.LogCleanupService',
    'N',
    NOW(),
    'admin'
);

-- 샘플 실행 이력 데이터 (선택사항)
-- 스케쥴러가 실행되면 자동으로 이력이 생성되므로 수동으로 삽입할 필요는 없습니다.
