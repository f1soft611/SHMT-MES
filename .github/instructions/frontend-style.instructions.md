---
description: 'Use when: editing frontend source in SHMT-MES; enforce frontend style and repository conventions'
applyTo: 'frontend/src/**/*.{ts,tsx,js,jsx}'
---

# SHMT-MES 프론트엔드 최소 스타일 지침

## 핵심 원칙

- 기존 구조/명명 규칙을 우선 유지하고, 변경 범위는 요청한 기능으로 한정한다.
- 규칙이 충돌하면 `.github/copilot-instructions.md`를 최우선 기준으로 따른다.

## 프론트엔드

- `any` 타입 사용 금지, 가능한 구체 타입/인터페이스를 사용한다.
- API 호출은 `src/util/axios.ts`의 `apiClient` 단일 인스턴스를 사용한다.
- 컴포넌트 파일은 PascalCase, 서비스/유틸은 기존 camelCase 패턴을 유지한다.

## 변경 품질

- 하드코딩 대신 기존 상수/코드 체계를 우선 사용한다.
- 수정 후 영향 범위(타입 오류, 빌드/테스트 가능 여부)를 짧게 점검한다.
