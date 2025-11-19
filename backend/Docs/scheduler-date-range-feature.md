# 스케쥴러 날짜 범위 선택 기능

## 개요
스케쥴러 즉시 실행 시 날짜 범위(From ~ To)를 선택하여 특정 기간의 데이터만 인터페이스할 수 있는 기능입니다.

## 주요 기능

### 1. 수동 실행 (Manual Execution)
- 스케쥴러 즉시 실행 시 날짜 범위 선택 팝업 표시
- 사용자가 From(시작일) ~ To(종료일)를 선택하여 특정 기간의 데이터 처리
- 날짜를 지정하지 않으면 오늘 날짜로 자동 설정

### 2. 자동 실행 (Automatic Execution)
- CRON 표현식에 따라 자동 실행되는 경우 오늘 날짜로 자동 설정
- 사용자 개입 없이 당일 데이터만 자동으로 연동

## 적용 스케쥴러

다음 스케쥴러들에 날짜 범위 기능이 적용되었습니다:

### 1. 사원정보 연동 (User Interface)
- **필터 기준**: `LastDateTime` (최종 수정일시)
- **SQL 조건**: `CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ?`
- **서비스 메서드**: `executeUserInterface(fromDate, toDate)`

### 2. 거래처정보 연동 (Customer Interface)
- **필터 기준**: `LastDateTime` (최종 수정일시)
- **SQL 조건**: `CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ?`
- **서비스 메서드**: `executeCustInterface(fromDate, toDate)`

### 3. 생산의뢰 연동 (Production Request Interface)
- **필터 기준**: `ReqDate` (의뢰일자)
- **SQL 조건**: `ReqDate BETWEEN ? AND ?`
- **서비스 메서드**: `executeProdReqInterface(fromDate, toDate)`

## API 변경사항

### 스케쥴러 즉시 실행 API

**Endpoint**: `POST /api/schedulers/{schedulerId}/execute`

**Request Parameters**:
- `fromDate` (optional, String): 조회 시작 날짜 (yyyy-MM-dd)
- `toDate` (optional, String): 조회 종료 날짜 (yyyy-MM-dd)

**예제**:
```http
POST /api/schedulers/1/execute?fromDate=2025-01-01&toDate=2025-01-31
```

**기본 동작** (날짜 미지정 시):
```http
POST /api/schedulers/1/execute
```
→ 오늘 날짜가 자동으로 사용됨

## 사용 방법

### Frontend (웹 UI)

1. 스케쥴러 목록에서 실행할 스케쥴러의 "즉시 실행" 버튼 클릭
2. 날짜 범위 선택 팝업이 표시됨:
   - **스케쥴러명**: 실행할 스케쥴러 이름 표시
   - **시작 날짜**: From 날짜 선택
   - **종료 날짜**: To 날짜 선택
3. "실행" 버튼 클릭하여 스케쥴러 실행
4. 팝업 기본값은 오늘 날짜로 설정됨

### Backend (프로그래밍)

```java
// 날짜 범위 지정하여 실행
schedulerConfigService.executeSchedulerManually(schedulerId, "2025-01-01", "2025-01-31");

// 오늘 날짜로 실행 (날짜 null 전달)
schedulerConfigService.executeSchedulerManually(schedulerId, null, null);
```

## 기술 구현 세부사항

### Backend

#### 1. Service Layer
- `ErpToMesInterfaceService`: 인터페이스에 날짜 파라미터 추가
- `ErpToMesInterfaceServiceImpl`: SQL 쿼리에 날짜 필터 적용
- `DynamicSchedulerService`: 날짜 파라미터 전달 지원
- `DynamicSchedulerServiceImpl`: 
  - 자동 실행 시 오늘 날짜 자동 설정
  - 수동 실행 시 사용자 지정 날짜 사용
  - Reflection을 사용한 동적 메서드 호출

#### 2. SQL 쿼리 수정
```sql
-- 사원정보 쿼리 예시 (MSSQL)
SELECT CompanySeq, EmpSeq, EmpId, EmpName, ...
FROM SHM_IF_VIEW_TDAEmp
WHERE TypeSeq = 3031001 
  AND CONVERT(VARCHAR(10), LastDateTime, 120) BETWEEN ? AND ?
ORDER BY EmpSeq
```

#### 3. 메서드 시그니처
```java
// 기존
void syncUsers() throws Exception;

// 변경 후
void syncUsers(String fromDate, String toDate) throws Exception;
```

### Frontend

#### 1. DateRangeDialog 컴포넌트
- Material-UI Dialog 사용
- Date type의 TextField로 날짜 선택
- 기본값은 오늘 날짜
- 취소 시 날짜 초기화

#### 2. SchedulerList 컴포넌트
- 즉시 실행 버튼 클릭 시 DateRangeDialog 표시
- 선택된 날짜로 API 호출
- React Query mutation 사용

#### 3. API Service
```typescript
// schedulerService.ts
async executeScheduler(
  schedulerId: number,
  fromDate?: string,
  toDate?: string
): Promise<any> {
  const params: any = {};
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  
  const response = await api.post(
    `/api/schedulers/${schedulerId}/execute`,
    null,
    { params }
  );
  return response.data;
}
```

## 날짜 형식

**형식**: `yyyy-MM-dd`

**예시**:
- 2025-01-01
- 2025-11-19
- 2024-12-31

## 주의사항

1. **날짜 범위 검증**: 
   - FromDate가 ToDate보다 나중이어도 쿼리는 실행됨 (결과 없음)
   - 프론트엔드에서 검증 로직 추가 가능

2. **데이터베이스별 날짜 함수**:
   - 현재 구현은 MSSQL 기준 (`CONVERT(VARCHAR(10), LastDateTime, 120)`)
   - MySQL 사용 시 `DATE_FORMAT(LastDateTime, '%Y-%m-%d')` 사용 필요

3. **대용량 데이터**:
   - 긴 날짜 범위 선택 시 대량의 데이터 처리로 성능 저하 가능
   - 적절한 범위 선택 권장 (예: 최대 1개월)

4. **타임존**:
   - 날짜는 서버의 타임존 기준으로 처리됨
   - 필요시 클라이언트 타임존 고려 필요

## 테스트 방법

### 1. 수동 실행 테스트
1. 웹 UI 접속 → 스케쥴러 관리 메뉴
2. 특정 스케쥴러의 "즉시 실행" 버튼 클릭
3. 날짜 범위 선택 (예: 오늘부터 1주일 전)
4. "실행" 버튼 클릭
5. 스케쥴러 실행 이력에서 결과 확인

### 2. 자동 실행 테스트
1. 스케쥴러를 활성화 상태로 설정
2. CRON 표현식을 가까운 시간으로 설정 (예: 1분 후)
3. 자동 실행 대기
4. 실행 이력에서 오늘 날짜로 실행되었는지 확인

### 3. API 테스트
```bash
# 날짜 범위 지정
curl -X POST "http://localhost:8080/api/schedulers/1/execute?fromDate=2025-01-01&toDate=2025-01-31" \
  -H "Authorization: Bearer {token}"

# 날짜 미지정 (오늘 날짜 사용)
curl -X POST "http://localhost:8080/api/schedulers/1/execute" \
  -H "Authorization: Bearer {token}"
```

## 트러블슈팅

### 문제: 날짜 범위를 지정했는데 데이터가 조회되지 않음

**원인**: 
- 지정한 날짜 범위에 데이터가 없음
- 날짜 컬럼과 필터 조건 불일치

**해결**:
1. ERP 시스템의 해당 날짜 데이터 존재 여부 확인
2. SQL 로그를 통해 실제 쿼리 확인
3. 날짜 형식이 올바른지 확인 (yyyy-MM-dd)

### 문제: 자동 실행 시 오늘이 아닌 다른 날짜 데이터가 조회됨

**원인**:
- 서버의 시스템 날짜가 잘못 설정됨
- 타임존 설정 문제

**해결**:
1. 서버의 시스템 날짜 확인: `date`
2. Java 타임존 확인: `TimeZone.getDefault()`
3. application.properties에서 타임존 설정

## 향후 개선 사항

1. **날짜 검증 강화**: FromDate > ToDate 체크
2. **최대 범위 제한**: 성능을 위한 최대 날짜 범위 제한 (예: 3개월)
3. **프리셋 제공**: "오늘", "어제", "최근 1주일" 등 빠른 선택 버튼
4. **배치 실행**: 여러 스케쥴러를 한 번에 같은 날짜 범위로 실행
5. **이력 조회 개선**: 날짜 범위별 실행 이력 조회 및 통계
