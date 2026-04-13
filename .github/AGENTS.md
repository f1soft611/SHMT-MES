# SHMT-MES Copilot Agents

최소 운영용 인덱스입니다. 필요한 항목만 빠르게 찾기 위한 문서입니다.

## 공통 원칙

- 프로젝트 전역 규칙은 `.github/copilot-instructions.md`를 우선 적용합니다.
- 체인 실행 진입점은 `.github/prompts/feature-plan-chain.prompt.md`이며, 단계별 상세 계약은 `.github/skills/feature-plan-6step/SKILL.md`를 단일 기준으로 사용합니다.
- 읽기 전용 분석 에이전트: `프로젝트 리더`, `코드 품질 리뷰어`, `보안 점검자`
- 구현 에이전트: `백엔드 개발자`, `프론트 개발자`, `코드 및 보안점검 문서 생성자`

## Instructions

- `.github/instructions/style.instructions.md` : 공통 최소 원칙(기준점)
- `.github/instructions/frontend-style.instructions.md` : 프론트 소스 수정 규칙
- `.github/instructions/backend-style.instructions.md` : 백엔드/매퍼 수정 규칙

## Agents

- `.github/agents/project-leader.agent.md` : `프로젝트 리더` (1단계)
- `.github/agents/backend-developer.agent.md` : `백엔드 개발자` (2단계)
- `.github/agents/frontend-developer.agent.md` : `프론트 개발자` (3단계)
- `.github/agents/code-quality-reviewer.agent.md` : `코드 품질 리뷰어` (4단계)
- `.github/agents/security-auditor.agent.md` : `보안 점검자` (5단계)
- `.github/agents/report-writer.agent.md` : `코드 및 보안점검 문서 생성자` (6단계)

## Prompts

- `.github/prompts/feature-plan-chain.prompt.md` : 6단계 전체 체인 실행 엔트리 래퍼

## Skills

- `.github/skills/feature-plan-6step/SKILL.md` : 1~6단계 체인 실행/검증의 단일 표준 계약
- `.github/skills/pr-checklist/SKILL.md` : PR/머지 체크리스트 생성
- `.github/skills/multi-db-sql-review/SKILL.md` : MyBatis 멀티 DB SQL 점검

## 권장 순서

1. `feature-plan-chain.prompt` 실행
2. `feature-plan-6step` 계약 기준으로 기본 경로(1~6) 수행, 분기 조건 충족 시 예외 분기 적용
3. 문서(`문서/검증/`) 생성 확인
4. PR 직전 `pr-checklist` 확인
5. SQL 변경 시 `multi-db-sql-review` 수행

## 실행 메타 규약

- 최종 문서에는 `workflow_state`, `execution_timestamp`, `input_signature`, `replay_mode`를 포함합니다.
- 상태 메타(`chain_state_version`, `current_step`, `completed_steps`)를 포함합니다.
- 분기/피드백 메타(`skip_decisions`, `last_error_signature`, `feedback_applied`)를 포함합니다.
- 재실행 시 동일 입력 여부는 `input_signature` 기준으로 판단합니다.

## 운영 고도화 원칙

- 자동 피드백 루프: 실행 결과 평가 후 실패 패턴 회피 규칙을 다음 실행에 반영합니다.
- 상태 관리: 최종 문서 Frontmatter + 세션 메모리 기반으로 체인 상태를 유지합니다.
- 동적 체인(보수적): 기본은 1~6 순차이며, 명시 조건과 대체 검증이 있을 때만 단계 스킵/경량화를 허용합니다.
