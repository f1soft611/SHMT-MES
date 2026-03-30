---
description: 'Use when: checking SHMT-MES 공통 최소 스타일 원칙이 필요한 경우. 상세 규칙은 frontend-style.instructions.md / backend-style.instructions.md를 우선 적용'
---

# SHMT-MES 최소 스타일 지침

## 핵심 원칙

- 기존 구조/명명 규칙을 우선 유지하고, 변경 범위는 요청한 기능으로 한정한다.
- 규칙이 충돌하면 `.github/copilot-instructions.md`를 최우선 기준으로 따른다.

## 적용 방식

- 프론트 소스 변경은 `frontend-style.instructions.md`를 우선 따른다.
- 백엔드/매퍼 변경은 `backend-style.instructions.md`를 우선 따른다.
- 이 파일은 공통 원칙의 기준점으로만 사용한다.

## 변경 품질

- 하드코딩 대신 기존 상수/코드 체계를 우선 사용한다.
- 수정 후 영향 범위(타입 오류, 빌드/테스트 가능 여부)를 짧게 점검한다.
