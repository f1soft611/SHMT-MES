# 스케쥴러 관리 시스템 - 기술 구현 명세

## 프로젝트 개요
이슈 요구사항에 따라 동적 스케쥴러 관리 시스템을 구현하였습니다.

## 구현된 기능

### ✅ 1. 스케쥴러 등록
- Web UI를 통한 스케쥴러 등록
- 필수 입력 항목: 스케쥴러명, CRON 표현식, 작업 클래스명
- 활성화/비활성화 설정

### ✅ 2. 스케쥴러 주기 변경
- CRON 표현식 수정을 통한 실행 주기 조정
- 수정 후 자동 재시작으로 변경사항 즉시 적용

### ✅ 3. 백엔드 동적 스케쥴러 실행
- Spring TaskScheduler를 이용한 동적 스케쥴러 관리
- 데이터베이스에서 활성화된 스케쥴러를 자동 로드
- 서버 재시작 없이 스케쥴러 추가/수정/삭제 가능

### ✅ 4. 실행 이력 및 에러 로그
- 자동 실행 이력 기록 (시작/종료 시간, 실행 시간)
- 상태 관리 (SUCCESS/FAILED/RUNNING)
- 상세 에러 메시지 저장

## 기술 스택

### Backend
- **Framework**: Spring Boot
- **ORM**: MyBatis
- **Scheduler**: Spring TaskScheduler (ThreadPoolTaskScheduler)
- **Database**: MySQL
- **API**: REST API with Swagger documentation

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Data Grid**: MUI DataGrid

## 파일 구조

### Backend
```
backend/src/main/java/egovframework/let/scheduler/
├── controller/
│   ├── SchedulerConfigApiController.java      # REST API 엔드포인트
│   └── SchedulerHistoryApiController.java     # 실행 이력 API
├── service/
│   ├── SchedulerConfigService.java            # 스케쥴러 설정 서비스 인터페이스
│   ├── SchedulerHistoryService.java           # 실행 이력 서비스 인터페이스
│   ├── DynamicSchedulerService.java           # 동적 스케쥴러 관리 인터페이스
│   └── impl/
│       ├── SchedulerConfigServiceImpl.java    # 설정 서비스 구현
│       ├── SchedulerHistoryServiceImpl.java   # 이력 서비스 구현
│       └── DynamicSchedulerServiceImpl.java   # 동적 스케쥴러 구현
├── mapper/
│   ├── SchedulerConfigDAO.java                # 설정 DAO
│   └── SchedulerHistoryDAO.java               # 이력 DAO
├── model/
│   ├── SchedulerConfig.java                   # 설정 모델
│   ├── SchedulerConfigVO.java                 # 설정 VO
│   ├── SchedulerHistory.java                  # 이력 모델
│   └── SchedulerHistoryVO.java                # 이력 VO
└── README.md                                  # 사용자 가이드

backend/src/main/resources/egovframework/mapper/let/scheduler/
├── SchedulerConfigMapper_SQL_mysql.xml        # 설정 MyBatis 매퍼
└── SchedulerHistoryMapper_SQL_mysql.xml       # 이력 MyBatis 매퍼

backend/DATABASE/
├── scheduler_ddl_mysql.sql                    # 테이블 DDL
└── scheduler_sample_data.sql                  # 샘플 데이터
```

### Frontend
```
frontend/src/
├── pages/Scheduler/
│   └── SchedulerManagement.tsx                # 메인 페이지
├── components/Scheduler/
│   ├── SchedulerList.tsx                      # 스케쥴러 목록
│   ├── SchedulerForm.tsx                      # 등록/수정 폼
│   └── SchedulerHistoryList.tsx               # 실행 이력 목록
├── services/
│   └── schedulerService.ts                    # API 서비스
└── constants/
    └── url.js                                 # URL 상수 (SCHEDULER 추가)
```

## 핵심 구현 내용

### 1. DynamicSchedulerServiceImpl
```java
- configureTasks(): TaskScheduler 초기화
- initializeSchedulers(): 애플리케이션 시작 시 스케쥴러 로드
- restartSchedulers(): 모든 스케쥴러 재시작
- scheduleTask(): 개별 스케쥴러 등록
- createTaskRunnable(): 실행 이력 자동 기록 로직
```

**핵심 기능**:
- ConcurrentHashMap으로 스케쥴러 작업 관리
- CronTrigger로 CRON 표현식 파싱
- 실행 전후 자동 이력 기록
- Exception 발생 시 에러 메시지 저장

### 2. 데이터베이스 트랜잭션
- 스케쥴러 등록/수정/삭제 시 @Transactional 처리
- 변경 후 자동 재시작으로 즉시 반영

### 3. Frontend React Query 캐싱
```typescript
- staleTime: 5분 (스케쥴러 설정)
- staleTime: 30초 (실행 이력)
- 자동 refetch on window focus
- Optimistic updates
```

### 4. 상태 관리
- **스케쥴러 상태**: Y(활성), N(비활성)
- **실행 상태**: SUCCESS, FAILED, RUNNING
- Chip 컴포넌트로 시각적 표시

## API 명세

### Scheduler Config API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/schedulers | 목록 조회 (페이지네이션) |
| GET | /api/schedulers/{id} | 상세 조회 |
| POST | /api/schedulers | 등록 |
| PUT | /api/schedulers/{id} | 수정 |
| DELETE | /api/schedulers/{id} | 삭제 |
| POST | /api/schedulers/restart | 전체 재시작 |

### Scheduler History API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scheduler-history | 목록 조회 (페이지네이션) |
| GET | /api/scheduler-history/{id} | 상세 조회 |

## 배포 및 설정

### 1. 데이터베이스 설정
```sql
-- 테이블 생성
source backend/DATABASE/scheduler_ddl_mysql.sql;

-- 샘플 데이터 삽입 (선택)
source backend/DATABASE/scheduler_sample_data.sql;
```

### 2. 애플리케이션 설정
- Spring Boot 자동 설정 사용
- @EnableScheduling은 자동으로 활성화됨
- DynamicSchedulerService가 @PostConstruct에서 초기화

### 3. 웹 접속
- URL: `http://localhost:3000/scheduler`
- 인증이 필요한 경우 로그인 후 접속

## 테스트 시나리오

### 1. 스케쥴러 등록 테스트
1. 웹 UI 접속
2. "스케쥴러 등록" 클릭
3. 정보 입력 및 저장
4. 목록에서 확인

### 2. 실행 이력 확인
1. 등록된 스케쥴러가 CRON 표현식에 따라 자동 실행
2. "실행 이력" 탭에서 이력 확인
3. 상태 및 실행 시간 확인

### 3. 스케쥴러 수정 및 재시작
1. 스케쥴러 수정
2. 자동 재시작 확인
3. 변경된 CRON으로 실행되는지 확인

## 주의사항

### Backend
- 작업 클래스는 현재 샘플 구현만 제공
- 실제 작업 클래스 동적 로딩은 추가 구현 필요
- 보안: API 접근 권한 설정 필요

### Frontend
- 빌드 시 CI 환경의 eslint 오류는 기존 파일 관련
- 스케쥴러 관련 코드는 모두 정상

### 운영
- 실행 이력 데이터 정리 정책 필요
- 동시 실행 스케쥴러 수 제한 검토
- 장시간 실행 작업 타임아웃 설정

## 향후 개선 사항

1. **작업 클래스 동적 로딩**: Reflection을 이용한 실제 클래스 실행
2. **스케쥴러 그룹화**: 카테고리별 스케쥴러 관리
3. **알림 기능**: 실패 시 이메일/슬랙 알림
4. **대시보드**: 실행 통계 및 모니터링
5. **로그 보관**: 실행 이력 자동 아카이빙
6. **권한 관리**: 스케쥴러별 접근 권한 설정
