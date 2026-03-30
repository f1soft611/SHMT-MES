---
workflow_state: REPORT_DONE
execution_timestamp: '2026-03-30T15:30:00+09:00'
input_signature: 'a7f3c82e1d9b4056a3e2f8c1d7b09f5e4a2c6d1e8f3b7a4c0e9d2b5f8a1c3'
replay_mode: regenerate
---

# Feature Plan Chain 검증 보고서

**대상**: 생산계획 관리 — 지시 완료 후 생산계획일 수정 허용  
**날짜**: 2026-03-30  
**단계 식별자**: STEP-6-REPORT

---

## 요약

생산지시(ORDERED) 완료 상태의 생산계획에서 **생산계획일(PROD_DATE)만 수정 가능**하도록  
프론트엔드 UI 제어와 백엔드 서버 방어를 함께 구현했다.

- 프론트: ORDERED 상태에서 날짜 필드만 활성화, 저장 버튼 허용, 경고 메시지 문구 수정
- 백엔드: 서버가 DB의 ORDER_FLAG를 직접 확인 후 날짜 전용 SQL 호출 (우회 차단)
- TPR301R 참조 동기화는 PROD_DATE 변경과 무관하여 생략 처리

---

## 변경/점검 범위

### 포함 범위

- ORDERED 상태에서 생산계획일(`PROD_DATE`) 변경 허용
- 다른 필드(품목, 수량, 설비, 작업자, 공정, 근무구분, 비고)는 변경 불가 유지
- 기존 주간 이동 후처리(사전계획일 주 이동) 유지
- Backend: DB ORDER_FLAG 기반 방어 심화

### 제외 범위

- 신규 화면 추가 없음
- 권한 체계(@PreAuthorize) 변경 없음
- TPR301R references 동기화 로직 변경 없음
- 생산지시 생성/취소 플로우 변경 없음

---

## 수정 파일 목록

| #   | 파일 경로                                                                                                 | 변경 내용                                                                               |
| --- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `backend/src/main/resources/egovframework/mapper/let/production/plan/ProductionPlan_SQL_mssql.xml`        | `selectProductionPlanOrderFlag` SELECT 추가, `updateProductionPlanDateOnly` UPDATE 추가 |
| 2   | `backend/src/main/java/egovframework/let/production/plan/domain/repository/ProductionPlanDAO.java`        | `selectProductionPlanOrderFlag()`, `updateProductionPlanDateOnly()` 메서드 추가         |
| 3   | `backend/src/main/java/egovframework/let/production/plan/service/impl/EgovProductionPlanServiceImpl.java` | `updateProductionPlan()` 내 ORDERED 분기 추가 (날짜 전용 업데이트 후 early return)      |
| 4   | `frontend/src/pages/ProductionPlan/components/PlanDialog.tsx`                                             | `canEditPlanDate` 조건 완화, 경고 메시지 문구 수정, 저장 버튼 활성화 조건 수정          |
| 5   | `frontend/src/pages/ProductionPlan/index.tsx`                                                             | ORDERED 상태 조기 종료(토스트+return) 블록 제거                                         |

---

## 단계별 핵심 결과

### STEP-1-LEADER

- 기존 기능 수정으로 판단 (신규 화면 없음)
- 포함: 날짜 필드 수정 허용, 서버 방어
- 제외: 권한/신규 화면/참조 동기화 변경 없음

### STEP-2-BACKEND

- Controller → Service → DAO → MyBatis XML 흐름 유지 ✅
- DB에서 직접 ORDER_FLAG 조회 → "ORDERED"이면 `updateProductionPlanDateOnly` 호출 후 return
- 단일 mssql XML에만 추가 (멀티DB XML 없음)
- references(TPR301R) 동기화: ORDERED 분기에서 skip, PROD_DATE 변경과 PRODPLAN_DATE/SEQ 무관

### STEP-3-FRONTEND

- `canEditPlanDate = dialogMode === 'edit' && !isGroupedPlan` (ORDERED 예외 허용)
- 저장 버튼: `disabled={!canEditPlan && !isOrderedPlan && dialogMode === 'edit'}`
- 경고 메시지: "변경할 수 없습니다" → "계획일만 변경 가능합니다"
- ORDERED 조기 종료 제거 → react-hook-form이 원본 formData 값 유지하므로 날짜만 실제 변경
- apiClient 경유 ✅, TypeScript any 추가 없음 ✅

### STEP-4-QUALITY

- Architecture: Controller → Service → DAO → MyBatis 흐름 유지 ✅
- 회귀: isGroupedPlan 결합 케이스 안전, equipmentId 누락 없음, WORK_CODE+EQUIP_SYS_CD 불변
- TPR301R 동기화: ORDERED 분기 early return으로 보호 ✅
- 저장 버튼 로직 3개 케이스 모두 정상 ✅

### STEP-5-SECURITY

- A01 인증/인가: @PreAuthorize 미변경 ✅
- A03 SQL인젝션: 파라미터 바인딩만 사용 ✅
- A01 인가우회: ORDER_FLAG DB 직접 조회로 프론트 조작 무효화 ✅
- A04 안전하지 않은 설계: 날짜 전용 SQL → 다른 컬럼 물리적 불변 ✅
- 민감정보 노출: 없음 ✅

---

## Critical/High 이슈

없음.

---

## 잔여 위험 항목

| #   | 항목                                                           | 위험도 | 비고                                                                   |
| --- | -------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| 1   | ORDERED + isGroupedPlan 복합 케이스 통합 테스트                | Low    | 단위 로직상 안전하나 실 데이터로 확인 권장                             |
| 2   | `selectProductionPlanByPlanNo` XML 쿼리 레거시 컬럼 사용       | Low    | 본 변경과 무관, 기존 이슈 별도 추적 필요                               |
| 3   | `totalQty` 재계산 시 ORDERED 상태에서 plannedQty=0 들어올 경우 | Info   | 프론트에서 disabled 처리되어 formData 기본값 전달되므로 실질 위험 낮음 |

---

## 결정 사항

1. 서버 방어 방식: `planList.get(0)` 기준으로 DB ORDER_FLAG 조회 (요청값 신뢰 불가)
2. 멀티 DB XML: 운영 XML이 `mssql` 단일 파일로 추가 XML 변경 불필요
3. references 처리: ORDERED 분기에서 완전 skip (PROD_DATE ≠ TPR301R 키)
4. 경고 메시지: "변경 불가" → "계획일만 변경 가능" 으로 사용자 안내 개선

---

## artifacts

```json
{
  "step1": "기존 기능 수정 범위 확정, 날짜 예외 허용 + 서버 방어 병행 결정",
  "step2": "XML 2 SQL 추가, DAO 2 메서드 추가, Service ORDERED 분기",
  "step3": "canEditPlanDate 완화, 저장 버튼 조건 수정, 조기 종료 제거",
  "step4": "Critical 없음, 회귀 위험 모두 해소 확인",
  "step5": "OWASP 5개 항목 이상 없음",
  "step6": "문서 저장 완료"
}
```

---

저장 결과: 파일 생성 완료  
저장 경로: `문서/검증/feature-plan-chain-20260330-1530-생산계획일-수정예외.md`
