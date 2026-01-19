# 대시보드 관련 테이블 DDL 참조 가이드

> 이 문서는 대시보드 쿼리 작성 시 참조할 실제 테이블 구조를 정리한 것입니다.
> 작성일: 2026-01-15

## 목차

1. [생산계획 관련 테이블](#생산계획-관련-테이블)
2. [기준정보 테이블](#기준정보-테이블)
3. [거래처 테이블](#거래처-테이블)
4. [공통 규칙](#공통-규칙)

---

## 생산계획 관련 테이블

### TPR301M - 생산계획 마스터

**용도**: 생산계획 헤더 정보
**Primary Key**: (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)

```sql
CREATE TABLE TPR301M (
    FACTORY_CODE NVARCHAR(10) NOT NULL DEFAULT '000001',  -- 회사 코드
    PRODPLAN_DATE NVARCHAR(8) NOT NULL,                   -- 계획일자 (YYYYMMDD)
    PRODPLAN_SEQ INT NOT NULL,                            -- 계획순번
    PRODPLAN_ID NVARCHAR(20) NOT NULL,                    -- 계획번호
    ORDER_FLAG NVARCHAR(20) NOT NULL DEFAULT 'PLANNED',   -- 계획상태
    -- ORDER_FLAG 값: PLANNED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    BIGO NVARCHAR(500) NULL,                              -- 비고
    OPMAN_CODE NVARCHAR(20) NULL,                         -- 등록자 ID
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),          -- 등록일시
    OPMAN_CODE2 NVARCHAR(20) NULL,                        -- 수정자 ID
    OPTIME2 DATETIME2 NULL,                               -- 수정일시

    CONSTRAINT PK_TPR301M PRIMARY KEY (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)
);
```

**주요 쿼리 패턴**:

```sql
-- 계획 조회
SELECT * FROM TPR301M WHERE PRODPLAN_DATE = '20260115' AND ORDER_FLAG = 'IN_PROGRESS'

-- 진행 중인 계획 수
SELECT COUNT(*) FROM TPR301M WHERE ORDER_FLAG = 'IN_PROGRESS'
```

---

### TPR301 - 생산계획 상세

**용도**: 생산계획 상세 라인 (품목/작업장/설비/작업자 정보)
**Primary Key**: (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ)
**Foreign Key**: TPR301M 참조

```sql
CREATE TABLE TPR301 (
    FACTORY_CODE NVARCHAR(10) NOT NULL DEFAULT '000001',
    PRODPLAN_DATE NVARCHAR(8) NOT NULL,                   -- 계획일자
    PRODPLAN_SEQ INT NOT NULL,                            -- 계획순번
    PRODWORK_SEQ INT NOT NULL,                            -- 작업순번
    PRODPLAN_ID NVARCHAR(20) NOT NULL,                    -- 계획번호
    PROD_DATE NVARCHAR(8) NOT NULL,                       -- 생산일자
    ITEM_CODE NVARCHAR(50) NOT NULL,                      -- 품목코드
    ITEM_NAME NVARCHAR(200) NOT NULL,                     -- 품목명
    PROD_QTY DECIMAL(18,3) NOT NULL DEFAULT 0,            -- 계획수량
    WORKCENTER_CODE NVARCHAR(20) NOT NULL,                -- 작업장 코드 ★
    WORK_CODE NVARCHAR(20) NULL,                          -- 공정 코드
    EQUIP_SYS_CD NVARCHAR(20) NULL,                       -- 설비코드
    WORKER_TYPE NVARCHAR(20) NULL,                        -- 작업자 구분
    WORKER_CODE NVARCHAR(20) NULL,                        -- 작업자 코드
    WORKER_NAME NVARCHAR(100) NULL,                       -- 작업자명
    ORDER_NO NVARCHAR(20) NULL,                           -- 생산의뢰번호
    ORDER_SEQNO INT NULL,                                 -- 생산의뢰순번
    ORDER_HISTNO INT NULL,                                -- 생산의뢰이력번호
    LOT_NO NVARCHAR(30) NULL,                             -- LOT번호
    WORKORDER_SEQ INT NULL,                               -- 작업지시순번
    DELIVERY_DATE NVARCHAR(8) NULL,                       -- 납기일자
    BIGO NVARCHAR(500) NULL,                              -- 비고
    SEL_CUSTOMER_NAMES NVARCHAR(500) NULL,                -- 선택 거래처명들
    OPMAN_CODE NVARCHAR(20) NULL,
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),
    OPMAN_CODE2 NVARCHAR(20) NULL,
    OPTIME2 DATETIME2 NULL,

    CONSTRAINT PK_TPR301 PRIMARY KEY (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ),
    CONSTRAINT FK_TPR301_TPR301M FOREIGN KEY (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)
        REFERENCES TPR301M(FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ) ON DELETE CASCADE
);
```

**중요**:

- `WORKCENTER_CODE`로 TPR101 작업장 테이블과 조인
- `EQUIP_SYS_CD`로 TPR151 설비 테이블과 조인
- `WORK_CODE`로 TPR102 공정 테이블과 조인

**주요 쿼리 패턴**:

```sql
-- 계획 상세와 마스터 조인
SELECT M.*, D.ITEM_CODE, D.ITEM_NAME, D.PROD_QTY, D.WORKCENTER_CODE
FROM TPR301M M
INNER JOIN TPR301 D ON M.FACTORY_CODE = D.FACTORY_CODE
    AND M.PRODPLAN_DATE = D.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = D.PRODPLAN_SEQ

-- 작업장별 집계
SELECT D.WORKCENTER_CODE, SUM(D.PROD_QTY) AS TOTAL_QTY
FROM TPR301 D
GROUP BY D.WORKCENTER_CODE
```

---

### TPR301R - 생산계획 실적 (주문연결)

**용도**: 생산의뢰와 연결된 실적 정보
**Primary Key**: (FACTORY_CODE, ORDER_NO, ORDER_SEQNO, ORDER_HISTNO)
**Foreign Key**: TPR301M 참조

```sql
CREATE TABLE TPR301R (
    FACTORY_CODE NVARCHAR(10) NOT NULL DEFAULT '000001',
    ORDER_NO NVARCHAR(20) NOT NULL,                       -- 생산의뢰번호
    ORDER_SEQNO INT NOT NULL,                             -- 생산의뢰순번
    ORDER_HISTNO INT NOT NULL,                            -- 생산의뢰이력번호
    CUSTOMER_CODE NVARCHAR(20) NULL,                      -- 거래처 코드
    PRODPLAN_DATE NVARCHAR(8) NOT NULL,                   -- 계획일자 ★
    PRODPLAN_SEQ INT NOT NULL,                            -- 계획순번 ★
    ORDER_QTY DECIMAL(18,3) NOT NULL DEFAULT 0,           -- 주문수량(양품수량)
    WORKDT_QTY DECIMAL(18,3) NOT NULL DEFAULT 0,          -- 작업수량(실적수량) ★
    REPRESENT_ORDER NCHAR(1) NULL DEFAULT 'N',            -- 대표주문여부
    OPMAN_CODE NVARCHAR(20) NULL,
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),
    OPMAN_CODE2 NVARCHAR(20) NULL,
    OPTIME2 DATETIME2 NULL,

    CONSTRAINT PK_TPR301R PRIMARY KEY (FACTORY_CODE, ORDER_NO, ORDER_SEQNO, ORDER_HISTNO),
    CONSTRAINT FK_TPR301R_TPR301M FOREIGN KEY (FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ)
        REFERENCES TPR301M(FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ) ON DELETE CASCADE
);
```

**중요**:

- `WORKDT_QTY`가 실적수량 (GOOD_QTY 컬럼은 없음!)
- 한 계획에 여러 주문이 연결될 수 있으므로 SUM으로 집계 필요

**주요 쿼리 패턴**:

```sql
-- 계획별 실적 집계
SELECT
    FACTORY_CODE,
    PRODPLAN_DATE,
    PRODPLAN_SEQ,
    SUM(ISNULL(WORKDT_QTY, 0)) AS TOTAL_WORKDT_QTY,
    SUM(ISNULL(ORDER_QTY, 0)) AS TOTAL_ORDER_QTY
FROM TPR301R
GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ

-- 계획과 실적 조인 (서브쿼리 패턴)
LEFT JOIN (
    SELECT FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ,
           SUM(ISNULL(WORKDT_QTY, 0)) AS WORKDT_QTY
    FROM TPR301R WITH (NOLOCK)
    GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ
) R ON M.FACTORY_CODE = R.FACTORY_CODE
    AND M.PRODPLAN_DATE = R.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = R.PRODPLAN_SEQ
```

---

## 기준정보 테이블

### TPR101 - 작업장 마스터

**용도**: 작업장 정보
**Primary Key**: (FACTORY_CODE, WORKCENTER_CODE)

```sql
CREATE TABLE TPR101 (
    FACTORY_CODE NVARCHAR(10) NOT NULL,
    WORKCENTER_ID NVARCHAR(20) NOT NULL,                  -- 작업장 ID
    WORKCENTER_CODE NVARCHAR(50) NOT NULL,                -- 작업장 코드 ★
    WORKCENTER_NAME NVARCHAR(100) NOT NULL,               -- 작업장명 ★
    WORKCENTER_TYPE NVARCHAR(50) NULL,                    -- 작업장 유형
    DESCRIPTION NVARCHAR(500) NULL,                       -- 설명
    LOCATION NVARCHAR(200) NULL,                          -- 위치
    STATUS NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',        -- 상태
    USE_YN NCHAR(1) NOT NULL DEFAULT 'Y',                 -- 사용여부
    OPMAN_CODE NVARCHAR(20) NULL,
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),
    OPMAN_CODE2 NVARCHAR(20) NULL,
    OPTIME2 DATETIME2 NULL,

    CONSTRAINT PK_TPR101 PRIMARY KEY (FACTORY_CODE, WORKCENTER_CODE)
);
```

**주요 쿼리 패턴**:

```sql
-- TPR301과 조인
LEFT JOIN TPR101 WC WITH (NOLOCK) ON D.WORKCENTER_CODE = WC.WORKCENTER_CODE

-- 작업장별 그룹화
GROUP BY WC.WORKCENTER_CODE, WC.WORKCENTER_NAME
```

---

### TPR102 - 공정 마스터

**용도**: 공정 정보
**Primary Key**: (FACTORY_CODE, WORK_CODE)

```sql
CREATE TABLE TPR102 (
    FACTORY_CODE NVARCHAR(10) NOT NULL,
    WORK_ID NVARCHAR(20) NOT NULL,                        -- 공정 ID
    WORK_CODE NVARCHAR(20) NOT NULL,                      -- 공정 코드 ★
    WORK_NAME NVARCHAR(100) NOT NULL,                     -- 공정명 ★
    DESCRIPTION NVARCHAR(500) NULL,                       -- 설명
    WORK_TYPE NVARCHAR(50) NULL,                          -- 공정 유형
    ERP_PROCESS_MAPPING NVARCHAR(50) NULL,                -- ERP 공정 매핑
    EQUIPMENT_INTEGRATION_YN NCHAR(1) DEFAULT 'N',        -- 설비 연동 여부
    STATUS NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    USE_YN NCHAR(1) NOT NULL DEFAULT 'Y',
    SORT_ORDER INT NULL,                                  -- 정렬 순서
    OPMAN_CODE NVARCHAR(20) NULL,
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),
    OPMAN_CODE2 NVARCHAR(20) NULL,
    OPTIME2 DATETIME2 NULL,

    CONSTRAINT PK_TPR102 PRIMARY KEY (FACTORY_CODE, WORK_CODE)
);
```

**주요 쿼리 패턴**:

```sql
-- TPR301과 조인
LEFT JOIN TPR102 P WITH (NOLOCK) ON D.WORK_CODE = P.WORK_CODE
```

---

### TPR151 - 설비 마스터

**용도**: 설비 정보
**Primary Key**: (FACTORY_CODE, EQUIP_SYS_CD)

```sql
CREATE TABLE TPR151 (
    FACTORY_CODE NVARCHAR(10) NOT NULL,
    EQUIPMENT_ID NVARCHAR(20) NOT NULL,                   -- 설비 ID
    EQUIP_SYS_CD NVARCHAR(20) NOT NULL,                   -- 설비 시스템 코드 ★
    EQUIP_CD NVARCHAR(20) NULL,                           -- 설비 코드
    EQUIPMENT_NAME NVARCHAR(100) NOT NULL,                -- 설비명 ★
    EQUIP_SPEC NVARCHAR(200) NULL,                        -- 설비 사양
    EQUIP_KIND NVARCHAR(50) NULL,                         -- 설비 종류
    PLC_ADDRESS NVARCHAR(100) NULL,                       -- PLC 주소
    LOCATION NVARCHAR(200) NULL,                          -- 위치
    USE_FLAG NCHAR(1) NOT NULL DEFAULT 'Y',               -- 사용 플래그
    STATUS_FLAG NVARCHAR(20) NULL,                        -- 상태 플래그
    BIGO NVARCHAR(500) NULL,                              -- 비고
    MANAGER1_CODE NVARCHAR(20) NULL,                      -- 담당자1
    MANAGER2_CODE NVARCHAR(20) NULL,                      -- 담당자2
    OPMAN_CODE NVARCHAR(20) NULL,
    OPTIME DATETIME2 NOT NULL DEFAULT GETDATE(),
    OPMAN_CODE2 NVARCHAR(20) NULL,
    OPTIME2 DATETIME2 NULL,

    CONSTRAINT PK_TPR151 PRIMARY KEY (FACTORY_CODE, EQUIP_SYS_CD)
);
```

**주요 쿼리 패턴**:

```sql
-- TPR301과 조인
LEFT JOIN TPR151 EQ WITH (NOLOCK) ON D.EQUIP_SYS_CD = EQ.EQUIP_SYS_CD
```

---

### TPR110 - 작업장별 공정흐름 (선택사항)

### TPR110D - 공정흐름 상세 (선택사항)

### TPR112 - 품목별 공정흐름 (선택사항)

이 테이블들은 공정 스텝퍼 기능에서 사용됩니다.

---

## 거래처 테이블

### TCO601 - 거래처 마스터

**용도**: 거래처 정보
**Primary Key**: (FACTORY_CODE, CUSTOMER_CODE)

```sql
CREATE TABLE TCO601 (
    FACTORY_CODE NVARCHAR(10) NOT NULL,
    CUSTOMER_CODE NVARCHAR(20) NOT NULL,                  -- 거래처 코드 ★
    CUSTOMER_NAME NVARCHAR(100) NOT NULL,                 -- 거래처명 ★
    -- ... 기타 컬럼들
);
```

**주요 쿼리 패턴**:

```sql
-- TPR301R과 조인
LEFT JOIN TCO601 C WITH (NOLOCK)
    ON R.CUSTOMER_CODE = C.CUSTOMER_CODE
    AND M.FACTORY_CODE = C.FACTORY_CODE
```

---

## 공통 규칙

### 1. 테이블 별칭 (Alias) 규칙

```sql
M  = TPR301M (마스터)
D  = TPR301 (상세)
R  = TPR301R (실적) - 서브쿼리로 집계 후 사용
WC = TPR101 (작업장)
EQ = TPR151 (설비)
P  = TPR102 (공정)
C  = TCO601 (거래처)
```

### 2. JOIN 패턴

```sql
-- 기본 3-way JOIN
FROM TPR301M M WITH (NOLOCK)
INNER JOIN TPR301 D WITH (NOLOCK)
    ON M.FACTORY_CODE = D.FACTORY_CODE
    AND M.PRODPLAN_DATE = D.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = D.PRODPLAN_SEQ
LEFT JOIN TPR101 WC WITH (NOLOCK)
    ON D.WORKCENTER_CODE = WC.WORKCENTER_CODE
```

### 3. TPR301R 집계 패턴 (필수!)

```sql
-- 서브쿼리로 먼저 집계
LEFT JOIN (
    SELECT
        FACTORY_CODE,
        PRODPLAN_DATE,
        PRODPLAN_SEQ,
        SUM(ISNULL(WORKDT_QTY, 0)) AS WORKDT_QTY,
        SUM(ISNULL(ORDER_QTY, 0)) AS ORDER_QTY,
        MIN(CUSTOMER_CODE) AS CUSTOMER_CODE
    FROM TPR301R WITH (NOLOCK)
    GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ
) R ON M.FACTORY_CODE = R.FACTORY_CODE
    AND M.PRODPLAN_DATE = R.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = R.PRODPLAN_SEQ
```

### 4. WITH (NOLOCK) 사용

- 모든 SELECT 쿼리에서 `WITH (NOLOCK)` 힌트 사용
- 읽기 성능 향상을 위한 Dirty Read 허용

### 5. 날짜 형식

- `PRODPLAN_DATE`: NVARCHAR(8) - YYYYMMDD 형식
- `OPTIME`, `OPTIME2`: DATETIME2 - 등록/수정일시

### 6. 컬럼명 변환

```sql
-- AS 절로 명확한 이름 부여
D.WORKCENTER_CODE AS WORKPLACE_CODE
WC.WORKCENTER_NAME AS WORKPLACE_NAME
D.EQUIP_SYS_CD AS EQUIPMENT_CODE
EQ.EQUIPMENT_NAME
D.WORK_CODE AS PROCESS_CODE
P.WORK_NAME AS PROCESS_NAME
R.WORKDT_QTY AS ACTUAL_QTY  -- 실적수량
```

### 7. 자주 하는 실수 ⚠️

```sql
-- ❌ 잘못된 패턴
FROM TPR301M T
LEFT JOIN TPR301R R ON T.PLAN_DATE = R.PLAN_DATE  -- PLAN_DATE는 없음!
LEFT JOIN TPR104 WC  -- TPR104는 없음, TPR101 사용!
SELECT R.GOOD_QTY  -- GOOD_QTY는 없음, WORKDT_QTY 사용!

-- ✅ 올바른 패턴
FROM TPR301M M
INNER JOIN TPR301 D ON M.PRODPLAN_DATE = D.PRODPLAN_DATE
LEFT JOIN (
    SELECT PRODPLAN_DATE, PRODPLAN_SEQ, SUM(WORKDT_QTY) AS WORKDT_QTY
    FROM TPR301R GROUP BY PRODPLAN_DATE, PRODPLAN_SEQ
) R ON M.PRODPLAN_DATE = R.PRODPLAN_DATE AND M.PRODPLAN_SEQ = R.PRODPLAN_SEQ
LEFT JOIN TPR101 WC ON D.WORKCENTER_CODE = WC.WORKCENTER_CODE
```

---

## 대시보드 쿼리 템플릿

### 기본 템플릿

```sql
SELECT
    M.PRODPLAN_ID,
    M.PRODPLAN_DATE,
    M.PRODPLAN_SEQ,
    M.ORDER_FLAG,
    D.ITEM_CODE,
    D.ITEM_NAME,
    D.PROD_QTY AS PLANNED_QTY,
    D.WORKCENTER_CODE AS WORKPLACE_CODE,
    WC.WORKCENTER_NAME AS WORKPLACE_NAME,
    D.EQUIP_SYS_CD AS EQUIPMENT_CODE,
    EQ.EQUIPMENT_NAME,
    ISNULL(R.WORKDT_QTY, 0) AS ACTUAL_QTY
FROM TPR301M M WITH (NOLOCK)
INNER JOIN TPR301 D WITH (NOLOCK)
    ON M.FACTORY_CODE = D.FACTORY_CODE
    AND M.PRODPLAN_DATE = D.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = D.PRODPLAN_SEQ
LEFT JOIN TPR101 WC WITH (NOLOCK)
    ON D.WORKCENTER_CODE = WC.WORKCENTER_CODE
LEFT JOIN TPR151 EQ WITH (NOLOCK)
    ON D.EQUIP_SYS_CD = EQ.EQUIP_SYS_CD
LEFT JOIN (
    SELECT FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ,
           SUM(ISNULL(WORKDT_QTY, 0)) AS WORKDT_QTY
    FROM TPR301R WITH (NOLOCK)
    GROUP BY FACTORY_CODE, PRODPLAN_DATE, PRODPLAN_SEQ
) R ON M.FACTORY_CODE = R.FACTORY_CODE
    AND M.PRODPLAN_DATE = R.PRODPLAN_DATE
    AND M.PRODPLAN_SEQ = R.PRODPLAN_SEQ
WHERE M.FACTORY_CODE = #{factoryCode}
  AND M.PRODPLAN_DATE = #{planDate}
```

---

## 참고사항

1. **테이블 존재 여부 확인**

   - TPR101, TPR102, TPR151, TPR301M, TPR301, TPR301R, TCO601은 확인된 테이블
   - TPR104는 존재하지 않거나 사용되지 않음

2. **컬럼명 일관성**

   - WORKCENTER_CODE (작업장)
   - EQUIP_SYS_CD (설비)
   - WORK_CODE (공정)
   - PRODPLAN_DATE, PRODPLAN_SEQ (계획 식별)

3. **실적 데이터**

   - TPR301R.WORKDT_QTY가 실제 작업수량
   - GOOD_QTY, DEFECT_QTY 같은 컬럼은 TPR301R에 없음

4. **쿼리 작성 전 체크리스트**
   - [ ] TPR301M과 TPR301 INNER JOIN 확인
   - [ ] PRODPLAN_DATE, PRODPLAN_SEQ 사용 확인
   - [ ] TPR301R은 서브쿼리로 집계 확인
   - [ ] TPR101 (작업장) 사용 확인
   - [ ] WORKDT_QTY (실적) 사용 확인
   - [ ] WITH (NOLOCK) 추가 확인

---

**마지막 업데이트**: 2026-01-15
**작성자**: SHMT-MES Development Team
