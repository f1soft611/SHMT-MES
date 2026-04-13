# Feature Plan Chain 드라이런 점검표

작성일: 2026-03-30
목적: 하네스 엔지니어링 기준으로 6단계 체인의 실행 신뢰성(입력 계약, 오라클, 격리, 관측성, 재현성)을 실제 요청 1건으로 검증한다.

## 1. 드라이런 입력 시나리오

요구사항:

- 생산계획 실적 화면에서 조회 조건에 공장 필터를 추가한다.
- 백엔드 API는 공장코드를 optional 파라미터로 받아 필터링한다.
- 기존 화면 동작을 깨지 않도록 회귀 위험을 최소화한다.

대상 경로:

- frontend/src/pages/ProdPlanResult/index.tsx
- backend/src/main/java (관련 Controller/Service/DAO)
- backend/src/main/resources/egovframework/mapper (관련 MyBatis XML)

제약사항:

- API 권한 검증(@PreAuthorize) 누락 금지
- 운영 SQL은 MyBatis XML 기준
- 프론트는 apiClient 사용, any 금지

## 2. 실행 절차

1. feature-plan-chain.prompt로 체인 시작
2. feature-plan-6step 계약 기준으로 1단계부터 6단계까지 순차 실행
3. 단계 전이 게이트 위반 여부 점검
4. 6단계 결과 문서 저장 및 파일 존재 확인

## 3. 단계별 통과 기준

### STEP-1-LEADER

- 포함 범위/제외 범위 분리
- 신규/기존 기능 판단 명시
- 다음 단계 입력(백엔드 개발자용) 존재

### STEP-2-BACKEND

- Controller -> Service -> DAO -> MyBatis XML 흐름 유지
- @PreAuthorize, 트랜잭션, SQL 점검 근거 포함
- SQL 변경 시 멀티 DB 점검 포인트 포함
- 다음 단계 입력(프론트 개발자용 API 계약) 존재

### STEP-3-FRONTEND

- apiClient 사용 근거 포함
- any 미사용 확인
- 다음 단계 입력(코드 품질 리뷰어용) 존재

### STEP-4-QUALITY

- 기존 화면 참조 근거와 신규 대상 검토 결과 분리
- Critical/High 이슈에 파일 근거 포함
- 다음 단계 입력(보안 점검자용) 존재

### STEP-5-SECURITY

- 인증/인가/입력검증/민감정보/로그 전부 점검
- 재현 또는 확인 근거 포함
- 이슈 상태를 신규 대상 확정/기존 화면 참조/추가 확인 필요로 구분
- 다음 단계 입력(문서 생성자용) 존재

### STEP-6-REPORT

- 문서 실제 저장 수행
- 저장 결과와 파일 존재 확인 포함
- 수정 파일 목록 + 잔여 위험 항목 포함
- workflow_state, execution_timestamp, input_signature, replay_mode 포함

## 4. 전역 실패 조건

- 필수 입력 누락 상태에서 단계 완료 처리
- 다음 단계 입력 누락 상태에서 단계 전이
- 실행 모드가 실행인데 문서 파일 미생성
- 최종 문서 메타(workflow_state/execution_timestamp/input_signature/replay_mode) 누락

## 5. 점검 체크리스트

- [ ] 입력 계약 3요소(요구사항/대상 경로/제약사항) 모두 존재
- [ ] 1~6단계 모두 STEP 식별자 표기
- [ ] 단계 전이 게이트 위반 없음
- [ ] read-only 단계(1,4,5)에서 코드 수정 시도 없음
- [ ] write 단계(2,3,6)에서 요청 범위 외 수정 없음
- [ ] 최종 문서 파일 실제 존재
- [ ] 파일명 규칙(feature-plan-chain-YYYYMMDD-HHmm-대상요약) 충족
- [ ] replay_mode가 reuse 또는 regenerate로 명시

## 6. 결과 기록 템플릿

실행 결과:

- Pass/Fail:
- 실패 단계:
- 원인 요약:

조치 항목:

1.
2.
3.

재실행 판단:

- input_signature 동일 여부:
- replay_mode: reuse / regenerate

## 7. 기대 산출물

- 최종 보고서 1건 (문서/검증 경로)
- 단계별 핵심 결과 요약
- 수정 파일 목록
- 잔여 위험 항목
- 재현성 메타 4종(workflow_state, execution_timestamp, input_signature, replay_mode)
