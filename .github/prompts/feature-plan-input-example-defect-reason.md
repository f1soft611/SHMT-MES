# Feature Plan Input Example (Defect Reason Stats)

아래 본문 전체를 복사해 `feature-plan-chain.prompt`의 `${input:요구사항 plan}`에 입력하면 됩니다.

```markdown
[요청 개요]

- 요청 제목: 생산실적 대시보드 불량 사유 통계 신규 화면 구현
- 요청 배경: 일자별/작업장별 주요 불량 사유를 현장에서 빠르게 확인하고 개선 우선순위를 정하기 위해 신규 조회 화면이 필요함
- 신규 기능 여부: 신규 화면

[대상 경로]

- 프론트 대상 경로: frontend/src/pages/DefectReasonStatus/
- 백엔드 대상 경로: backend/src/main/java/egovframework/let/production/defect/
- 매퍼 대상 경로: backend/src/main/resources/egovframework/mapper/let/production/defect/

[기능 요구사항]

1. 기간, 작업장, 설비, 품목 조건으로 불량 사유 집계 조회
2. 동일 집계 결과를 목록(Grid)과 차트(Top N)로 동시에 표시
3. 조회 권한 없는 사용자의 화면 진입 및 API 호출 차단
4. 빈 결과일 때 목록/차트 모두 No Data 상태 표시

[제약사항]

- 권한/인가: 백엔드에서 조회 권한 검증 필수(`@PreAuthorize` 또는 동등 정책)
- DB/SQL: 운영 SQL은 MyBatis XML 사용, 집계 기준일은 `PROD_DATE`
- 멀티 DB: mssql 기준 구현 + 타 DB 영향 여부 점검 포인트 포함
- 일정/범위 제외: 등록/수정/삭제 기능 제외, 기존 불량율 화면 구조 변경 금지

[신규 생성 후보(알고 있는 경우)]

- 프론트 생성 후보 파일:
  - frontend/src/pages/DefectReasonStatus/index.tsx
  - frontend/src/pages/DefectReasonStatus/hooks/useDefectReason.ts
  - frontend/src/pages/DefectReasonStatus/components/DefectReasonSearchFilter.tsx
  - frontend/src/pages/DefectReasonStatus/components/DefectReasonSummaryChart.tsx
  - frontend/src/pages/DefectReasonStatus/components/DefectReasonList.tsx
  - frontend/src/services/productionDefectReasonService.ts
  - frontend/src/types/productionDefectReason.ts
- 백엔드 생성 후보 파일:
  - backend/src/main/java/egovframework/let/production/defect/controller/EgovProductionDefectReasonApiController.java
  - backend/src/main/java/egovframework/let/production/defect/service/EgovProductionDefectReasonService.java
  - backend/src/main/java/egovframework/let/production/defect/service/impl/EgovProductionDefectReasonServiceImpl.java
  - backend/src/main/java/egovframework/let/production/defect/domain/repository/ProductionDefectReasonDAO.java
  - backend/src/main/java/egovframework/let/production/defect/domain/model/ProductionDefectReasonSearchDto.java
  - backend/src/main/java/egovframework/let/production/defect/domain/model/ProductionDefectReasonRow.java
- 매퍼 생성 후보 파일:
  - backend/src/main/resources/egovframework/mapper/let/production/defect/ProductionDefectReason_SQL_mssql.xml

[검증 기준]

- 기능 검증: 필터 조합별 조회 결과 정합성, 목록/차트 값 일치
- 회귀 검증: 기존 불량율 화면 및 생산실적 화면 동작 영향 없음
- 보안 검증: 권한 없는 사용자 URL 직접 접근 및 API 직접 호출 차단
- 품질 검증: 신규 기능 검토 시 기존 화면 참조와 신규 대상 확정 이슈 구분 기록

[출력 기대사항]

- 6단계 순차 수행
- 각 단계에서 `## 다음 단계 입력` 포함
- 리뷰/보안 단계는 `기존 화면 참조`와 `신규 대상 확정/추가 확인 필요`를 구분
- 최종 문서는 `문서/검증/feature-plan-chain-YYYYMMDD-HHmm-불량사유통계.md`로 저장
```
