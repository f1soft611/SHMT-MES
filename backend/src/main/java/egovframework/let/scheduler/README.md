# 스케쥴러 관리 시스템

## 개요
이 시스템은 동적으로 스케쥴러를 등록, 수정, 삭제하고 실행 이력을 관리할 수 있는 웹 기반 스케쥴러 관리 시스템입니다.

## 주요 기능

### 1. 스케쥴러 등록
- 스케쥴러명, 설명, CRON 표현식, 작업 클래스명을 입력하여 새로운 스케쥴러를 등록할 수 있습니다.
- 활성화/비활성화 상태를 설정할 수 있습니다.

### 2. 스케쥴러 주기 변경
- 등록된 스케쥴러의 CRON 표현식을 변경하여 실행 주기를 조정할 수 있습니다.
- 수정 후 자동으로 스케쥴러가 재시작되어 변경사항이 즉시 적용됩니다.

### 3. 동적 스케쥴러 실행
- 데이터베이스에 등록된 활성화된 스케쥴러를 Spring TaskScheduler를 이용하여 동적으로 실행합니다.
- 서버 재시작 없이 스케쥴러를 추가/수정/삭제할 수 있습니다.

### 4. 실행 이력 및 에러 로그
- 각 스케쥴러의 실행 이력이 자동으로 기록됩니다.
- 실행 시작/종료 시간, 실행 시간(ms), 상태(성공/실패/실행중)가 기록됩니다.
- 실패 시 에러 메시지가 함께 저장되어 디버깅에 활용할 수 있습니다.

## 데이터베이스 스키마

### scheduler_config 테이블
스케쥴러 설정 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| scheduler_id | BIGINT | 스케쥴러 ID (PK, Auto Increment) |
| scheduler_name | VARCHAR(100) | 스케쥴러명 (Unique) |
| scheduler_description | VARCHAR(500) | 스케쥴러 설명 |
| cron_expression | VARCHAR(100) | CRON 표현식 |
| job_class_name | VARCHAR(255) | 작업 클래스명 |
| is_enabled | CHAR(1) | 활성화 여부 (Y/N) |
| created_date | DATETIME | 등록일시 |
| created_by | VARCHAR(20) | 등록자 |
| updated_date | DATETIME | 수정일시 |
| updated_by | VARCHAR(20) | 수정자 |

### scheduler_history 테이블
스케쥴러 실행 이력을 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| history_id | BIGINT | 이력 ID (PK, Auto Increment) |
| scheduler_id | BIGINT | 스케쥴러 ID (FK) |
| scheduler_name | VARCHAR(100) | 스케쥴러명 |
| start_time | DATETIME | 시작시간 |
| end_time | DATETIME | 종료시간 |
| status | VARCHAR(20) | 실행상태 (SUCCESS/FAILED/RUNNING) |
| error_message | TEXT | 에러 메시지 |
| execution_time_ms | BIGINT | 실행시간(밀리초) |
| created_date | DATETIME | 등록일시 |

## API 엔드포인트

### 스케쥴러 설정 관리
- `GET /api/schedulers` - 스케쥴러 목록 조회
- `GET /api/schedulers/{schedulerId}` - 스케쥴러 상세 조회
- `POST /api/schedulers` - 스케쥴러 등록
- `PUT /api/schedulers/{schedulerId}` - 스케쥴러 수정
- `DELETE /api/schedulers/{schedulerId}` - 스케쥴러 삭제
- `POST /api/schedulers/restart` - 스케쥴러 재시작

### 스케쥴러 실행 이력
- `GET /api/scheduler-history` - 실행 이력 목록 조회
- `GET /api/scheduler-history/{historyId}` - 실행 이력 상세 조회

## 사용 방법

### 1. 데이터베이스 설정
```sql
-- 사용 중인 데이터베이스에 맞는 DDL 파일을 실행하여 테이블을 생성합니다.
-- MySQL: backend/DATABASE/scheduler_ddl_mysql.sql
-- MSSQL: backend/DATABASE/scheduler_ddl_mssql.sql (별도 생성 필요)
```

**지원하는 데이터베이스:**
- MySQL (Mapper: SchedulerConfigMapper_SQL_mysql.xml, SchedulerHistoryMapper_SQL_mysql.xml)
- MS SQL Server (Mapper: SchedulerConfigMapper_SQL_mssql.xml, SchedulerHistoryMapper_SQL_mssql.xml)

### 2. 스케쥴러 등록
1. 웹 UI에서 `/scheduler` 경로로 접속합니다.
2. "스케쥴러 등록" 버튼을 클릭합니다.
3. 필수 정보를 입력합니다:
   - **스케쥴러명**: 스케쥴러를 식별할 수 있는 이름
   - **설명**: 스케쥴러의 용도 설명
   - **CRON 표현식**: 실행 주기 (예: `0 0 * * * *` = 매시간 0분)
   - **작업 클래스명**: 실행할 서비스 클래스의 전체 경로
   - **활성화 여부**: Y(활성) 또는 N(비활성)

### 3. CRON 표현식 예시
- `0 0 * * * *` - 매시간 0분마다
- `0 */30 * * * *` - 30분마다
- `0 0 0 * * *` - 매일 자정
- `0 0 9 * * MON-FRI` - 평일 오전 9시
- `0 0 12 1 * *` - 매월 1일 12시

### 4. 실행 이력 확인
1. "실행 이력" 탭을 클릭합니다.
2. 스케쥴러별 실행 이력을 확인할 수 있습니다.
3. 상태 필터를 사용하여 성공/실패만 조회할 수 있습니다.
4. 실패한 작업의 에러 메시지를 확인하여 문제를 해결합니다.

## 아키텍처

### Backend
- **Controller**: REST API 엔드포인트 제공
- **Service**: 비즈니스 로직 처리
- **DAO/Repository**: 데이터베이스 접근 (EgovAbstractMapper 상속)
- **DynamicSchedulerService**: 동적 스케쥴러 관리 및 실행

### Frontend
- **React**: UI 프레임워크
- **Material-UI**: UI 컴포넌트 라이브러리
- **React Query**: 서버 상태 관리
- **DataGrid**: 테이블 UI

## 주의사항

1. **작업 클래스명**은 실제로 존재하는 서비스 클래스의 전체 경로를 입력해야 합니다.
2. **CRON 표현식**이 잘못되면 스케쥴러가 실행되지 않습니다.
3. 스케쥴러 수정/삭제 시 자동으로 재시작되므로 진행 중인 작업이 중단될 수 있습니다.
4. 실행 이력은 자동으로 쌓이므로 주기적으로 정리가 필요할 수 있습니다.

## 기존 샘플 스케쥴러

기존의 정적 스케쥴러 시스템(InterfaceScheduler, InterfaceHistory 등)은 제거되었습니다.
새로운 동적 스케쥴러 관리 시스템을 사용하세요.

**제거된 파일들:**
- `InterfaceScheduler.java` - 정적 @Scheduled 샘플
- `InterfaceHistory.java`, `InterfaceHistoryVO.java` - 구 이력 모델
- `InterfaceHistoryDAO.java` - 구 DAO
- `EgovInterfaceHistoryService.java`, `ErpToMesInterfaceService.java` - 구 서비스
- `InterfaceHistoryMapper_SQL_mssql.xml` - 구 매퍼

모든 스케쥴러는 이제 Web UI를 통해 등록하고 관리합니다.

## 문의

문제가 발생하거나 기능 개선이 필요한 경우 이슈를 등록해주세요.
