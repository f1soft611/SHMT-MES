# Security Policy / 보안 정책

## 🔒 보안 지침 (Security Guidelines)

이 문서는 SHMT-MES 프로젝트의 보안 관련 지침을 제공합니다.

---

## ⚠️ 중요: 민감한 정보 관리

### 절대로 Git에 커밋하면 안 되는 것들:

1. **데이터베이스 접속 정보**
   - 호스트 IP 주소
   - 데이터베이스 이름
   - 사용자 이름 및 비밀번호

2. **API 키 및 시크릿**
   - JWT Secret Key
   - 암호화 알고리즘 키
   - OAuth 클라이언트 ID/Secret (Naver, Kakao 등)

3. **회사 기밀 문서**
   - 인터페이스 정의서
   - 요구사항 정의서
   - WBS 문서
   - 내부 기획서

4. **프로덕션 서버 정보**
   - 프로덕션 도메인 및 IP
   - 서버 접속 정보
   - SSL 인증서 및 키 파일

---

## ✅ 안전한 설정 방법

### 1. 로컬 개발 환경 설정

#### 백엔드 (Backend)

1. `application.properties.example` 파일을 복사:
   ```bash
   cd backend/src/main/resources
   cp application.properties.example application-local.properties
   ```

2. `application-local.properties` 파일에 실제 값을 입력:
   ```properties
   # 실제 데이터베이스 정보 입력
   Globals.mssql.Url=jdbc:log4jdbc:sqlserver://YOUR_ACTUAL_HOST:1433;...
   Globals.mssql.UserName=your_actual_username
   Globals.mssql.Password=your_actual_password
   
   # 실제 JWT Secret 입력 (강력한 랜덤 문자열 사용)
   Globals.jwt.secret=your_strong_random_secret_key_here
   ```

3. Spring Profile 설정:
   - `application.properties`에서 `spring.profiles.active=local` 설정

#### 프론트엔드 (Frontend)

1. 환경 파일 복사:
   ```bash
   cd frontend
   cp env.development .env.local
   ```

2. `.env.local` 파일에 로컬 설정 입력:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8080
   REACT_APP_API_TIMEOUT=10000
   REACT_APP_ENV=local
   ```

### 2. 프로덕션 환경 설정

프로덕션 환경에서는 **환경 변수** 또는 **외부 설정 서버**를 사용하세요:

#### 환경 변수 사용 예시:
```bash
export DB_HOST=your_prod_host
export DB_USERNAME=your_prod_user
export DB_PASSWORD=your_prod_password
export JWT_SECRET=your_prod_jwt_secret
```

#### Spring Boot 외부 설정:
```bash
java -jar app.jar \
  --spring.datasource.url=${DB_URL} \
  --spring.datasource.username=${DB_USERNAME} \
  --spring.datasource.password=${DB_PASSWORD}
```

---

## 🛡️ 보안 체크리스트

개발자는 커밋 전에 다음을 확인하세요:

- [ ] 실제 데이터베이스 접속 정보가 포함되어 있지 않은가?
- [ ] 프로덕션 API 키나 시크릿이 포함되어 있지 않은가?
- [ ] 회사 내부 문서가 포함되어 있지 않은가?
- [ ] `.gitignore`에 민감한 파일 패턴이 추가되어 있는가?
- [ ] `application-local.properties` 같은 로컬 설정 파일이 커밋되지 않았는가?

---

## 🔑 강력한 비밀번호 생성

### JWT Secret Key 생성 예시:

#### Linux/Mac:
```bash
openssl rand -base64 64
```

#### Node.js:
```javascript
require('crypto').randomBytes(64).toString('base64')
```

#### Python:
```python
import secrets
secrets.token_urlsafe(64)
```

---

## 📢 보안 취약점 발견 시

보안 취약점을 발견한 경우, 공개적으로 Issue를 생성하지 마시고 직접 프로젝트 관리자에게 연락해 주세요.

---

## 📚 추가 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Best Practices](https://docs.spring.io/spring-security/reference/features/index.html)
- [React Security Best Practices](https://reactjs.org/docs/thinking-in-react.html)

---

## English Summary

### Never Commit:
- Database credentials (host, username, password)
- API keys and secrets (JWT, OAuth)
- Company confidential documents
- Production server information

### Safe Configuration:
- Use `application-local.properties` for local development (not tracked by git)
- Use environment variables for production
- Generate strong random secrets for JWT and encryption keys
- Keep `.gitignore` updated with sensitive file patterns

### Security Checklist Before Commit:
- No real database credentials?
- No production API keys?
- No internal company documents?
- Local config files not included?

If you find a security vulnerability, please contact the project maintainers directly instead of creating a public issue.
