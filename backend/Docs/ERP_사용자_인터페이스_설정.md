# ERP 사원정보 인터페이스 설정 가이드

## 개요
ERP 시스템의 사원 정보를 MES 시스템으로 자동 동기화하는 스케쥴러 서비스입니다.

## 구성 요소

### 1. 서비스 클래스
- **ErpToMesUserInterfaceService**: 인터페이스
- **ErpToMesUserInterfaceServiceImpl**: 구현체
  - ERP 데이터베이스에서 사원 정보 조회 (JdbcTemplate 사용)
  - MES 데이터베이스에 사원 정보 등록/업데이트 (MyBatis 사용)

### 2. 도메인 모델
- **ErpEmployee**: ERP 사원 정보 DTO
  - ERP의 `SHM_IF_VIEW_TDAEmp` 뷰 테이블 구조 매핑

### 3. DAO/Mapper
- **MesUserInterfaceDAO**: MES 사용자 테이블 접근 인터페이스
- **MesUserInterface_SQL_mssql.xml**: MyBatis 매퍼 XML

### 4. 데이터소스 설정
- **EgovConfigAppErpDatasource**: ERP 전용 데이터소스 설정
  - ERP 데이터베이스 연결 (읽기 전용)
  - JdbcTemplate 빈 생성

## 데이터베이스 설정

### application.properties 설정
```properties
# ERP 데이터베이스 연동용
Globals.erp.DriverClassName=net.sf.log4jdbc.DriverSpy
Globals.erp.Url=jdbc:log4jdbc:sqlserver://123.123.123.123:1433;databaseName=SHMTEST;encrypt=true;trustServerCertificate=true
Globals.erp.UserName=test
Globals.erp.Password=test
```

**중요**: 실제 운영 환경에서는 아이디와 비밀번호를 보안에 맞게 설정하세요.

## 스케쥴러 등록

### 스케쥴러 설정 정보
- **스케쥴러명**: ERP 사원정보 I/F
- **설명**: ERP에서 사원정보를 인터페이스 한다. 재직자만 가져온다.
- **CRON 표현식**: `0 */30 * * * *` (30분마다 실행)
- **작업 클래스명**: `egovframework.let.scheduler.service.ErpToMesUserInterfaceService`

### 등록 방법
1. 스케쥴러 관리 화면 접속
2. 신규 등록 버튼 클릭
3. 위 정보 입력
4. 활성화 상태로 저장

## 동작 방식

### 1. ERP 데이터 조회
- ERP 데이터베이스의 `SHM_IF_VIEW_TDAEmp` 뷰에서 재직자(TypeSeq=0) 정보 조회
- JdbcTemplate을 사용하여 직접 SQL 쿼리 실행

### 2. MES 데이터 동기화
각 사원에 대해:
- MES_USER_INFO 테이블에 존재 여부 확인
- 신규 사원: INSERT 실행
- 기존 사원: UPDATE 실행

### 3. 사용자 권한 설정
- **권한**: 일반사용자 (EMPLYR_STTUS_CODE = 'P')
- **그룹**: 기본 그룹 (GROUP_ID = 'GROUP_00000000000000')
- **조직**: 기본 조직 (ORGNZT_ID = 'ORGNZT_0000000000000')

## 매핑 정보

### ERP → MES 필드 매핑
| ERP 필드 (SHM_IF_VIEW_TDAEmp) | MES 필드 (MES_USER_INFO) | 설명 |
|-------------------------------|--------------------------|------|
| EmpSeq | ESNTL_ID | 'USR_' + EmpSeq 형식 |
| EmpId | EMPLYR_ID | 사원번호 (로그인 ID) |
| EmpName | USER_NM | 사원명 |
| Email | EMAIL_ADRES | 이메일 주소 |
| TypeSeq | EMPLYR_STTUS_CODE | 0:재직(P), 1:퇴직(D) |

## 로그 확인
```
=== ERP 사원정보 연동 시작 ===
ERP 시스템(SHM_IF_VIEW_TDAEmp)에서 사원 데이터 조회 시작
ERP 사원 데이터 조회 완료: XX건
신규 사원 등록: 홍길동 (E001)
기존 사원 업데이트: 김철수 (E002)
=== ERP 사원정보 연동 완료 ===
총 처리: XX건, 신규등록: XX건, 업데이트: XX건, 오류: XX건
```

## 주의사항
1. ERP 데이터베이스는 읽기 전용으로 접근합니다
2. 재직자(TypeSeq=0)만 동기화되며, 퇴직자는 기존 데이터만 업데이트됩니다
3. 비밀번호는 기본값으로 설정되므로, 사용자는 최초 로그인 후 변경해야 합니다
4. 30분마다 자동 실행되므로 데이터베이스 부하를 고려하세요

## 트러블슈팅

### ERP 데이터베이스 연결 실패
- application.properties의 ERP 데이터베이스 접속 정보 확인
- 네트워크 방화벽 설정 확인
- 데이터베이스 계정 권한 확인

### 사원 정보 동기화 실패
- MES_USER_INFO 테이블 스키마 확인
- 로그에서 상세 오류 메시지 확인
- 필수 필드 누락 여부 확인

## 확장 가능성
- 부서 정보 동기화 기능 추가 가능
- 직급/직책 정보 동기화 기능 추가 가능
- 실시간 웹훅 방식으로 변경 가능
