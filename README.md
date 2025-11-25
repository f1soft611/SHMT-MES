# SHMT-MES

새한마이크로텍 MES(Manufacturing Execution System)는 생산계획, 공정/설비/품목 관리, 작업장-공정 매핑, 외부 ERP/생산 의뢰 인터페이스 연계를 통합 제공하는 경량 제조 실행 시스템입니다. 다중 DB 지원과 직관적 UI를 통해 중소 제조 환경에서 빠른 도입을 목표로 합니다.

> 처음 시작: 반드시 [로컬 개발 환경 설정](./문서/로컬_개발_환경_설정.md) 확인
> 보안 정책: (SECURITY.md 파일 미존재 — 추후 추가 예정)

## 아키텍처 개요

- Backend: Spring Boot (eGovFrame parent) + QueryDSL + JWT (Access/Refresh) + 다중 DB(MySQL, MSSQL 등)
- Frontend: React 19 + MUI 7 + React Query 5 + Axios + TypeScript
- 인증: Access(60분) + Refresh(7일) (자동 5분 전 재발급 및 Sliding Window 기능 제거됨)
- ERD: `문서/ERD/새한마이크로텍_V1.0_20251107.erwin` (PNG 추출 예정)

## 기술 스택

| Layer    | Tech               | Version         | Notes            |
| -------- | ------------------ | --------------- | ---------------- |
| Backend  | Java               | 1.8             | Upgrade 후보(17) |
| Backend  | Spring Boot (eGov) | 4.3.0           | Parent 관리      |
| Backend  | QueryDSL           | APT             | 동적 쿼리        |
| Backend  | jjwt               | 0.9.1           | 업그레이드 필요  |
| Frontend | React              | 19.x            | 최신 릴리스      |
| Frontend | TypeScript         | 4.9.x           | 상향 검토(5.x)   |
| Frontend | UI                 | MUI 7 + Emotion | 디자인 시스템    |
| Frontend | State/Data         | React Query 5   | 서버 상태 캐싱   |
| Common   | Build              | Maven / npm     |                  |

## 디렉터리 (축약)

```
backend/
    src/main/java/... (controller service repository entity dto config)
frontend/
    src/... (components pages services hooks types styles)
문서/ (도메인/가이드/보고서/ERD/인덱스, 통합/정리 예정)
```

## Quick Start

1. DB DDL 적용: `backend/DATABASE/all_sht_ddl_<db>.sql`
2. 초기 데이터: `backend/DATABASE/all_sht_data_<db>.sql`
3. Backend 실행:

```
mvn -f backend/pom.xml clean package
java -jar backend/target/*.war
```

4. Frontend 실행:

```
cd frontend
npm install
npm start
```

5. 접속: http://localhost:3000 (프록시 → 8080)

## 환경변수 & 프로파일

- Spring: `dev`, `prod`
- Frontend 예시(`.env.development`):

```
REACT_APP_API_BASE=http://localhost:8080/api
# (Sliding Window 제거로 미사용 시 삭제) REACT_APP_TOKEN_REFRESH_THRESHOLD=300000
```

## 데이터베이스 초기화 순서

DDL → 공통코드/기준 데이터 → 마이그레이션(`workplace_migration_*`, `scheduler_migration_*`) → 샘플/검증 데이터.

## 주요 도메인 대표 문서

- 생산계획: `문서/생산계획_관리_기능_구현.md`
- 공정관리: `문서/공정_관리_UI_가이드.md` (히스토리 통합)
- 설비관리: `문서/설비_관리_UI_가이드.md` (히스토리 통합)
- 품목관리: `문서/품목_관리_UI_가이드.md` (요약 통합)
- 스케줄러: `문서/scheduler-overview.md`
- 검증/품질: `문서/검증_보고서_통합.md`
- 백엔드 구현 요약: `문서/백엔드_구현_요약.md`
- 매핑: `문서/작업장_공정_매핑_구현.md`
  > 구버전/세부 문서는 `문서/archive/` 보존.

## JWT 인증 (요약)

현재 동작: Access 60분 고정, Refresh 7일. 이전 Sliding Window(활동 시 만료 연장) 및 "만료 5분 전 자동 재발급" 기능은 제거되었습니다.
재발급 방식: Access 만료(401 또는 토큰 만료 감지) 시 Refresh 토큰으로 명시적 `/auth/refresh` 호출. 자동 사전(Threshold) 재발급 없음.
프론트엔드: Axios 인터셉터가 401 응답을 감지하면 Refresh 흐름 수행 후 재시도.
Backend 구현: `EgovJwtTokenUtil.java`, `EgovLoginApiController.java` (jjwt 0.9.1 사용 — 업그레이드 예정).
보안 주의: Refresh 토큰은 HttpOnly 쿠키 또는 안전 저장소 사용 권장 (현 구현 검토 필요).

## 테스트

- Backend: `mvn test -f backend/pom.xml`
- Frontend: `npm test` (Jest + RTL)

## 빌드 & 배포

- Packaging: `war` (내장 톰캣 가능) → 향후 `jar` + 컨테이너 전환 검토
- 프로파일 사용: `-Dspring.profiles.active=prod`

## 문서 인덱스

정리 작업 후 `문서/README.md` 재작성 (중복/구버전은 `문서/archive/` 이동 예정). 현재 인덱스는 일부 중복 포함.

## 코드/파일 규칙 (축약)

- Java: 패키지 소문자 / 클래스 PascalCase / 메서드 camelCase / 상수 UPPER_SNAKE_CASE
- React: 컴포넌트 PascalCase / 도메인 타입 `xxx.types.ts` / 테스트 `Component.test.tsx`
- 공통: UTF-8 / 2-space / 120자 제한 / 함수/메서드 과도 길이 지양

## 커밋 컨벤션

Prefix: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.
상세 기록: `문서/COMMIT_HISTORY_KR.md` 참고.

## 라이선스

Backend 라이선스: `backend/LICENSE`. 루트 라이선스 통합 필요 시 추가 예정.

## 변경/리팩토링 기록

주요 리팩토링: `문서/리팩토링_완료_보고서.md` 참조. 향후 `CHANGELOG.md` 도입 예정.

## 향후 개선 로드맵

- JWT 라이브러리 최신화 (보안)
- Java 17 / TS 5.x 상향
- ESLint/Prettier/Husky 도입
- JSP/JSTL 제거 여부 검토 (REST 전용화)
- OpenAPI 정적 문서 & ERD PNG 공개
- CI/CD (GitHub Actions 또는 Jenkins) 구성

## 유지보수 상태

문서 정리(중복 통합/아카이브) 진행 중. 완료 후 README 내 링크 갱신 예정.
