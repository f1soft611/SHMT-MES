# 품목관리(ItemManagement) 코드 및 보안 점검 보고서

- 점검 일자: 2026-03-26
- 점검 범위: 품목관리 기능 전체 (백엔드 + 프론트엔드)
- 점검 기준: SHMT-MES 코딩 규칙, OWASP Top 10

---

## 1. 점검 요약

| 구분                                      | 건수 | 조치                           |
| ----------------------------------------- | ---- | ------------------------------ |
| Critical (SQL 런타임 에러 또는 보안 위반) | 2건  | ✅ 수정 완료                   |
| High (데이터 정합성·보안)                 | 7건  | ✅ 수정 완료 / 1건 별도 릴리즈 |
| Medium (코드 품질)                        | 2건  | ✅ 수정 완료                   |
| Low (잠재 개선)                           | 2건  | 허용 / 다음 PR                 |
| 안전 확인                                 | 5건  | ✅ 이상 없음                   |

---

## 2. Critical 이슈 (수정 완료)

### C-1 [SQL 런타임 에러] selectItemList FROM 절 중복 (BUG-1)

- **파일**: `Item_SQL_mssql.xml`
- **원인**: `inProcessFlowYn == 2` 분기에 `FROM TPR_FLOW_ITEM FI` 줄이 `FROM TPR112 FI`와 중복 존재 → SQL syntax error
- **영향**: "공정 등록 품목" 필터 선택 시 목록 조회 500 에러
- **조치**: `FROM TPR_FLOW_ITEM FI` 줄 삭제, `FROM TPR112 FI`만 유지

### C-2 [A01+A04 보안] factoryCode 클라이언트 오버라이드 허용

- **파일**: `EgovItemApiController.java`
- **원인**: `Item.java`의 `factoryCode = "000001"` 기본값만 있고, Controller에서 JWT Principal의 factoryCode로 강제 설정하지 않음 → 클라이언트가 임의 공장 코드로 목록 조회/등록/수정 가능
- **조치**: `selectItemList`, `insertItem`, `updateItem`에서 `item/itemVO.setFactoryCode(user.getFactoryCode())` 서버 강제 설정

---

## 3. High 이슈 (수정 완료)

### H-1 [BUG-2] deleteItem SQL #{useYn} null 바인딩

- **파일**: `Item_SQL_mssql.xml`
- **원인**: `parameterType="string"` 에서 `#{useYn}` 참조 → null 바인딩
- **조치**: `DELETE_FLAG = '1'` 고정, `parameterType="map"`, `#{_parameter}` 제거 → `#{itemCode}`, `#{userId}` 사용

### H-2 [BUG-3] updateItem 중복 코드 체크 미수행

- **파일**: `EgovItemApiController.java`
- **원인**: `isItemCodeExistsForUpdate` 서비스 메서드가 구현되어 있으나 Controller에서 미호출
- **조치**: `updateItem` 전 `isItemCodeExistsForUpdate` 호출, 중복 시 `INPUT_CHECK_ERROR` 반환

### H-3 [BUG-3+] updateItem itemId null → 중복 체크 우회 가능

- **파일**: `EgovItemApiController.java`
- **원인**: itemId가 없을 때 fallback 조회 후 `existingItem == null`인 경우 처리 없음
- **조치**: `existingItem == null` 시 `BUSINESS_ERROR` 반환, `item.setItemId(itemId)` 추가

### H-4 [BUG-4] selectItemCodeCheckForUpdate — 자기 자신 제외 조건 누락

- **파일**: `Item_SQL_mssql.xml`
- **원인**: `WHERE MATERIAL_CODE = #{itemCode}` 만 있어 자기 자신도 중복으로 인식
- **조치**: `AND MATERIAL_ID != #{itemId}` 조건 추가

### H-5 [BUG-5] selectItemList / selectItemListCnt useYn 필터 불일치

- **파일**: `Item_SQL_mssql.xml`
- **원인**: `selectItemListCnt` 없이 `AND DELETE_FLAG != '1'` 상수 조건 → 전체 조회 시 rows > totalCount → 페이지네이션 오동작
- **조치**: 두 쿼리 모두 `<choose><otherwise>AND DELETE_FLAG != '1'</otherwise></choose>` 통일

### H-6 [A09 보안] deleteItem 감사 로그 누락 — OPMAN_CODE2='SYSTEM' 하드코딩

- **파일**: `EgovItemApiController.java`, `EgovItemService.java`, `EgovItemServiceImpl.java`, `ItemDAO.java`, `Item_SQL_mssql.xml`
- **원인**: 삭제자를 'SYSTEM'으로 하드코딩, JWT 사용자 정보 미전달
- **조치**: `deleteItem(itemCode, userId)` 시그니처 확장, SQL `OPMAN_CODE2 = #{userId}` 적용

### H-7 [A05 보안] CORS allowedOriginPatterns("\*") — 전 도메인 허용

- **파일**: `SecurityConfig.java`
- **원인**: `allowedOriginPatterns("*")`와 `allowCredentials(true)` 조합 → 피싱 도메인에서 인증 세션으로 API 호출 가능
- **조치**: `setAllowedOriginPatterns` 라인 제거 → `setAllowedOrigins(ORIGINS_WHITELIST)`만 적용

---

## 4. Medium 이슈 (수정 완료)

### M-1 updateItem 응답 코드 미검증

- **파일**: `index.tsx`
- **원인**: updateItem 후 resultCode 확인 없이 항상 성공 toast
- **조치**: `result.resultCode === 200` 분기 추가, 실패 시 `return`

### M-2 getItemTypeColor as any 사용

- **파일**: `index.tsx`
- **원인**: `color={getItemTypeColor(...) as any}` — TypeScript `any` 금지 위반
- **조치**: 반환 타입 `'primary' | 'success' | ...` 명시, `as any` 제거

---

## 5. Low 이슈 (허용 / 다음 PR)

### L-1 productionPerCycle removeCommas 미포함

- `handleSave`에서 `stockQty`, `safetyStock`, `cycleTime`은 콤마 제거하나 `productionPerCycle` 누락
- 실질 버그 아님 (dialog onChange에서 이미 제거됨) → 다음 PR에서 일괄 정리

### L-2 selectItem / deleteItem 레이어 파라미터 네이밍 혼용

- Service 시그니처는 `itemId`이나 실제 전달값은 `itemCode`
- 기능 영향 없음 → 다음 PR에서 네이밍 통일

---

## 6. 안전 확인 항목

| 항목                               | 결과                                                |
| ---------------------------------- | --------------------------------------------------- |
| SQL Injection (MyBatis #{})        | ✅ 전 구간 `#{}` PreparedStatement 사용, `${}` 없음 |
| LIKE wildcard 처리                 | ✅ `'%' + #{searchWrd} + '%'` 파라미터 바인딩       |
| regUserId/updUserId 서버 강제 설정 | ✅ Controller에서 `user.getUniqId()` 설정           |
| JWT 인증                           | ✅ `anyRequest().authenticated()` 전체 적용         |
| XSS (MUI 컴포넌트)                 | ✅ React dangerouslySetInnerHTML 미사용             |

---

## 7. 미수정 잔여 이슈 (별도 릴리즈)

| 이슈                                 | 심각도 | 이유                                                                  |
| ------------------------------------ | ------ | --------------------------------------------------------------------- |
| @PreAuthorize 미도입 (SEC-1)         | High   | @EnableMethodSecurity 미설정 상태 → 별도 전사 보안 강화 작업으로 분리 |
| Swagger 무인증 운영 노출 (H-3)       | High   | 공통 SecurityConfig 영향 → 별도 배포                                  |
| DB 에러 메시지 클라이언트 노출 (M-1) | Medium | GlobalExceptionHandler 전역 변경 → 별도 PR                            |

---

## 8. 수정 파일 목록

| 파일                                     | 수정 내용                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `backend/.../EgovItemApiController.java` | factoryCode 강제, updateItem 중복 체크, 404 처리, deleteItem userId 전달 |
| `backend/.../EgovItemService.java`       | deleteItem 시그니처 확장                                                 |
| `backend/.../EgovItemServiceImpl.java`   | deleteItem Map 파라미터 전달                                             |
| `backend/.../ItemDAO.java`               | deleteItem Map 파라미터 수신                                             |
| `backend/.../Item_SQL_mssql.xml`         | BUG-1~5, H-6 deleteItem userId, selectItemCodeCheckForUpdate 조건        |
| `backend/.../SecurityConfig.java`        | CORS allowedOriginPatterns 제거                                          |
| `frontend/.../index.tsx`                 | updateItem 결과 체크, getItemTypeColor 반환 타입 명시                    |

---

## 9. 권고 후속 조치

1. **@PreAuthorize 도입** — `@EnableMethodSecurity` 활성화 후 POST/PUT/DELETE에 역할 기반 인가 적용
2. **Swagger 운영 비활성화** — `@Profile("!prod")` 또는 Spring Boot 설정으로 운영 Swagger 차단
3. **GlobalExceptionHandler 개선** — DB 에러 메시지 추상화, 서버 로그에만 상세 정보 기록
4. **멀티 DB 매퍼 보완** — 현재 MSSQL 전용. MySQL/Oracle/Altibase/Cubrid/Tibero 매퍼 필요 시 동일 수정 적용 필요

---

## 10. feature-plan-chain.prompt 사용법 (공유용 간단 버전)

### 10.1 언제 사용하나요?

- plan 기준으로 1~6단계를 순차 실행해 구현 + 품질 + 보안 + 문서화를 한 번에 진행할 때 사용
- 신규 화면, 프론트/백엔드 동시 변경, 검증 문서까지 필요한 작업에 적합

### 10.2 실행 순서

1. 요구사항 plan 작성 (목표, 대상 경로, 제외 범위 포함)
2. `feature-plan-chain.prompt` 실행
3. 각 단계 출력의 `다음 단계 입력`을 다음 단계에 그대로 전달
4. 6단계 완료 후 `문서/검증/feature-plan-chain-YYYYMMDD-HHmm-[대상요약].md`로 저장

### 10.3 입력 작성 예시 (복붙용)

- 요구사항: 품목관리 목록/등록/수정/삭제 안정화
- 프론트 경로: frontend/src/pages/**/item/**
- 백엔드 경로: backend/src/main/java/**/item/**, backend/src/main/resources/egovframework/mapper/\*_/Item*SQL*_.xml
- 제약사항: TypeScript any 금지, Controller→Service→DAO→MyBatis XML, @PreAuthorize 영향 확인, 멀티 DB 매퍼 정합성 점검

### 10.4 꼭 지킬 규칙

- 단계 출력은 항상 아래 5개 섹션 유지: 요약 / 변경·점검 범위 / Critical·High 이슈 / 결정 사항 / 다음 단계 입력
- 선행 단계에서 `다음 단계 입력`이 누락되면 다음 단계 진행 금지 (누락 보완 후 동일 단계 재실행)
- SQL 변경이 있으면 멀티 DB 영향 여부를 함께 확인

### 10.5 팀 공지용 3줄 요약

- `feature-plan-chain.prompt`는 plan 하나로 1~6단계(기획→구현→품질→보안→문서화)를 연속 실행하는 표준 플로우입니다.
- 각 단계 마지막 `다음 단계 입력`을 다음 단계에 전달하면 체인이 끊기지 않습니다.
- 최종 결과는 `문서/검증/`에 보고서로 저장해 이력과 회귀 점검 기준으로 사용합니다.
