-- 작업장 작업자 테이블에 근무구분(shift) 컬럼 추가
-- Migration script for adding shift column to TB_WORKPLACE_WORKER table (MySQL)

-- TB_WORKPLACE_WORKER 테이블에 SHIFT 컬럼 추가
ALTER TABLE TB_WORKPLACE_WORKER
ADD COLUMN IF NOT EXISTS SHIFT VARCHAR(20) NULL COMMENT '근무구분 (DAY/NIGHT/SWING)';

-- TPR106 테이블이 존재하는 경우 추가
-- Note: MySQL에서는 테이블 존재 여부 확인 후 ALTER가 어려우므로 에러 발생 시 무시하도록 처리
-- 필요시 주석 해제하여 사용
-- ALTER TABLE TPR106
-- ADD COLUMN IF NOT EXISTS SHIFT VARCHAR(20) NULL COMMENT '근무구분 (DAY/NIGHT/SWING)';

SELECT 'Shift column migration completed successfully' AS result;
