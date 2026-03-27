---
name: pr-checklist
description: 'Use when: generating PR checklist, merge checklist, release checklist, regression checklist, or verifying done criteria before pull request merge. Triggers on: pr checklist, 머지 체크리스트, 검증 항목, done criteria'
---

# PR Checklist Generator

SHMT-MES 변경사항을 입력받아 PR 본문에 바로 붙일 수 있는 체크리스트를 생성합니다.

## 입력

- 변경 경로(예: `frontend/src/pages/ProductionPlan/`)
- 변경 유형(버그/기능/리팩토링/문서)
- 영향 범위(UI/API/DB/권한/스케줄러)

## 생성 규칙

1. 공통 체크리스트를 먼저 생성
2. 변경 유형별 체크 항목 추가
3. SHMT-MES 고유 점검 항목을 추가
4. 실행 가능한 명령어를 함께 제시

## 공통 체크리스트 템플릿

- [ ] 변경 목적/범위를 PR 설명에 명시
- [ ] 관련 이슈/요구사항 링크 연결
- [ ] 영향 범위(UI/API/DB) 명시
- [ ] 테스트 결과 첨부(성공/실패 케이스)
- [ ] 롤백 방법 또는 위험요소 기재

## SHMT-MES 추가 체크

- [ ] 백엔드 변경 시 `ResultVO` 응답 규격 준수 확인
- [ ] 권한 관련 변경 시 `@PreAuthorize` 적용 확인
- [ ] 프론트 API 호출은 `src/util/axios.ts`의 `apiClient` 사용 확인
- [ ] MyBatis 변경 시 대상 DB 매퍼(mysql/mssql/oracle 등) 동시 반영 확인
- [ ] 생산계획/실적 집계 시 `PROD_DATE` 기준 사용 여부 확인

## 출력 형식

아래 형식으로 출력합니다.

```markdown
## PR 체크리스트

### 공통

- [ ] ...

### 기능 영향

- [ ] ...

### SHMT-MES 규칙

- [ ] ...

### 실행한 검증 명령

- [ ] `mvn test -f backend/pom.xml`
- [ ] `npm test --prefix frontend`
```
