# Feature Plan Chain Branch Decision Matrix

기본 정책

- 기본 경로는 STEP-1 -> STEP-6 순차 수행
- 아래 조건을 모두 만족할 때만 예외 분기 허용

## STEP-3 (Frontend) Skip Candidate

필수 조건 (ALL)

- 프론트 영향 범위 = 없음
- API 계약 변경 = 없음
- UI/UX 변경 요청 = 없음
- 대체 검증 항목 존재(백엔드 응답 스키마 검증)

차단 조건 (ANY)

- 화면/컴포넌트/라우트 변경이 1건이라도 있음
- 사용자 입력 폼이나 클라이언트 검증 로직이 변경됨

결정 결과

- 조건 충족: STEP-3 skip 가능
- 조건 미충족: STEP-3 수행
- 사용자 승인 없음: STEP-3 수행

## STEP-5 (Security) Lighten or Skip Candidate

필수 조건 (ALL)

- 인증/인가 정책 변경 없음
- 입력검증 로직 변경 없음
- 민감정보 처리/로그 노출 변경 없음
- 대체 검증 항목 존재(체크리스트 기반 최소 보안 점검)

차단 조건 (ANY)

- `@PreAuthorize` 변경
- 신규 API 추가 또는 권한 경계 변경
- 외부 입력 파라미터 스키마 변경

결정 결과

- 조건 충족: STEP-5 lighten 또는 skip 가능
- 조건 미충족: STEP-5 수행
- 사용자 승인 없음: STEP-5 수행

## 승인 게이트

- 후보 판정 결과가 나오면 사용자 승인 여부를 확인한다.
- 승인 입력이 `승인`이 아니면 분기를 적용하지 않는다.
- 승인 입력이 비어 있거나 모호하면 `미지정`으로 간주하고 기본 순차 경로를 유지한다.

## 필수 기록 포맷

분기 시 `skip_decisions`에 아래를 남긴다.

- step: 분기 대상 단계
- mode: skip 또는 lighten
- reason: 분기 근거
- replacement_validation: 대체 검증 항목
- residual_risk: 잔여 위험

## 운영 권고

- 초기 2주간은 skip보다 lighten 우선
- 분기 비율이 50%를 넘으면 오탐 여부를 재평가
- 동일 실패가 반복되면 분기 기준을 보수적으로 재조정

## Execution Command

```bash
node .github/skills/feature-plan-6step/tools/branch-decider.mjs --input .github/prompts/feature-plan-sample-template.md
```
