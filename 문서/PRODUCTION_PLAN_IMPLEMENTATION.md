# 생산계획 백엔드 구현 가이드

## 개요

이 문서는 이슈 #185에서 요청된 미구현 백엔드 기능의 구현 내역을 설명합니다.

## 구현 내역

### 1. 데이터베이스 스키마

#### 1.1 작업자 근무구분 (Shift) 추가

**변경된 테이블**: `TB_WORKPLACE_WORKER` (또는 `TPR106`)

**추가된 컬럼**:
- `SHIFT` (VARCHAR(20) NULL): 근무구분 (DAY/NIGHT/SWING)

**마이그레이션 스크립트**:
- `backend/DATABASE/workplace_migration_add_shift_mssql.sql` (MSSQL용)
- `backend/DATABASE/workplace_migration_add_shift_mysql.sql` (MySQL용)

#### 1.2 생산계획 테이블 생성

**생성된 테이블**:

1. **TPR301M** (생산계획 마스터)
   - FACTORY_CODE: 회사 코드
   - PLAN_NO: 계획번호 (PK)
   - PLAN_DATE: 계획일자
   - WORKPLACE_CODE: 작업장 코드
   - PLAN_STATUS: 계획상태 (PLANNED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)
   - TOTAL_PLAN_QTY: 총 계획수량
   - CHECK 제약조건으로 유효한 상태값만 허용

2. **TPR301** (생산계획 상세)
   - FACTORY_CODE, PLAN_NO, PLAN_SEQ: 복합 PK
   - ITEM_CODE, ITEM_NAME: 품목 정보
   - PLANNED_QTY, ACTUAL_QTY: 계획/실적 수량
   - EQUIPMENT_CODE: 설비 코드
   - SHIFT: 근무구분
   - WORKER_CODE: 작업자 코드
   - ORDER_NO: 생산의뢰번호 (선택)
   - LOT_NO: LOT번호
   - CUSTOMER_CODE: 거래처 코드
   - 외래키로 TPR301M 참조 (CASCADE DELETE)

3. **TPR301R** (생산계획 실적)
   - FACTORY_CODE, PLAN_NO, PLAN_SEQ, RESULT_SEQ: 복합 PK
   - RESULT_DATE: 실적일자
   - RESULT_QTY, GOOD_QTY, BAD_QTY: 수량 정보
   - WORKER_CODE: 작업자 코드
   - START_TIME, END_TIME: 작업 시간
   - 외래키로 TPR301 참조 (CASCADE DELETE)

**DDL 스크립트**:
- `backend/DATABASE/production_plan_ddl_mssql.sql` (MSSQL용)
- `backend/DATABASE/production_plan_ddl_mysql.sql` (MySQL용)

### 2. 백엔드 구현

#### 2.1 도메인 모델

**위치**: `backend/src/main/java/egovframework/let/production/plan/domain/model/`

**클래스**:
- `ProductionPlanMaster`: 생산계획 마스터 모델
  - 계획상태 상수 정의 (STATUS_PLANNED 등)
- `ProductionPlan`: 생산계획 상세 모델
- `ProductionPlanVO`: 검색 및 페이징을 위한 VO

#### 2.2 데이터 액세스 레이어

**DAO 인터페이스**: `ProductionPlanDAO`
**위치**: `backend/src/main/java/egovframework/let/production/plan/domain/repository/`

**MyBatis 매퍼**: `ProductionPlan_SQL_mssql.xml`
**위치**: `backend/src/main/resources/egovframework/mapper/let/production/plan/`

**주요 쿼리**:
- insertProductionPlanMaster: 마스터 등록
- insertProductionPlan: 상세 등록
- selectProductionPlanMasterList: 마스터 목록 조회 (페이징 지원)
- selectProductionPlanList: 상세 목록 조회
- updateProductionPlanMaster: 마스터 수정
- updateProductionPlan: 상세 수정
- deleteProductionPlanMaster: 논리적 삭제 (USE_YN = 'N')

#### 2.3 서비스 레이어

**인터페이스**: `EgovProductionPlanService`
**구현 클래스**: `EgovProductionPlanServiceImpl`
**위치**: `backend/src/main/java/egovframework/let/production/plan/service/`

**주요 기능**:
- `insertProductionPlan()`: 마스터와 상세를 트랜잭션으로 처리
  - 계획번호 자동 생성 (형식: PL + YYYYMMDD + 0001)
  - 총 계획수량 자동 계산
- `selectProductionPlanMasterList()`: 마스터 목록 조회
- `selectProductionPlanByPlanNo()`: 계획번호로 상세 조회
- `updateProductionPlan()`: 마스터와 상세 동시 수정
- `deleteProductionPlan()`: 논리적 삭제

**트랜잭션 관리**:
- `@Transactional` 어노테이션으로 ACID 보장
- 마스터/상세 등록/수정/삭제 시 단일 트랜잭션 처리

#### 2.4 컨트롤러 레이어

**클래스**: `EgovProductionPlanApiController`
**위치**: `backend/src/main/java/egovframework/let/production/plan/controller/`

**REST API 엔드포인트**:

1. **GET /api/production-plans**
   - 생산계획 마스터 목록 조회
   - 파라미터: startDate, endDate, workplaceCode, planStatus, pageIndex, pageUnit
   - 응답: 목록 데이터 + 총 건수

2. **GET /api/production-plans/{planNo}**
   - 계획번호로 상세 목록 조회
   - 응답: 해당 계획의 모든 상세 데이터

3. **POST /api/production-plans**
   - 생산계획 등록 (마스터 + 상세)
   - 요청 본문:
     ```json
     {
       "master": {
         "planDate": "20251121",
         "workplaceCode": "WP001",
         "workplaceName": "작업장1",
         "remark": "비고"
       },
       "details": [
         {
           "planDate": "20251121",
           "itemCode": "ITEM001",
           "itemName": "품목1",
           "plannedQty": 100,
           "equipmentCode": "EQ001",
           "shift": "DAY",
           "workerCode": "W001"
         }
       ]
     }
     ```
   - 응답: 생성된 계획번호

4. **PUT /api/production-plans/{planNo}**
   - 생산계획 수정
   - 요청 본문: POST와 동일한 형식

5. **DELETE /api/production-plans/{planNo}**
   - 생산계획 삭제 (논리적 삭제)

**보안**:
- `@SecurityRequirement` 어노테이션으로 JWT 인증 필요
- `@AuthenticationPrincipal`로 사용자 정보 자동 주입

### 3. WorkplaceWorker 개선

**변경 사항**:
- `WorkplaceWorker.java`: shift 필드 추가
- `WorkplaceWorker_SQL_mssql.xml`: 모든 CRUD 쿼리에 SHIFT 컬럼 추가
- `workplace.ts` (프론트엔드): WorkplaceWorker 인터페이스에 shift 속성 추가

## 사용 방법

### 1. 데이터베이스 마이그레이션

MSSQL을 사용하는 경우:
```sql
-- 1. 작업자 테이블에 shift 컬럼 추가
\i backend/DATABASE/workplace_migration_add_shift_mssql.sql

-- 2. 생산계획 테이블 생성
\i backend/DATABASE/production_plan_ddl_mssql.sql
```

MySQL을 사용하는 경우:
```sql
-- 1. 작업자 테이블에 shift 컬럼 추가
source backend/DATABASE/workplace_migration_add_shift_mysql.sql;

-- 2. 생산계획 테이블 생성
source backend/DATABASE/production_plan_ddl_mysql.sql;
```

### 2. 빌드 및 배포

```bash
cd backend
mvn clean package
# 생성된 WAR 파일을 톰캣 등의 서버에 배포
```

### 3. API 테스트

Swagger UI를 통해 API를 테스트할 수 있습니다:
- URL: `http://localhost:8080/swagger-ui.html`
- Tag: `EgovProductionPlanApiController`

## 데이터 모델 관계

```
TPR301M (마스터)
  ├─ 1:N → TPR301 (상세)
  │          └─ 1:N → TPR301R (실적)
  │
  └─ N:1 → TB_WORKPLACE (작업장)

TPR301 (상세)
  ├─ N:1 → TB_ITEM (품목)
  ├─ N:1 → TB_EQUIPMENT (설비)
  ├─ N:1 → TB_WORKPLACE_WORKER (작업자)
  └─ N:1 → TB_CUSTOMER (거래처)
```

## 주요 설계 결정사항

1. **계획번호 생성 방식**: 날짜 + 시퀀스 조합으로 유일성 보장
2. **삭제 방식**: 논리적 삭제 (USE_YN = 'N')로 이력 보존
3. **트랜잭션 범위**: 마스터와 상세를 하나의 트랜잭션으로 처리
4. **상태 관리**: CHECK 제약조건으로 유효한 상태값만 허용
5. **외래키**: CASCADE DELETE 옵션으로 데이터 일관성 보장

## 확장 가능성

향후 다음 기능을 추가할 수 있습니다:

1. **생산계획 승인 프로세스**: PLAN_STATUS를 활용한 워크플로우
2. **실적 입력**: TPR301R 테이블을 활용한 실적 관리
3. **계획 대비 실적 분석**: 계획수량과 실적수량 비교
4. **자동 일정 생성**: AI/ML 기반 최적 일정 생성
5. **Gantt 차트**: 시각적 일정 관리

## 참고사항

- 모든 날짜는 YYYYMMDD 형식의 문자열로 저장
- BigDecimal 타입으로 수량 정밀도 보장
- Lombok 사용으로 보일러플레이트 코드 최소화
- Swagger 어노테이션으로 API 문서 자동 생성

## 문의

구현 관련 문의사항은 이슈에 코멘트로 남겨주세요.
