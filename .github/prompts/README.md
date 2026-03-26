# SHMT-MES Prompts Index

## 목록

### Feature Plan Chain

- 파일: `feature-plan-chain.prompt.md`
- 목적: 6개 에이전트 순차 실행(프로젝트 리더 → 백엔드 개발자 → 프론트 개발자 → 코드 품질 리뷰어 → 보안 점검자 → 코드 및 보안점검 문서 생성자)
- 사용 예시:
  - `생산계획 신규 화면 구현, 프론트: frontend/src/pages/production-plan/, 백엔드: backend/src/main/java/egovframework/let/production/`
  - `기존 설비관리 화면 수정, 권한 검증 강화, 대상 API와 UI 동시 변경`

## 운영 규칙

- 프롬프트는 반복되는 업무(리뷰/점검/문서화)를 표준화할 때 사용합니다.
- 체인 실행 시 각 단계 출력의 `## 다음 단계 입력` 존재 여부를 확인한 뒤 다음 단계로 진행합니다.
- 모든 단계는 `요약 → 변경/점검 범위 → Critical/High 이슈 → 결정 사항 → 다음 단계 입력` 순서를 유지합니다.
- 신규 화면/기능으로 대상 파일이 없으면 `백엔드 개발자`, `프론트 개발자` 단계에서 필요한 파일 생성 후 구현합니다.
- 프롬프트 실행 결과는 반드시 Markdown 문서 파일로 저장합니다. (기본 경로: `문서/검증/`)
- 프로젝트 규칙은 항상 `.github/copilot-instructions.md`를 따릅니다.
- 보안만 집중 점검이 필요하면 프롬프트 대신 `보안 점검자` 에이전트를 사용합니다.
