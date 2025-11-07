# 미사용 서비스 문서화 (Unused Services Documentation)

## 개요

이 문서는 현재 SHMT-MES 프로젝트에 구현되어 있지만, 프론트엔드에서 활발히 사용되지 않는 백엔드 서비스들을 정리한 문서입니다. 이러한 서비스들은 eGovFramework의 표준 컴포넌트로, 필요 시 활성화하여 사용할 수 있습니다.

---

## 📋 목차

- [게시판 관리 서비스 (BBS Management)](#게시판-관리-서비스-bbs-management)
- [개인 일정 관리 서비스 (Individual Schedule)](#개인-일정-관리-서비스-individual-schedule)
- [SNS 로그인 서비스 (SNS Login)](#sns-로그인-서비스-sns-login)
- [파일 관리 서비스 (File Management)](#파일-관리-서비스-file-management)
- [사이트 관리 서비스 (Site Management)](#사이트-관리-서비스-site-management)
- [활성화 가이드](#활성화-가이드)

---

## 게시판 관리 서비스 (BBS Management)

### 개요
전자정부 표준프레임워크의 게시판 관리 기능으로, 공지사항, 게시판, 방명록 등의 기능을 제공합니다.

### 위치
```
backend/src/main/java/egovframework/let/cop/bbs/
├── service/
│   ├── EgovBBSManageService.java              # 게시물 관리 서비스
│   ├── EgovBBSAttributeManageService.java     # 게시판 속성 관리 서비스
│   ├── EgovBBSLoneMasterService.java          # 게시판 마스터 관리 서비스
│   └── impl/                                  # 구현체
├── controller/
│   ├── EgovBBSManageApiController.java        # 게시물 API
│   └── EgovBBSAttributeManageApiController.java # 게시판 속성 API
└── domain/                                     # VO 및 DAO
```

### 주요 기능

#### 1. 게시판 마스터 관리
- 게시판 생성, 수정, 삭제
- 게시판 유형 설정 (일반, 공지, 갤러리 등)
- 게시판 권한 설정

#### 2. 게시물 관리
- 게시물 CRUD
- 답글 기능
- 파일 첨부
- 조회수 관리

#### 3. 방명록 기능
- 방명록 작성
- 비밀번호 보호
- 관리자 답변

### API 엔드포인트

```java
// 게시판 마스터 API
GET    /api/bbs/master/{bbsId}              # 게시판 정보 조회
POST   /api/bbs/master                      # 게시판 생성
PUT    /api/bbs/master/{bbsId}              # 게시판 수정
DELETE /api/bbs/master/{bbsId}              # 게시판 삭제

// 게시물 API
GET    /api/bbs/{bbsId}/articles            # 게시물 목록
GET    /api/bbs/{bbsId}/articles/{nttId}    # 게시물 상세
POST   /api/bbs/{bbsId}/articles            # 게시물 등록
PUT    /api/bbs/{bbsId}/articles/{nttId}    # 게시물 수정
DELETE /api/bbs/{bbsId}/articles/{nttId}    # 게시물 삭제
```

### 데이터베이스 테이블

```sql
-- 게시판 마스터
COMTNBBSMST (
    BBS_ID VARCHAR(20) PRIMARY KEY,          -- 게시판 ID
    BBS_NM VARCHAR(255),                     -- 게시판명
    BBS_TY_CODE CHAR(6),                     -- 게시판 유형
    BBS_INTRCN VARCHAR(2400),                -- 게시판 소개
    REPLY_POSBL_AT CHAR(1),                  -- 답글 가능 여부
    FILE_ATCH_POSBL_AT CHAR(1),              -- 파일첨부 가능 여부
    ...
)

-- 게시물
COMTNBBS (
    NTT_ID NUMERIC(20) PRIMARY KEY,          -- 게시물 ID
    BBS_ID VARCHAR(20),                      -- 게시판 ID
    NTT_SJ VARCHAR(2000),                    -- 제목
    NTT_CN CLOB,                             -- 내용
    NTCR_ID VARCHAR(20),                     -- 작성자 ID
    NTCR_NM VARCHAR(20),                     -- 작성자명
    RDCNT NUMERIC(10),                       -- 조회수
    ...
)
```

### 활성화 방법

#### 1. 프론트엔드 페이지 생성
```typescript
// src/pages/Board/BoardList.tsx
import React, { useEffect, useState } from 'react';
import { boardService } from '../../services/boardService';
import { Board } from '../../types/board';

const BoardList: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    const response = await boardService.getBoardList('BBSMSTR_000000000001');
    setBoards(response.result.resultList);
  };

  return (
    <div>
      <h1>게시판</h1>
      {/* 게시판 목록 렌더링 */}
    </div>
  );
};

export default BoardList;
```

#### 2. 서비스 레이어 생성
```typescript
// src/services/boardService.ts
import apiClient from './api';

export const boardService = {
  // 게시물 목록 조회
  getBoardList: async (bbsId: string, page: number = 0, pageSize: number = 10) => {
    const response = await apiClient.get(`/api/bbs/${bbsId}/articles`, {
      params: { pageIndex: page + 1, pageUnit: pageSize }
    });
    return response.data;
  },

  // 게시물 상세 조회
  getBoardDetail: async (bbsId: string, nttId: string) => {
    const response = await apiClient.get(`/api/bbs/${bbsId}/articles/${nttId}`);
    return response.data;
  },

  // 게시물 등록
  createBoard: async (bbsId: string, data: any) => {
    const response = await apiClient.post(`/api/bbs/${bbsId}/articles`, data);
    return response.data;
  },
};
```

#### 3. 라우트 추가
```typescript
// src/App.tsx
<Route path="/board" element={<BoardList />} />
<Route path="/board/:nttId" element={<BoardDetail />} />
```

---

## 개인 일정 관리 서비스 (Individual Schedule)

### 개요
사용자별 개인 일정을 관리하는 서비스입니다. 캘린더 형식으로 일정 등록, 조회, 수정, 삭제가 가능합니다.

### 위치
```
backend/src/main/java/egovframework/let/cop/smt/sim/
├── service/
│   ├── EgovIndvdlSchdulManageService.java     # 일정 관리 서비스
│   ├── IndvdlSchdulManageVO.java              # 일정 VO
│   └── impl/
│       └── EgovIndvdlSchdulManageServiceImpl.java
├── web/
│   └── EgovIndvdlSchdulManageApiController.java
```

### 주요 기능

#### 1. 일정 관리
- 일정 등록, 수정, 삭제
- 일정 목록 조회
- 일정 상세 조회
- 날짜별 일정 조회

#### 2. 일정 유형
- 개인 일정
- 업무 일정
- 회의 일정
- 기타 일정

### API 엔드포인트

```java
GET    /api/schedule                          # 일정 목록 조회
GET    /api/schedule/{schdulId}               # 일정 상세 조회
POST   /api/schedule                          # 일정 등록
PUT    /api/schedule/{schdulId}               # 일정 수정
DELETE /api/schedule/{schdulId}               # 일정 삭제
GET    /api/schedule/month                    # 월별 일정 조회
GET    /api/schedule/week                     # 주별 일정 조회
```

### 데이터베이스 테이블

```sql
COMTNINDVDLSCHDULMANAGE (
    SCHDL_ID VARCHAR(20) PRIMARY KEY,         -- 일정 ID
    SCHDL_NM VARCHAR(255),                    -- 일정명
    SCHDL_SE VARCHAR(1),                      -- 일정 구분
    SCHDL_BEGIN_DATE VARCHAR(8),             -- 일정 시작일
    SCHDL_BEGIN_TIME VARCHAR(6),             -- 일정 시작시간
    SCHDL_END_DATE VARCHAR(8),               -- 일정 종료일
    SCHDL_END_TIME VARCHAR(6),               -- 일정 종료시간
    SCHDL_CN VARCHAR(2500),                  -- 일정 내용
    SCHDL_PLACE VARCHAR(255),                -- 일정 장소
    ATCH_FILE_ID VARCHAR(20),                -- 첨부파일 ID
    REPT_AT CHAR(1),                         -- 반복 여부
    REPT_SE VARCHAR(1),                      -- 반복 구분
    ...
)
```

### 활성화 방법

#### 1. 프론트엔드 타입 정의
```typescript
// src/types/schedule.ts
export interface Schedule {
  schdlId: string;
  schdlNm: string;
  schdlSe: 'P' | 'W' | 'M' | 'O'; // Personal, Work, Meeting, Other
  schdlBeginDate: string;
  schdlBeginTime: string;
  schdlEndDate: string;
  schdlEndTime: string;
  schdlCn?: string;
  schdlPlace?: string;
  reptAt?: 'Y' | 'N';
}
```

#### 2. 서비스 레이어
```typescript
// src/services/scheduleService.ts
import apiClient from './api';
import { Schedule } from '../types/schedule';

export const scheduleService = {
  getScheduleList: async (params?: any) => {
    const response = await apiClient.get('/api/schedule', { params });
    return response.data;
  },

  getMonthlySchedule: async (year: number, month: number) => {
    const response = await apiClient.get('/api/schedule/month', {
      params: { searchYear: year, searchMonth: month }
    });
    return response.data;
  },

  createSchedule: async (schedule: Schedule) => {
    const response = await apiClient.post('/api/schedule', schedule);
    return response.data;
  },
};
```

#### 3. 캘린더 컴포넌트 예제
```typescript
// src/pages/Schedule/ScheduleCalendar.tsx
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-big-calendar';
import { scheduleService } from '../../services/scheduleService';

const ScheduleCalendar: React.FC = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const response = await scheduleService.getScheduleList();
    setEvents(response.result.resultList);
  };

  return (
    <div>
      <h1>일정 관리</h1>
      {/* Calendar Component */}
    </div>
  );
};
```

---

## SNS 로그인 서비스 (SNS Login)

### 개요
네이버, 카카오 등의 SNS 계정을 통한 소셜 로그인 기능을 제공합니다.

### 위치
```
backend/src/main/java/egovframework/com/sns/
├── SnsLoginApiController.java                # SNS 로그인 컨트롤러
├── SnsVO.java                                # SNS VO
└── SnsUtils.java                             # SNS 유틸리티
```

### 주요 기능

#### 1. 네이버 로그인
- OAuth 2.0 인증
- 네이버 프로필 정보 조회
- 회원 연동

#### 2. 카카오 로그인
- OAuth 2.0 인증
- 카카오 프로필 정보 조회
- 회원 연동

### API 엔드포인트

```java
// 네이버 로그인
GET  /auth/naver/login                        # 네이버 로그인 URL 생성
GET  /auth/naver/callback                     # 네이버 로그인 콜백
GET  /auth/naver/profile                      # 네이버 프로필 조회

// 카카오 로그인
GET  /auth/kakao/login                        # 카카오 로그인 URL 생성
GET  /auth/kakao/callback                     # 카카오 로그인 콜백
GET  /auth/kakao/profile                      # 카카오 프로필 조회
```

### 설정 방법

#### 1. 네이버 개발자 센터 설정
```properties
# application.properties
naver.client.id=YOUR_CLIENT_ID
naver.client.secret=YOUR_CLIENT_SECRET
naver.redirect.uri=http://localhost:8080/auth/naver/callback
```

#### 2. 카카오 개발자 센터 설정
```properties
# application.properties
kakao.client.id=YOUR_CLIENT_ID
kakao.client.secret=YOUR_CLIENT_SECRET
kakao.redirect.uri=http://localhost:8080/auth/kakao/callback
```

### 활성화 방법

#### 1. 프론트엔드 로그인 버튼
```typescript
// src/pages/Login/Login.tsx
import React from 'react';

const Login: React.FC = () => {
  const handleNaverLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/naver/login`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/kakao/login`;
  };

  return (
    <div>
      <h1>로그인</h1>
      <button onClick={handleNaverLogin}>네이버 로그인</button>
      <button onClick={handleKakaoLogin}>카카오 로그인</button>
    </div>
  );
};
```

#### 2. 콜백 처리
```typescript
// src/pages/Login/SnsCallback.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SnsCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('jToken', token);
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  return <div>로그인 처리중...</div>;
};
```

---

## 파일 관리 서비스 (File Management)

### 개요
파일 업로드, 다운로드, 삭제 등의 파일 관리 기능을 제공합니다.

### 위치
```
backend/src/main/java/egovframework/com/cmm/
├── service/
│   ├── EgovFileMngService.java               # 파일 관리 서비스
│   └── impl/
│       └── EgovFileMngServiceImpl.java
├── web/
│   ├── EgovFileMngApiController.java         # 파일 API
│   ├── EgovFileDownloadController.java       # 파일 다운로드
│   └── EgovImageProcessController.java       # 이미지 처리
```

### 주요 기능

#### 1. 파일 업로드
- 단일 파일 업로드
- 다중 파일 업로드
- 파일 크기 제한
- 파일 유형 제한

#### 2. 파일 다운로드
- 파일 다운로드
- 이미지 미리보기
- 썸네일 생성

#### 3. 파일 관리
- 파일 목록 조회
- 파일 삭제
- 첨부파일 ID 관리

### API 엔드포인트

```java
POST   /api/file/upload                       # 파일 업로드
GET    /api/file/{atchFileId}                 # 파일 목록 조회
GET    /cmm/fms/FileDown.do                   # 파일 다운로드
DELETE /api/file/{atchFileId}/{fileSn}        # 파일 삭제
GET    /cmm/fms/getImage.do                   # 이미지 조회
```

### 데이터베이스 테이블

```sql
-- 파일 마스터
COMTNFILE (
    ATCH_FILE_ID VARCHAR(20) PRIMARY KEY,     -- 첨부파일 ID
    CREAT_DT VARCHAR(20),                     -- 생성일시
    USE_AT CHAR(1)                            -- 사용여부
)

-- 파일 상세
COMTNFILEDETAIL (
    ATCH_FILE_ID VARCHAR(20),                 -- 첨부파일 ID
    FILE_SN NUMERIC(10),                      -- 파일 순번
    FILE_STRE_COURS VARCHAR(2000),            -- 파일 저장 경로
    STRE_FILE_NM VARCHAR(255),                -- 저장 파일명
    ORIGNL_FILE_NM VARCHAR(255),              -- 원본 파일명
    FILE_EXTSN VARCHAR(20),                   -- 파일 확장자
    FILE_CN CLOB,                             -- 파일 내용
    FILE_SIZE NUMERIC(8),                     -- 파일 크기
    PRIMARY KEY (ATCH_FILE_ID, FILE_SN)
)
```

### 활성화 방법

#### 1. 프론트엔드 파일 업로드 컴포넌트
```typescript
// src/components/common/FileUpload/FileUpload.tsx
import React, { useState } from 'react';
import { fileService } from '../../../services/fileService';

interface FileUploadProps {
  onFileUploaded?: (atchFileId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fileService.uploadFiles(formData);
    if (response.resultCode === 200 && onFileUploaded) {
      onFileUploaded(response.result.atchFileId);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
};

export default FileUpload;
```

#### 2. 파일 서비스
```typescript
// src/services/fileService.ts
import apiClient from './api';

export const fileService = {
  uploadFiles: async (formData: FormData) => {
    const response = await apiClient.post('/api/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getFileList: async (atchFileId: string) => {
    const response = await apiClient.get(`/api/file/${atchFileId}`);
    return response.data;
  },

  downloadFile: (atchFileId: string, fileSn: number) => {
    window.open(
      `${process.env.REACT_APP_API_BASE_URL}/cmm/fms/FileDown.do?atchFileId=${atchFileId}&fileSn=${fileSn}`,
      '_blank'
    );
  },
};
```

---

## 사이트 관리 서비스 (Site Management)

### 개요
사이트 정보, 메뉴, 관련 사이트 등을 관리하는 서비스입니다.

### 위치
```
backend/src/main/java/egovframework/let/uat/esm/
├── service/
│   ├── EgovSiteManagerService.java           # 사이트 관리 서비스
│   └── impl/
│       └── EgovSiteManagerServiceImpl.java
├── web/
│   └── EgovSiteManagerApiController.java
```

### 주요 기능

#### 1. 사이트 정보 관리
- 사이트 정보 등록, 수정, 삭제
- 사이트 목록 조회

#### 2. 메뉴 관리
- 메뉴 구조 관리
- 메뉴 권한 설정

### API 엔드포인트

```java
GET    /api/site                              # 사이트 목록 조회
GET    /api/site/{siteId}                     # 사이트 상세 조회
POST   /api/site                              # 사이트 등록
PUT    /api/site/{siteId}                     # 사이트 수정
DELETE /api/site/{siteId}                     # 사이트 삭제
```

---

## 활성화 가이드

### 단계별 활성화 프로세스

#### Step 1: 요구사항 확인
```markdown
1. 어떤 서비스가 필요한가?
2. 어떤 기능이 필요한가?
3. 데이터 모델 확인
```

#### Step 2: 백엔드 확인
```bash
# 1. 서비스 클래스 확인
cd backend/src/main/java/egovframework/let/

# 2. API 컨트롤러 확인
# 3. MyBatis Mapper 확인
# 4. Swagger에서 API 테스트
```

#### Step 3: 프론트엔드 개발
```bash
# 1. 타입 정의
cd frontend/src/types/

# 2. 서비스 레이어 작성
cd frontend/src/services/

# 3. 페이지 컴포넌트 작성
cd frontend/src/pages/

# 4. 라우트 추가
```

#### Step 4: 테스트
```bash
# 1. 백엔드 API 테스트 (Swagger)
# 2. 프론트엔드 통합 테스트
# 3. 권한 테스트
```

### 활성화 체크리스트

- [ ] 데이터베이스 테이블 확인
- [ ] 백엔드 API 동작 확인
- [ ] TypeScript 타입 정의
- [ ] 서비스 레이어 작성
- [ ] 페이지 컴포넌트 작성
- [ ] 라우트 추가
- [ ] 메뉴 추가
- [ ] 권한 설정
- [ ] 테스트 완료
- [ ] 문서 업데이트

---

## 참고 자료

### 관련 문서
- [백엔드 개발 가이드](./BACKEND_DEVELOPMENT_GUIDE.md)
- [프론트엔드 개발 가이드](./FRONTEND_DEVELOPMENT_GUIDE.md)
- [통합 개발 워크플로우](./DEVELOPMENT_WORKFLOW.md)

### eGovFramework 공식 문서
- [전자정부 표준프레임워크](https://www.egovframe.go.kr/)
- [공통컴포넌트 가이드](https://www.egovframe.go.kr/wiki/doku.php?id=egovframework:com:v4)

---

## 💡 활성화 우선순위 제안

### 높은 우선순위
1. **파일 관리 서비스**: 대부분의 기능에서 파일 첨부가 필요
2. **게시판 서비스**: 공지사항, 문서 공유 등에 활용

### 중간 우선순위
3. **개인 일정 관리**: 생산 일정과 연동하여 활용 가능
4. **사이트 관리**: 메뉴 구조 변경 시 활용

### 낮은 우선순위
5. **SNS 로그인**: 외부 사용자 접근이 필요한 경우

---

## 🔄 업데이트 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2025-01-07 | 1.0 | 초기 문서 작성 | GitHub Copilot |

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-07  
**작성자**: GitHub Copilot  
**문서 관리자**: 개발팀

---

## 📞 문의

미사용 서비스 활성화에 대한 문의나 지원이 필요하신 경우:

- **이메일**: dev-team@example.com
- **Slack**: #dev-support
- **GitHub Issues**: [프로젝트 Issues](https://github.com/f1soft611/SHMT-MES/issues)

**Happy Coding! 🚀**
