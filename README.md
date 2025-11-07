# SHMT-MES 프로젝트 구조 및 파일 생성 규칙

## 📚 프로젝트 문서

프로젝트 개발을 시작하기 전에 다음 문서들을 참고하세요:

- **[📖 문서 인덱스](./문서/README.md)** - 모든 문서의 시작점
- **[🔵 백엔드 개발 가이드](./문서/BACKEND_DEVELOPMENT_GUIDE.md)** - Spring Boot 백엔드 개발
- **[🟢 프론트엔드 개발 가이드](./문서/FRONTEND_DEVELOPMENT_GUIDE.md)** - React 프론트엔드 개발
- **[🟣 통합 개발 워크플로우](./문서/DEVELOPMENT_WORKFLOW.md)** - 전체 개발 프로세스

## 프로젝트 폴더 구조

```
SHMT-MES/
├── README.md                           # 프로젝트 구조 및 규칙 문서 (본 파일)
├── .gitignore                          # Git 버전 관리 제외 파일 목록
├── interface-expanded-array.png        # 인터페이스 UI 스크린샷 (배열 확장 뷰)
├── interface-json-view.png            # 인터페이스 UI 스크린샷 (JSON 뷰)
├── 문서/                              # 프로젝트 관련 문서 디렉터리
│   └── 새한마이크로텍 ERP - MES 인터페이스 정리 v1.xlsx
├── backend/                           # Spring Boot 백엔드 애플리케이션
│   ├── README.md                      # 백엔드 프로젝트 설명서
│   ├── pom.xml                        # Maven 빌드 설정 파일
│   ├── .gitignore                     # 백엔드 전용 Git 제외 파일
│   ├── .springBeans                   # Spring IDE 설정 파일
│   ├── .pmd                          # PMD 정적 분석 도구 설정
│   ├── LICENSE                        # 백엔드 라이선스 파일
│   ├── DATABASE/                      # 데이터베이스 스크립트 디렉터리
│   │   ├── all_sht_ddl_*.sql         # DDL 스크립트 (각 DB별: mysql, oracle, cubrid, altibase, tibero)
│   │   └── all_sht_data_*.sql        # 초기 데이터 스크립트 (각 DB별)
│   ├── Docs/                         # 백엔드 기술 문서
│   │   ├── context-*.md              # Spring Context 설정 관련 문서들
│   │   ├── servlet.md                # 서블릿 설정 문서
│   │   └── WebApplicationInitializer*.md # 웹 애플리케이션 초기화 문서
│   └── src/                          # Java 소스코드 디렉터리
│       ├── main/                     # 메인 애플리케이션 소스
│       │   ├── java/egovframework/   # eGov 프레임워크 기반 Java 소스
│       │   │   ├── EgovBootApplication.java # Spring Boot 메인 클래스
│       │   │   ├── com/              # 비즈니스 로직 패키지
│       │   │   └── let/              # 추가 패키지
│       │   └── resources/            # 설정 파일 및 리소스
│       │       ├── application*.properties # 환경별 설정 파일 (dev, prod)
│       │       ├── logback-spring.xml     # 로깅 설정
│       │       ├── egovframework/         # eGov 프레임워크 설정
│       │       ├── db/                    # 데이터베이스 관련 설정
│       │       └── static/                # 정적 리소스
│       └── test/                     # 테스트 소스코드
└── frontend/                         # React 프론트엔드 애플리케이션
    ├── README.md                     # 프론트엔드 프로젝트 설명서
    ├── package.json                  # npm 패키지 설정 파일
    ├── package-lock.json            # npm 의존성 잠금 파일
    ├── tsconfig.json                # TypeScript 컴파일러 설정
    ├── .gitignore                   # 프론트엔드 전용 Git 제외 파일
    ├── env.*                        # 환경별 설정 파일 (development, staging, production)
    ├── public/                      # 정적 파일 디렉터리
    │   ├── index.html               # HTML 템플릿 파일
    │   ├── manifest.json            # PWA 매니페스트 파일
    │   ├── robots.txt               # 검색엔진 크롤링 규칙
    │   ├── favicon*.png             # 파비콘 파일들 (다양한 크기)
    │   └── logo*.png                # 로고 이미지 파일들
    └── src/                         # React 소스코드 디렉터리
        ├── index.tsx                # React 애플리케이션 진입점
        ├── App.tsx                  # 루트 컴포넌트
        ├── App.css                  # 애플리케이션 전역 스타일
        ├── index.css                # 기본 스타일
        ├── react-app-env.d.ts       # React 타입 정의
        ├── reportWebVitals.ts       # 성능 측정 유틸리티
        ├── setupTests.ts            # 테스트 환경 설정
        ├── logo.svg                 # SVG 로고 파일
        ├── components/              # 재사용 가능한 React 컴포넌트
        │   ├── common/              # 공통 컴포넌트
        │   └── Interface/           # 인터페이스 관련 컴포넌트
        ├── pages/                   # 페이지 레벨 컴포넌트
        │   ├── BaseData/            # 기준정보 페이지
        │   ├── Dashboard/           # 대시보드 페이지
        │   ├── Interface/           # 인터페이스 페이지
        │   ├── Login/               # 로그인 페이지
        │   ├── ProductionOrder/     # 생산지시 페이지
        │   └── ProductionResult/    # 생산실적 페이지
        ├── services/                # API 호출 서비스
        ├── hooks/                   # 커스텀 React 훅
        ├── contexts/                # React Context 제공자
        ├── types/                   # TypeScript 타입 정의
        ├── constants/               # 상수 정의
        ├── styles/                  # 스타일 관련 파일
        └── util/                    # 유틸리티 함수
```

## 파일별 상세 설명

### 루트 디렉터리
- **README.md**: 프로젝트 전체 구조와 파일 생성 규칙을 설명하는 문서
- **.gitignore**: 버전 관리에서 제외할 파일/폴더 패턴 정의
- **interface-*.png**: 시스템 인터페이스 화면 스크린샷
- **문서/**: 프로젝트 기획서, 인터페이스 명세서 등 비기술 문서 보관

### 백엔드 (backend/)
- **pom.xml**: Maven 빌드 도구 설정, 의존성 관리, 빌드 프로파일 정의
- **EgovBootApplication.java**: Spring Boot 애플리케이션 메인 클래스
- **DATABASE/**: 지원하는 모든 데이터베이스(MySQL, Oracle, Cubrid, Altibase, Tibero)의 DDL/DML 스크립트
- **application*.properties**: 환경별(dev, prod) 데이터베이스 연결, 서버 포트 등 설정
- **Docs/**: eGov 프레임워크 관련 기술 문서 및 설정 가이드

### 프론트엔드 (frontend/)
- **package.json**: npm 의존성, 스크립트, 프로젝트 메타데이터 정의
- **tsconfig.json**: TypeScript 컴파일 옵션, 경로 매핑 등 설정
- **env.***: 환경별 API 엔드포인트, 기능 플래그 등 설정
- **public/**: 빌드 시 그대로 복사되는 정적 파일들
- **src/components/**: 재사용 가능한 UI 컴포넌트 (버튼, 폼, 테이블 등)
- **src/pages/**: 라우팅되는 페이지 컴포넌트들
- **src/services/**: Axios 기반 API 호출 로직
- **src/types/**: 전역 TypeScript 인터페이스 및 타입 정의

## 프로젝트 파일 생성 규칙

### 1. 네이밍 규칙

#### 백엔드 (Java)
- **패키지명**: 소문자, 점(.) 구분자 사용 (예: `com.shmt.mes.production`)
- **클래스명**: PascalCase (예: `ProductionOrderController`)
- **메서드명**: camelCase (예: `createProductionOrder`)
- **상수명**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`)
- **파일명**: 클래스명과 동일 + `.java` 확장자

#### 프론트엔드 (React/TypeScript)
- **컴포넌트 파일**: PascalCase (예: `ProductionOrderList.tsx`)
- **유틸리티/서비스 파일**: camelCase (예: `apiService.ts`)
- **타입 정의 파일**: camelCase + `.types.ts` (예: `productionOrder.types.ts`)
- **스타일 파일**: 컴포넌트명과 동일 + `.css` 또는 `.module.css`
- **페이지 컴포넌트**: 폴더명과 동일한 index.tsx (예: `ProductionOrder/index.tsx`)

### 2. 디렉터리 구조 규칙

#### 백엔드
```
src/main/java/egovframework/
├── controller/     # REST API 컨트롤러
├── service/        # 비즈니스 로직 서비스
├── repository/     # 데이터 접근 계층
├── entity/         # JPA 엔티티
├── dto/           # 데이터 전송 객체
├── config/        # 설정 클래스
└── exception/     # 예외 처리 클래스
```

#### 프론트엔드
```
src/
├── components/
│   ├── common/          # 전역 공통 컴포넌트
│   └── [domain]/        # 도메인별 컴포넌트
├── pages/
│   └── [PageName]/      # 페이지별 디렉터리
│       ├── index.tsx    # 메인 페이지 컴포넌트
│       ├── components/  # 페이지 전용 컴포넌트
│       └── styles/      # 페이지 전용 스타일
├── services/
│   └── [domain]Api.ts   # 도메인별 API 서비스
├── types/
│   └── [domain].types.ts # 도메인별 타입 정의
└── hooks/
    └── use[Domain].ts   # 도메인별 커스텀 훅
```

### 3. 파일 생성 시 필수 포함 사항

#### 백엔드 파일
- **헤더 주석**: 파일 목적, 작성자, 생성일 명시
- **패키지 선언**: 적절한 패키지 경로
- **Import 정렬**: 표준 라이브러리 → 서드파티 → 프로젝트 내부 순서
- **클래스 JavaDoc**: 클래스 역할과 사용법 설명

#### 프론트엔드 파일
- **Import 정렬**: React 관련 → 라이브러리 → 프로젝트 내부 순서
- **Props 타입 정의**: TypeScript 인터페이스 또는 타입 선언
- **JSDoc 주석**: 복잡한 컴포넌트나 함수에 대한 설명
- **Default Export**: 메인 컴포넌트는 default export 사용

### 4. 코드 스타일 규칙

#### 공통
- **들여쓰기**: 2칸 스페이스
- **줄바꿈**: Unix 스타일 (LF)
- **인코딩**: UTF-8
- **최대 줄 길이**: 120자

#### 백엔드 특화
- **중괄호**: 같은 줄에 시작, 새 줄에 종료
- **메서드 길이**: 30줄 이하 권장
- **클래스 길이**: 300줄 이하 권장

#### 프론트엔드 특화
- **함수형 컴포넌트**: 화살표 함수 사용
- **Props 구조분해**: 함수 파라미터에서 구조분해 할당 사용
- **상태 관리**: useState, useEffect 등 Hooks 우선 사용

### 5. 테스트 파일 규칙

#### 백엔드
- **위치**: `src/test/java/` 하위에 동일한 패키지 구조
- **네이밍**: `[ClassName]Test.java`
- **어노테이션**: `@SpringBootTest`, `@ExtendWith(MockitoExtension.class)` 등 사용

#### 프론트엔드
- **위치**: 테스트 대상 파일과 같은 디렉터리
- **네이밍**: `[ComponentName].test.tsx`
- **라이브러리**: React Testing Library, Jest 사용

### 6. 환경 설정 파일 규칙

#### 백엔드
- **application.properties**: 기본 설정
- **application-dev.properties**: 개발 환경 설정
- **application-prod.properties**: 운영 환경 설정

#### 프론트엔드
- **env.development**: 개발 환경 변수
- **env.staging**: 스테이징 환경 변수
- **env.production**: 운영 환경 변수

### 7. 문서화 규칙

- **README.md**: 각 모듈별로 설치, 실행, 테스트 방법 명시
- **API 문서**: Swagger/OpenAPI 3.0 사용
- **컴포넌트 문서**: Storybook 또는 JSDoc 활용
- **변경 이력**: CHANGELOG.md 파일에 버전별 변경사항 기록

## JWT 세션 관리

### 슬라이딩 윈도우 세션 방식

프로젝트는 사용자 경험 향상을 위해 **슬라이딩 윈도우(Sliding Window)** 방식의 JWT 세션 관리를 사용합니다.

#### 동작 원리

1. **토큰 유효 시간**: 60분
2. **자동 갱신**: 사용자가 API 요청을 할 때마다 세션 시간이 자동으로 연장됩니다
3. **비활동 시 만료**: 사용자가 60분 동안 아무런 활동을 하지 않으면 로그아웃됩니다

#### 기술적 구현

- **프론트엔드**: 모든 성공적인 API 응답 시 `tokenIssuedAt` 타임스탬프를 업데이트
- **자동 갱신 시점**: 토큰이 만료 5분 전이 되면 자동으로 새 토큰 발급
- **리프레시 토큰**: 7일 유효 기간의 리프레시 토큰으로 액세스 토큰 갱신

#### 사용자 경험

- ✅ **활동 중인 사용자**: 작업 중에는 로그아웃되지 않습니다
- ✅ **장시간 작업**: 데이터 입력이나 문서 작성 중에도 세션 유지
- ✅ **보안**: 비활동 상태가 60분 지속되면 자동 로그아웃으로 보안 유지
- ✅ **투명한 갱신**: 토큰 갱신이 백그라운드에서 자동으로 처리되어 사용자가 인지하지 못함

#### 관련 파일

**Frontend (이번 PR에서 수정)**:
- `frontend/src/services/api.ts` - 기본 API 클라이언트 (슬라이딩 윈도우 구현)
- `frontend/src/services/authService.ts` - 인증 서비스 (슬라이딩 윈도우 구현)
- `frontend/src/util/axios.ts` - Axios 설정 (슬라이딩 윈도우 구현)

**Backend (기존 구현, 변경 없음)**:
- `backend/src/main/java/egovframework/com/jwt/EgovJwtTokenUtil.java` - JWT 토큰 생성/검증
- `backend/src/main/java/egovframework/let/uat/uia/web/EgovLoginApiController.java` - 로그인/토큰 갱신 API

---

### JWT Session Management (English Summary)

**Sliding Window Session Approach**: The project uses a sliding window JWT session management to improve user experience.

**Key Features**:
- Token validity: 60 minutes
- Automatic extension: Session time automatically extends with each user activity
- Inactivity timeout: Users are logged out after 60 minutes of inactivity
- Implementation: `tokenIssuedAt` timestamp is updated on every successful API response
- Auto-refresh: New token is issued 5 minutes before expiration
- Refresh token: 7-day validity for access token renewal

**Benefits**:
- Active users remain logged in during work
- Long-running tasks maintain session
- Security maintained with inactivity timeout
- Transparent token refresh in background