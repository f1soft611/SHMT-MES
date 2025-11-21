# 스케쥴러 동시 INSERT 시 HISTORY_ID 경합 문제 해결

## 문제 상황

매일 아침 9시에 4개의 스케쥴러가 동시에 실행됨:
1. 품목 연동 (executeMaterialInterface)
2. 사용자 연동 (executeUserInterface)
3. 거래처 연동 (executeCustInterface)
4. 생산의뢰 연동 (executeProdReqInterface)

**증상:**
- 4개 중 1개 이상의 스케쥴러가 "RUNNING" 상태에서 멈춤
- 실제로는 작업이 완료되었으나 이력 업데이트가 실패함
- 완료 상태로 변경되지 않음

## 근본 원인

### MyBatis Mapper의 잘못된 Identity 조회

**문제 코드 (변경 전):**
```xml
<insert id="SchedulerHistoryDAO.insertSchedulerHistory" ...>
    <selectKey keyProperty="historyId" resultType="long" order="AFTER">
        SELECT IDENT_CURRENT('SCHEDULER_HISTORY')  <!-- ❌ 문제 -->
    </selectKey>
    INSERT INTO SCHEDULER_HISTORY (...) VALUES (...)
</insert>
```

### `IDENT_CURRENT`의 문제점

`IDENT_CURRENT('테이블명')`은:
- 해당 테이블에 **모든 세션/연결에서** 마지막으로 생성된 identity 값 반환
- 동시성 제어가 없음
- 다른 세션의 INSERT에 영향을 받음

### 동시 실행 시 발생하는 문제

```
시간      스케쥴러A          스케쥴러B          스케쥴러C          스케쥴러D
----      -----------       -----------       -----------       -----------
09:00:00  INSERT (ID=101)
09:00:00                    INSERT (ID=102)
09:00:00                                      INSERT (ID=103)
09:00:00                                                        INSERT (ID=104)
09:00:01  SELECT IDENT_     SELECT IDENT_     SELECT IDENT_     SELECT IDENT_
          CURRENT = 104     CURRENT = 104     CURRENT = 104     CURRENT = 104
          
결과:     A의 history.      B의 history.      C의 history.      D의 history.
          historyId=104     historyId=104     historyId=104     historyId=104
          
문제:     모두 ID=104를 받음 → UPDATE 시 마지막 스케쥴러만 업데이트 성공
          나머지 3개는 잘못된 ID로 UPDATE 실패 → RUNNING 상태로 남음
```

## 해결 방법

### `SCOPE_IDENTITY()` 사용

**수정 코드 (변경 후):**
```xml
<insert id="SchedulerHistoryDAO.insertSchedulerHistory" ...>
    <selectKey keyProperty="historyId" resultType="long" order="AFTER">
        SELECT CAST(SCOPE_IDENTITY() AS BIGINT)  <!-- ✅ 해결 -->
    </selectKey>
    INSERT INTO SCHEDULER_HISTORY (...) VALUES (...)
</insert>
```

### `SCOPE_IDENTITY()`의 장점

`SCOPE_IDENTITY()`은:
- **현재 세션 및 현재 실행 범위**에서 마지막으로 생성된 identity 값 반환
- 동시 실행되는 다른 세션의 영향을 받지 않음
- 트랜잭션 안전성 보장
- 정확한 identity 값 반환

### SQL Server Identity 함수 비교

| 함수 | 범위 | 세션 안전성 | 권장 사용 |
|------|------|------------|----------|
| `@@IDENTITY` | 현재 세션의 모든 범위 | 부분적 | ❌ 권장 안함 (트리거 영향 받음) |
| `SCOPE_IDENTITY()` | 현재 세션, 현재 범위 | 완전 | ✅ **권장** |
| `IDENT_CURRENT('테이블')` | 모든 세션, 모든 범위 | 없음 | ❌ 동시성 문제 |

## 수정 후 동작

```
시간      스케쥴러A          스케쥴러B          스케쥴러C          스케쥴러D
----      -----------       -----------       -----------       -----------
09:00:00  INSERT (ID=101)
09:00:00                    INSERT (ID=102)
09:00:00                                      INSERT (ID=103)
09:00:00                                                        INSERT (ID=104)
09:00:01  SELECT SCOPE_     SELECT SCOPE_     SELECT SCOPE_     SELECT SCOPE_
          IDENTITY()=101    IDENTITY()=102    IDENTITY()=103    IDENTITY()=104
          
결과:     A.historyId=101   B.historyId=102   C.historyId=103   D.historyId=104

완료:     각 스케쥴러가 정확한 ID로 UPDATE 성공 ✅
          모두 정상적으로 완료 상태로 업데이트됨
```

## 검증 방법

### 1. 데이터베이스 쿼리로 확인

```sql
-- 9시에 실행된 스케쥴러 이력 확인
SELECT 
    HISTORY_ID,
    SCHEDULER_NAME,
    START_TIME,
    END_TIME,
    STATUS,
    EXECUTION_TIME_MS
FROM SCHEDULER_HISTORY
WHERE CONVERT(VARCHAR(10), START_TIME, 120) = CONVERT(VARCHAR(10), GETDATE(), 120)
    AND DATEPART(HOUR, START_TIME) = 9
ORDER BY HISTORY_ID;

-- 기대 결과:
-- HISTORY_ID | SCHEDULER_NAME | STATUS  | END_TIME
-- -----------+----------------+---------+----------
-- 1001       | 품목연동        | SUCCESS | 09:05:23
-- 1002       | 사용자연동      | SUCCESS | 09:06:15
-- 1003       | 거래처연동      | SUCCESS | 09:06:45
-- 1004       | 생산의뢰연동    | SUCCESS | 09:07:10
```

### 2. 로그 확인

```
2025-11-21 09:00:00 [dynamic-scheduler-1] INFO - 스케쥴러 이력 업데이트 완료: 1001
2025-11-21 09:00:00 [dynamic-scheduler-2] INFO - 스케쥴러 이력 업데이트 완료: 1002
2025-11-21 09:00:00 [dynamic-scheduler-3] INFO - 스케쥴러 이력 업데이트 완료: 1003
2025-11-21 09:00:00 [dynamic-scheduler-4] INFO - 스케쥴러 이력 업데이트 완료: 1004
```

모든 스케쥴러의 로그에 "이력 업데이트 완료" 메시지가 표시되어야 함.

### 3. RUNNING 상태 확인

```sql
-- RUNNING 상태로 남아있는 스케쥴러가 없어야 함
SELECT COUNT(*)
FROM SCHEDULER_HISTORY
WHERE STATUS = 'RUNNING'
    AND START_TIME < DATEADD(HOUR, -1, GETDATE());  -- 1시간 이상 경과

-- 결과: 0
```

## 관련 수정 사항

이 수정은 다음과 함께 작동:
1. **PR #166**: `REQUIRES_NEW` 트랜잭션 전파 (이력 독립 트랜잭션)
2. **재시도 메커니즘**: 업데이트 실패 시 3회 재시도

## 기술적 세부사항

### CAST 사용 이유

```xml
SELECT CAST(SCOPE_IDENTITY() AS BIGINT)
```

- `SCOPE_IDENTITY()`는 `numeric(38,0)` 타입 반환
- MyBatis `resultType="long"`과 타입 불일치 방지
- `BIGINT`로 명시적 캐스팅하여 정확한 long 타입 매핑

### MyBatis selectKey 설정

```xml
<selectKey keyProperty="historyId" resultType="long" order="AFTER">
```

- `order="AFTER"`: INSERT 실행 후 ID 조회
- `keyProperty="historyId"`: 조회한 값을 history.historyId에 설정
- `resultType="long"`: Java Long 타입으로 반환

## 결론

✅ **수정 완료**: `IDENT_CURRENT` → `SCOPE_IDENTITY()` 변경
✅ **동시성 문제 해결**: 각 스케쥴러가 정확한 historyId 획득
✅ **안정성 향상**: 4개 스케쥴러 동시 실행 시에도 모두 정상 완료

이제 매일 아침 9시에 4개의 스케쥴러가 동시 실행되어도 모두 정상적으로 완료 이력이 기록됩니다.

---

**파일 수정:** `backend/src/main/resources/egovframework/mapper/let/scheduler/SchedulerHistoryMapper_SQL_mssql.xml`
**수정 라인:** 108번 줄
**관련 이슈:** 동시 실행 스케쥴러의 RUNNING 상태 멈춤 현상
