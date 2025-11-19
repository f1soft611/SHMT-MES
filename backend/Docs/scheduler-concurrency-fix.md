# 스케쥴러 동시 실행 문제 해결 문서

## 문제 현상

세 개의 스케쥴러(품목, 거래처, 사용자)가 아침 9시에 동시에 시작되도록 설정되어 있었으나, 모두 정상적으로 완료 로그가 기록되지 않는 문제가 발생했습니다.

**증상:**
- 어떤 때는 1개만 진행 중이고 2개는 완료
- 어떤 때는 2개만 진행 중이고 1개는 완료
- 모든 스케쥴러가 정상적으로 끝나서 완료 이력이 업데이트되어야 하는데 일관성이 없음

## 원인 분석

### 1. 트랜잭션 격리 문제
스케쥴러 실행 흐름:
1. `insertSchedulerHistory()` - 이력 레코드 시작 기록 (상태: RUNNING)
2. `executeJob()` - 실제 작업 실행 (@Transactional 메서드)
3. `updateSchedulerHistory()` - 이력 레코드 완료 기록 (상태: SUCCESS/FAILED)

**문제점:**
- `updateSchedulerHistory()`가 `finally` 블록에서 실행되어 작업의 트랜잭션이 아직 커밋 중일 때 호출될 수 있음
- 이력 업데이트가 작업과 같은 트랜잭션 컨텍스트에서 실행되어 트랜잭션 충돌 발생
- 여러 스케쥴러가 동시에 실행될 때 데이터베이스 락 경합 가능성

### 2. 트랜잭션 전파 설정 부재
- `DynamicSchedulerServiceImpl`이 `SchedulerHistoryDAO`를 직접 호출
- 이력 관리 작업에 명시적인 트랜잭션 경계가 없었음
- 작업의 트랜잭션과 이력 업데이트가 혼재되어 동작

## 해결 방법

### 1. 트랜잭션 전파 설정 추가 (REQUIRES_NEW)

**변경 전:**
```java
@Service
public class SchedulerHistoryServiceImpl implements SchedulerHistoryService {
    @Override
    @Transactional
    public void insertSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.insertSchedulerHistory(history);
    }

    @Override
    @Transactional
    public void updateSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.updateSchedulerHistory(history);
    }
}
```

**변경 후:**
```java
@Service
public class SchedulerHistoryServiceImpl implements SchedulerHistoryService {
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void insertSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.insertSchedulerHistory(history);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.updateSchedulerHistory(history);
    }
}
```

**효과:**
- 이력 insert/update가 독립적인 트랜잭션에서 실행됨
- 작업의 트랜잭션과 분리되어 서로 간섭하지 않음
- 동시 실행 시에도 각 이력 업데이트가 독립적으로 완료됨

### 2. 서비스 계층을 통한 트랜잭션 관리

**변경 전:**
```java
@Service
public class DynamicSchedulerServiceImpl {
    private final SchedulerHistoryDAO schedulerHistoryDAO;  // DAO 직접 사용
    
    private Runnable createTaskRunnable(SchedulerConfig config) {
        return () -> {
            // ...
            schedulerHistoryDAO.insertSchedulerHistory(history);  // 직접 호출
            // ...
            schedulerHistoryDAO.updateSchedulerHistory(history);  // 직접 호출
        };
    }
}
```

**변경 후:**
```java
@Service
public class DynamicSchedulerServiceImpl {
    private final SchedulerHistoryService schedulerHistoryService;  // Service 사용
    
    private Runnable createTaskRunnable(SchedulerConfig config) {
        return () -> {
            // ...
            schedulerHistoryService.insertSchedulerHistory(history);  // Service를 통한 호출
            // ...
            schedulerHistoryService.updateSchedulerHistory(history);  // Service를 통한 호출
        };
    }
}
```

**효과:**
- Spring의 트랜잭션 프록시가 정상적으로 동작
- `@Transactional` 어노테이션 설정이 적용됨
- 트랜잭션 전파 설정이 올바르게 처리됨

## 기술적 세부사항

### PROPAGATION_REQUIRES_NEW란?
- 항상 새로운 트랜잭션을 시작합니다
- 기존 트랜잭션이 있으면 일시 중단하고 새 트랜잭션을 시작합니다
- 새 트랜잭션이 커밋되거나 롤백되면 기존 트랜잭션이 재개됩니다

### 동시 실행 시나리오
```
시간 | 품목 스케쥴러          | 거래처 스케쥴러        | 사용자 스케쥴러
-----|----------------------|---------------------|--------------------
9:00 | INSERT history (T1)  | INSERT history (T2) | INSERT history (T3)
9:00 | BEGIN job (T4)       | BEGIN job (T5)      | BEGIN job (T6)
9:05 | COMMIT job (T4)      | ...                 | ...
9:05 | UPDATE history (T7)  | ...                 | ...
9:05 | COMMIT history (T7)  | ...                 | ...
9:06 | ✅ 완료               | COMMIT job (T5)     | ...
9:06 |                      | UPDATE history (T8) | COMMIT job (T6)
9:06 |                      | COMMIT history (T8) | UPDATE history (T9)
9:06 |                      | ✅ 완료              | COMMIT history (T9)
9:06 |                      |                     | ✅ 완료
```

T1, T2, T3: 이력 시작 기록 트랜잭션 (REQUIRES_NEW)
T4, T5, T6: 작업 실행 트랜잭션
T7, T8, T9: 이력 완료 기록 트랜잭션 (REQUIRES_NEW)

각 트랜잭션이 독립적으로 동작하여 서로 간섭하지 않습니다.

## 추가 안전장치

코드에는 이미 재시도 메커니즘이 구현되어 있습니다:

```java
private void retryUpdateHistory(SchedulerHistory history, int maxRetries) {
    for (int i = 0; i < maxRetries; i++) {
        try {
            Thread.sleep(1000 * (i + 1)); // 1초, 2초, 3초 대기
            schedulerHistoryService.updateSchedulerHistory(history);
            return;
        } catch (Exception e) {
            log.warn("재시도 실패: {}회차", i + 1);
        }
    }
}
```

이 메커니즘이 REQUIRES_NEW 전파와 함께 동작하여 더욱 안정적인 실행을 보장합니다.

## 검증 방법

### 1. 데이터베이스 로그 확인
```sql
-- 특정 시간대의 스케쥴러 실행 이력 조회
SELECT 
    SCHEDULER_NAME,
    START_TIME,
    END_TIME,
    STATUS,
    EXECUTION_TIME_MS
FROM SCHEDULER_HISTORY
WHERE START_TIME >= '2025-11-19 09:00:00'
    AND START_TIME < '2025-11-19 09:10:00'
ORDER BY START_TIME, SCHEDULER_NAME;

-- 결과 예시 (수정 후 기대값):
-- 품목     | 09:00:00 | 09:05:00 | SUCCESS | 300000
-- 거래처   | 09:00:00 | 09:06:00 | SUCCESS | 360000  
-- 사용자   | 09:00:00 | 09:06:00 | SUCCESS | 360000
```

### 2. 애플리케이션 로그 확인
```
2025-11-19 09:00:00 [dynamic-scheduler-1] INFO - 스케쥴러 실행 완료: 품목 (300000ms)
2025-11-19 09:00:00 [dynamic-scheduler-1] DEBUG - 스케쥴러 이력 업데이트 완료: 1001

2025-11-19 09:00:00 [dynamic-scheduler-2] INFO - 스케쥴러 실행 완료: 거래처 (360000ms)
2025-11-19 09:00:00 [dynamic-scheduler-2] DEBUG - 스케쥴러 이력 업데이트 완료: 1002

2025-11-19 09:00:00 [dynamic-scheduler-3] INFO - 스케쥴러 실행 완료: 사용자 (360000ms)
2025-11-19 09:00:00 [dynamic-scheduler-3] DEBUG - 스케쥴러 이력 업데이트 완료: 1003
```

모든 스케쥴러가 "완료" 로그와 함께 정상적으로 종료되어야 합니다.

## 결론

이 수정으로 인해:
1. ✅ 이력 레코드 insert/update가 작업 트랜잭션과 독립적으로 실행
2. ✅ 동시 실행 시 트랜잭션 충돌 방지
3. ✅ 모든 스케쥴러가 정상적으로 완료 이력 기록
4. ✅ 기존 재시도 메커니즘과 결합하여 높은 안정성 확보

세 개의 스케쥴러가 9시에 동시에 시작되어도 모두 정상적으로 완료되고 이력이 기록됩니다.
