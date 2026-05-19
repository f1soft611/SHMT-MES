# ERP IF 재전송 버튼 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 생산지시 화면의 검색 버튼 오른쪽에 "ERP IF" 버튼을 추가하여, 선택된 ORDERED 계획의 공정 데이터를 ERP IF 테이블에 재전송한다 (ERP에 없는 데이터만).

**Architecture:** 선택된 `ProdPlanRow[]`를 Zustand store에 올려 SearchFilter에서 접근 가능하게 하고, 버튼 클릭 시 `POST /api/production-orders/erp-if-resend`로 plan 키 목록을 전달한다. 백엔드는 각 plan의 기존 생산지시(`selectProdOrdersByPlanId`)를 조회하여 ERP에 없는 공정 row만 `sendProdOrderBatchToErp`로 삽입한다.

**Tech Stack:** Spring Boot (MyBatis), React + Zustand + MUI, TypeScript

---

## File Map

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `backend/.../EgovProductionOrderService.java` | `resendErpIf` 메서드 추가 |
| `backend/.../EgovProductionOrderServiceImpl.java` | `resendErpIf` 구현 + `convertRowToIfDto` 헬퍼 |
| `backend/.../EgovProductionOrderApiController.java` | `POST /erp-if-resend` 엔드포인트 추가 |
| `frontend/src/types/productionOrder.ts` | `ProdOrderSearchParam`에 `prodworkSeq` 추가, `ProdPlanKeyDto`에 `prodplanDetailId` 추가 |
| `frontend/src/services/productionOrderService.ts` | `resendErpIf` API 함수 추가 |
| `frontend/src/pages/ProdOrder/store/useProdOrderStore.ts` | `selectedRows`, `handleErpIfResend` 추가 |
| `frontend/src/pages/ProdOrder/hooks/useProductionOrder.ts` | `handleErpIfResend` 구현 및 노출 |
| `frontend/src/pages/ProdOrder/components/ProdPlanList.tsx` | `onSelectionChange` 시 store에 `selectedRows` sync |
| `frontend/src/pages/ProdOrder/components/ProdOrderSearchFilter.tsx` | ERP IF 버튼 추가 |

---

## Task 1: 백엔드 — 서비스 인터페이스에 `resendErpIf` 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/service/EgovProductionOrderService.java`

- [ ] **Step 1: `resendErpIf` 메서드 시그니처 추가**

`EgovProductionOrderService.java` 마지막 메서드 아래에 추가:

```java
/**
 * 선택한 생산계획의 공정 데이터를 ERP IF 테이블에 재전송
 * ERP에 이미 존재하는 mesIfKey는 건너뜀
 * @param plans 재전송 대상 생산계획 키 목록
 * @return ERP 전송 성공 여부 (실패 시 false)
 */
boolean resendErpIf(List<ProdPlanKeyDto> plans) throws Exception;
```

---

## Task 2: 백엔드 — 서비스 구현체에 `resendErpIf` 구현

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/service/impl/EgovProductionOrderServiceImpl.java`

- [ ] **Step 1: `convertRowToIfDto` private 헬퍼 추가**

`convertDeleteToIfDto` 메서드 아래에 추가:

```java
/**
 * 기존 생산지시(ProdOrderRow)를 ERP IF (A) 전송용 DTO로 변환한다.
 * resendErpIf 전용 — 이미 저장된 row를 재전송할 때 사용.
 */
private ErpIFProdOrderDto convertRowToIfDto(ProdOrderRow row) {
    ErpIFProdOrderDto dto = new ErpIFProdOrderDto();

    dto.setWorkingTag("A");
    dto.setRegEmpId("SYSTEM");

    dto.setMesIfKey(row.getProdorderId());

    dto.setWorkOrderSeq(0);
    dto.setWorkOrderSerl(0);

    dto.setFactUnit(1);
    dto.setWorkOrderNo(row.getLotNo());
    dto.setWorkOrderDate(row.getProdplanDate());

    dto.setProdPlanSeq(row.getProdplanSeq());
    dto.setWorkCenterSeq(1);
    dto.setGoodItemSeq(row.getItemCodeId());
    dto.setProcSeq(row.getWorkCodeId());
    dto.setProdUnitSeq(row.getItemUnitId());

    dto.setOrderQty(row.getOrderQty());

    dto.setDeptSeq(0);
    dto.setEmpSeq(0);
    dto.setProcRev("");
    dto.setRemark(row.getBigo());

    return dto;
}
```

- [ ] **Step 2: `resendErpIf` 구현 추가**

`bulkCancelProductionOrders` 메서드 아래에 추가:

```java
/**
 * 선택한 생산계획의 공정 데이터를 ERP IF 테이블에 재전송
 * - ORDERED 상태인 계획의 기존 생산지시 공정 row를 조회
 * - ERP에 없는 mesIfKey만 필터하여 배치 전송
 */
@Override
public boolean resendErpIf(List<ProdPlanKeyDto> plans) throws Exception {
    if (plans == null || plans.isEmpty()) return false;

    List<ErpIFProdOrderDto> candidates = new ArrayList<>();

    for (ProdPlanKeyDto plan : plans) {
        ProdOrderSearchParam param = new ProdOrderSearchParam();
        param.setProdplanDate(plan.getProdplanDate());
        param.setProdplanSeq(plan.getProdplanSeq());
        param.setProdworkSeq(plan.getProdworkSeq());

        List<ProdOrderRow> orders = productionOrderDAO.selectProdOrdersByPlanId(param);
        for (ProdOrderRow row : orders) {
            if (row.getProdorderId() != null && !row.getProdorderId().isEmpty()) {
                candidates.add(convertRowToIfDto(row));
            }
        }
    }

    if (candidates.isEmpty()) {
        log.info("[ERP IF][RESEND] 전송 대상 없음 (생산지시 미존재)");
        return false;
    }

    List<String> allKeys = candidates.stream()
            .map(ErpIFProdOrderDto::getMesIfKey)
            .collect(Collectors.toList());

    Set<String> existingKeys = erpIfService.selectExistingMesIfKeys(allKeys);

    List<ErpIFProdOrderDto> toSend = candidates.stream()
            .filter(dto -> !existingKeys.contains(dto.getMesIfKey()))
            .collect(Collectors.toList());

    if (toSend.isEmpty()) {
        log.info("[ERP IF][RESEND] 모두 이미 전송됨. cnt={}", candidates.size());
        return false;
    }

    log.info("[ERP IF][RESEND] 전송 시작. total={}, toSend={}", candidates.size(), toSend.size());
    boolean success = erpIfService.sendProdOrderBatchToErp(toSend);
    log.info("[ERP IF][RESEND] 전송 완료. success={}", success);
    return success;
}
```

---

## Task 3: 백엔드 — 컨트롤러에 엔드포인트 추가

**Files:**
- Modify: `backend/src/main/java/egovframework/let/production/order/controller/EgovProductionOrderApiController.java`

- [ ] **Step 1: `erp-if-resend` 엔드포인트 추가**

`bulkCancelProductionOrders` 메서드 아래에 추가:

```java
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "전송 완료"),
        @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
})
@PostMapping("/erp-if-resend")
public ResultVO resendErpIf(
        @RequestBody List<ProdPlanKeyDto> plans,
        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
) throws Exception {

    for (ProdPlanKeyDto dto : plans) {
        dto.setOpmanCode(user.getUniqId());
    }

    boolean sent = productionOrderService.resendErpIf(plans);

    Map<String, Object> resultMap = new HashMap<>();
    resultMap.put("user", user);
    resultMap.put("sent", sent);

    String message = sent
            ? "ERP IF 재전송이 완료되었습니다."
            : "전송할 데이터가 없습니다. (이미 전송됐거나 생산지시 미존재)";

    return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS, message);
}
```

---

## Task 4: 프론트엔드 — 타입 보정

**Files:**
- Modify: `frontend/src/types/productionOrder.ts`

- [ ] **Step 1: `ProdOrderSearchParam`에 `prodworkSeq` 추가**

```typescript
// 기존
export interface ProdOrderSearchParam {
    prodplanDate: string;   // yyyyMMdd
    prodplanSeq: number;
}

// 변경 후
export interface ProdOrderSearchParam {
    prodplanDate: string;   // yyyyMMdd
    prodplanSeq: number;
    prodworkSeq?: number;
}
```

- [ ] **Step 2: `ProdPlanKeyDto`에 `prodplanDetailId` 추가**

```typescript
// 기존 (prodplanDetailId 주석 처리됨)
export interface ProdPlanKeyDto {
    prodplanId: string;
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;
    // prodplanDetailId: string;
}

// 변경 후
export interface ProdPlanKeyDto {
    prodplanId: string;
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;
    prodplanDetailId?: string;
}
```

---

## Task 5: 프론트엔드 — API 서비스 함수 추가

**Files:**
- Modify: `frontend/src/services/productionOrderService.ts`

- [ ] **Step 1: `resendErpIf` 함수 추가**

`bulkCancelProductionOrders` 라인 아래에 추가:

```typescript
// ERP IF 재전송 (ERP에 없는 공정 데이터만)
resendErpIf: (data: ProdPlanKeyDto[]) =>
    apiClient.post('/api/production-orders/erp-if-resend', data),
```

---

## Task 6: 프론트엔드 — Store에 `selectedRows`, `handleErpIfResend` 추가

**Files:**
- Modify: `frontend/src/pages/ProdOrder/store/useProdOrderStore.ts`

- [ ] **Step 1: `ProdOrderStoreState` 인터페이스에 필드 추가**

```typescript
// 기존 인터페이스 내 deleteOrder 아래에 추가
selectedRows: ProdPlanRow[];
handleErpIfResend: () => void;
```

- [ ] **Step 2: 초기값 추가**

`create` 블록의 `deleteOrder: () => {}` 아래에 추가:

```typescript
selectedRows: [],
handleErpIfResend: () => {},
```

- [ ] **Step 3: `useProdOrderStoreInit`의 stableActionsRef에 추가**

```typescript
handleErpIfResend: () => hookRef.current.handleErpIfResend(),
```

- [ ] **Step 4: `useProdOrderStoreInit`의 두 번째 useEffect 의존성 배열 및 setState에 추가**

```typescript
// setState 블록에 추가
selectedRows: hook.selectedRows,

// 의존성 배열에 추가
hook.selectedRows,
```

---

## Task 7: 프론트엔드 — `useProductionOrder`에 `handleErpIfResend` 구현

**Files:**
- Modify: `frontend/src/pages/ProdOrder/hooks/useProductionOrder.ts`

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 추가:

```typescript
import { useState } from 'react';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { productionOrderService } from '../../../services/productionOrderService';
import { useProdOrderStore } from '../store/useProdOrderStore';
```

- [ ] **Step 2: `handleErpIfResend` 구현 추가**

`handlePlanSelect` 함수 아래에 추가:

```typescript
const { showToast } = useToast();
const [erpIfLoading, setErpIfLoading] = useState(false);

const handleErpIfResend = async () => {
    const selectedRows = useProdOrderStore.getState().selectedRows;

    const targets = selectedRows.filter(row => row.orderFlag === 'ORDERED');

    if (targets.length === 0) {
        showToast({ message: 'ORDERED 상태인 계획을 선택해주세요.', severity: 'warning' });
        return;
    }

    const payload = targets.map(row => ({
        prodplanId: row.prodplanId,
        prodplanDate: row.prodplanDate,
        prodplanSeq: row.prodplanSeq,
        prodworkSeq: row.prodworkSeq,
        prodplanDetailId: row.prodplanDetailId,
    }));

    try {
        setErpIfLoading(true);
        const response = await productionOrderService.resendErpIf(payload);
        if (response.data.resultCode !== 200) {
            showToast({ message: response.data.resultMessage ?? '전송 실패', severity: 'error' });
            return;
        }
        showToast({
            message: response.data.resultMessage ?? 'ERP IF 전송 완료',
            severity: 'success',
        });
        prodPlan.fetchProdPlan();
    } catch {
        showToast({ message: '서버 오류가 발생했습니다.', severity: 'error' });
    } finally {
        setErpIfLoading(false);
    }
};
```

- [ ] **Step 3: return 블록에 노출**

```typescript
// return 블록에 추가
selectedRows: useProdOrderStore.getState().selectedRows,
handleErpIfResend,
erpIfLoading,
```

> **주의:** `erpIfLoading`은 store를 통해 SearchFilter의 버튼 disabled 상태에 사용됨. Task 6 Step 3~4에서 동일하게 store에 추가 필요.

- [ ] **Step 4: store에 `erpIfLoading` 추가 (Task 6 보완)**

`useProdOrderStore.ts`에 `erpIfLoading: boolean` 초기값 `false`로 추가, `stableActionsRef`/`setState` 포함. (Task 6과 동일 패턴)

---

## Task 8: 프론트엔드 — `ProdPlanList`에서 selectedRows store sync

**Files:**
- Modify: `frontend/src/pages/ProdOrder/components/ProdPlanList.tsx`

- [ ] **Step 1: store에 selectedRows sync 추가**

`useSameFlagSelection` 아래, `useBulkProdOrder` 위에 추가:

```typescript
// selectedRows 변경 시 store에 sync
useEffect(() => {
    useProdOrderStore.setState({ selectedRows });
}, [selectedRows]);
```

- [ ] **Step 2: import 보완 확인**

파일 상단에 아래 import가 있어야 함 (없으면 추가):

```typescript
import { useEffect } from 'react';
```

---

## Task 9: 프론트엔드 — SearchFilter에 ERP IF 버튼 추가

**Files:**
- Modify: `frontend/src/pages/ProdOrder/components/ProdOrderSearchFilter.tsx`

- [ ] **Step 1: store에서 값 읽기**

컴포넌트 상단 store 구독 블록에 추가:

```typescript
const onErpIfResend = useProdOrderStore((s) => s.handleErpIfResend);
const erpIfLoading = useProdOrderStore((s) => s.erpIfLoading);
```

- [ ] **Step 2: ERP IF 버튼 추가**

검색 버튼(`<Button variant="contained" color="primary" ...>검색</Button>`) 바로 아래에 추가:

```tsx
<Button
    variant="outlined"
    color="warning"
    onClick={onErpIfResend}
    disabled={erpIfLoading || loading}
>
    ERP IF
</Button>
```

---

## Self-Review

### Spec coverage 체크

| 요구사항 | 대응 Task |
|---------|----------|
| 검색버튼 오른쪽에 ERP IF 버튼 | Task 9 |
| 선택된 행만 대상 | Task 7, 8 |
| ORDERED 상태만 전송 | Task 7 Step 2 |
| ERP에 없는 것만 재전송 | Task 2 Step 2 (`selectExistingMesIfKeys` 필터) |
| 공정(N개) 단위로 ERP insert | Task 2 (`selectProdOrdersByPlanId` → 공정 row마다 DTO) |
| 결과 toast 피드백 | Task 7 Step 2 |

### 타입 일관성

- `ProdPlanKeyDto.prodplanDetailId` → Task 4에서 추가, Task 7에서 사용. 일치함.
- `ProdOrderSearchParam.prodworkSeq` → Task 4에서 추가, Task 2에서 Java측 이미 존재. 일치함.
- `handleErpIfResend` → Task 6(store), Task 7(hook), Task 9(filter)에서 동일 이름. 일치함.
- `erpIfLoading` → Task 6(store), Task 7(hook), Task 9(filter)에서 동일 이름. 일치함.
- `selectedRows` → Task 6(store), Task 7(return), Task 8(sync)에서 동일 이름. 일치함.
