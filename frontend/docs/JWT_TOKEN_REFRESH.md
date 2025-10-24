# JWT 토큰 자동 갱신 메커니즘

## 개요

이 시스템은 사용자가 활동 중일 때 자동으로 JWT 토큰을 갱신하여, 60분 후 자동 로그아웃되는 문제를 해결합니다.

## 주요 기능

### 1. 토큰 만료 감지
- 토큰 발급 시간(`tokenIssuedAt`)을 `sessionStorage`에 저장
- 토큰 유효 시간: 60분
- 만료 5분 전부터 갱신 가능 상태로 감지

### 2. 자동 갱신 메커니즘

#### 주기적 갱신 (타이머)
```typescript
// 1분마다 토큰 만료 확인
setInterval(async () => {
  if (isAuthenticated() && isTokenExpiringSoon()) {
    await refreshToken();
  }
}, 60 * 1000);
```

#### API 요청 전 갱신
모든 API 요청 전에 인터셉터가 토큰 만료를 확인하고 자동으로 갱신:
```typescript
apiClient.interceptors.request.use(async (config) => {
  if (isTokenExpiringSoon()) {
    const newToken = await refreshToken();
    config.headers.Authorization = `Bearer ${newToken}`;
  }
  return config;
});
```

### 3. 리프레쉬 토큰 활용
- 액세스 토큰: 60분 유효
- 리프레쉬 토큰: 7일 유효
- 리프레쉬 토큰으로 새 액세스 토큰 발급

## 작동 방식

### 로그인 시
1. 서버로부터 액세스 토큰과 리프레쉬 토큰 수신
2. `tokenIssuedAt` 시간 저장
3. 자동 갱신 타이머 시작

### 사용 중
1. **타이머 방식**: 1분마다 토큰 만료 확인
   - 55분 이상 경과 시 자동 갱신
2. **요청 시 방식**: API 요청 전마다 확인
   - 만료 임박 시 즉시 갱신

### 토큰 갱신
1. 리프레쉬 토큰으로 `/auth/refresh` 엔드포인트 호출
2. 새 액세스 토큰 수신
3. `tokenIssuedAt` 업데이트
4. 새 토큰으로 API 요청 진행

### 로그아웃 시
1. 모든 토큰 정보 삭제
2. 자동 갱신 타이머 중지
3. 로그인 페이지로 이동

## 파일 구조

### 수정된 파일
```
frontend/src/
├── services/
│   ├── authService.ts      # 주요 인증 로직 및 타이머 관리
│   ├── api.ts              # API 클라이언트 인터셉터
│   └── authService.test.ts # 단위 테스트
├── util/
│   └── axios.ts            # Axios 유틸리티 인터셉터
└── contexts/
    └── AuthContext.tsx     # 앱 시작 시 타이머 초기화
```

## 설정 값

```typescript
// 토큰 유효 시간
const JWT_TOKEN_VALIDITY = 60 * 60 * 1000; // 60분

// 갱신 임계값 (만료 5분 전)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5분

// 타이머 체크 주기
const TIMER_INTERVAL = 60 * 1000; // 1분
```

## 타임라인 예시

```
0분    : 로그인 (토큰 발급)
↓
55분   : 자동 갱신 시작 (만료 5분 전)
↓
60분   : 원래 토큰 만료 시점
↓
115분  : 갱신된 토큰 자동 재갱신
↓
계속 사용 가능...
```

## 에러 처리

### 리프레쉬 토큰 만료 시
- 7일 후 리프레쉬 토큰 만료
- 자동 로그아웃 및 로그인 페이지로 이동

### 401 응답 수신 시
1. 리프레쉬 토큰으로 갱신 시도
2. 성공 시: 원래 요청 재시도
3. 실패 시: 로그아웃 처리

## 보안 고려사항

- ✅ 토큰은 `sessionStorage`에 저장 (탭 종료 시 삭제)
- ✅ HTTPS 통신 권장
- ✅ XSS 방지를 위한 적절한 헤더 설정 필요
- ✅ CSRF 토큰 사용 권장

## 테스트

13개의 단위 테스트로 다음 항목 검증:
- 토큰 만료 감지 로직
- 타이머 시작/중지
- 토큰 저장 및 업데이트
- 인증 상태 관리

```bash
npm test -- --testPathPattern=authService.test.ts
```

## 문제 해결

### 토큰이 자동으로 갱신되지 않는 경우
1. 브라우저 콘솔에서 "토큰 자동 갱신 시작..." 로그 확인
2. `sessionStorage`에서 `tokenIssuedAt` 값 확인
3. 리프레쉬 토큰 유효성 확인

### 여전히 로그아웃되는 경우
1. 리프레쉬 토큰 만료 확인 (7일)
2. 서버 `/auth/refresh` 엔드포인트 정상 작동 확인
3. 네트워크 탭에서 401 응답 확인

## 향후 개선 사항

- [ ] 리프레쉬 토큰 만료 전 사용자에게 알림
- [ ] 토큰 갱신 실패 시 재시도 로직
- [ ] 토큰 갱신 이력 로깅
- [ ] 다중 탭 간 토큰 동기화
