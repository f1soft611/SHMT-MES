-- =============================================
-- 생산계획별 공정 진행 현황 조회 쿼리
-- =============================================
-- 설명: 특정 생산계획(PRODPLAN_DATE, PRODPLAN_SEQ)의 모든 공정 진행 현황을 조회
-- 계획 정보(TPR301, TPR504)와 실적 정보(TPR601)를 결합하여 공정별 상태를 표시

SELECT
    D.WORK_SEQ AS PROCESS_SEQ,                      -- 공정순번
    D.WORK_CODE AS PROCESS_CODE,                    -- 공정코드
    P.WORK_NAME AS PROCESS_NAME,                    -- 공정명
    H.WORKCENTER_CODE AS WORKPLACE_CODE,            -- 작업장코드
    WC.WORKCENTER_NAME AS WORKPLACE_NAME,           -- 작업장명
    T.EQUIP_SYS_CD AS EQUIPMENT_CODE,               -- 설비코드
    E.EQUIPMENT_NAME,                               -- 설비명
    T.WORKER_CODE,                                  -- 작업자코드
    W.WORKER_NAME,                                  -- 작업자명
    T.PROD_QTY AS PLANNED_QTY,                      -- 계획수량
    ISNULL(R.GOOD_QTY, 0) AS ACTUAL_QTY,           -- 실적수량(양품)
    ISNULL(R.GOOD_QTY, 0) AS GOOD_QTY,             -- 양품수량
    ISNULL(R.BAD_QTY, 0) AS DEFECT_QTY,            -- 불량수량
    CASE
        WHEN R.GOOD_QTY >= T.PROD_QTY THEN 'COMPLETED'
        WHEN R.GOOD_QTY > 0 THEN 'IN_PROGRESS'
        ELSE 'PLANNED'
    END AS PROCESS_STATUS,                          -- 공정상태
    R.PROD_STIME AS START_TIME,                     -- 시작시간
    R.PROD_ETIME AS END_TIME,                       -- 종료시간
    T.BIGO AS REMARK                                -- 비고
FROM TPR301 T WITH (NOLOCK)                         -- 생산계획
    INNER JOIN TPR112 B WITH (NOLOCK)               -- BOM 정보
        ON T.ITEM_CODE = B.PROD_CODE_ID
    INNER JOIN TPR110 H WITH (NOLOCK)               -- 작업지시 헤더
        ON B.FACTORY_CODE = H.FACTORY_CODE
        AND B.WORK_ORDER = H.WORK_ORDER
    INNER JOIN TPR110D D WITH (NOLOCK)              -- 작업지시 상세(공정)
        ON H.FACTORY_CODE = D.FACTORY_CODE
        AND H.WORK_ORDER = D.WORK_ORDER
    INNER JOIN TPR102 P WITH (NOLOCK)               -- 공정 마스터
        ON D.FACTORY_CODE = P.FACTORY_CODE
        AND D.WORK_CODE = P.WORK_CODE
    LEFT JOIN TPR101 WC WITH (NOLOCK)               -- 작업장 마스터
        ON H.WORKCENTER_CODE = WC.WORKCENTER_CODE
    LEFT JOIN TPR151 E WITH (NOLOCK)                -- 설비 마스터
        ON T.EQUIP_SYS_CD = E.EQUIP_SYS_CD
    LEFT JOIN TCO601 W WITH (NOLOCK)                -- 작업자 마스터
        ON T.WORKER_CODE = W.WORKER_CODE
    LEFT JOIN (
        -- 생산실적 집계 (공정별 최신 실적 정보)
        SELECT
            FACTORY_CODE,
            PRODPLAN_DATE,
            PRODPLAN_SEQ,
            PRODWORK_SEQ,
            WORK_SEQ,
            SUM(ISNULL(GOOD_QTY, 0)) AS GOOD_QTY,
            SUM(ISNULL(BAD_QTY, 0)) AS BAD_QTY,
            MIN(PROD_STIME) AS PROD_STIME,
            MAX(PROD_ETIME) AS PROD_ETIME
        FROM TPR601 WITH (NOLOCK)
        GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ, WORK_SEQ
    ) R ON T.FACTORY_CODE = R.FACTORY_CODE
       AND T.PRODPLAN_DATE = R.PRODPLAN_DATE
       AND T.PRODPLAN_SEQ = R.PRODPLAN_SEQ
       AND D.WORK_SEQ = R.WORK_SEQ
WHERE T.FACTORY_CODE = #{factoryCode}
  AND T.PRODPLAN_DATE = #{planDate}
  AND T.PRODPLAN_SEQ = #{planSeq}
ORDER BY D.WORK_SEQ;


-- =============================================
-- 대체 쿼리 1: TPR504(생산지시) 기준
-- =============================================
-- 설명: TPR504 테이블을 기준으로 생산지시별 실적 조회
-- 생산지시(TPR504)와 실적(TPR601)을 직접 연결

SELECT
    CAST(A.WORK_SEQ AS INT) AS PROCESS_SEQ,         -- 공정순번
    A.WORK_CODE AS PROCESS_CODE,                    -- 공정코드
    B.WORK_NAME AS PROCESS_NAME,                    -- 공정명
    A1.WORKCENTER_CODE AS WORKPLACE_CODE,           -- 작업장코드
    A2.WORKCENTER_NAME AS WORKPLACE_NAME,           -- 작업장명
    A.EQUIP_SYS_CD AS EQUIPMENT_CODE,               -- 설비코드
    D.EQUIPMENT_NAME,                               -- 설비명
    A.OPMAN_CODE AS WORKER_CODE,                    -- 작업자코드
    NULL AS WORKER_NAME,                            -- 작업자명 (별도 JOIN 필요)
    A.PROD_QTY AS PLANNED_QTY,                      -- 계획수량
    ISNULL(R.GOOD_QTY, 0) AS ACTUAL_QTY,           -- 실적수량(양품)
    ISNULL(R.GOOD_QTY, 0) AS GOOD_QTY,             -- 양품수량
    ISNULL(R.BAD_QTY, 0) AS DEFECT_QTY,            -- 불량수량
    CASE
        WHEN ISNULL(R.GOOD_QTY, 0) >= A.PROD_QTY THEN 'COMPLETED'
        WHEN ISNULL(R.GOOD_QTY, 0) > 0 THEN 'IN_PROGRESS'
        ELSE 'PLANNED'
    END AS PROCESS_STATUS,                          -- 공정상태
    R.PROD_STIME AS START_TIME,                     -- 시작시간
    R.PROD_ETIME AS END_TIME,                       -- 종료시간
    NULL AS REMARK                                  -- 비고
FROM TPR504 A WITH (NOLOCK)                         -- 생산지시
    LEFT JOIN TPR301 A1 WITH (NOLOCK)               -- 생산계획
        ON A.FACTORY_CODE = A1.FACTORY_CODE
        AND A.PRODPLAN_DATE = A1.PRODPLAN_DATE
        AND A.PRODPLAN_SEQ = A1.PRODPLAN_SEQ
    LEFT JOIN TPR101 A2 WITH (NOLOCK)               -- 작업장 마스터
        ON A1.WORKCENTER_CODE = A2.WORKCENTER_CODE
    LEFT JOIN TPR102 B WITH (NOLOCK)                -- 공정 마스터
        ON A.FACTORY_CODE = B.FACTORY_CODE
        AND A.WORK_CODE = B.WORK_CODE
    LEFT JOIN TPR151 D WITH (NOLOCK)                -- 설비 마스터
        ON A.EQUIP_SYS_CD = D.EQUIP_SYS_CD
    LEFT JOIN (
        -- 생산실적 집계 (생산지시별)
        SELECT
            FACTORY_CODE,
            PRODPLAN_DATE,
            PRODPLAN_SEQ,
            PRODWORK_SEQ,
            WORK_SEQ,
            SUM(ISNULL(GOOD_QTY, 0)) AS GOOD_QTY,
            SUM(ISNULL(BAD_QTY, 0)) AS BAD_QTY,
            MIN(PROD_STIME) AS PROD_STIME,
            MAX(PROD_ETIME) AS PROD_ETIME
        FROM TPR601 WITH (NOLOCK)
        GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ, WORK_SEQ
    ) R ON A.FACTORY_CODE = R.FACTORY_CODE
       AND A.PRODPLAN_DATE = R.PRODPLAN_DATE
       AND A.PRODPLAN_SEQ = R.PRODPLAN_SEQ
       AND A.PRODWORK_SEQ = R.PRODWORK_SEQ
       AND CAST(A.WORK_SEQ AS INT) = R.WORK_SEQ
WHERE A.FACTORY_CODE = #{factoryCode}
  AND A.PRODPLAN_DATE = #{planDate}
  AND A.PRODPLAN_SEQ = #{planSeq}
ORDER BY CAST(A.WORK_SEQ AS INT);


-- =============================================
-- 대체 쿼리 2: 실적 상세 정보 포함
-- =============================================
-- 설명: 작업자 정보를 TPR601W에서 가져오는 버전

SELECT
    CAST(A.WORK_SEQ AS INT) AS PROCESS_SEQ,         -- 공정순번
    A.WORK_CODE AS PROCESS_CODE,                    -- 공정코드
    B.WORK_NAME AS PROCESS_NAME,                    -- 공정명
    A1.WORKCENTER_CODE AS WORKPLACE_CODE,           -- 작업장코드
    A2.WORKCENTER_NAME AS WORKPLACE_NAME,           -- 작업장명
    A.EQUIP_SYS_CD AS EQUIPMENT_CODE,               -- 설비코드
    D.EQUIPMENT_NAME,                               -- 설비명
    STUFF((
        SELECT ',' + W.WORKER_CODE
        FROM TPR601W W WITH (NOLOCK)
        WHERE W.FACTORY_CODE = A.FACTORY_CODE
          AND W.PRODPLAN_DATE = A.PRODPLAN_DATE
          AND W.PRODPLAN_SEQ = A.PRODPLAN_SEQ
          AND W.PRODWORK_SEQ = A.PRODWORK_SEQ
          AND W.WORK_SEQ = CAST(A.WORK_SEQ AS INT)
        FOR XML PATH(''), TYPE
    ).value('.', 'varchar(max)'), 1, 1, '') AS WORKER_CODE,
    NULL AS WORKER_NAME,                            -- 작업자명
    A.PROD_QTY AS PLANNED_QTY,                      -- 계획수량
    ISNULL(R.GOOD_QTY, 0) AS ACTUAL_QTY,           -- 실적수량(양품)
    ISNULL(R.GOOD_QTY, 0) AS GOOD_QTY,             -- 양품수량
    ISNULL(R.BAD_QTY, 0) AS DEFECT_QTY,            -- 불량수량
    CASE
        WHEN ISNULL(R.GOOD_QTY, 0) >= A.PROD_QTY THEN 'COMPLETED'
        WHEN ISNULL(R.GOOD_QTY, 0) > 0 THEN 'IN_PROGRESS'
        ELSE 'PLANNED'
    END AS PROCESS_STATUS,                          -- 공정상태
    R.PROD_STIME AS START_TIME,                     -- 시작시간
    R.PROD_ETIME AS END_TIME,                       -- 종료시간
    NULL AS REMARK                                  -- 비고
FROM TPR504 A WITH (NOLOCK)                         -- 생산지시
    LEFT JOIN TPR301 A1 WITH (NOLOCK)               -- 생산계획
        ON A.FACTORY_CODE = A1.FACTORY_CODE
        AND A.PRODPLAN_DATE = A1.PRODPLAN_DATE
        AND A.PRODPLAN_SEQ = A1.PRODPLAN_SEQ
    LEFT JOIN TPR101 A2 WITH (NOLOCK)               -- 작업장 마스터
        ON A1.WORKCENTER_CODE = A2.WORKCENTER_CODE
    LEFT JOIN TPR102 B WITH (NOLOCK)                -- 공정 마스터
        ON A.FACTORY_CODE = B.FACTORY_CODE
        AND A.WORK_CODE = B.WORK_CODE
    LEFT JOIN TPR151 D WITH (NOLOCK)                -- 설비 마스터
        ON A.EQUIP_SYS_CD = D.EQUIP_SYS_CD
    LEFT JOIN (
        -- 생산실적 집계
        SELECT
            FACTORY_CODE,
            PRODPLAN_DATE,
            PRODPLAN_SEQ,
            PRODWORK_SEQ,
            WORK_SEQ,
            SUM(ISNULL(GOOD_QTY, 0)) AS GOOD_QTY,
            SUM(ISNULL(BAD_QTY, 0)) AS BAD_QTY,
            MIN(PROD_STIME) AS PROD_STIME,
            MAX(PROD_ETIME) AS PROD_ETIME
        FROM TPR601 WITH (NOLOCK)
        GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ, WORK_SEQ
    ) R ON A.FACTORY_CODE = R.FACTORY_CODE
       AND A.PRODPLAN_DATE = R.PRODPLAN_DATE
       AND A.PRODPLAN_SEQ = R.PRODPLAN_SEQ
       AND A.PRODWORK_SEQ = R.PRODWORK_SEQ
       AND CAST(A.WORK_SEQ AS INT) = R.WORK_SEQ
WHERE A.FACTORY_CODE = #{factoryCode}
  AND A.PRODPLAN_DATE = #{planDate}
  AND A.PRODPLAN_SEQ = #{planSeq}
ORDER BY CAST(A.WORK_SEQ AS INT);
