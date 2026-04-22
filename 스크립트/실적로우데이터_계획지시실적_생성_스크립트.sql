-- =============================================================================
-- 실적 로우 데이터 기반 계획→지시→실적 생성 스크립트 (MSSQL)
-- =============================================================================
-- 목적  : 엑셀 생산실적/불량현황 로우 데이터를 스테이징 테이블에 적재 후
--         TPR301M(계획마스터) → TPR301(계획상세) → TPR504(생산지시) →
--         TPR601(생산실적) → TPR601W(작업자) → TPR605(불량상세) 순으로 생성
-- 대상  : MSSQL
-- 용도  : 시스템 워크플로우(계획→지시→실적) 검증용 샘플 데이터
-- 전제  : 기존 스크립트와 달리 TPR301 데이터가 없는 상태에서 시작 (역방향 생성)
-- 작성일: 2026-04-21
--
-- ★ 실행 순서 ★
--   1단계: [SECTION A] 스테이징 테이블 DDL 실행 (테이블 생성)
--   2단계: [SECTION B] [생산실적$].PROD_DATE 기준으로 스테이징 자동 적재
--   3단계: [SECTION C] @PROD_DATE 날짜 확인 후 마이그레이션 실행 (TPR 테이블 생성)
--   4단계: [SECTION D] 검증 쿼리 실행 (결과 확인)
-- =============================================================================


-- =============================================================================
-- [SECTION A] 스테이징 테이블 DDL
-- =============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- A-1. 생산실적 스테이징 테이블
-- ───────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[STAGING_PROD_RESULT]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[STAGING_PROD_RESULT] (
        [LOAD_SEQ]       INT            IDENTITY(1,1) PRIMARY KEY,  -- 적재순번 (자동)
        [LOAD_DT]        DATETIME2      NOT NULL DEFAULT GETDATE(),  -- 적재일시 (자동)

        -- ── 날짜 (STIME/ETIME이 HH:MM 형식만 있을 경우 여기서 날짜 지정) ──
        [PROD_DATE]      NVARCHAR(8)    NOT NULL DEFAULT CONVERT(CHAR(8), GETDATE(), 112), -- 생산일자 YYYYMMDD

        -- ── 엑셀 컬럼 원본 ──
        [ITEM_LOT_NO]    NVARCHAR(50)   NOT NULL,   -- 롯번호 (item_lot_no)
        [ITEM_CODE]      NVARCHAR(50)   NOT NULL,   -- 품목코드
        [PORD_ITEM_CODE] NVARCHAR(50)   NULL,        -- 공정생산품 코드
        [WORK_CODE]      NVARCHAR(20)   NOT NULL,   -- 공정코드
        [WORK_NAME]      NVARCHAR(100)  NULL,        -- 공정명 (참조용)
        [PROD_STIME]     NVARCHAR(10)   NULL,        -- 작업시작시간 (HH:MM 형식, 예: '14:30')
        [PROD_ETIME]     NVARCHAR(10)   NULL,        -- 작업종료시간 (HH:MM 형식, 예: '15:30')
        [PROD_QTY]       DECIMAL(18,3)  NOT NULL DEFAULT 0,  -- 생산수량
        [GOOD_QTY]       DECIMAL(18,3)  NOT NULL DEFAULT 0,  -- 양품수량
        [BAD_QTY]        DECIMAL(18,3)  NOT NULL DEFAULT 0,  -- 불량수량
        [RCV_QTY]        DECIMAL(18,3)  NOT NULL DEFAULT 0,  -- 입고수량
        [WORKORDER_SEQ]  INT            NULL,        -- 작업순서
        [WORKER_CODE]    NVARCHAR(20)   NULL         -- 작업자코드 (없으면 'admin' 자동 대체)
    );

    -- 조회 성능 인덱스
    CREATE INDEX [IX_STAGING_PROD_RESULT_LOT]  ON [dbo].[STAGING_PROD_RESULT] ([ITEM_LOT_NO]);
    CREATE INDEX [IX_STAGING_PROD_RESULT_ITEM] ON [dbo].[STAGING_PROD_RESULT] ([ITEM_CODE]);

    PRINT '테이블 생성 완료: STAGING_PROD_RESULT';
END
ELSE
    PRINT '이미 존재: STAGING_PROD_RESULT';
GO

-- ───────────────────────────────────────────────────────────────────────────
-- A-2. 불량현황 스테이징 테이블
-- ───────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[STAGING_PROD_DEFECT]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[STAGING_PROD_DEFECT] (
        [LOAD_SEQ]       INT            IDENTITY(1,1) PRIMARY KEY,  -- 적재순번 (자동)
        [LOAD_DT]        DATETIME2      NOT NULL DEFAULT GETDATE(),  -- 적재일시 (자동)

        -- ── 엑셀 컬럼 원본 ──
        [ITEM_LOT_NO]    NVARCHAR(50)   NOT NULL,   -- 롯번호 (STAGING_PROD_RESULT.ITEM_LOT_NO 매칭 키)
        [ITEM_CODE]      NVARCHAR(50)   NOT NULL,   -- 품목코드
        [WORK_CODE]      NVARCHAR(20)   NOT NULL,   -- 공정코드
        [WORK_NAME]      NVARCHAR(100)  NULL,        -- 공정명 (참조용)
        [QC_CODE]        NVARCHAR(50)   NOT NULL,   -- 불량유형 (코드값 또는 한글명)
        [QC_QTY]         DECIMAL(18,3)  NOT NULL DEFAULT 0  -- 불량수량
    );

    -- 조회 성능 인덱스
    CREATE INDEX [IX_STAGING_PROD_DEFECT_LOT] ON [dbo].[STAGING_PROD_DEFECT] ([ITEM_LOT_NO]);

    PRINT '테이블 생성 완료: STAGING_PROD_DEFECT';
END
ELSE
    PRINT '이미 존재: STAGING_PROD_DEFECT';
GO


-- =============================================================================
-- [SECTION B] 엑셀 임포트 테이블 → 스테이징 테이블 INSERT
-- =============================================================================
-- 엑셀을 MSSQL로 임포트하면 [생산실적$], [불량현황$] 테이블이 생성됩니다.
-- 아래 SQL이 해당 테이블에서 STAGING으로 변환 적재합니다.
--
-- ★ PROD_DATE 처리: [생산실적$].PROD_DATE 값을 우선 사용합니다.
--   형식이 YYYYMMDD(112) 또는 일반 날짜 문자열이면 YYYYMMDD로 변환 저장합니다.
--   변환 실패/공백이면 당일(GETDATE())로 폴백합니다.
--
-- PROD_STIME/ETIME 처리:
--   엑셀 시간 전용 셀은 임포트 시 '1899-12-30 HH:MM:SS.000' 형태로 저장됨
--   → LEFT(CONVERT(NVARCHAR(8), PROD_STIME, 108), 5) 로 'HH:MM' 추출
--
-- WORKORDER_SEQ 처리:
--   엑셀의 '작업순서' 컬럼은 텍스트(예: 'ROD 워크센터') → INT 변환 불가
--   → NULL 저장 (마이그레이션 시 TPR110D_SEQ 공정흐름 값으로 대체됨)
--
-- WORKER_CODE 처리:
--   한글 작업자명은 시스템 코드가 아니므로 'admin'으로 대체
--   실제 코드 매핑 필요 시: SELECT WORKER_ID, WORKER_NAME FROM TCO601 WHERE USE_YN = 'Y';
-- =============================================================================

-- (랜덤 날짜 변수 제거: 생산실적$.PROD_DATE 사용)

-- ★ 생산실적$ 적재 기간 필터 (2026-03-01 ~ 2026-03-31)
DECLARE @IMPORT_FROM_DATE DATE = '2026-03-01';
DECLARE @IMPORT_TO_DATE   DATE = '2026-04-01';  -- 미만(<) 비교용 다음달 1일

-- ───────────────────────────────────────────────────────────────────────────
-- B-1. 기존 스테이징 데이터 초기화 (재실행 안전)
-- ───────────────────────────────────────────────────────────────────────────
TRUNCATE TABLE STAGING_PROD_RESULT;
TRUNCATE TABLE STAGING_PROD_DEFECT;
PRINT '스테이징 테이블 초기화 완료';

-- ───────────────────────────────────────────────────────────────────────────
-- B-2. [생산실적$] → STAGING_PROD_RESULT
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO STAGING_PROD_RESULT (
    PROD_DATE,
    ITEM_LOT_NO,
    ITEM_CODE,
    PORD_ITEM_CODE,
    WORK_CODE,
    WORK_NAME,
    PROD_STIME,
    PROD_ETIME,
    PROD_QTY,
    GOOD_QTY,
    BAD_QTY,
    RCV_QTY,
    WORKORDER_SEQ,
    WORKER_CODE
)
SELECT
    -- PROD_DATE: 생산실적$.PROD_DATE(DATETIME) 우선 사용, 필요 시 문자열 파싱 폴백
    COALESCE(
        CONVERT(CHAR(8), TRY_CONVERT(DATE, PROD_DATE), 112),
        CONVERT(CHAR(8), TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX)))), 112), 112),
        CONVERT(CHAR(8), TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX))))), 112),
        CONVERT(CHAR(8), GETDATE(), 112)
    ),
    -- 롯번호: NULL 방어 + 최대 50자 (STAGING 컬럼 크기)
    LEFT(ISNULL(LTRIM(RTRIM(CAST(ITEM_LOT_NO    AS NVARCHAR(MAX)))), ''), 50),
    -- 품목코드: 최대 50자
    LEFT(ISNULL(LTRIM(RTRIM(CAST(ITEM_CODE      AS NVARCHAR(MAX)))), ''), 50),
    -- 공정생산품: NULL 허용, 최대 50자
    NULLIF(LEFT(LTRIM(RTRIM(CAST(PORD_ITEM_CODE AS NVARCHAR(MAX)))), 50), ''),
    -- 공정코드: 최대 20자
    LEFT(ISNULL(LTRIM(RTRIM(CAST(WORK_CODE      AS NVARCHAR(MAX)))), ''), 20),
    -- 공정명: 최대 100자
    NULLIF(LEFT(LTRIM(RTRIM(CAST(WORK_NAME      AS NVARCHAR(MAX)))), 100), ''),
    -- 시작시간: 엑셀 시간 전용 값(1899-12-30 HH:MM:SS) → 'HH:MM' 추출 (최대 10자)
    LEFT(CASE
        WHEN TRY_CAST(PROD_STIME AS DATETIME) IS NOT NULL
        THEN CONVERT(NVARCHAR(8), TRY_CAST(PROD_STIME AS DATETIME), 108)
        ELSE LTRIM(RTRIM(CAST(PROD_STIME AS NVARCHAR(MAX))))
    END, 5),
    -- 종료시간 (최대 10자)
    LEFT(CASE
        WHEN TRY_CAST(PROD_ETIME AS DATETIME) IS NOT NULL
        THEN CONVERT(NVARCHAR(8), TRY_CAST(PROD_ETIME AS DATETIME), 108)
        ELSE LTRIM(RTRIM(CAST(PROD_ETIME AS NVARCHAR(MAX))))
    END, 5),
    -- 수량: NULL → 0 방어
    ISNULL(TRY_CAST(PROD_QTY AS DECIMAL(18,3)), 0),
    ISNULL(TRY_CAST(GOOD_QTY AS DECIMAL(18,3)), 0),
    ISNULL(TRY_CAST(BAD_QTY  AS DECIMAL(18,3)), 0),
    ISNULL(TRY_CAST(RCV_QTY  AS DECIMAL(18,3)), 0),
    -- WORKORDER_SEQ: 엑셀 '작업순서' 컬럼이 텍스트('ROD 워크센터' 등)이면 NULL
    TRY_CAST(WORKORDER_SEQ AS INT),
    -- WORKER_CODE: 한글 작업자명 → NULL 저장, 마이그레이션 시 'admin' 대체
    NULLIF(LEFT(LTRIM(RTRIM(CAST(WORKER_CODE AS NVARCHAR(MAX)))), 20), '')
FROM [생산실적$]
WHERE LEN(LTRIM(RTRIM(CAST(ITEM_LOT_NO AS NVARCHAR(MAX))))) > 0  -- 빈 행 제외
    AND LEN(LTRIM(RTRIM(CAST(ITEM_CODE   AS NVARCHAR(MAX))))) > 0
    AND COALESCE(
                TRY_CONVERT(DATE, PROD_DATE),
                TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX)))), 112),
                TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX)))))
            ) >= @IMPORT_FROM_DATE
    AND COALESCE(
                TRY_CONVERT(DATE, PROD_DATE),
                TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX)))), 112),
                TRY_CONVERT(DATE, LTRIM(RTRIM(CAST(PROD_DATE AS NVARCHAR(MAX)))))
            ) < @IMPORT_TO_DATE;

PRINT '[생산실적$] → STAGING_PROD_RESULT 적재 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- B-3. [불량현황$] → STAGING_PROD_DEFECT  (테이블이 있을 경우에만 실행)
-- ───────────────────────────────────────────────────────────────────────────
IF OBJECT_ID(N'[dbo].[불량현황$]') IS NOT NULL
BEGIN
    INSERT INTO STAGING_PROD_DEFECT (
        ITEM_LOT_NO,
        ITEM_CODE,
        WORK_CODE,
        WORK_NAME,
        QC_CODE,
        QC_QTY
    )
    SELECT
        ISNULL(LTRIM(RTRIM(CAST(ITEM_LOT_NO AS NVARCHAR(50)))), ''),
        ISNULL(LTRIM(RTRIM(CAST(ITEM_CODE   AS NVARCHAR(50)))), ''),
        ISNULL(LTRIM(RTRIM(CAST(WORK_CODE   AS NVARCHAR(20)))), ''),
        NULLIF(LTRIM(RTRIM(CAST(WORK_NAME   AS NVARCHAR(100)))), ''),
        -- QC_CODE: 한글명 그대로 저장 (마이그레이션 시 MES_CCMMNDETAIL_CODE 조인으로 코드 변환)
        ISNULL(LTRIM(RTRIM(CAST(QC_CODE     AS NVARCHAR(50)))), 'UNKNOWN'),
        ISNULL(TRY_CAST(QC_QTY AS DECIMAL(18,3)), 0)
    FROM [불량현황$]
    WHERE ISNULL(LTRIM(RTRIM(CAST(ITEM_LOT_NO AS NVARCHAR(50)))), '') <> ''
      AND ISNULL(TRY_CAST(QC_QTY AS DECIMAL(18,3)), 0) > 0;

    PRINT '[불량현황$] → STAGING_PROD_DEFECT 적재 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';
END
ELSE
    PRINT '[불량현황$] 테이블 없음 — STAGING_PROD_DEFECT 적재 건너뜀';

-- 스테이징 적재 결과 확인
SELECT '실적' AS 구분, COUNT(*) AS 건수, SUM(PROD_QTY) AS 총생산수량, SUM(BAD_QTY) AS 총불량수량 FROM STAGING_PROD_RESULT
UNION ALL
SELECT '불량', COUNT(*), NULL, SUM(QC_QTY) FROM STAGING_PROD_DEFECT;


-- =============================================================================
-- [SECTION C] 마이그레이션 SQL
-- ★ 주의: STAGING 테이블에 데이터를 INSERT한 후 실행하세요.
-- =============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- C-0. 설정 변수
-- ★ @PROD_DATE: SECTION B의 PROD_DATE 변환 실패/공백 시 사용할 폴백 날짜
-- ───────────────────────────────────────────────────────────────────────────
DECLARE @FACTORY_CODE            NVARCHAR(10)  = '000001';  -- 공장코드
DECLARE @OPMAN_CODE              NVARCHAR(20)  = 'admin';    -- 등록자 ID
DECLARE @PROD_DATE               NVARCHAR(8)   = '20260421'; -- PROD_DATE 폴백값 (YYYYMMDD)
DECLARE @DEFAULT_WORKER_CODE     NVARCHAR(20)  = 'admin';    -- WORKER_CODE 없을 때 기본값
DECLARE @DEFAULT_WORKCENTER_CODE NVARCHAR(20)  = 'WC001';   -- WORKCENTER_CODE 기본값
--   ↑ 실제 작업장 코드 확인: SELECT WORKCENTER_CODE, WORKCENTER_NAME FROM TPR101 WHERE USE_YN = 'Y';

-- ───────────────────────────────────────────────────────────────────────────
-- C-1. 스테이징 데이터 존재 여부 확인
-- ───────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM STAGING_PROD_RESULT)
BEGIN
    RAISERROR('STAGING_PROD_RESULT 테이블에 데이터가 없습니다. SECTION B의 INSERT를 먼저 실행하세요.', 16, 1);
    RETURN;
END

DECLARE @STAGING_COUNT INT = (SELECT COUNT(*) FROM STAGING_PROD_RESULT);
DECLARE @DEFECT_COUNT  INT = (SELECT COUNT(*) FROM STAGING_PROD_DEFECT);
PRINT '스테이징 실적 건수: ' + CAST(@STAGING_COUNT AS VARCHAR);
PRINT '스테이징 불량 건수: ' + CAST(@DEFECT_COUNT AS VARCHAR);

-- ───────────────────────────────────────────────────────────────────────────
-- C-2. 오늘 날짜 기반 ID 채번 준비
-- ───────────────────────────────────────────────────────────────────────────
DECLARE @TODAY_STR CHAR(8) = CONVERT(CHAR(8), GETDATE(), 112); -- YYYYMMDD

-- 당일 기존 시퀀스 최대값 확인 (중복 방지)
DECLARE @PP_OFFSET  INT;  -- TPR301M PRODPLAN_ID 시퀀스
DECLARE @PO_OFFSET  INT;  -- TPR504  TPR504ID 시퀀스
DECLARE @PR_OFFSET  INT;  -- TPR601  TPR601ID 시퀀스
DECLARE @PRW_OFFSET INT;  -- TPR601W TPR601WID 시퀀스
DECLARE @QC_OFFSET  INT;  -- TPR605  TPR605ID 시퀀스

-- TPR504 문자열 컬럼 길이 (운영 DB 스키마 기준 동적 조회)
DECLARE @L504_FACTORY_CODE INT = 6;
DECLARE @L504_PRODPLAN_ID  INT = 20;
DECLARE @L504_PRODORDER_ID INT = 20;
DECLARE @L504_TPR504ID     INT = 20;
DECLARE @L504_WORK_CODE    INT = 10;
DECLARE @L504_ITEM_CODE    INT = 20;
DECLARE @L504_PROD_CODE    INT = 20;
DECLARE @L504_EQUIP_SYS_CD INT = 10;
DECLARE @L504_LOT_NO       INT = 20;
DECLARE @L504_OPMAN_CODE   INT = 10;

SELECT
    @L504_FACTORY_CODE = MAX(CASE WHEN C.NAME = 'FACTORY_CODE' THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_PRODPLAN_ID  = MAX(CASE WHEN C.NAME = 'PRODPLAN_ID'  THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_PRODORDER_ID = MAX(CASE WHEN C.NAME = 'PRODORDER_ID' THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_TPR504ID     = MAX(CASE WHEN C.NAME = 'TPR504ID'     THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_WORK_CODE    = MAX(CASE WHEN C.NAME = 'WORK_CODE'    THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_ITEM_CODE    = MAX(CASE WHEN C.NAME = 'ITEM_CODE'    THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_PROD_CODE    = MAX(CASE WHEN C.NAME = 'PROD_CODE'    THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_EQUIP_SYS_CD = MAX(CASE WHEN C.NAME = 'EQUIP_SYS_CD' THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_LOT_NO       = MAX(CASE WHEN C.NAME = 'LOT_NO'       THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END),
    @L504_OPMAN_CODE   = MAX(CASE WHEN C.NAME = 'OPMAN_CODE'   THEN CASE WHEN C.max_length < 0 THEN 4000 ELSE C.max_length / 2 END END)
FROM sys.columns C
WHERE C.object_id = OBJECT_ID('dbo.TPR504');

SELECT @PP_OFFSET = ISNULL(MAX(
    CASE WHEN ISNUMERIC(RIGHT(PRODPLAN_ID, 4)) = 1 THEN CAST(RIGHT(PRODPLAN_ID, 4) AS INT) ELSE 0 END
), 0)
FROM TPR301M WHERE PRODPLAN_ID LIKE 'PP' + @TODAY_STR + '%';

SELECT @PO_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR504ID, 4) AS INT)), 0)
FROM TPR504 WHERE TPR504ID LIKE 'PO' + @TODAY_STR + '%';

SELECT @PR_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR601ID, 4) AS INT)), 0)
FROM TPR601 WHERE TPR601ID LIKE 'PR' + @TODAY_STR + '%';

SELECT @PRW_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR601WID, 3) AS INT)), 0)
FROM TPR601W WHERE TPR601WID LIKE 'PRW' + @TODAY_STR + '%';

SELECT @QC_OFFSET = ISNULL(MAX(CAST(RIGHT(TPR605ID, 4) AS INT)), 0)
FROM TPR605 WHERE TPR605ID LIKE 'QC' + @TODAY_STR + '%';

PRINT 'ID 시퀀스 오프셋 — PP:' + CAST(@PP_OFFSET AS VARCHAR)
    + ', PO:' + CAST(@PO_OFFSET AS VARCHAR)
    + ', PR:' + CAST(@PR_OFFSET AS VARCHAR)
    + ', PRW:' + CAST(@PRW_OFFSET AS VARCHAR)
    + ', QC:' + CAST(@QC_OFFSET AS VARCHAR);

-- ───────────────────────────────────────────────────────────────────────────
-- C-3. 기본 작업 데이터 준비 (#BASE_DATA)
--      스테이징 각 행을 계획/지시/실적 1:1 단위로 확장
--
--  ★ 공정흐름(selectFlowProcess) 동일 조인 구조:
--     TPR112(품목→작업지시 매핑) → TPR110(작업지시 마스터)
--     → TPR110D(공정 단계 상세) 로 TPR110D_SEQ · EQUIP_SYS_CD 확보
--     ※ 공정흐름 미등록 품목은 INSERT 대상에서 제외
--
--  ★ WORK_SEQ 아키텍처:
--     실제 시스템: selectProdOrderWorkSeq = COUNT(*)+1 (동일 plan 내)
--     본 스크립트: 스테이징 1행 = 계획/지시/실적 1세트 생성
--     단, WORK_SEQ는 TPR110D.WORK_SEQ(공정흐름 순번)를 우선 사용
--     TPR110D_SEQ 와 WORKORDER_SEQ 를 공정흐름 순번으로 채워 UI 정렬 보장
-- ───────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('tempdb..#BASE_DATA') IS NOT NULL DROP TABLE #BASE_DATA;

;WITH S_AGG AS (
    SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(S.PROD_DATE)), ''), @PROD_DATE) AS PROD_DATE,
        LEFT(ISNULL(LTRIM(RTRIM(S.ITEM_LOT_NO)), ''), 50)         AS ITEM_LOT_NO,
        LEFT(ISNULL(LTRIM(RTRIM(S.ITEM_CODE)), ''), 50)           AS ITEM_CODE,
        LEFT(ISNULL(S.PORD_ITEM_CODE, S.ITEM_CODE), 20)           AS PROD_CODE,
        MIN(LEFT(ISNULL(LTRIM(RTRIM(S.WORK_CODE)), ''), 10))      AS PREF_WORK_CODE,
        MIN(S.PROD_STIME)                                          AS PROD_STIME,
        MAX(S.PROD_ETIME)                                          AS PROD_ETIME,
        SUM(S.PROD_QTY)                                            AS PROD_QTY,
        SUM(S.GOOD_QTY)                                            AS GOOD_QTY,
        SUM(S.BAD_QTY)                                             AS BAD_QTY,
        SUM(S.RCV_QTY)                                             AS RCV_QTY,
        MAX(S.WORKORDER_SEQ)                                       AS WORKORDER_SEQ,
        MAX(ISNULL(NULLIF(LTRIM(RTRIM(S.WORKER_CODE)), ''), @DEFAULT_WORKER_CODE)) AS WORKER_CODE
    FROM STAGING_PROD_RESULT S
    GROUP BY
        ISNULL(NULLIF(LTRIM(RTRIM(S.PROD_DATE)), ''), @PROD_DATE),
        LEFT(ISNULL(LTRIM(RTRIM(S.ITEM_LOT_NO)), ''), 50),
        LEFT(ISNULL(LTRIM(RTRIM(S.ITEM_CODE)), ''), 50),
        LEFT(ISNULL(S.PORD_ITEM_CODE, S.ITEM_CODE), 20)
)
SELECT
    -- 계획 1건 단위 키 (PROD_DATE + LOT + ITEM)
    ROW_NUMBER() OVER (ORDER BY S.PROD_DATE, S.ITEM_LOT_NO, S.ITEM_CODE) AS LOAD_SEQ,
    S.PROD_DATE,
    S.ITEM_LOT_NO,
    S.ITEM_CODE,
    S.PROD_CODE,
    LEFT(FLOW.WORK_CODE, 10)                          AS WORK_CODE,
    S.PROD_STIME,
    S.PROD_ETIME,
    S.PROD_QTY,
    S.GOOD_QTY,
    S.BAD_QTY,
    S.RCV_QTY,
    S.WORKORDER_SEQ,
    ISNULL(NULLIF(LTRIM(RTRIM(S.WORKER_CODE)), ''), @DEFAULT_WORKER_CODE) AS WORKER_CODE,

    -- 품목명: TCO403 조회, 없으면 ITEM_CODE 그대로
    LEFT(ISNULL(I.MATERIAL_NAME, S.ITEM_CODE), 200)  AS ITEM_NAME,

    -- 작업장코드: 공정흐름(TPR112→TPR110)의 WORKCENTER_CODE 우선, 없으면 공정마스터/기본값
    LEFT(ISNULL(FLOW.WORKCENTER_CODE, @DEFAULT_WORKCENTER_CODE), 20) AS WORKCENTER_CODE,

    -- ── 공정흐름(TPR110D) 기반 순번 ──────────────────────────────────────
    -- TPR110D.SEQ: 해당 품목의 공정흐름에서 매핑된 단계 순번
    -- → TPR504.TPR110D_SEQ, TPR504.WORKORDER_SEQ 에 사용
    -- TPR110D 매핑이 없으면 1로 폴백 (공정흐름 미등록은 WHERE에서 제외됨)
    ISNULL(FLOW.SEQ, 1)  AS TPR110D_SEQ,
    -- WORK_SEQ: 공정흐름(TPR110D.WORK_SEQ) 우선, 없으면 1
    ISNULL(FLOW.WORK_SEQ, 1)      AS FLOW_WORK_SEQ,
    -- 설비코드: TPR104(공정×설비 매핑) → TPR151 조회, 없으면 NULL
    E1.EQUIP_SYS_CD                AS EQUIP_SYS_CD,

    -- 전체 ROW 순번 (ID 채번용)
    ROW_NUMBER() OVER (ORDER BY S.PROD_DATE, S.ITEM_LOT_NO, S.ITEM_CODE) AS ROW_NUM

INTO #BASE_DATA
FROM S_AGG S
-- 품목명 조회 (TCO403: 품목 마스터)
LEFT JOIN TCO403 I
    ON  I.MATERIAL_CODE = S.ITEM_CODE
-- ── 공정흐름 조인 (selectFlowProcess 동일 구조) ──────────────────────────
-- 품목코드 기반으로 TPR112 → TPR110 → TPR110D에서 공정/작업장 1건 선택
OUTER APPLY (
    SELECT TOP 1
        WO1.WORKCENTER_CODE,
        WD1.WORK_CODE,
        WD1.SEQ,
        WD1.WORK_SEQ
    FROM TPR112 BM1
    INNER JOIN TPR110 WO1
        ON  WO1.FACTORY_CODE = BM1.FACTORY_CODE
        AND WO1.WORK_ORDER   = BM1.WORK_ORDER
    INNER JOIN TPR110D WD1
        ON  WD1.FACTORY_CODE = WO1.FACTORY_CODE
        AND WD1.WORK_ORDER   = WO1.WORK_ORDER
    WHERE BM1.FACTORY_CODE = @FACTORY_CODE
            AND BM1.PROD_CODE = S.ITEM_CODE
    ORDER BY
                CASE WHEN WD1.WORK_CODE = S.PREF_WORK_CODE THEN 0 ELSE 1 END,
        ISNULL(WD1.SEQ, 99999),
        ISNULL(WD1.WORK_SEQ, 99999)
) FLOW
-- 공정코드 기반 작업장코드 보조 조회 (FLOW 미매핑 시 폴백)
LEFT JOIN TPR102 P
    ON  P.FACTORY_CODE = @FACTORY_CODE
    AND P.WORK_CODE    = LEFT(FLOW.WORK_CODE, 10)
-- TPR104: 공정 × 설비 매핑
LEFT JOIN TPR104 EQ
    ON  EQ.WORK_CODE     = LEFT(FLOW.WORK_CODE, 10)
-- TPR151: 설비 마스터
LEFT JOIN TPR151 E1
    ON  E1.EQUIP_SYS_CD  = EQ.EQUIP_SYS_CD
WHERE FLOW.WORK_CODE IS NOT NULL;  -- 공정흐름 미등록 품목 제외

DECLARE @BASE_COUNT INT = (SELECT COUNT(*) FROM #BASE_DATA);
PRINT '#BASE_DATA 준비 완료: ' + CAST(@BASE_COUNT AS VARCHAR) + '건';

IF @BASE_COUNT = 0
BEGIN
    PRINT '처리할 데이터가 없습니다.';
    RETURN;
END

IF EXISTS (
    SELECT 1
    FROM #BASE_DATA
    WHERE ISNULL(LTRIM(RTRIM(EQUIP_SYS_CD)), '') = ''
)
BEGIN
    RAISERROR('공정-설비 연동(EQUIP_SYS_CD)이 누락된 항목이 있습니다. TPR104/TPR151 매핑 확인 후 재실행하세요.', 16, 1);
    RETURN;
END

-- ───────────────────────────────────────────────────────────────────────────
-- C-3-0. 생산계획 키 준비 (#PLAN_KEYS)
--        PRODPLAN_SEQ를 PROD_DATE별 기존 최대값 + 일자별 순번으로 산정
-- ───────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('tempdb..#PLAN_KEYS') IS NOT NULL DROP TABLE #PLAN_KEYS;

SELECT
        B.LOAD_SEQ,
        B.PROD_DATE,
        ISNULL(X.MAX_PRODPLAN_SEQ, 0)
            + ROW_NUMBER() OVER (PARTITION BY B.PROD_DATE ORDER BY B.ROW_NUM) AS NEW_PRODPLAN_SEQ
INTO #PLAN_KEYS
FROM #BASE_DATA B
OUTER APPLY (
                SELECT MAX(S.PRODPLAN_SEQ) AS MAX_PRODPLAN_SEQ
                FROM (
                        SELECT M.PRODPLAN_SEQ
                        FROM TPR301M M
                        WHERE M.FACTORY_CODE   = @FACTORY_CODE
                            AND M.PRODPLAN_DATE  = B.PROD_DATE

                        UNION ALL

                        SELECT D.PRODPLAN_SEQ
                        FROM TPR301 D
                        WHERE D.FACTORY_CODE   = @FACTORY_CODE
                            AND D.PRODPLAN_DATE  = B.PROD_DATE

                        UNION ALL

                        SELECT O.PRODPLAN_SEQ
                        FROM TPR504 O
                        WHERE O.FACTORY_CODE   = @FACTORY_CODE
                            AND O.PRODPLAN_DATE  = B.PROD_DATE
                ) S
) X;

-- ───────────────────────────────────────────────────────────────────────────
-- C-3-1. 지시용 공정흐름 확장 (#FLOW_ORDERS)
--        계획은 #BASE_DATA(1행), 지시는 공정흐름(TPR110D) 다건으로 생성
-- ───────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('tempdb..#FLOW_ORDERS') IS NOT NULL DROP TABLE #FLOW_ORDERS;
IF OBJECT_ID('tempdb..#BOM_TREE') IS NOT NULL DROP TABLE #BOM_TREE;

;WITH ROOT_ITEM AS (
    SELECT DISTINCT
        B.ITEM_CODE,
        ISNULL(M.ROOT_MATERIAL_ID, B.ITEM_CODE) AS ROOT_MATERIAL_ID
    FROM #BASE_DATA B
    OUTER APPLY (
        SELECT TOP 1 T.MATERIAL_ID AS ROOT_MATERIAL_ID
        FROM TCO403 T
        WHERE T.MATERIAL_CODE = B.ITEM_CODE
           OR T.MATERIAL_ID = B.ITEM_CODE
        ORDER BY CASE WHEN T.MATERIAL_CODE = B.ITEM_CODE THEN 0 ELSE 1 END
    ) M
),
BOM_TREE AS (
    SELECT
        CAST(R.ROOT_MATERIAL_ID AS NVARCHAR(50)) AS ROOT_ITEM_CODE,
        T.ITEM_SEQ,
        T.MAT_ITEM_SEQ,
        T.PROC_SEQ
    FROM ROOT_ITEM R
    INNER JOIN TCO501 T
        ON CAST(T.ITEM_SEQ AS NVARCHAR(50)) = R.ROOT_MATERIAL_ID

    UNION ALL

    SELECT
        B.ROOT_ITEM_CODE,
        C.ITEM_SEQ,
        C.MAT_ITEM_SEQ,
        C.PROC_SEQ
    FROM BOM_TREE B
    INNER JOIN TCO501 C
        ON CAST(C.ITEM_SEQ AS NVARCHAR(50)) = CAST(B.MAT_ITEM_SEQ AS NVARCHAR(50))
)
SELECT
    ROOT_ITEM_CODE,
    ITEM_SEQ,
    MAT_ITEM_SEQ,
    PROC_SEQ
INTO #BOM_TREE
FROM BOM_TREE
OPTION (MAXRECURSION 1000);

SELECT
    B.LOAD_SEQ,
    B.PROD_DATE,
    B.ROW_NUM,
    B.ITEM_LOT_NO,
    B.ITEM_CODE,
    LEFT(
        COALESCE(
            NULLIF(CAST(BOM.PROD_CODE_ID AS NVARCHAR(50)), B.ITEM_CODE),
            NULLIF(B.PROD_CODE, B.ITEM_CODE)
        ),
        20
    ) AS PROD_CODE,
    B.PROD_QTY,
    LEFT(ISNULL(FH.WORKCENTER_CODE, B.WORKCENTER_CODE), 20) AS WORKCENTER_CODE,
    LEFT(WD.WORK_CODE, 10)                                   AS WORK_CODE,
    WD.SEQ                                                    AS TPR110D_SEQ,
    ROW_NUMBER() OVER (
        PARTITION BY B.LOAD_SEQ
        ORDER BY ISNULL(WD.SEQ, 99999), ISNULL(WD.WORK_SEQ, 99999), WD.WORK_CODE
    )                                                         AS FLOW_WORK_SEQ,
    EQ1.EQUIP_SYS_CD
INTO #FLOW_ORDERS
FROM #BASE_DATA B
OUTER APPLY (
    SELECT TOP 1
        WO1.FACTORY_CODE,
        WO1.WORK_ORDER,
        WO1.WORKCENTER_CODE
    FROM TPR112 BM1
    INNER JOIN TPR110 WO1
        ON  WO1.FACTORY_CODE = BM1.FACTORY_CODE
        AND WO1.WORK_ORDER   = BM1.WORK_ORDER
    LEFT JOIN TPR110D XM
        ON  XM.FACTORY_CODE = WO1.FACTORY_CODE
        AND XM.WORK_ORDER   = WO1.WORK_ORDER
        AND XM.WORK_CODE    = B.WORK_CODE
    WHERE BM1.FACTORY_CODE = @FACTORY_CODE
            AND BM1.PROD_CODE = B.ITEM_CODE
    ORDER BY
        CASE WHEN XM.WORK_CODE IS NOT NULL THEN 0 ELSE 1 END,
        WO1.WORK_ORDER
) FH
INNER JOIN TPR110D WD
    ON  WD.FACTORY_CODE = FH.FACTORY_CODE
    AND WD.WORK_ORDER   = FH.WORK_ORDER
LEFT JOIN TPR102 D1
    ON  D1.FACTORY_CODE = @FACTORY_CODE
    AND D1.WORK_CODE    = WD.WORK_CODE
OUTER APPLY (
    SELECT TOP 1 T.MATERIAL_ID AS ROOT_MATERIAL_ID
    FROM TCO403 T
    WHERE T.MATERIAL_CODE = B.ITEM_CODE
       OR T.MATERIAL_ID = B.ITEM_CODE
    ORDER BY CASE WHEN T.MATERIAL_CODE = B.ITEM_CODE THEN 0 ELSE 1 END
) ROOT
OUTER APPLY (
    SELECT TOP 1 E1.EQUIP_SYS_CD
    FROM TPR104 E
    INNER JOIN TPR151 E1
        ON E1.EQUIP_SYS_CD = E.EQUIP_SYS_CD
    WHERE E.WORK_CODE = WD.WORK_CODE
    ORDER BY E.EQUIP_SYS_CD
) EQ1
OUTER APPLY (
    SELECT TOP 1 BT.MAT_ITEM_SEQ AS PROD_CODE_ID
    FROM #BOM_TREE BT
        WHERE BT.ROOT_ITEM_CODE = ISNULL(ROOT.ROOT_MATERIAL_ID, B.ITEM_CODE)
      AND CAST(BT.PROC_SEQ AS NVARCHAR(50)) = ISNULL(D1.ERP_PROCESS_MAPPING, '')
    ORDER BY BT.ITEM_SEQ, BT.MAT_ITEM_SEQ
) BOM;

DECLARE @FLOW_ORDER_COUNT INT = 0;
SELECT @FLOW_ORDER_COUNT = COUNT(*) FROM #FLOW_ORDERS;
PRINT '#FLOW_ORDERS 준비 완료: ' + CAST(@FLOW_ORDER_COUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-4. TPR301M 생산계획 마스터 INSERT
-- ───────────────────────────────────────────────────────────────────────────
PRINT '=== TPR301M 생산계획 마스터 INSERT 시작 ===';

INSERT INTO TPR301M (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODPLAN_ID,
    ORDER_FLAG,
    OPMAN_CODE,
    OPTIME
)
SELECT
    @FACTORY_CODE,
    B.PROD_DATE,
    K.NEW_PRODPLAN_SEQ,      -- PRODPLAN_SEQ (일자별 기존 최대값 + 순번)
    -- PRODPLAN_ID = 'PP' + YYYYMMDD + 4자리 순번
    'PP' + B.PROD_DATE + RIGHT('0000' + CAST(B.ROW_NUM + @PP_OFFSET AS VARCHAR), 4),
    'IN_PROGRESS',            -- 실적이 이미 있으므로 IN_PROGRESS (CHECK 허용값)
    @OPMAN_CODE,
    COALESCE(
        TRY_CAST(STUFF(STUFF(B.PROD_DATE, 5, 0, '-'), 8, 0, '-') + ' 00:00:00' AS DATETIME2),
        GETDATE()
    )
FROM #BASE_DATA B
INNER JOIN #PLAN_KEYS K
    ON K.LOAD_SEQ = B.LOAD_SEQ;

PRINT 'TPR301M INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- TPR301M.ITEM_LOT_NO 동기화 (운영 updateProdPlanLotNo2와 동일 목적)
IF COL_LENGTH('dbo.TPR301M', 'ITEM_LOT_NO') IS NOT NULL
BEGIN
    UPDATE M
    SET M.ITEM_LOT_NO = LEFT(B.ITEM_LOT_NO, COL_LENGTH('dbo.TPR301M', 'ITEM_LOT_NO') / 2)
    FROM TPR301M M
    INNER JOIN #PLAN_KEYS K
        ON  K.PROD_DATE = M.PRODPLAN_DATE
        AND K.NEW_PRODPLAN_SEQ = M.PRODPLAN_SEQ
    INNER JOIN #BASE_DATA B
        ON B.LOAD_SEQ = K.LOAD_SEQ
    WHERE M.FACTORY_CODE = @FACTORY_CODE;

    PRINT 'TPR301M ITEM_LOT_NO 동기화 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';
END
ELSE
BEGIN
    PRINT '경고: TPR301M.ITEM_LOT_NO 컬럼이 없어 LOT 동기화를 건너뜀';
END

-- ───────────────────────────────────────────────────────────────────────────
-- C-5. TPR301 생산계획 상세 INSERT
-- ───────────────────────────────────────────────────────────────────────────
PRINT '=== TPR301 생산계획 상세 INSERT 시작 ===';

INSERT INTO TPR301 (
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    PRODWORK_SEQ,
    PRODPLAN_ID,
    PRODPLAN_DETAIL_ID,
    PROD_DATE,
    ITEM_CODE,
    ITEM_NAME,
    PROD_QTY,
    WORKCENTER_CODE,
    WORK_CODE,
    EQUIP_SYS_CD,    -- 공정-설비 연동 코드 (TPR104→TPR151)
    WORKER_TYPE,     -- 근무구분 (NULL 불가 스키마 대응)
    WORKER_CODE,
    WORKER_NAME,
    LOT_NO,
    ORDER_FLAG,
    OPMAN_CODE,
    OPTIME
)
SELECT
    @FACTORY_CODE,
    B.PROD_DATE,
    K.NEW_PRODPLAN_SEQ,                              -- TPR301M의 PRODPLAN_SEQ와 동일
    1,                                                -- PRODWORK_SEQ: 스테이징 1행 = 1공정
    -- PRODPLAN_ID = TPR301M과 동일한 값
    'PP' + B.PROD_DATE + RIGHT('0000' + CAST(B.ROW_NUM + @PP_OFFSET AS VARCHAR), 4),
    -- PRODPLAN_DETAIL_ID = 'PLD' + YYYYMMDD + 4자리 순번
    LEFT('PLD' + B.PROD_DATE + RIGHT('0000' + CAST(B.ROW_NUM + @PP_OFFSET AS VARCHAR), 4), 20),
    B.PROD_DATE,
    LEFT(ISNULL(I_ITEM.MATERIAL_ID, B.ITEM_CODE), 50),
    B.ITEM_NAME,
    B.PROD_QTY,
    B.WORKCENTER_CODE,
    B.WORK_CODE,
    -- EQUIP_SYS_CD: #BASE_DATA에서 TPR104→TPR151 공정흐름 조인으로 확보한 설비코드
    -- ★ selectWeeklyProductionPlansByWorkplace: D.EQUIP_SYS_CD = E.EQUIP_SYS_CD 조인 필수
    --    NULL 이면 주간 캘린더에 해당 계획이 표시되지 않음
    LEFT(B.EQUIP_SYS_CD, 10),
    'D',
    B.WORKER_CODE,
    LEFT(ISNULL(NULLIF(B.WORKER_CODE, ''), @DEFAULT_WORKER_CODE), 100),
    LEFT(B.ITEM_LOT_NO, 30),                         -- LOT_NO (TPR301 NVARCHAR(30))
    'ORDERED',                                        -- 실적이 있으므로 ORDERED 상태
    @OPMAN_CODE,
    COALESCE(
        TRY_CAST(STUFF(STUFF(B.PROD_DATE, 5, 0, '-'), 8, 0, '-') + ' 00:00:00' AS DATETIME2),
        GETDATE()
    )
FROM #BASE_DATA B
INNER JOIN #PLAN_KEYS K
    ON K.LOAD_SEQ = B.LOAD_SEQ
OUTER APPLY (
    SELECT TOP 1 T.MATERIAL_ID
    FROM TCO403 T
    WHERE T.MATERIAL_ID = B.ITEM_CODE
       OR T.MATERIAL_CODE = B.ITEM_CODE
    ORDER BY CASE WHEN T.MATERIAL_ID = B.ITEM_CODE THEN 0 ELSE 1 END
) I_ITEM;

PRINT 'TPR301 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-6. TPR504 생산지시 INSERT
--
--  ★ 공정흐름 반영 포인트:
--     • TPR110D_SEQ : #BASE_DATA에서 공정흐름(TPR110D.SEQ) 조회값 사용
--                   → selectProdOrders ORDER BY WORKORDER_SEQ / TPR110D_SEQ 정렬 기준
--     • WORKORDER_SEQ: TPR110D_SEQ와 동일값 사용
--                   → 공정흐름 순서대로 UI에 표시되려면 이 값이 맞아야 함
--     • WORK_SEQ    : #FLOW_ORDERS에서 공정순번(ROW_NUMBER)으로 생성
--     • EQUIP_SYS_CD: TPR104 → TPR151 공정흐름 조인에서 가져옴 (NULL 허용)
-- ───────────────────────────────────────────────────────────────────────────
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
    WORKORDER_SEQ,   -- 공정흐름 순번 (TPR110D.SEQ 기반)
    WORK_CODE,
    WORKDT_DATE,
    ITEM_CODE,
    PROD_CODE,
    EQUIP_SYS_CD,    -- 공정흐름 조인에서 확보 (TPR301과 동일값, NULL 불가)
    ORDER_FLAG,
    LOT_NO,
    PROD_QTY,
    TPR110D_SEQ,     -- 공정 단계 순번 (selectProdOrders·UI 정렬 핵심)
    OPMAN_CODE,
    OPTIME
)
SELECT
    @FACTORY_CODE,
    F.PROD_DATE,
    K.NEW_PRODPLAN_SEQ,        -- TPR301M/TPR301과 동일 PRODPLAN_SEQ
    1,                          -- PRODWORK_SEQ
    F.FLOW_WORK_SEQ,            -- WORK_SEQ: 공정흐름 순서
    LEFT('PP' + F.PROD_DATE + RIGHT('0000' + CAST(F.ROW_NUM + @PP_OFFSET AS VARCHAR), 4), @L504_PRODPLAN_ID),
    LEFT('PO' + @TODAY_STR + RIGHT('0000' + CAST(F.ROW_NUM + @PO_OFFSET + F.FLOW_WORK_SEQ - 1 AS VARCHAR), 4), @L504_PRODORDER_ID),
    LEFT('PO' + @TODAY_STR + RIGHT('0000' + CAST(F.ROW_NUM + @PO_OFFSET + F.FLOW_WORK_SEQ - 1 AS VARCHAR), 4), @L504_TPR504ID),
    -- WORKORDER_SEQ: 공정흐름 순번(TPR110D.SEQ) 우선,
    --               스테이징에 명시값 있으면 그것 사용, 둘 다 없으면 ROW_NUM
    F.TPR110D_SEQ,
    F.WORK_CODE,
    F.PROD_DATE,                -- 작업일자 = 생산일자
    LEFT(ISNULL(I_ITEM.MATERIAL_ID, F.ITEM_CODE), @L504_ITEM_CODE),
    LEFT(I_PROD.MATERIAL_ID, @L504_PROD_CODE),
    F.EQUIP_SYS_CD,   -- 공정흐름(TPR104→TPR151)에서 가져온 설비코드
    'O',                        -- 지시완료
    LEFT(F.ITEM_LOT_NO, @L504_LOT_NO),    -- LOT_NO (TPR504 NVARCHAR(20))
    CAST(F.PROD_QTY AS INT),
    F.TPR110D_SEQ,
    LEFT(@OPMAN_CODE, @L504_OPMAN_CODE),
    GETDATE()
FROM #FLOW_ORDERS F
INNER JOIN #PLAN_KEYS K
    ON K.LOAD_SEQ = F.LOAD_SEQ
OUTER APPLY (
    SELECT TOP 1 T.MATERIAL_ID
    FROM TCO403 T
    WHERE T.MATERIAL_ID = F.ITEM_CODE
       OR T.MATERIAL_CODE = F.ITEM_CODE
    ORDER BY CASE WHEN T.MATERIAL_ID = F.ITEM_CODE THEN 0 ELSE 1 END
) I_ITEM
OUTER APPLY (
    SELECT TOP 1 T.MATERIAL_ID
    FROM TCO403 T
    WHERE T.MATERIAL_ID = F.PROD_CODE
       OR T.MATERIAL_CODE = F.PROD_CODE
    ORDER BY CASE WHEN T.MATERIAL_ID = F.PROD_CODE THEN 0 ELSE 1 END
) I_PROD
WHERE I_PROD.MATERIAL_ID IS NOT NULL
    AND I_PROD.MATERIAL_ID <> ISNULL(I_ITEM.MATERIAL_ID, '')
    AND NOT EXISTS (
    SELECT 1
    FROM TPR504 X
    WHERE X.FACTORY_CODE  = LEFT(@FACTORY_CODE, @L504_FACTORY_CODE)
      AND X.PRODPLAN_DATE = F.PROD_DATE
      AND X.PRODPLAN_SEQ  = K.NEW_PRODPLAN_SEQ
      AND X.PRODWORK_SEQ  = 1
      AND X.WORK_SEQ      = F.FLOW_WORK_SEQ
);

PRINT 'TPR504 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-7. TPR301 LOT_NO 동기화 (TPR504와 동일 LOT_NO 보장)
--      ★ TPR301.LOT_NO는 NVARCHAR(30), TPR504.LOT_NO는 NVARCHAR(20) — 이미 동일값
-- ───────────────────────────────────────────────────────────────────────────
-- (이미 C-5에서 동일한 ITEM_LOT_NO를 사용했으므로 별도 UPDATE 불필요)

-- TPR301M ORDER_FLAG 최종 상태 업데이트 (COMPLETED로 변경 가능 — 필요 시 활성화)
/*
UPDATE M SET M.ORDER_FLAG = 'COMPLETED'
FROM TPR301M M
INNER JOIN #BASE_DATA B
    ON M.FACTORY_CODE  = @FACTORY_CODE
    AND M.PRODPLAN_DATE = B.PROD_DATE
INNER JOIN #PLAN_KEYS K
    ON K.LOAD_SEQ = B.LOAD_SEQ
    AND M.PRODPLAN_SEQ  = K.NEW_PRODPLAN_SEQ;
*/

-- ───────────────────────────────────────────────────────────────────────────
-- C-8. TPR601 생산실적 INSERT
-- ───────────────────────────────────────────────────────────────────────────
PRINT '=== TPR601 생산실적 INSERT 시작 ===';

-- 방금 INSERT된 TPR504 기반으로 실적 생성
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
    O.WORKDT_DATE,
    B.PROD_QTY,
    B.GOOD_QTY,
    B.BAD_QTY,
    B.RCV_QTY,
    B.PROD_STIME,
    B.PROD_ETIME,
    B.WORKER_CODE,
    -- WORKORDER_SEQ: 공정흐름 순번(TPR110D_SEQ)과 동일하게 맞춤
    ISNULL(O.TPR110D_SEQ, B.WORKORDER_SEQ) AS WORKORDER_SEQ,
    1                        AS PROD_SEQ,
    ROW_NUMBER() OVER (
        ORDER BY O.PRODPLAN_DATE, O.PRODPLAN_SEQ, O.WORK_SEQ, O.TPR504ID
    )                        AS ROW_NUM,
    B.LOAD_SEQ
INTO #TARGET_ORDERS
FROM #FLOW_ORDERS F
INNER JOIN #PLAN_KEYS K
    ON K.LOAD_SEQ = F.LOAD_SEQ
INNER JOIN #BASE_DATA B
    ON B.LOAD_SEQ = F.LOAD_SEQ
INNER JOIN TPR504 O
    ON  O.FACTORY_CODE  = @FACTORY_CODE
    AND O.PRODPLAN_DATE = F.PROD_DATE
    AND O.PRODPLAN_SEQ  = K.NEW_PRODPLAN_SEQ
    AND O.PRODWORK_SEQ  = 1
    AND O.WORK_SEQ      = F.FLOW_WORK_SEQ
    AND ISNULL(O.DELETE_FLAG, '0') != '1';

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
    'PR' + @TODAY_STR + RIGHT('0000' + CAST(O.ROW_NUM + @PR_OFFSET AS VARCHAR), 4),
    O.TPR504ID,
    O.ITEM_CODE,
    O.WORK_CODE,
    -- PROD_STIME: WORKDT_DATE(YYYYMMDD) + ' ' + PROD_STIME(HH:MM) → DATETIME2
    CASE
        WHEN O.PROD_STIME IS NOT NULL AND LEN(LTRIM(RTRIM(O.PROD_STIME))) >= 4
        THEN TRY_CAST(
            LEFT(O.WORKDT_DATE, 4) + '-'
            + SUBSTRING(O.WORKDT_DATE, 5, 2) + '-'
            + RIGHT(O.WORKDT_DATE, 2) + ' '
            + LTRIM(RTRIM(O.PROD_STIME)) + ':00'
            AS DATETIME2
        )
        ELSE CAST(
            LEFT(O.WORKDT_DATE, 4) + '-'
            + SUBSTRING(O.WORKDT_DATE, 5, 2) + '-'
            + RIGHT(O.WORKDT_DATE, 2) + ' 08:00:00' AS DATETIME2
        )
    END,
    -- PROD_ETIME: WORKDT_DATE(YYYYMMDD) + ' ' + PROD_ETIME(HH:MM) → DATETIME2
    CASE
        WHEN O.PROD_ETIME IS NOT NULL AND LEN(LTRIM(RTRIM(O.PROD_ETIME))) >= 4
        THEN TRY_CAST(
            LEFT(O.WORKDT_DATE, 4) + '-'
            + SUBSTRING(O.WORKDT_DATE, 5, 2) + '-'
            + RIGHT(O.WORKDT_DATE, 2) + ' '
            + LTRIM(RTRIM(O.PROD_ETIME)) + ':00'
            AS DATETIME2
        )
        ELSE CAST(
            LEFT(O.WORKDT_DATE, 4) + '-'
            + SUBSTRING(O.WORKDT_DATE, 5, 2) + '-'
            + RIGHT(O.WORKDT_DATE, 2) + ' 17:00:00' AS DATETIME2
        )
    END,
    '0',                         -- ORDER_FLAG 기본값
    O.PROD_QTY,
    O.GOOD_QTY,
    O.BAD_QTY,
    O.RCV_QTY,
    O.WORKORDER_SEQ,
    @OPMAN_CODE,
    GETDATE()
FROM #TARGET_ORDERS O;

PRINT 'TPR601 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-9. TPR601W 생산실적 작업자 INSERT
-- ───────────────────────────────────────────────────────────────────────────
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
    1,                           -- WORKER_SEQ: 실적 1건당 작업자 1명
    O.WORKER_CODE,
    'PRW' + @TODAY_STR + RIGHT('000' + CAST(O.ROW_NUM + @PRW_OFFSET AS VARCHAR), 3),
    'PR' + @TODAY_STR + RIGHT('0000' + CAST(O.ROW_NUM + @PR_OFFSET AS VARCHAR), 4)
FROM #TARGET_ORDERS O;

PRINT 'TPR601W INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-10. TPR605 불량 상세 INSERT
--       스테이징 불량 데이터를 TPR601 FK 키와 연결
-- ───────────────────────────────────────────────────────────────────────────
PRINT '=== TPR605 불량 상세 INSERT 시작 ===';

-- 먼저 BAD_QTY > 0인데 STAGING_PROD_DEFECT에 데이터가 없는 경우:
-- → TPR605 단일행(QC_CODE='UNKNOWN', QC_QTY=BAD_QTY)으로 자동 보완
IF OBJECT_ID('tempdb..#DEFECT_ROWS') IS NOT NULL DROP TABLE #DEFECT_ROWS;

-- 스테이징 불량 데이터와 TPR601 매칭
-- + BAD_QTY > 0이지만 STAGING_PROD_DEFECT 미등록 실적 보완
SELECT
    R.FACTORY_CODE,
    R.PRODPLAN_DATE,
    R.PRODPLAN_SEQ,
    R.PRODWORK_SEQ,
    R.WORK_SEQ,
    R.PROD_SEQ,
    R.WORK_CODE,
    -- QC_CODE: MES_CCMMNDETAIL_CODE 에서 CODE_NM으로 코드 조회, 없으면 원본 한글명 사용
    ISNULL(CC.CODE, D.QC_CODE)  AS QC_CODE,
    D.QC_QTY,
    ROW_NUMBER() OVER (
        PARTITION BY R.FACTORY_CODE, R.PRODPLAN_DATE, R.PRODPLAN_SEQ,
                     R.PRODWORK_SEQ, R.WORK_SEQ, R.PROD_SEQ
        ORDER BY D.LOAD_SEQ
    ) AS BAD_SEQ,
    ROW_NUMBER() OVER (ORDER BY R.PRODPLAN_DATE, R.PRODPLAN_SEQ, D.LOAD_SEQ) AS GLOBAL_ROW_NUM
INTO #DEFECT_ROWS
FROM STAGING_PROD_DEFECT D
-- STAGING_PROD_RESULT.ITEM_LOT_NO 기준으로 TPR601 FK 키 조회
INNER JOIN STAGING_PROD_RESULT SR
    ON  SR.ITEM_LOT_NO = D.ITEM_LOT_NO
    AND SR.ITEM_CODE   = D.ITEM_CODE
    AND LEFT(SR.WORK_CODE, 10) = LEFT(D.WORK_CODE, 10)
INNER JOIN #BASE_DATA B
    ON  B.PROD_DATE    = ISNULL(NULLIF(LTRIM(RTRIM(SR.PROD_DATE)), ''), @PROD_DATE)
    AND B.ITEM_LOT_NO  = SR.ITEM_LOT_NO
    AND B.ITEM_CODE    = SR.ITEM_CODE
INNER JOIN #TARGET_ORDERS T
    ON  T.LOAD_SEQ     = B.LOAD_SEQ
    AND LEFT(T.WORK_CODE, 10) = LEFT(D.WORK_CODE, 10)
INNER JOIN TPR601 R
    ON  R.FACTORY_CODE  = T.FACTORY_CODE
    AND R.PRODPLAN_DATE = T.PRODPLAN_DATE
    AND R.PRODPLAN_SEQ  = T.PRODPLAN_SEQ
    AND R.PRODWORK_SEQ  = T.PRODWORK_SEQ
    AND R.WORK_SEQ      = T.WORK_SEQ
    AND R.PROD_SEQ      = 1
-- QC_CODE 한글명 → 코드값 매핑 시도 (MES_CCMMNDETAIL_CODE)
LEFT JOIN MES_CCMMNDETAIL_CODE CC
    ON  CC.CODE_NM = D.QC_CODE
    AND CC.USE_AT  = 'Y'
WHERE D.QC_QTY > 0;

-- BAD_QTY > 0이지만 스테이징 불량 데이터 없는 실적 → 단일 보완 행 추가
INSERT INTO #DEFECT_ROWS (
    FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ, WORK_SEQ, PROD_SEQ,
    WORK_CODE, QC_CODE, QC_QTY, BAD_SEQ, GLOBAL_ROW_NUM
)
SELECT
    R.FACTORY_CODE,
    R.PRODPLAN_DATE,
    R.PRODPLAN_SEQ,
    R.PRODWORK_SEQ,
    R.WORK_SEQ,
    R.PROD_SEQ,
    R.WORK_CODE,
    'UNKNOWN',                   -- 미지정 불량코드 (확인 필요)
    R.BAD_QTY,
    1,
    (SELECT ISNULL(MAX(GLOBAL_ROW_NUM), 0) FROM #DEFECT_ROWS)
    + ROW_NUMBER() OVER (ORDER BY R.PRODPLAN_DATE, R.PRODPLAN_SEQ)
FROM TPR601 R
WHERE R.FACTORY_CODE = @FACTORY_CODE
  AND R.TPR601ID LIKE 'PR' + @TODAY_STR + '%'
  AND R.BAD_QTY > 0
  AND NOT EXISTS (
      SELECT 1 FROM #DEFECT_ROWS DR
      WHERE DR.FACTORY_CODE  = R.FACTORY_CODE
        AND DR.PRODPLAN_DATE = R.PRODPLAN_DATE
        AND DR.PRODPLAN_SEQ  = R.PRODPLAN_SEQ
        AND DR.PRODWORK_SEQ  = R.PRODWORK_SEQ
        AND DR.WORK_SEQ      = R.WORK_SEQ
        AND DR.PROD_SEQ      = R.PROD_SEQ
  );

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
    DR.FACTORY_CODE,
    DR.PRODPLAN_DATE,
    DR.PRODPLAN_SEQ,
    DR.PRODWORK_SEQ,
    DR.WORK_SEQ,
    DR.PROD_SEQ,
    DR.WORK_CODE,
    DR.QC_CODE,
    DR.QC_QTY,
    DR.BAD_SEQ,
    'QC' + @TODAY_STR + RIGHT('0000' + CAST(DR.GLOBAL_ROW_NUM + @QC_OFFSET AS VARCHAR), 4)
FROM #DEFECT_ROWS DR
WHERE NOT EXISTS (
    SELECT 1
    FROM TPR605 Q
    WHERE Q.FACTORY_CODE  = DR.FACTORY_CODE
      AND Q.PRODPLAN_DATE = DR.PRODPLAN_DATE
      AND Q.PRODPLAN_SEQ  = DR.PRODPLAN_SEQ
      AND Q.PRODWORK_SEQ  = DR.PRODWORK_SEQ
      AND Q.WORK_SEQ      = DR.WORK_SEQ
      AND Q.PROD_SEQ      = DR.PROD_SEQ
      AND Q.BAD_SEQ       = DR.BAD_SEQ
);

PRINT 'TPR605 INSERT 완료: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- ───────────────────────────────────────────────────────────────────────────
-- C-11. 임시 테이블 정리
-- ───────────────────────────────────────────────────────────────────────────
IF OBJECT_ID('tempdb..#BASE_DATA')      IS NOT NULL DROP TABLE #BASE_DATA;
IF OBJECT_ID('tempdb..#PLAN_KEYS')      IS NOT NULL DROP TABLE #PLAN_KEYS;
IF OBJECT_ID('tempdb..#BOM_TREE')       IS NOT NULL DROP TABLE #BOM_TREE;
IF OBJECT_ID('tempdb..#FLOW_ORDERS')    IS NOT NULL DROP TABLE #FLOW_ORDERS;
IF OBJECT_ID('tempdb..#TARGET_ORDERS')  IS NOT NULL DROP TABLE #TARGET_ORDERS;
IF OBJECT_ID('tempdb..#DEFECT_ROWS')    IS NOT NULL DROP TABLE #DEFECT_ROWS;

PRINT '';
PRINT '=== 마이그레이션 완료 ===';


-- =============================================================================
-- [SECTION D] 검증 쿼리
-- =============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- D-1. 생성 건수 요약
-- ───────────────────────────────────────────────────────────────────────────
DECLARE @VDATE CHAR(8) = CONVERT(CHAR(8), GETDATE(), 112);

PRINT '';
PRINT '=== 생성 결과 요약 ===';

SELECT '스테이징(STAGING_PROD_RESULT)' AS 테이블, COUNT(*) AS 건수, SUM(PROD_QTY) AS 총수량 FROM STAGING_PROD_RESULT
UNION ALL
SELECT '생산계획마스터(TPR301M)',   COUNT(*), NULL FROM TPR301M WHERE FACTORY_CODE = '000001' AND PRODPLAN_ID LIKE 'PP' + @VDATE + '%'
UNION ALL
SELECT '생산계획상세(TPR301)',      COUNT(*), SUM(PROD_QTY) FROM TPR301 WHERE FACTORY_CODE = '000001' AND PRODPLAN_ID LIKE 'PP' + @VDATE + '%'
UNION ALL
SELECT '생산지시(TPR504)',          COUNT(*), SUM(PROD_QTY) FROM TPR504 WHERE FACTORY_CODE = '000001' AND TPR504ID LIKE 'PO' + @VDATE + '%'
UNION ALL
SELECT '생산실적(TPR601)',          COUNT(*), SUM(PROD_QTY) FROM TPR601 WHERE FACTORY_CODE = '000001' AND TPR601ID LIKE 'PR' + @VDATE + '%'
UNION ALL
SELECT '실적작업자(TPR601W)',        COUNT(*), NULL          FROM TPR601W WHERE TPR601ID LIKE 'PR' + @VDATE + '%'
UNION ALL
SELECT '불량상세(TPR605)',          COUNT(*), SUM(QC_QTY)   FROM TPR605 WHERE TPR605ID LIKE 'QC' + @VDATE + '%';

-- ───────────────────────────────────────────────────────────────────────────
-- D-2. 스테이징 vs TPR601 건수/수량 일치 검증
-- ───────────────────────────────────────────────────────────────────────────
SELECT
    S.ITEM_LOT_NO                    AS LOT_NO,
    S.ITEM_CODE,
    S.PROD_QTY                       AS 스테이징_생산수량,
    S.GOOD_QTY                       AS 스테이징_양품수량,
    S.BAD_QTY                        AS 스테이징_불량수량,
    R.PROD_QTY                       AS TPR601_생산수량,
    R.GOOD_QTY                       AS TPR601_양품수량,
    R.BAD_QTY                        AS TPR601_불량수량,
    CASE WHEN S.PROD_QTY = R.PROD_QTY AND S.GOOD_QTY = R.GOOD_QTY AND S.BAD_QTY = R.BAD_QTY
         THEN '✓ 일치' ELSE '✗ 불일치' END AS 검증결과
FROM STAGING_PROD_RESULT S
LEFT JOIN TPR504 O ON O.FACTORY_CODE = '000001' AND O.LOT_NO = LEFT(S.ITEM_LOT_NO, 20) AND O.TPR504ID LIKE 'PO' + @VDATE + '%'
LEFT JOIN TPR601 R ON R.TPR504ID = O.TPR504ID
ORDER BY S.LOAD_SEQ;

-- ───────────────────────────────────────────────────────────────────────────
-- D-3. 불량 합계 검증 (스테이징 vs TPR605)
-- ───────────────────────────────────────────────────────────────────────────
SELECT
    S.ITEM_LOT_NO                     AS LOT_NO,
    SUM(D.QC_QTY)                     AS 스테이징_불량합계,
    (SELECT SUM(T.QC_QTY)
     FROM TPR504 O2
     INNER JOIN TPR605 T ON T.FACTORY_CODE = O2.FACTORY_CODE
         AND T.PRODPLAN_DATE = O2.PRODPLAN_DATE AND T.PRODPLAN_SEQ = O2.PRODPLAN_SEQ
     WHERE O2.FACTORY_CODE = '000001' AND O2.LOT_NO = LEFT(S.ITEM_LOT_NO, 20)
       AND O2.TPR504ID LIKE 'PO' + @VDATE + '%'
    )                                 AS TPR605_불량합계,
    CASE
        WHEN SUM(D.QC_QTY) = (
            SELECT SUM(T.QC_QTY)
            FROM TPR504 O2
            INNER JOIN TPR605 T ON T.FACTORY_CODE = O2.FACTORY_CODE
                AND T.PRODPLAN_DATE = O2.PRODPLAN_DATE AND T.PRODPLAN_SEQ = O2.PRODPLAN_SEQ
            WHERE O2.FACTORY_CODE = '000001' AND O2.LOT_NO = LEFT(S.ITEM_LOT_NO, 20)
              AND O2.TPR504ID LIKE 'PO' + @VDATE + '%'
        ) THEN '✓ 일치' ELSE '✗ 불일치 또는 미등록'
    END                               AS 검증결과
FROM STAGING_PROD_DEFECT D
INNER JOIN STAGING_PROD_RESULT S ON S.ITEM_LOT_NO = D.ITEM_LOT_NO AND S.ITEM_CODE = D.ITEM_CODE
GROUP BY S.ITEM_LOT_NO
ORDER BY S.ITEM_LOT_NO;

-- ───────────────────────────────────────────────────────────────────────────
-- D-4. FK 무결성 확인 (orphan 레코드 없어야 함)
-- ───────────────────────────────────────────────────────────────────────────
-- TPR504 → TPR301M 참조 확인
SELECT 'TPR504 orphan (TPR301M 없음)' AS 항목, COUNT(*) AS 건수
FROM TPR504 O
WHERE O.TPR504ID LIKE 'PO' + @VDATE + '%'
  AND NOT EXISTS (
      SELECT 1 FROM TPR301M M
      WHERE M.FACTORY_CODE  = O.FACTORY_CODE
        AND M.PRODPLAN_DATE = O.PRODPLAN_DATE
        AND M.PRODPLAN_SEQ  = O.PRODPLAN_SEQ
  )
UNION ALL
-- TPR601 → TPR504 참조 확인
SELECT 'TPR601 orphan (TPR504 없음)', COUNT(*)
FROM TPR601 R
WHERE R.TPR601ID LIKE 'PR' + @VDATE + '%'
  AND R.TPR504ID IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM TPR504 O
      WHERE O.TPR504ID = R.TPR504ID
  )
UNION ALL
-- TPR605 → TPR601 참조 확인
SELECT 'TPR605 orphan (TPR601 없음)', COUNT(*)
FROM TPR605 Q
WHERE Q.TPR605ID LIKE 'QC' + @VDATE + '%'
  AND NOT EXISTS (
      SELECT 1 FROM TPR601 R
      WHERE R.FACTORY_CODE  = Q.FACTORY_CODE
        AND R.PRODPLAN_DATE = Q.PRODPLAN_DATE
        AND R.PRODPLAN_SEQ  = Q.PRODPLAN_SEQ
        AND R.PRODWORK_SEQ  = Q.PRODWORK_SEQ
        AND R.WORK_SEQ      = Q.WORK_SEQ
        AND R.PROD_SEQ      = Q.PROD_SEQ
  );
-- ★ 위 쿼리 결과 모두 0이면 FK 무결성 정상


-- =============================================================================
-- [SECTION E] 롤백 스크립트 (문제 발생 시 사용)
-- =============================================================================
-- ★ 삭제 기준: TPR301M (FACTORY_CODE + PRODPLAN_DATE 범위 + OPMAN_CODE)
--              → 해당 계획에 연결된 TPR301 / TPR504 / TPR601 / TPR601W / TPR605 모두 삭제
-- ★ 삭제 순서: TPR605 → TPR601W → TPR601 → TPR504 → TPR301 → TPR301M
/*
DECLARE @RB_FACTORY_CODE NVARCHAR(10) = '000001';
DECLARE @RB_OPMAN_CODE   NVARCHAR(20) = 'admin';

-- 삭제 대상 계획일자 범위 (이번 적재는 2026-03월)
DECLARE @RB_PLAN_FROM CHAR(8) = '20260301';
DECLARE @RB_PLAN_TO   CHAR(8) = '20260331';

-- ── 롤백 대상 키 수집 (TPR301M 기준) ─────────────────────────────────────
IF OBJECT_ID('tempdb..#RB_PLANS') IS NOT NULL DROP TABLE #RB_PLANS;

SELECT
    M.FACTORY_CODE,
    M.PRODPLAN_DATE,
    M.PRODPLAN_SEQ
INTO #RB_PLANS
FROM TPR301M M
WHERE M.FACTORY_CODE   = @RB_FACTORY_CODE
  AND M.PRODPLAN_DATE BETWEEN @RB_PLAN_FROM AND @RB_PLAN_TO
  AND ISNULL(M.OPMAN_CODE, '') = @RB_OPMAN_CODE;

-- TPR301M 누락/부분실패 대비: TPR301에서 키 보강
INSERT INTO #RB_PLANS (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)
SELECT DISTINCT
        D.FACTORY_CODE,
        D.PRODPLAN_DATE,
        D.PRODPLAN_SEQ
FROM TPR301 D
WHERE D.FACTORY_CODE   = @RB_FACTORY_CODE
    AND D.PRODPLAN_DATE BETWEEN @RB_PLAN_FROM AND @RB_PLAN_TO
    AND ISNULL(D.OPMAN_CODE, '') = @RB_OPMAN_CODE
    AND NOT EXISTS (
            SELECT 1
            FROM #RB_PLANS P
            WHERE P.FACTORY_CODE  = D.FACTORY_CODE
                AND P.PRODPLAN_DATE = D.PRODPLAN_DATE
                AND P.PRODPLAN_SEQ  = D.PRODPLAN_SEQ
    );

-- TPR301M/TPR301 누락 상태에서도 TPR504 직접 삭제 가능하도록 키 보강
INSERT INTO #RB_PLANS (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)
SELECT DISTINCT
        O.FACTORY_CODE,
        O.PRODPLAN_DATE,
        O.PRODPLAN_SEQ
FROM TPR504 O
WHERE O.FACTORY_CODE   = @RB_FACTORY_CODE
    AND O.PRODPLAN_DATE BETWEEN @RB_PLAN_FROM AND @RB_PLAN_TO
    AND ISNULL(O.OPMAN_CODE, '') = @RB_OPMAN_CODE
    AND NOT EXISTS (
            SELECT 1
            FROM #RB_PLANS P
            WHERE P.FACTORY_CODE  = O.FACTORY_CODE
                AND P.PRODPLAN_DATE = O.PRODPLAN_DATE
                AND P.PRODPLAN_SEQ  = O.PRODPLAN_SEQ
    );

DECLARE @RB_PLAN_COUNT INT = (SELECT COUNT(*) FROM #RB_PLANS);
PRINT '롤백 대상 계획 건수 (통합키): ' + CAST(@RB_PLAN_COUNT AS VARCHAR);

IF @RB_PLAN_COUNT = 0
BEGIN
    PRINT '롤백 대상 데이터가 없습니다.';
    DROP TABLE #RB_PLANS;
    RETURN;
END

-- 1) 불량 상세 (TPR605)
DELETE Q
FROM TPR605 Q
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = Q.FACTORY_CODE
    AND P.PRODPLAN_DATE = Q.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = Q.PRODPLAN_SEQ;
PRINT 'TPR605 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 2) 실적 작업자 (TPR601W)
DELETE W
FROM TPR601W W
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = W.FACTORY_CODE
    AND P.PRODPLAN_DATE = W.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = W.PRODPLAN_SEQ;
PRINT 'TPR601W 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 3) 생산실적 (TPR601)
DELETE R
FROM TPR601 R
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = R.FACTORY_CODE
    AND P.PRODPLAN_DATE = R.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = R.PRODPLAN_SEQ;
PRINT 'TPR601 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 4) 생산지시 (TPR504)
DELETE O
FROM TPR504 O
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = O.FACTORY_CODE
    AND P.PRODPLAN_DATE = O.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = O.PRODPLAN_SEQ;
PRINT 'TPR504 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 5) 생산계획 상세 (TPR301)
DELETE D
FROM TPR301 D
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = D.FACTORY_CODE
    AND P.PRODPLAN_DATE = D.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = D.PRODPLAN_SEQ;
PRINT 'TPR301 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

-- 6) 생산계획 마스터 (TPR301M)
DELETE M
FROM TPR301M M
INNER JOIN #RB_PLANS P
    ON  P.FACTORY_CODE  = M.FACTORY_CODE
    AND P.PRODPLAN_DATE = M.PRODPLAN_DATE
    AND P.PRODPLAN_SEQ  = M.PRODPLAN_SEQ;
PRINT 'TPR301M 삭제: ' + CAST(@@ROWCOUNT AS VARCHAR) + '건';

IF OBJECT_ID('tempdb..#RB_PLANS') IS NOT NULL DROP TABLE #RB_PLANS;

PRINT '롤백 완료';
*/
