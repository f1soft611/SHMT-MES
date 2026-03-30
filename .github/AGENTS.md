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
2. `feature-plan-6step` 계약 기준으로 1~6단계 순차 수행 결과 확인
3. 문서(`문서/검증/`) 생성 확인
4. PR 직전 `pr-checklist` 확인
5. SQL 변경 시 `multi-db-sql-review` 수행

## 실행 메타 규약

- 최종 문서에는 `workflow_state`, `execution_timestamp`, `input_signature`, `replay_mode`를 포함합니다.
- 재실행 시 동일 입력 여부는 `input_signature` 기준으로 판단합니다.
