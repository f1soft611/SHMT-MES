# 스케쥴러 서비스 등록 가이드

## 개요
이 문서는 동적 스케쥴러에서 실행할 서비스를 구현하고 등록하는 방법을 설명합니다.

## 1. 스케쥴러 서비스 구현 방법

### 1.1 서비스 인터페이스 작성

```java
package egovframework.let.scheduler.service;

/**
 * 샘플 스케쥴러 서비스 인터페이스
 */
public interface SampleSchedulerService {
    
    /**
     * 스케쥴러에서 호출할 메인 메서드
     * executeInterface 또는 execute 이름 권장
     */
    void executeInterface() throws Exception;
    
    /**
     * 개별 작업 메서드도 정의 가능
     */
    void doSomeWork() throws Exception;
}
```

### 1.2 서비스 구현체 작성

```java
package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.service.SampleSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service("sampleSchedulerService")  // Bean 이름 명시적 지정
@RequiredArgsConstructor
public class SampleSchedulerServiceImpl implements SampleSchedulerService {

    // 필요한 DAO, Service 등을 주입
    // private final SomeDAO someDAO;
    
    @Override
    @Transactional  // 트랜잭션이 필요한 경우 추가
    public void executeInterface() throws Exception {
        log.info("스케쥴러 작업 시작");
        
        try {
            // 실제 비즈니스 로직 구현
            doSomeWork();
            
            log.info("스케쥴러 작업 완료");
        } catch (Exception e) {
            log.error("스케쥴러 작업 실패", e);
            throw e;
        }
    }
    
    @Override
    public void doSomeWork() throws Exception {
        // 구체적인 작업 로직
        log.info("작업 수행 중...");
    }
}
```

## 2. 스케쥴러 등록 방법

### 2.1 웹 UI를 통한 등록

1. 웹 브라우저에서 스케쥴러 관리 페이지 접속
   - URL: `http://localhost:3000/scheduler`

2. "스케쥴러 등록" 버튼 클릭

3. 등록 폼 작성
   - **스케쥴러명**: 스케쥴러의 이름 (예: "샘플 스케쥴러")
   - **스케쥴러 설명**: 스케쥴러의 설명
   - **CRON 표현식**: 실행 주기 설정
     - 예: `0 0 * * * *` (매 시간 정각)
     - 예: `0 */5 * * * *` (5분마다)
     - 예: `0 0 2 * * *` (매일 오전 2시)
   - **작업 클래스명**: 서비스 전체 경로
     - 형식1: `egovframework.let.scheduler.service.SampleSchedulerService`
     - 형식2: `egovframework.let.scheduler.service.SampleSchedulerService.executeInterface`
     - 형식3: `egovframework.let.scheduler.service.SampleSchedulerService.doSomeWork` (특정 메서드 지정)
   - **활성화 여부**: Y (활성) 또는 N (비활성)

4. "저장" 버튼 클릭

5. 스케쥴러가 자동으로 등록되고 즉시 시작됨

### 2.2 데이터베이스를 통한 직접 등록

```sql
INSERT INTO scheduler_config (
    scheduler_name,
    scheduler_description,
    cron_expression,
    job_class_name,
    is_enabled,
    reg_dt,
    reg_user_id
) VALUES (
    '샘플 스케쥴러',
    '샘플 스케쥴러 설명',
    '0 0 * * * *',  -- 매 시간 정각
    'egovframework.let.scheduler.service.SampleSchedulerService',
    'Y',
    GETDATE(),
    'admin'
);
```

등록 후 스케쥴러 재시작 필요:
- 웹 UI에서 "전체 재시작" 버튼 클릭
- 또는 애플리케이션 재시작

## 3. ErpToMesInterfaceService 샘플 사용 방법

### 3.1 서비스 개요

`ErpToMesInterfaceService`는 ERP 시스템의 데이터를 MES 시스템으로 연동하는 샘플 서비스입니다.

### 3.2 등록 예시

**스케쥴러 등록 정보:**
- **스케쥴러명**: ERP-MES 인터페이스
- **스케쥴러 설명**: ERP 시스템의 작업지시, 자재, BOM 정보를 MES로 연동
- **CRON 표현식**: `0 0 2 * * *` (매일 새벽 2시 실행)
- **작업 클래스명**: `egovframework.let.scheduler.service.ErpToMesInterfaceService`
- **활성화 여부**: Y

### 3.3 개별 메서드 실행 등록

전체 연동이 아닌 개별 작업만 실행하려면:

**작업지시만 연동:**
- **작업 클래스명**: `egovframework.let.scheduler.service.ErpToMesInterfaceService.syncWorkOrders`
- **CRON 표현식**: `0 */30 * * * *` (30분마다)

**자재만 연동:**
- **작업 클래스명**: `egovframework.let.scheduler.service.ErpToMesInterfaceService.syncMaterials`
- **CRON 표현식**: `0 0 1 * * *` (매일 새벽 1시)

**BOM만 연동:**
- **작업 클래스명**: `egovframework.let.scheduler.service.ErpToMesInterfaceService.syncBom`
- **CRON 표현식**: `0 0 3 * * *` (매일 새벽 3시)

### 3.4 실제 구현 시 수정사항

`ErpToMesInterfaceServiceImpl.java`는 샘플 구현이므로, 실제 사용 시 아래 부분을 수정해야 합니다:

1. **ERP 시스템 연동 부분**
```java
// TODO 주석 부분을 실제 ERP API 호출 또는 DB 연동으로 변경
// List<WorkOrder> erpWorkOrders = erpApiClient.getWorkOrders();
```

2. **MES 시스템 저장 부분**
```java
// TODO 주석 부분을 실제 MES DAO 호출로 변경
// for (WorkOrder workOrder : erpWorkOrders) {
//     mesWorkOrderDAO.insertOrUpdate(workOrder);
// }
```

3. **필요한 DAO, Service 의존성 주입**
```java
@RequiredArgsConstructor
public class ErpToMesInterfaceServiceImpl implements ErpToMesInterfaceService {
    
    // 실제 필요한 의존성 추가
    private final ErpApiClient erpApiClient;
    private final MesWorkOrderDAO mesWorkOrderDAO;
    private final MesMaterialDAO mesMaterialDAO;
    private final MesBomDAO mesBomDAO;
    
    // ...
}
```

## 4. CRON 표현식 가이드

### 4.1 형식
```
초(0-59) 분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-6)
```

### 4.2 자주 사용하는 예시

| 표현식 | 설명 |
|--------|------|
| `0 0 * * * *` | 매 시간 정각 |
| `0 */5 * * * *` | 5분마다 |
| `0 */10 * * * *` | 10분마다 |
| `0 0 2 * * *` | 매일 새벽 2시 |
| `0 0 9-18 * * *` | 매일 오전 9시부터 오후 6시까지 매 시간 |
| `0 0 9 * * 1-5` | 주중(월-금) 오전 9시 |
| `0 0 0 1 * *` | 매월 1일 자정 |
| `0 0 0 * * 0` | 매주 일요일 자정 |

### 4.3 특수 문자

- `*` : 모든 값
- `?` : 특정 값 없음 (일, 요일에서만 사용)
- `-` : 범위 (예: 1-5)
- `,` : 여러 값 지정 (예: 1,3,5)
- `/` : 증분 (예: */5 = 5분마다)
- `L` : 마지막 (예: L = 마지막 날)
- `W` : 가장 가까운 평일
- `#` : n번째 요일 (예: 2#1 = 첫 번째 월요일)

## 5. 실행 이력 확인

### 5.1 웹 UI에서 확인
1. 스케쥴러 관리 페이지 접속
2. "실행 이력" 탭 클릭
3. 실행 상태, 시간, 에러 메시지 확인

### 5.2 실행 상태
- **RUNNING**: 실행 중
- **SUCCESS**: 성공
- **FAILED**: 실패

### 5.3 로그 확인
서버 로그 파일에서 상세한 실행 로그를 확인할 수 있습니다:
```bash
tail -f logs/application.log
```

## 6. 주의사항

### 6.1 Bean 이름 규칙
- Spring Bean 이름은 클래스명의 첫 글자를 소문자로 변경한 camelCase 사용
- 예: `ErpToMesInterfaceService` → `erpToMesInterfaceService`
- 명시적으로 Bean 이름을 지정하려면 `@Service("빈이름")` 사용

### 6.2 트랜잭션 처리
- DB 작업이 있는 경우 `@Transactional` 어노테이션 사용
- 예외 발생 시 자동 롤백 처리

### 6.3 에러 처리
- 서비스 메서드에서 예외를 던지면 스케쥴러가 자동으로 FAILED 상태로 기록
- 예외 메시지는 실행 이력에 저장됨

### 6.4 동시 실행
- 동일한 스케쥴러가 이전 실행이 완료되지 않은 상태에서 다시 실행될 수 있음
- 필요한 경우 동시 실행 방지 로직 구현 필요

### 6.5 장시간 실행 작업
- 스케쥴러 스레드 풀 크기: 10개
- 장시간 실행되는 작업은 별도 비동기 처리 고려

## 7. 문제 해결

### 7.1 서비스 빈을 찾을 수 없음
**에러**: `서비스 빈을 찾을 수 없습니다: xxxService`

**해결 방법**:
1. 서비스 클래스에 `@Service` 어노테이션이 있는지 확인
2. Bean 이름이 올바른지 확인 (camelCase)
3. 컴포넌트 스캔 범위에 포함되어 있는지 확인

### 7.2 메서드를 찾을 수 없음
**에러**: `서비스에 executeInterface() 또는 execute() 메서드가 없습니다`

**해결 방법**:
1. 서비스에 `executeInterface()` 또는 `execute()` 메서드가 있는지 확인
2. 메서드명을 작업 클래스명에 명시: `서비스경로.메서드명`

### 7.3 스케쥴러가 실행되지 않음
**확인 사항**:
1. 활성화 여부가 'Y'인지 확인
2. CRON 표현식이 올바른지 확인
3. 서버 로그에서 에러 메시지 확인
4. 스케쥴러 재시작 필요 시 "전체 재시작" 실행

## 8. 추가 예시

### 8.1 데이터 정리 스케쥴러

```java
@Service("dataCleanupService")
public class DataCleanupServiceImpl implements DataCleanupService {
    
    @Override
    @Transactional
    public void executeInterface() throws Exception {
        // 30일 이상 된 로그 데이터 삭제
        logDAO.deleteOldLogs(30);
        
        // 90일 이상 된 임시 파일 삭제
        fileService.cleanupTempFiles(90);
    }
}
```

**등록 정보**:
- **작업 클래스명**: `egovframework.let.scheduler.service.DataCleanupService`
- **CRON**: `0 0 1 * * *` (매일 새벽 1시)

### 8.2 보고서 생성 스케쥴러

```java
@Service("reportGenerationService")
public class ReportGenerationServiceImpl implements ReportGenerationService {
    
    @Override
    public void executeInterface() throws Exception {
        // 일일 생산 보고서 생성
        reportService.generateDailyProductionReport();
        
        // 보고서 이메일 전송
        emailService.sendReport();
    }
}
```

**등록 정보**:
- **작업 클래스명**: `egovframework.let.scheduler.service.ReportGenerationService`
- **CRON**: `0 0 18 * * *` (매일 오후 6시)
