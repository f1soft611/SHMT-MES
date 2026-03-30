# Feature Plan Sample Template

아래 템플릿을 복사해 `feature-plan-chain.prompt`의 `${input:요구사항 plan}`에 입력하세요.

```markdown
[요청 개요]

- 요청 제목:
- 요청 배경:
- 신규 기능 여부: (신규 화면/신규 API/기존 기능 개선 중 선택)

[대상 경로]

- 프론트 대상 경로:
- 백엔드 대상 경로:
- 매퍼 대상 경로:

[기능 요구사항]

1.
2.
3.

[제약사항]

- 권한/인가:
- DB/SQL:
- 일정/범위 제외:

[분기 판단 입력]

- 프론트 영향 범위: (있음/없음)
- API 계약 변경 여부: (있음/없음)
- UI/UX 변경 요청 여부: (있음/없음)
- 보안 영향 범위: (인증/인가/입력검증/민감정보 영향 있음/없음)
- 인증/인가 정책 변경 여부: (있음/없음)
- 입력검증 로직 변경 여부: (있음/없음)
- 민감정보 처리/로그 노출 변경 여부: (있음/없음)
- 분기 희망: (기본 순차/STEP-3 스킵 후보/STEP-5 경량화 후보)
- STEP-3 대체 검증 항목: (예: 백엔드 응답 스키마 검증)
- STEP-5 대체 검증 항목: (예: 체크리스트 기반 최소 보안 점검)
- STEP-3 스킵 승인: (승인/거부/미지정)
- STEP-5 경량화 승인: (승인/거부/미지정)

[피드백 루프 입력]

- 최근 실패 패턴(있는 경우):
- 다음 실행 회피 규칙 제안(있는 경우):

[신규 생성 후보(알고 있는 경우)]

- 프론트 생성 후보 파일:
- 백엔드 생성 후보 파일:
- 매퍼 생성 후보 파일:

[검증 기준]

- 기능 검증:
- 회귀 검증:
- 보안 검증:

[출력 기대사항]

- 6단계 순차 수행
- 각 단계에서 `## 다음 단계 입력` 포함
- 최종 문서 `문서/검증/` 저장
- 상태 메타(`chain_state_version`, `completed_steps`) 포함
- 분기/피드백 메타(`skip_decisions`, `feedback_applied`) 포함
```

## 빠른 입력 예시

```markdown
[요청 개요]

- 요청 제목: 생산실적 대시보드 불량 사유 통계 신규 화면
- 요청 배경: 불량 원인 상위 항목을 기간별로 빠르게 확인 필요
- 신규 기능 여부: 신규 화면

[대상 경로]

- 프론트 대상 경로: frontend/src/pages/DefectReasonStatus/
- 백엔드 대상 경로: backend/src/main/java/egovframework/let/production/defect/
- 매퍼 대상 경로: backend/src/main/resources/egovframework/mapper/let/production/defect/

[기능 요구사항]

1. 기간/작업장/설비/품목 조건 조회
2. 불량 사유 집계 목록 + 차트 동시 제공
3. 조회 권한 없는 사용자 차단

[제약사항]

- 권한/인가: 백엔드 인가 검증 필수(@PreAuthorize 또는 동등 정책)
- DB/SQL: MyBatis XML, PROD_DATE 기준 집계
- 일정/범위 제외: 등록/수정/삭제 기능은 제외

[분기 판단 입력]

- 프론트 영향 범위: 있음
- API 계약 변경 여부: 없음
- UI/UX 변경 요청 여부: 있음
- 보안 영향 범위: 입력검증 영향 있음
- 인증/인가 정책 변경 여부: 없음
- 입력검증 로직 변경 여부: 있음
- 민감정보 처리/로그 노출 변경 여부: 없음
- 분기 희망: 기본 순차
- STEP-3 대체 검증 항목: 없음
- STEP-5 대체 검증 항목: 체크리스트 기반 최소 보안 점검
- STEP-3 스킵 승인: 미지정
- STEP-5 경량화 승인: 미지정

[피드백 루프 입력]

- 최근 실패 패턴(있는 경우): 없음
- 다음 실행 회피 규칙 제안(있는 경우): 없음

[신규 생성 후보(알고 있는 경우)]

- 프론트 생성 후보 파일: index.tsx, hooks/useDefectReason.ts, components/_, services/_, types/\*
- 백엔드 생성 후보 파일: Controller, Service, ServiceImpl, DAO, SearchDto, Row
- 매퍼 생성 후보 파일: ProductionDefectReason_SQL_mssql.xml

[검증 기준]

- 기능 검증: 필터 조합별 조회 결과 일관성
- 회귀 검증: 기존 불량율 화면 영향 없음
- 보안 검증: URL 직접 접근/API 직접 호출 시 권한 차단

[출력 기대사항]

- 6단계 순차 수행
- 각 단계에서 `## 다음 단계 입력` 포함
- 최종 문서 `문서/검증/` 저장
- 상태 메타(`chain_state_version`, `completed_steps`) 포함
- 분기/피드백 메타(`skip_decisions`, `feedback_applied`) 포함
```
