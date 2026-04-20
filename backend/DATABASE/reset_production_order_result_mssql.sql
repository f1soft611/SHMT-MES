-- =============================================================================
-- 생산지시 / 생산실적 데이터 초기화 스크립트 (MSSQL)
-- 대상     : TPR504(생산지시), TPR601(실적), TPR601W(작업자), TPR605(불량상세)
-- 부가작업 : TPR301.ORDER_FLAG → NULL, TPR301.LOT_NO → NULL
--            TPR301M.ORDER_FLAG → 'PLANNED', TPR301M.ITEM_LOT_NO → NULL
-- 주의     : 이 스크립트는 되돌릴 수 없습니다. 실행 전 반드시 백업하세요.
-- 작성일   : 2026-04-20
-- =============================================================================

-- =====================================================================
-- [SECTION 0] 설정 변수
-- =====================================================================
DECLARE @FACTORY_CODE NVARCHAR(10) = '000001';

-- =====================================================================
-- [SECTION 1] 삭제 전 건수 확인
-- =====================================================================
PRINT '=== 삭제 전 건수 확인 ===';
SELECT '생산지시(TPR504)' AS 테이블, COUNT(*) AS 건수 FROM TPR504 WHERE FACTORY_CODE = @FACTORY_CODE AND ISNULL(DELETE_FLAG,'0') != '1'
UNION ALL
SELECT '생산실적(TPR601)', COUNT(*) FROM TPR601 WHERE FACTORY_CODE = @FACTORY_CODE
UNION ALL
SELECT '실적작업자(TPR601W)', COUNT(*) FROM TPR601W WHERE FACTORY_CODE = @FACTORY_CODE
UNION ALL
SELECT '불량상세(TPR605)', COUNT(*) FROM TPR605 WHERE FACTORY_CODE = @FACTORY_CODE;

-- =====================================================================
-- [SECTION 2] 자식 테이블부터 순서대로 삭제
--             (FK ON DELETE CASCADE가 있으나 명시적 순서 준수)
-- =====================================================================

-- 2-1. TPR605 불량 상세 삭제
PRINT '=== TPR605 삭제 ===';
DELETE FROM TPR605
WHERE FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR605 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 2-2. TPR601W 작업자 삭제
PRINT '=== TPR601W 삭제 ===';
DELETE FROM TPR601W
WHERE FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR601W 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 2-3. TPR601 생산실적 삭제
PRINT '=== TPR601 삭제 ===';
DELETE FROM TPR601
WHERE FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR601 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 2-4. TPR504 생산지시 삭제 (소프트삭제 포함 전체)
PRINT '=== TPR504 삭제 ===';
DELETE FROM TPR504
WHERE FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR504 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 3] TPR301 생산계획 상태 원복
--             ORDER_FLAG → NULL (PLANNED 이전 상태)
--             LOT_NO     → NULL
-- =====================================================================
PRINT '=== TPR301 원복 ===';
UPDATE TPR301
SET    ORDER_FLAG  = NULL,
       LOT_NO      = NULL,
       OPMAN_CODE2 = NULL,
       OPTIME2     = NULL
WHERE  FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR301 원복: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 4] TPR301M 생산계획 마스터 상태 원복
--             ORDER_FLAG  → 'PLANNED' (CHECK 제약 허용값)
--             ITEM_LOT_NO → NULL
-- =====================================================================
PRINT '=== TPR301M 원복 ===';
UPDATE TPR301M
SET    ORDER_FLAG   = 'PLANNED',
       ITEM_LOT_NO  = NULL,
       OPMAN_CODE2  = NULL,
       OPTIME2      = NULL
WHERE  FACTORY_CODE = @FACTORY_CODE;
PRINT 'TPR301M 원복: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 5] 삭제 후 건수 검증
-- =====================================================================
PRINT '';
PRINT '=== 삭제 후 건수 확인 ===';
SELECT '생산지시(TPR504)' AS 테이블, COUNT(*) AS 건수 FROM TPR504 WHERE FACTORY_CODE = @FACTORY_CODE
UNION ALL
SELECT '생산실적(TPR601)', COUNT(*) FROM TPR601 WHERE FACTORY_CODE = @FACTORY_CODE
UNION ALL
SELECT '실적작업자(TPR601W)', COUNT(*) FROM TPR601W WHERE FACTORY_CODE = @FACTORY_CODE
UNION ALL
SELECT '불량상세(TPR605)', COUNT(*) FROM TPR605 WHERE FACTORY_CODE = @FACTORY_CODE;

PRINT '=== 초기화 완료 ===';
