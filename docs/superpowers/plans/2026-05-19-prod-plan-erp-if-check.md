# ProdPlan ERP IF 전송 여부 조회 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `getProdPlans` API 응답의 각 `ProdPlanRow`에 ERP DB(`SHM_IF_TPDSFCWorkOrder`)에 전송되었는지 여부(`erpIfInserted`)를 함께 반환한다.

**Architecture:** `selectProdPlan` SQL에 STRING_AGG 서브쿼리를 추가해 TPR504의 PRODORDER_ID들을 함께 조회하고(MES 쿼리 1회), 조회된 ID들을 ERP DB에서 DISTINCT MESIFKey IN으로 일괄 확인(ERP 쿼리 1회)한 뒤 Java에서 병합한다. 두 DB가 별도 DataSource이므로 SQL JOIN 없이 애플리케이션 레이어에서 처리한다.

**Tech Stack:** Spring Boot, MyBatis, MSSQL (MES DB + ERP DB 별도 DataSource)

---

## 파일 변경 맵

| 파일 | 유형 | 역할 |
|------|------|------|
| `backend/src/main/java/egovframework/let/production/order/domain/model/ProdPlanRow.java` | 수정 | `erpIfInserted`, `prodorderIds` 필드 추가 |
| `backend/src/main/resources/egovframework/mapper/let/production/order/ProductionOrder_SQL_mssql.xml` | 수정 | `selectProdPlan`에 STRING_AGG 서브쿼리 추가 |
| `backend/src/main/java/egovframework/let/erpIf/domain/repository/ErpIFProdOrderDAO.java` | 수정 | `selectExistingMesIfKeys` 메서드 추가 |
| `backend/src/main/resources/egovframework/mapper/let/erpIf/ErpIFProdOrder_SQL_mssql.xml` | 수정 | DISTINCT MESIFKey IN 쿼리 추가 |
| `backend/src/main/java/egovframework/let/production/order/service/ErpIFProdOrderService.java` | 수정 | `selectExistingMesIfKeys` 인터페이스 메서드 추가 |
| `backend/src/main/java/egovframework/let/production/order/service/impl/ErpIFProdOrderServiceImpl.java` | 수정 | `selectExistingMesIfKeys` 구현 추가 |
| `backend/src/main/java/egovframework/let/production/order/service/impl/EgovProductionOrderServiceImpl.java` | 수정 | `selectProdPlans()`에 ERP 체크 + 병합 로직 추가 |

---

### Task 1: ProdPlanRow에 필드 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/domain/model/ProdPlanRow.java`

- [ ] **Step 1: `erpIfInserted`와 `prodorderIds` 필드 추가**

`ProdPlanRow.java` 맨 끝 필드 목록에 추가:

```java
/** ERP IF 전송 여부 */
private boolean erpIfInserted;

/** MES 생산지시 ID 목록 (서비스 내부 처리용, comma-separated) */
private String prodorderIds;
```

`prodorderIds`는 서비스 레이어에서 ERP 조회용으로만 사용되고 프론트에 노출되는 값이 아니다. `erpIfInserted`만 API 응답에 포함된다.

---

### Task 2: selectProdPlan SQL에 STRING_AGG 서브쿼리 추가

**Files:**
- Modify: `backend/src/main/resources/egovframework/mapper/let/production/order/ProductionOrder_SQL_mssql.xml`

- [ ] **Step 1: `selectProdPlan` SELECT 절 마지막에 서브쿼리 컬럼 추가**

현재 SELECT 절의 마지막 컬럼(`A.OPTIME2`) 바로 뒤에 추가:

```xml
SELECT ISNULL(A.ORDER_FLAG, 'PLANNED') AS ORDER_FLAG,
       ...
       A.OPMAN_CODE,
       A.OPTIME,
       A.OPMAN_CODE2,
       A.OPTIME2,
       (
           SELECT STRING_AGG(TPR504ID, ',')
           FROM TPR504
           WHERE FACTORY_CODE = '000001'
             AND PRODPLAN_DATE = A.PRODPLAN_DATE
             AND PRODPLAN_SEQ = A.PRODPLAN_SEQ
             AND PRODWORK_SEQ = A.PRODWORK_SEQ
             AND ISNULL(DELETE_FLAG, 0) != 1
       ) AS PRODORDER_IDS
FROM TPR301 A
...
```

`STRING_AGG`는 MSSQL 2017+에서 지원한다. 생산지시가 없는 plan은 `NULL`이 반환되어 `prodorderIds` 필드가 `null`이 된다.

---

### Task 3: ERP DAO에 MESIFKey 조회 메서드 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/erpIf/domain/repository/ErpIFProdOrderDAO.java`
- Modify: `backend/src/main/resources/egovframework/mapper/let/erpIf/ErpIFProdOrder_SQL_mssql.xml`

- [ ] **Step 1: DAO 메서드 추가**

`ErpIFProdOrderDAO.java`에 추가:

```java
// 주어진 MESIFKey 목록 중 ERP IF 테이블에 존재하는 key 반환
public List<String> selectExistingMesIfKeys(List<String> mesIfKeys) {
    return selectList("ErpIFProdOrderDAO.selectExistingMesIfKeys", mesIfKeys);
}
```

- [ ] **Step 2: SQL 매퍼에 쿼리 추가**

`ErpIFProdOrder_SQL_mssql.xml`에 추가 (기존 `</mapper>` 태그 바로 앞):

```xml
<select id="selectExistingMesIfKeys"
        parameterType="java.util.List"
        resultType="string">
    SELECT DISTINCT MESIFKey
    FROM SHM_IF_TPDSFCWorkOrder
    WHERE MESIFKey IN
    <foreach collection="list" item="key" open="(" separator="," close=")">
        #{key}
    </foreach>
</select>
```

`DISTINCT`를 사용해 동일 MESIFKey가 여러 행 있어도 중복 없이 반환한다.

---

### Task 4: ErpIFProdOrderService 인터페이스 + 구현체에 메서드 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/service/ErpIFProdOrderService.java`
- Modify: `backend/src/main/java/egovframework/let/production/order/service/impl/ErpIFProdOrderServiceImpl.java`

- [ ] **Step 1: 인터페이스에 메서드 선언 추가**

`ErpIFProdOrderService.java`에 추가:

```java
import java.util.Set;

// ERP IF 테이블에서 존재하는 MESIFKey를 Set으로 반환
Set<String> selectExistingMesIfKeys(List<String> mesIfKeys);
```

- [ ] **Step 2: 구현체에 구현 추가**

`ErpIFProdOrderServiceImpl.java`에 추가:

```java
import java.util.HashSet;
import java.util.Set;

@Override
public Set<String> selectExistingMesIfKeys(List<String> mesIfKeys) {
    if (mesIfKeys == null || mesIfKeys.isEmpty()) return new HashSet<>();
    try {
        return new HashSet<>(erpIfDao.selectExistingMesIfKeys(mesIfKeys));
    } catch (Exception e) {
        log.warn("[ERP IF][MESIFKEY CHECK] ERP DB 조회 실패, erpIfInserted 전부 false 처리", e);
        return new HashSet<>();
    }
}
```

ERP DB 조회 실패 시 빈 Set을 반환해 MES 트랜잭션에 영향을 주지 않는다.

---

### Task 5: selectProdPlans 서비스에 ERP 체크 + 병합 로직 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/service/impl/EgovProductionOrderServiceImpl.java`

- [ ] **Step 1: `selectProdPlans()` 메서드 수정**

기존 코드:

```java
@Override
public ListResult<ProdPlanRow> selectProdPlans(ProdPlanSearchParam param) throws Exception {
    List<ProdPlanRow> list = productionOrderDAO.selectProdPlans(param);
    int resultCnt = productionOrderDAO.selectProdPlanCount(param);
    return new ListResult<>(list, resultCnt);
}
```

변경 후:

```java
@Override
public ListResult<ProdPlanRow> selectProdPlans(ProdPlanSearchParam param) throws Exception {
    List<ProdPlanRow> list = productionOrderDAO.selectProdPlans(param);
    int resultCnt = productionOrderDAO.selectProdPlanCount(param);

    List<String> allProdorderIds = list.stream()
            .map(ProdPlanRow::getProdorderIds)
            .filter(ids -> ids != null && !ids.isEmpty())
            .flatMap(ids -> Arrays.stream(ids.split(",")))
            .distinct()
            .collect(Collectors.toList());

    if (!allProdorderIds.isEmpty()) {
        Set<String> erpInsertedKeys = erpIfService.selectExistingMesIfKeys(allProdorderIds);
        for (ProdPlanRow row : list) {
            String ids = row.getProdorderIds();
            if (ids != null && !ids.isEmpty()) {
                boolean inserted = Arrays.stream(ids.split(","))
                        .anyMatch(erpInsertedKeys::contains);
                row.setErpIfInserted(inserted);
            }
        }
    }

    return new ListResult<>(list, resultCnt);
}
```

필요한 import:

```java
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
```

`prodorderIds`가 null이거나 ERP 목록에 없는 plan은 `erpIfInserted`가 기본값 `false`로 유지된다.
