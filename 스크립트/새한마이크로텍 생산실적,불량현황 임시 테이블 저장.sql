


-- =============================================================================
-- [SECTION B] 엑셀 임포트 테이블 → 스테이징 테이블 INSERT
-- =============================================================================
-- 엑셀을 MSSQL로 임포트하면 [생산실적$], [불량현황$] 테이블이 생성됩니다.
-- 아래 SQL이 해당 테이블에서 STAGING으로 변환 적재합니다.
--
-- ★ PROD_DATE 설정: [생산실적$]에 날짜 컬럼이 없으므로 아래 범위(@DATE_START~@DATE_END)
--   내에서 행마다 랜덤 날짜를 자동 할당합니다.
--   단일 날짜로 고정하려면 @DATE_START = @DATE_END 로 동일하게 설정하세요.
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

-- ★ 작업 날짜 범위 설정 (YYYYMMDD)
--   행마다 @DATE_START ~ @DATE_END 사이에서 랜덤 날짜가 자동 할당됩니다.
--   단일 날짜로 고정: @DATE_START = @DATE_END 동일하게 입력
DECLARE @DATE_START NVARCHAR(8) = '20260414';  -- 시작일
DECLARE @DATE_END   NVARCHAR(8) = '20260421';  -- 종료일

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
    -- PROD_DATE: @DATE_START ~ @DATE_END 범위에서 행마다 랜덤 날짜 할당
    --   CHECKSUM(NEWID()) → 행마다 다른 시드 보장
    --   주말 제외 필요 시 아래 주석 해제 (평일만 허용하도록 추가 처리 필요)
    CONVERT(CHAR(8),
        DATEADD(DAY,
            ABS(CHECKSUM(NEWID()))
            % (DATEDIFF(DAY, CAST(@DATE_START AS DATE), CAST(@DATE_END AS DATE)) + 1),
            CAST(@DATE_START AS DATE)
        ), 112
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
  AND LEN(LTRIM(RTRIM(CAST(ITEM_CODE   AS NVARCHAR(MAX))))) > 0;

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
SELECT * FROM STAGING_PROD_RESULT
SELECT * FROM STAGING_PROD_DEFECT;

--DELETE FROM STAGING_PROD_RESULT
--DELETE FROM STAGING_PROD_DEFECT