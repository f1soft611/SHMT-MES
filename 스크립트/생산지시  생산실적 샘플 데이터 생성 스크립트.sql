-- =============================================================================
-- 생산지시 / 생산실적 샘플 데이터 생성 스크립트 (MSSQL)
-- 대상 DB   : MSSQL
-- 목적      : 생산계획(TPR301) 데이터를 기반으로 생산지시(TPR504),
--             생산실적(TPR601), 불량상세(TPR605) 데이터 자동 생성
-- 실행 조건 : TPR301(생산계획 상세)에 데이터가 있어야 함
-- 재실행 안전: 이미 지시가 등록된 계획은 건너뜀 (중복 생성 없음)
-- 작성일    : 2026-04-20
-- =============================================================================

-- =====================================================================
-- [SECTION 0] 설정 변수 — 필요 시 수정하세요
-- =====================================================================
DECLARE @FACTORY_CODE   NVARCHAR(10)  = '000001';   -- 공장코드
DECLARE @OPMAN_CODE     NVARCHAR(20)  = 'admin';     -- 등록자 ID
DECLARE @GOOD_RATIO     DECIMAL(5,2)  = 0.95;        -- 양품 비율 (0.00 ~ 1.00)
DECLARE @QC_CODE        NVARCHAR(50)  = 'ERR001';     -- 불량코드 (MES_CCMMNDETAIL_CODE.CODE where CODE_ID='COM003')
-- 실제 DB에 있는 불량코드 확인 쿼리:
-- SELECT CODE, CODE_NM FROM MES_CCMMNDETAIL_CODE WHERE CODE_ID = 'COM003' AND USE_AT = 'Y';
DECLARE @DEFAULT_WORKER_CODE NVARCHAR(20) = 'admin'; -- TPR301.WORKER_CODE가 NULL일 때 사용할 기본 작업자 코드
-- 실제 작업자 코드 확인 쿼리:
-- SELECT WORKER_ID, WORKER_NAME FROM TB_WORKPLACE_WORKER WHERE USE_YN = 'Y';

-- =====================================================================
-- [SECTION 1] 오늘 날짜 기반 ID prefix 준비
-- =====================================================================
DECLARE @TODAY_STR      CHAR(8)       = CONVERT(char(8), GETDATE(), 112);  -- YYYYMMDD

-- =====================================================================
-- [SECTION 2] 대상 계획 추출 — 공정흐름 기반
--   selectFlowProcess 로직과 동일:
--   TPR301 → TPR112 → TPR110 → TPR110D(공정상세) → TPR104/TPR151(설비)
--   TPR110D 행이 없으면 TPR301.WORK_CODE 단일 공정으로 폴백
-- =====================================================================
IF OBJECT_ID('tempdb..#TARGET_PLANS') IS NOT NULL DROP TABLE #TARGET_PLANS;

-- STEP 2-1: LOT_NO를 TPR301 계획 단위로 미리 계산 (같은 계획의 모든 공정이 동일 LOT 공유)
IF OBJECT_ID('tempdb..#LOT_MAP') IS NOT NULL DROP TABLE #LOT_MAP;

SELECT
    P.FACTORY_CODE,
    P.PRODPLAN_DATE,
    P.PRODPLAN_SEQ,
    P.PRODWORK_SEQ,
    P.ITEM_CODE,
    LEFT(ISNULL(A2.MATERIAL_CODE, P.ITEM_CODE), 13) AS MATERIAL_CODE_SHORT,
    -- LOT_NO = 품번(최대13자)-YY-순번(3자리) : TPR504.LOT_NO NVARCHAR(20) 맞춤
    LEFT(ISNULL(A2.MATERIAL_CODE, P.ITEM_CODE), 13)
        + '-' + RIGHT(CAST(YEAR(GETDATE()) AS VARCHAR), 2)
        + '-' + RIGHT('000' + CAST(
                    ISNULL((
                        SELECT MAX(CAST(RIGHT(ITEM_LOT_NO, 3) AS INT))
                        FROM TPR301M
                        WHERE ITEM_LOT_NO LIKE LEFT(ISNULL(A2.MATERIAL_CODE, P.ITEM_CODE), 13)
                                             + '-' + RIGHT(CAST(YEAR(GETDATE()) AS VARCHAR), 2) + '-%'
                          AND LEN(ITEM_LOT_NO) >= 3
                          AND ISNUMERIC(RIGHT(ITEM_LOT_NO, 3)) = 1
                    ), 0)
                    + DENSE_RANK() OVER (
                        PARTITION BY LEFT(ISNULL(A2.MATERIAL_CODE, P.ITEM_CODE), 13)
                        ORDER BY P.PRODPLAN_DATE, P.PRODPLAN_SEQ, P.PRODWORK_SEQ
                    )
                AS VARCHAR), 3)
    AS LOT_NO
INTO #LOT_MAP
FROM TPR301 P
LEFT JOIN TCO403 A2 ON A2.MATERIAL_ID = P.ITEM_CODE
-- 지시 없는 계획만 대상
WHERE P.FACTORY_CODE = @FACTORY_CODE
  AND NOT EXISTS (
      SELECT 1 FROM TPR504 O
      WHERE O.FACTORY_CODE  = P.FACTORY_CODE
        AND O.PRODPLAN_DATE = P.PRODPLAN_DATE
        AND O.PRODPLAN_SEQ  = P.PRODPLAN_SEQ
        AND O.PRODWORK_SEQ  = P.PRODWORK_SEQ
        AND ISNULL(O.DELETE_FLAG, '0') != '1'
  );

-- STEP 2-2: 공정흐름 전개 (selectFlowProcess 로직과 동일)
SELECT
    P.FACTORY_CODE,
    P.PRODPLAN_DATE,
    P.PRODPLAN_SEQ,
    P.PRODWORK_SEQ,
    P.PRODPLAN_ID,
    P.PRODPLAN_DETAIL_ID,
    P.PROD_DATE,
    P.ITEM_CODE,                                       -- TPR504.ITEM_CODE (MATERIAL_ID)
    P.ITEM_NAME,
    P.PROD_QTY,
    P.WORKCENTER_CODE,
    P.WORKER_CODE,
    -- 공정코드: TPR110D 있으면 공정흐름, 없으면 TPR301.WORK_CODE 폴백
    LEFT(ISNULL(D.WORK_CODE, P.WORK_CODE), 10)         AS WORK_CODE,  -- TPR504.WORK_CODE NVARCHAR(10)
    -- 설비코드: TPR104+TPR151 매핑, 없으면 TPR301.EQUIP_SYS_CD 폴백
    ISNULL(E1.EQUIP_SYS_CD, P.EQUIP_SYS_CD)           AS EQUIP_SYS_CD,
    -- 제품코드(BOM): 없으면 ITEM_CODE 폴백
    LEFT(ISNULL(CAST(F.MAT_ITEM_SEQ AS NVARCHAR), P.ITEM_CODE), 20) AS PROD_CODE,
    -- TPR110D_SEQ → TPR504.WORKORDER_SEQ (정렬 기준)
    ISNULL(D.SEQ, 1)                                   AS TPR110D_SEQ,
    -- WORK_SEQ: 동일 계획(PRODPLAN_DATE+SEQ+WORK_SEQ) 내 공정 순번
    ROW_NUMBER() OVER (
        PARTITION BY P.FACTORY_CODE, P.PRODPLAN_DATE, P.PRODPLAN_SEQ, P.PRODWORK_SEQ
        ORDER BY ISNULL(D.SEQ, 1), ISNULL(D.WORK_SEQ, 1)
    )                                                  AS WORK_SEQ,
    L.LOT_NO,
    -- 전체 INSERT 순번 (TPR504ID 채번용)
    ROW_NUMBER() OVER (
        ORDER BY P.PRODPLAN_DATE, P.PRODPLAN_SEQ, P.PRODWORK_SEQ,
                 ISNULL(D.SEQ, 1), ISNULL(D.WORK_SEQ, 1)
    )                                                  AS ROW_NUM
INTO #TARGET_PLANS
FROM TPR301 P
-- 품번 조회
LEFT JOIN TCO403 A2
    ON  A2.MATERIAL_ID = P.ITEM_CODE
-- 공정흐름: 품목별 작업지시 → 작업지시 마스터 → 공정 상세
LEFT JOIN TPR112 B
    ON  B.PROD_CODE_ID = P.ITEM_CODE
LEFT JOIN TPR110 C
    ON  C.FACTORY_CODE = B.FACTORY_CODE
    AND C.WORK_ORDER   = B.WORK_ORDER
LEFT JOIN TPR110D D
    ON  D.FACTORY_CODE = C.FACTORY_CODE
    AND D.WORK_ORDER   = C.WORK_ORDER
-- 설비: 공정 × 계획설비 매핑
LEFT JOIN TPR104 E
    ON  E.WORK_CODE    = D.WORK_CODE
    AND E.EQUIP_SYS_CD = P.EQUIP_SYS_CD
LEFT JOIN TPR151 E1
    ON  E1.EQUIP_SYS_CD = E.EQUIP_SYS_CD
-- BOM (제품코드)
LEFT JOIN TCO501 F
    ON  CAST(F.ITEM_SEQ AS NVARCHAR) = P.ITEM_CODE
    AND F.PROC_SEQ IS NOT NULL
-- LOT_NO 매핑
INNER JOIN #LOT_MAP L
    ON  L.FACTORY_CODE  = P.FACTORY_CODE
    AND L.PRODPLAN_DATE = P.PRODPLAN_DATE
    AND L.PRODPLAN_SEQ  = P.PRODPLAN_SEQ
    AND L.PRODWORK_SEQ  = P.PRODWORK_SEQ
-- 지시 없는 계획만 대상
WHERE P.FACTORY_CODE = @FACTORY_CODE
  AND NOT EXISTS (
      SELECT 1 FROM TPR504 O
      WHERE O.FACTORY_CODE  = P.FACTORY_CODE
        AND O.PRODPLAN_DATE = P.PRODPLAN_DATE
        AND O.PRODPLAN_SEQ  = P.PRODPLAN_SEQ
        AND O.PRODWORK_SEQ  = P.PRODWORK_SEQ
        AND ISNULL(O.DELETE_FLAG, '0') != '1'
  )
  -- TPR110D가 없는 경우(폴백)는 D.SEQ IS NULL 허용
  -- TPR110D가 있으면 selectFlowProcess와 동일한 조건 적용
  AND (D.SEQ IS NULL OR D.SEQ >= 1);

DECLARE @TARGET_COUNT INT = (SELECT COUNT(*) FROM #TARGET_PLANS);
PRINT '대상 계획 건수: ' + CAST(@TARGET_COUNT AS VARCHAR);

IF @TARGET_COUNT = 0
BEGIN
    PRINT '생성할 대상이 없습니다. 모든 계획에 생산지시가 이미 존재합니다.';
    RETURN;
END

-- =====================================================================
-- [SECTION 3] 당일 기존 ID 최대 시퀀스 확인 (중복 방지)
-- =====================================================================
DECLARE @PO_OFFSET INT;
DECLARE @PR_OFFSET INT;
DECLARE @QC_OFFSET INT;

SELECT @PO_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR504ID, 4) AS INT)), 0)
FROM TPR504
WHERE TPR504ID LIKE 'PO' + @TODAY_STR + '%';

SELECT @PR_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR601ID, 4) AS INT)), 0)
FROM TPR601
WHERE TPR601ID LIKE 'PR' + @TODAY_STR + '%';

SELECT @QC_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR605ID, 4) AS INT)), 0)
FROM TPR605
WHERE TPR605ID LIKE 'QC' + @TODAY_STR + '%';

DECLARE @PRW_OFFSET INT;
SELECT @PRW_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR601WID, 3) AS INT)), 0)
FROM TPR601W
WHERE TPR601WID LIKE 'PRW' + @TODAY_STR + '%';

PRINT 'TPR504 기존 시퀀스 최대값: ' + CAST(@PO_OFFSET AS VARCHAR);
PRINT 'TPR601 기존 시퀀스 최대값: ' + CAST(@PR_OFFSET AS VARCHAR);
PRINT 'TPR601W 기존 시퀀스 최대값: ' + CAST(@PRW_OFFSET AS VARCHAR);
PRINT 'TPR605 기존 시퀀스 최대값: ' + CAST(@QC_OFFSET AS VARCHAR);

-- =====================================================================
-- [SECTION 4] TPR504 생산지시 INSERT
-- =====================================================================
PRINT '=== TPR504 생산지시 INSERT 시작 ===';

INSERT INTO TPR504 (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODWORK_SEQ,
    WORK_SEQ,
    PRODPLAN_ID,
    PRODORDER_ID,
    TPR504ID,
    WORKORDER_SEQ,
    WORK_CODE,
    WORKDT_DATE,
    ITEM_CODE,
    PROD_CODE,
    EQUIP_SYS_CD,
    ORDER_FLAG,
    LOT_NO,
    PROD_QTY,
    OPMAN_CODE,
    OPTIME
)
SELECT
    T.FACTORY_CODE,
    T.PRODPLAN_DATE,
    T.PRODPLAN_SEQ,
    T.PRODWORK_SEQ,
    T.WORK_SEQ,
    T.PRODPLAN_ID,
    -- PRODORDER_ID / TPR504ID = 'PO' + YYYYMMDD + 4자리 순번
    'PO' + @TODAY_STR + RIGHT('0000' + CAST(T.ROW_NUM + @PO_OFFSET AS VARCHAR), 4),
    'PO' + @TODAY_STR + RIGHT('0000' + CAST(T.ROW_NUM + @PO_OFFSET AS VARCHAR), 4),
    T.ROW_NUM,                   -- WORKORDER_SEQ = TPR110D_SEQ 기준 (selectProdOrders ORDER BY WORKORDER_SEQ)
    T.WORK_CODE,                 -- 이미 LEFT(10) 적용됨
    T.PROD_DATE,                 -- 작업일자 = 계획의 생산일자
    LEFT(T.ITEM_CODE, 20),       -- TPR504.ITEM_CODE NVARCHAR(20)
    T.PROD_CODE,                 -- BOM 제품코드 또는 ITEM_CODE (이미 LEFT(20) 적용됨)
    T.EQUIP_SYS_CD,
    'O',                         -- 지시완료
    LEFT(T.LOT_NO, 20),         -- TPR504.LOT_NO NVARCHAR(20)
    CAST(T.PROD_QTY AS INT),
    @OPMAN_CODE,
    GETDATE()
FROM #TARGET_PLANS T;

PRINT 'TPR504 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 5] TPR301 / TPR301M 업데이트
--             (시스템 서비스 로직과 동일: EgovProductionOrderServiceImpl.updatePlanLotNo)
-- =====================================================================
PRINT '=== TPR301 ORDER_FLAG / LOT_NO 업데이트 ===';

-- TPR301.ORDER_FLAG → 'ORDERED'
-- TPR301.LOT_NO     → 생산지시 시 채번된 LOT_NO (updateProdPlanLotNo)
UPDATE P
SET    P.ORDER_FLAG  = 'ORDERED',
       P.LOT_NO      = T.LOT_NO,
       P.OPMAN_CODE2 = @OPMAN_CODE,
       P.OPTIME2     = GETDATE()
FROM   TPR301 P
INNER JOIN #TARGET_PLANS T
    ON  T.FACTORY_CODE   = P.FACTORY_CODE
    AND T.PRODPLAN_DATE  = P.PRODPLAN_DATE
    AND T.PRODPLAN_SEQ   = P.PRODPLAN_SEQ
    AND T.PRODWORK_SEQ   = P.PRODWORK_SEQ;

PRINT 'TPR301 업데이트 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- TPR301M.ORDER_FLAG  → 'IN_PROGRESS'
-- TPR301M.ITEM_LOT_NO → 동일 계획의 LOT_NO (updateProdPlanLotNo2)
-- (CHECK 제약 허용값: PLANNED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)
-- PRODPLAN_SEQ 기준 첫 번째 LOT_NO 사용 (계획 내 첫 번째 작업순번)
UPDATE M
SET    M.ORDER_FLAG   = 'IN_PROGRESS',
       M.ITEM_LOT_NO  = (
           SELECT TOP 1 T2.LOT_NO
           FROM   #TARGET_PLANS T2
           WHERE  T2.FACTORY_CODE  = M.FACTORY_CODE
             AND  T2.PRODPLAN_DATE = M.PRODPLAN_DATE
             AND  T2.PRODPLAN_SEQ  = M.PRODPLAN_SEQ
           ORDER  BY T2.PRODWORK_SEQ
       ),
       M.OPMAN_CODE2  = @OPMAN_CODE,
       M.OPTIME2      = GETDATE()
FROM   TPR301M M
WHERE  M.FACTORY_CODE  = @FACTORY_CODE
  AND  M.ORDER_FLAG   != 'COMPLETED'
  AND  EXISTS (
      SELECT 1 FROM #TARGET_PLANS T
      WHERE T.FACTORY_CODE  = M.FACTORY_CODE
        AND T.PRODPLAN_DATE = M.PRODPLAN_DATE
        AND T.PRODPLAN_SEQ  = M.PRODPLAN_SEQ
  );

PRINT 'TPR301M 업데이트 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 6] TPR601 생산실적 INSERT
-- =====================================================================
PRINT '=== TPR601 생산실적 INSERT 시작 ===';

-- TPR504에 방금 INSERT된 지시 기반으로 실적 생성
IF OBJECT_ID('tempdb..#TARGET_ORDERS') IS NOT NULL DROP TABLE #TARGET_ORDERS;

SELECT
    O.FACTORY_CODE,
    O.PRODPLAN_DATE,
    O.PRODPLAN_SEQ,
    O.PRODWORK_SEQ,
    O.WORK_SEQ,
    O.TPR504ID,
    O.ITEM_CODE,
    O.WORK_CODE,
    O.PROD_QTY,
    O.WORKDT_DATE,
    T.WORKER_CODE,               -- 계획에 지정된 작업자 코드
    -- 양품/불량 수량 계산
    FLOOR(O.PROD_QTY * @GOOD_RATIO)               AS GOOD_QTY,
    O.PROD_QTY - FLOOR(O.PROD_QTY * @GOOD_RATIO)  AS BAD_QTY,
    1 AS PROD_SEQ,
    ROW_NUMBER() OVER (ORDER BY O.PRODPLAN_DATE, O.PRODPLAN_SEQ, O.PRODWORK_SEQ) AS ROW_NUM
INTO #TARGET_ORDERS
FROM TPR504 O
INNER JOIN #TARGET_PLANS T
    ON  T.FACTORY_CODE  = O.FACTORY_CODE
    AND T.PRODPLAN_DATE = O.PRODPLAN_DATE
    AND T.PRODPLAN_SEQ  = O.PRODPLAN_SEQ
    AND T.PRODWORK_SEQ  = O.PRODWORK_SEQ
    AND T.WORK_SEQ      = O.WORK_SEQ
WHERE ISNULL(O.DELETE_FLAG, '0') != '1';

INSERT INTO TPR601 (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODWORK_SEQ,
    WORK_SEQ,
    PROD_SEQ,
    TPR601ID,
    TPR504ID,
    ITEM_CODE,
    WORK_CODE,
    PROD_STIME,
    PROD_ETIME,
    ORDER_FLAG,
    PROD_QTY,
    GOOD_QTY,
    BAD_QTY,
    RCV_QTY,
    WORKORDER_SEQ,
    OPMAN_CODE,
    OPTIME
)
SELECT
    O.FACTORY_CODE,
    O.PRODPLAN_DATE,
    O.PRODPLAN_SEQ,
    O.PRODWORK_SEQ,
    O.WORK_SEQ,
    O.PROD_SEQ,
    -- TPR601ID = 'PR' + YYYYMMDD + 4자리 순번
    'PR' + @TODAY_STR + RIGHT('0000' + CAST(O.ROW_NUM + @PR_OFFSET AS VARCHAR), 4),
    O.TPR504ID,
    O.ITEM_CODE,
    O.WORK_CODE,
    -- 생산시작: 작업일자 08:00:00
    CAST(
        CAST(LEFT(O.WORKDT_DATE, 4) AS VARCHAR) + '-'
        + CAST(SUBSTRING(O.WORKDT_DATE, 5, 2) AS VARCHAR) + '-'
        + CAST(RIGHT(O.WORKDT_DATE, 2) AS VARCHAR)
        + ' 08:00:00' AS DATETIME2
    ),
    -- 생산종료: 작업일자 17:00:00
    CAST(
        CAST(LEFT(O.WORKDT_DATE, 4) AS VARCHAR) + '-'
        + CAST(SUBSTRING(O.WORKDT_DATE, 5, 2) AS VARCHAR) + '-'
        + CAST(RIGHT(O.WORKDT_DATE, 2) AS VARCHAR)
        + ' 17:00:00' AS DATETIME2
    ),
    '0',                         -- ORDER_FLAG 기본값
    O.PROD_QTY,
    O.GOOD_QTY,
    O.BAD_QTY,
    O.GOOD_QTY,                  -- RCV_QTY = 양품수량
    O.PROD_SEQ,                  -- WORKORDER_SEQ = PROD_SEQ
    @OPMAN_CODE,
    GETDATE()
FROM #TARGET_ORDERS O;

PRINT 'TPR601 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 7] TPR601W 생산실적 작업자 INSERT
--             (시스템 서비스 로직과 동일: saveProductionResultWorkers)
-- =====================================================================
PRINT '=== TPR601W 생산실적 작업자 INSERT 시작 ===';

INSERT INTO TPR601W (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODWORK_SEQ,
    WORK_SEQ,
    PROD_SEQ,
    WORKER_SEQ,
    WORKER_CODE,
    TPR601WID,
    TPR601ID
)
SELECT
    O.FACTORY_CODE,
    O.PRODPLAN_DATE,
    O.PRODPLAN_SEQ,
    O.PRODWORK_SEQ,
    O.WORK_SEQ,
    O.PROD_SEQ,
    1,                           -- WORKER_SEQ: 실적 1건당 작업자 1명 (COUNT(*)+1 = 1)
    ISNULL(O.WORKER_CODE, @DEFAULT_WORKER_CODE),  -- 계획 작업자 우선, 없으면 기본값
    -- TPR601WID = 'PRW' + YYYYMMDD + 3자리 순번
    'PRW' + @TODAY_STR + RIGHT('000' + CAST(O.ROW_NUM + @PRW_OFFSET AS VARCHAR), 3),
    -- TPR601ID = 방금 INSERT된 실적 ID
    'PR' + @TODAY_STR + RIGHT('0000' + CAST(O.ROW_NUM + @PR_OFFSET AS VARCHAR), 4)
FROM #TARGET_ORDERS O;

PRINT 'TPR601W INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 8] TPR605 불량 상세 INSERT (BAD_QTY > 0 인 것만)
-- =====================================================================
PRINT '=== TPR605 불량 상세 INSERT 시작 ===';

INSERT INTO TPR605 (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODWORK_SEQ,
    WORK_SEQ,
    PROD_SEQ,
    WORK_CODE,
    QC_CODE,
    QC_QTY,
    BAD_SEQ,
    TPR605ID
)
SELECT
    O.FACTORY_CODE,
    O.PRODPLAN_DATE,
    O.PRODPLAN_SEQ,
    O.PRODWORK_SEQ,
    O.WORK_SEQ,
    O.PROD_SEQ,
    O.WORK_CODE,
    @QC_CODE,                    -- 불량코드
    O.BAD_QTY,                   -- 불량수량
    1,                           -- BAD_SEQ
    -- TPR605ID = 'QC' + YYYYMMDD + 4자리 순번
    'QC' + @TODAY_STR + RIGHT('0000' + CAST(O.ROW_NUM + @QC_OFFSET AS VARCHAR), 4)
FROM #TARGET_ORDERS O
WHERE O.BAD_QTY > 0;

PRINT 'TPR605 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- =====================================================================
-- [SECTION 9] 임시 테이블 정리
-- =====================================================================
IF OBJECT_ID('tempdb..#TARGET_PLANS')  IS NOT NULL DROP TABLE #TARGET_PLANS;
IF OBJECT_ID('tempdb..#TARGET_ORDERS') IS NOT NULL DROP TABLE #TARGET_ORDERS;
IF OBJECT_ID('tempdb..#LOT_MAP')       IS NOT NULL DROP TABLE #LOT_MAP;

-- =====================================================================
-- [SECTION 10] 결과 검증 쿼리
-- =====================================================================
PRINT '';
PRINT '=== 생성 결과 요약 ===';

SELECT
    '생산지시(TPR504)'  AS 테이블,
    COUNT(*)            AS 전체건수,
    SUM(PROD_QTY)       AS 총지시수량
FROM TPR504
WHERE FACTORY_CODE = '000001'
  AND ISNULL(DELETE_FLAG, '0') != '1'
  AND TPR504ID LIKE 'PO' + @TODAY_STR + '%'

UNION ALL

SELECT
    '생산실적(TPR601)',
    COUNT(*),
    SUM(PROD_QTY)
FROM TPR601
WHERE FACTORY_CODE = '000001'
  AND TPR601ID LIKE 'PR' + @TODAY_STR + '%'

UNION ALL

SELECT
    '불량상세(TPR605)',
    COUNT(*),
    SUM(QC_QTY)
FROM TPR605
WHERE TPR605ID LIKE 'QC' + @TODAY_STR + '%';

-- 양품/불량 수량 검증
SELECT
    SUM(PROD_QTY)   AS 총생산수량,
    SUM(GOOD_QTY)   AS 총양품수량,
    SUM(BAD_QTY)    AS 총불량수량,
    CAST(
        CASE WHEN SUM(PROD_QTY) > 0
             THEN ROUND(SUM(GOOD_QTY) * 100.0 / SUM(PROD_QTY), 2)
             ELSE 0 END
    AS VARCHAR) + '%' AS 양품율
FROM TPR601
WHERE FACTORY_CODE = '000001'
  AND TPR601ID LIKE 'PR' + @TODAY_STR + '%';
