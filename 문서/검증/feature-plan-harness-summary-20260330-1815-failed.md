---
workflow_state: HARNESS_FAILED
execution_timestamp: '2026-03-30T18:15:28'
plan: 'D:\f1soft\dev\react\SHMT-MES\.github\prompts\feature-plan-sample-template.md'
report: 'D:\f1soft\dev\react\SHMT-MES\문서\검증\feature-plan-chain-20260330-1530-생산계획일-수정예외.md'
schema: 'D:\f1soft\dev\react\SHMT-MES\.github\skills\feature-plan-6step\state-schema.yaml'
---
# Feature Plan Harness FAILED Summary
## Summary
- result: FAILED
- branch: see STEP-A
- gate: see STEP-B
- state: see STEP-C
## STEP-A BRANCH DECIDE
- exitCode: 0
```text
Branch Decision Result
{
  "input": {
    "frontendImpact": "(있음/없음)",
    "apiChanged": "(있음/없음)",
    "securityImpact": "(인증/인가/입력검증/민감정보 영향 있음/없음)",
    "userChoice": "(기본 순차/STEP-3 스킵 후보/STEP-5 경량화 후보)"
  },
  "decisions": {
    "STEP_3_FRONTEND": {
      "mode": "execute",
      "reason": "frontend impact or api contract change exists"
    },
    "STEP_5_SECURITY": {
      "mode": "lighten-candidate",
      "reason": "security impact marked as none"
    }
  },
  "policy": {
    "defaultPath": "STEP-1 -> STEP-6",
    "branchMode": "conservative"
  }
}
```
## STEP-B GATE CHECK
- exitCode: 2
```text
Feature Plan Gate Check Summary
- total: 26
- passed: 15
- failed: 11

Failed checks:
- [FAIL] report:frontmatter :: report has frontmatter block
- [FAIL] meta:workflow_state :: frontmatter contains key: workflow_state
- [FAIL] meta:execution_timestamp :: frontmatter contains key: execution_timestamp
- [FAIL] meta:input_signature :: frontmatter contains key: input_signature
- [FAIL] meta:replay_mode :: frontmatter contains key: replay_mode
- [FAIL] meta:chain_state_version :: frontmatter contains key: chain_state_version
- [FAIL] meta:current_step :: frontmatter contains key: current_step
- [FAIL] meta:completed_steps :: frontmatter contains key: completed_steps
- [FAIL] meta:skip_decisions :: frontmatter contains key: skip_decisions
- [FAIL] meta:feedback_applied :: frontmatter contains key: feedback_applied
- [FAIL] body:next-step-input-count :: count of '## 다음 단계 입력' >= 5 (actual: 0)
```
## STEP-C STATE VALIDATE
- exitCode: 2
```text
State Schema Validation Summary
- total: 10
- passed: 0
- failed: 10

Failed checks:
- [FAIL] frontmatter:exists :: report has frontmatter block
- [FAIL] field:chain_state_version :: required field exists: chain_state_version
- [FAIL] field:workflow_state :: required field exists: workflow_state
- [FAIL] field:current_step :: required field exists: current_step
- [FAIL] field:completed_steps :: required field exists: completed_steps
- [FAIL] field:execution_timestamp :: required field exists: execution_timestamp
- [FAIL] field:input_signature :: required field exists: input_signature
- [FAIL] field:replay_mode :: required field exists: replay_mode
- [FAIL] field:feedback_applied :: required field exists: feedback_applied
- [FAIL] field:skip_decisions :: required field exists: skip_decisions
```