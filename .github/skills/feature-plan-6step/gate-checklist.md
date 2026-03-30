# Feature Plan Chain Gate Checklist

이 문서는 feature-plan 6단계 체인의 자동 검사 기준을 정의한다.
기본 원칙은 "기본 경로(1~6) 유지, 예외 분기는 근거가 있을 때만 허용"이다.

## Gate 0: Input Readiness

필수 조건

- 요구사항 본문 존재
- 대상 경로(프론트/백엔드/매퍼) 존재
- 제약사항 존재(없으면 `없음` 명시)

실패 처리

- 하나라도 누락 시 STEP-1 시작 금지

## Gate 1~5: Stage Transition

- Gate 1: STEP-1 결과 없으면 STEP-2 금지
- Gate 2: STEP-2 API 계약 없으면 STEP-3 금지
- Gate 3: STEP-3 결과 없으면 STEP-4 금지
- Gate 4: STEP-4 결과 없으면 STEP-5 금지
- Gate 5: STEP-5 결과 없으면 STEP-6 금지

공통 검사

- 직전 단계에 `## 다음 단계 입력` 존재
- 섹션 포맷(요약/변경범위/Critical-High/결정사항/다음 단계 입력) 유지

## Branch Gate A: Decision Evidence

분기(스킵/경량화) 전 필수

- `skip_decisions`에 근거 기록
- 분기 대상 단계 명시
- 분기 사유와 잔여 위험 명시

실패 처리

- 근거 누락 시 분기 금지, 기본 경로 강제

## Branch Gate B: Replacement Validation

분기 허용 전 필수

- 스킵 단계의 대체 검증 항목 존재
- 대체 검증 결과를 최종 문서에 기록

실패 처리

- 대체 검증 없으면 분기 금지

## Branch Gate C: User Approval

분기 허용 전 필수

- `STEP-3 스킵 승인`, `STEP-5 경량화 승인` 입력이 명시적으로 `승인`
- 승인 누락/거부/미지정 시 기본 경로(1~6) 유지

실패 처리

- 사용자 승인 없으면 분기 금지

## Feedback Gate: Loop Application

- 최근 실패 패턴이 있으면 `avoid_rule` 반영 여부 확인
- `feedback_applied` 값을 `applied` 또는 `not_applied`로 기록

실패 처리

- 피드백 결과 미기록 시 STEP-6 완료 금지

## Final Consistency Gate

최종 문서 필수 메타

- workflow_state
- execution_timestamp
- input_signature
- replay_mode
- chain_state_version
- current_step
- completed_steps
- skip_decisions
- feedback_applied

최종 문서 필수 본문

- 단계별 핵심 결과(1~6)
- 수정 파일 목록
- 잔여 위험 항목
- 저장 결과: 파일 생성 완료

실패 처리

- 누락 시 STEP-6 재실행

## Execution Command

통합 실행(권장)

```bash
node .github/skills/feature-plan-6step/tools/harness-runner.mjs --plan <plan-file.md> --report <report-file.md>
```

실패 시 자동 산출

- `문서/검증/feature-plan-harness-summary-YYYYMMDD-HHmm-failed.md`

성공/실패 공통 자동 산출

- `문서/검증/feature-plan-harness-summary-YYYYMMDD-HHmm-(passed|failed).md`
- `문서/검증/feature-plan-harness-onepage-YYYYMMDD-HHmm-(passed|failed).md`

개별 실행

```bash
node .github/skills/feature-plan-6step/tools/gate-checker.mjs --plan <plan-file.md> --report <report-file.md>
```

예시

```bash
node .github/skills/feature-plan-6step/tools/gate-checker.mjs --plan .github/prompts/feature-plan-sample-template.md --report 문서/검증/feature-plan-chain-20260330-1530-생산계획일-수정예외.md
```

npm 대안

```bash
npm run harness:gate-check --plan=.github/prompts/feature-plan-sample-template.md --report=문서/검증/feature-plan-chain-20260330-1530-생산계획일-수정예외.md
```
