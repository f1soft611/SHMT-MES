---
description: 'Use when: editing backend Java/MyBatis source in SHMT-MES; enforce backend architecture and SQL conventions'
applyTo: 'backend/src/main/java/**/*.java,backend/src/main/resources/egovframework/mapper/**/*.xml'
---

# SHMT-MES 백엔드 최소 스타일 지침

## 핵심 원칙

- 기존 구조/명명 규칙을 우선 유지하고, 변경 범위는 요청한 기능으로 한정한다.
- 규칙이 충돌하면 `.github/copilot-instructions.md`를 최우선 기준으로 따른다.

## 백엔드

- 레이어 순서를 유지한다: Controller -> Service -> DAO -> MyBatis XML.
- 트랜잭션은 Service 레이어에 적용하고 DAO에 부여하지 않는다.
- 멀티 DB 환경을 고려해 SQL 변경 시 해당 도메인의 DB별 매퍼 일관성을 확인한다.

## 변경 품질

- 하드코딩 대신 기존 상수/코드 체계를 우선 사용한다.
- 수정 후 영향 범위(빌드/테스트 가능 여부)를 짧게 점검한다.
