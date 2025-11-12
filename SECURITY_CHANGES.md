# 🔒 보안 개선 완료 안내

## 변경 사항 요약

이 PR은 공개 저장소에서 민감한 정보를 제거하고, 향후 민감한 정보가 실수로 커밋되는 것을 방지하기 위한 보안 개선 작업입니다.

---

## 🚨 제거된 민감한 정보

### 1. 데이터베이스 접속 정보
- ✅ MES 데이터베이스 IP, 사용자명, 비밀번호
- ✅ ERP 데이터베이스 IP, 사용자명, 비밀번호
- ✅ JWT Secret Key
- ✅ 암호화 알고리즘 키

### 2. 프로덕션 도메인 정보
- ✅ 실제 프로덕션 서버 도메인

### 3. 회사 기밀 문서
- ✅ ERP - MES 인터페이스 정리 v1.xlsx
- ✅ ERP_MES_Interface 정의서_V1.0_250915 (1).xlsx
- ✅ WBS_v1.1_20250901.xlsx
- ✅ SF-AD2 요구사항정의서 (1).hwp

---

## 📝 추가된 파일

### 보안 및 설정 가이드
- **`SECURITY.md`**: 보안 정책 및 가이드라인
- **`문서/로컬_개발_환경_설정.md`**: 로컬 개발 환경 설정 방법
- **`문서/인터페이스/README.md`**: 제거된 문서 접근 방법 안내

### 템플릿 파일
- **`backend/src/main/resources/application.properties.example`**: 백엔드 설정 템플릿
- **`frontend/.env.example`**: 프론트엔드 환경 변수 템플릿

---

## 🔧 개발자가 해야 할 작업

### 기존 개발자 (이미 로컬 환경이 설정된 경우)

1. **최신 코드 받기**
   ```bash
   git pull origin main
   ```

2. **로컬 설정 파일 생성** (아직 없는 경우)
   ```bash
   # 백엔드
   cd backend/src/main/resources
   cp application.properties.example application-local.properties
   # application-local.properties에 실제 값 입력
   
   # 프론트엔드
   cd frontend
   cp .env.example .env.local
   # .env.local에 실제 값 입력
   ```

3. **기존 설정 유지**
   - 이미 로컬에서 작동하는 설정이 있다면 그대로 사용 가능
   - 단, `application.properties`의 민감한 정보는 `application-local.properties`로 이동 필요

### 새로운 개발자

1. **저장소 클론**
   ```bash
   git clone https://github.com/f1soft611/SHMT-MES.git
   cd SHMT-MES
   ```

2. **로컬 환경 설정**
   - [로컬 개발 환경 설정 가이드](문서/로컬_개발_환경_설정.md) 참고
   - 프로젝트 관리자에게 실제 데이터베이스 접속 정보 요청

---

## 🛡️ 향후 커밋 시 주의사항

### `.gitignore`에 추가된 패턴

다음 파일들은 자동으로 Git에서 무시됩니다:

```gitignore
# 환경 변수
.env.*
!.env.example

# 로컬 설정
application-local.properties
application-*.properties
!application.properties.example

# 회사 문서
*.xlsx
*.xls
*.hwp
*.doc
*.docx

# 키 파일
*.key
*.pem
*.p12
*.jks
```

### 커밋 전 체크리스트

- [ ] `git diff --staged`로 변경 내용 확인
- [ ] 실제 데이터베이스 접속 정보가 포함되지 않았는가?
- [ ] API 키나 시크릿이 포함되지 않았는가?
- [ ] 회사 내부 문서가 포함되지 않았는가?
- [ ] 프로덕션 서버 정보가 노출되지 않았는가?

---

## 📋 참고 문서

- **[SECURITY.md](SECURITY.md)**: 전체 보안 정책
- **[로컬 개발 환경 설정](문서/로컬_개발_환경_설정.md)**: 상세 설정 가이드
- **[프로젝트 README](README.md)**: 프로젝트 전체 구조

---

## ❓ FAQ

### Q: 기존에 작동하던 로컬 환경이 안 돌아가요!

A: `application.properties`의 민감한 정보가 제거되었습니다. 다음과 같이 해결하세요:

```bash
cd backend/src/main/resources
cp application.properties.example application-local.properties
# application-local.properties에 실제 데이터베이스 정보 입력
```

그리고 `application.properties`에서 `spring.profiles.active=local`로 설정하세요.

### Q: 실제 데이터베이스 접속 정보는 어디서 얻나요?

A: 프로젝트 관리자나 팀 리더에게 문의하세요. 보안상 공개 저장소나 채팅방에 공유하지 마세요.

### Q: 인터페이스 정의서는 어디서 볼 수 있나요?

A: [문서/인터페이스/README.md](문서/인터페이스/README.md)를 참고하세요. 사내 문서 관리 시스템이나 공유 드라이브에서 접근 가능합니다.

### Q: `.gitignore`에 추가된 파일이 커밋되고 있어요!

A: 이미 Git에 추적 중인 파일은 `.gitignore`로 제거되지 않습니다. 다음 명령으로 제거하세요:

```bash
git rm --cached path/to/file
git commit -m "Remove tracked file"
```

---

## 🔐 보안 사고 발생 시

만약 실수로 민감한 정보를 커밋했다면:

1. **즉시 프로젝트 관리자에게 알림**
2. **해당 시크릿/비밀번호 즉시 변경**
3. Git 히스토리에서 완전 제거 필요 (관리자에게 문의)

---

## 📞 문의

- 프로젝트 관리자: [Contact Info]
- 보안 관련 문의: [Security Contact]
- 기술 지원: GitHub Issues (민감한 정보 제외)

---

**이 변경사항은 프로젝트의 보안을 강화하고, 회사의 기밀 정보를 보호하기 위한 필수적인 조치입니다.**
