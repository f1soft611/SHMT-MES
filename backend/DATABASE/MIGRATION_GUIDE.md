# 스케쥴러 데이터베이스 마이그레이션 가이드

## 개요
이 문서는 기존 스케쥴러 테이블의 컬럼명을 basedata 패턴에 맞게 변경하는 마이그레이션 절차를 설명합니다.

## 변경 내역

### scheduler_config 테이블
| 기존 컬럼명 | 신규 컬럼명 | 설명 |
|-----------|-----------|------|
| created_date | reg_dt | 등록일시 |
| created_by | reg_user_id | 등록자 ID |
| updated_date | upd_dt | 수정일시 |
| updated_by | upd_user_id | 수정자 ID |

### scheduler_history 테이블
| 기존 컬럼명 | 신규 컬럼명 | 설명 |
|-----------|-----------|------|
| created_date | reg_dt | 등록일시 |

## 마이그레이션 절차

### 1. 신규 설치 (테이블이 없는 경우)

#### MSSQL
```bash
# DDL 실행
sqlcmd -S localhost -U sa -P your_password -d your_database -i scheduler_ddl_mssql.sql

# 샘플 데이터 삽입 (선택사항)
sqlcmd -S localhost -U sa -P your_password -d your_database -i scheduler_sample_data.sql
```

#### MySQL
```bash
# DDL 실행
mysql -u root -p your_database < scheduler_ddl_mysql.sql

# 샘플 데이터 삽입 (선택사항)
mysql -u root -p your_database < scheduler_sample_data.sql
```

### 2. 기존 테이블 업데이트 (마이그레이션)

⚠️ **주의**: 마이그레이션 전 반드시 데이터베이스 백업을 수행하세요!

#### 백업 방법

**MSSQL:**
```sql
-- 전체 데이터베이스 백업
BACKUP DATABASE your_database 
TO DISK = 'C:\Backup\your_database_before_migration.bak';

-- 또는 테이블만 백업
SELECT * INTO scheduler_config_backup FROM scheduler_config;
SELECT * INTO scheduler_history_backup FROM scheduler_history;
```

**MySQL:**
```bash
# 전체 데이터베이스 백업
mysqldump -u root -p your_database > backup_before_migration.sql

# 또는 테이블만 백업
mysqldump -u root -p your_database scheduler_config scheduler_history > scheduler_backup.sql
```

#### 마이그레이션 실행

**MSSQL:**
```bash
sqlcmd -S localhost -U sa -P your_password -d your_database -i scheduler_migration_mssql.sql
```

**MySQL:**
```bash
mysql -u root -p your_database < scheduler_migration_mysql.sql
```

### 3. 마이그레이션 검증

마이그레이션 후 다음 쿼리로 컬럼명이 정상적으로 변경되었는지 확인:

**MSSQL:**
```sql
-- scheduler_config 테이블 구조 확인
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'scheduler_config'
ORDER BY ORDINAL_POSITION;

-- scheduler_history 테이블 구조 확인
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'scheduler_history'
ORDER BY ORDINAL_POSITION;

-- 데이터 확인
SELECT TOP 5 * FROM scheduler_config;
SELECT TOP 5 * FROM scheduler_history;
```

**MySQL:**
```sql
-- scheduler_config 테이블 구조 확인
SHOW COLUMNS FROM scheduler_config;

-- scheduler_history 테이블 구조 확인
SHOW COLUMNS FROM scheduler_history;

-- 데이터 확인
SELECT * FROM scheduler_config LIMIT 5;
SELECT * FROM scheduler_history LIMIT 5;
```

### 4. 애플리케이션 재시작

마이그레이션 완료 후 애플리케이션을 재시작하여 변경사항을 적용합니다:

```bash
# Spring Boot 애플리케이션 재시작
./gradlew bootRun
# 또는
./mvnw spring-boot:run
```

## 롤백 방법

마이그레이션에 문제가 발생한 경우 백업으로 복원:

### MSSQL
```sql
-- 데이터베이스 전체 복원
RESTORE DATABASE your_database 
FROM DISK = 'C:\Backup\your_database_before_migration.bak'
WITH REPLACE;

-- 또는 테이블만 복원
DROP TABLE scheduler_config;
DROP TABLE scheduler_history;
SELECT * INTO scheduler_config FROM scheduler_config_backup;
SELECT * INTO scheduler_history FROM scheduler_history_backup;
```

### MySQL
```bash
# 데이터베이스 전체 복원
mysql -u root -p your_database < backup_before_migration.sql

# 또는 테이블만 복원
mysql -u root -p your_database < scheduler_backup.sql
```

## 주의사항

1. **프로덕션 환경**에서는 반드시 점검 시간에 마이그레이션을 수행하세요.
2. 마이그레이션 중 스케쥴러가 실행되지 않도록 애플리케이션을 중지하세요.
3. 마이그레이션 후 모든 스케쥴러가 정상적으로 동작하는지 확인하세요.
4. 기존 실행 이력 데이터는 그대로 유지됩니다.

## 문제 해결

### 문제 1: 컬럼명 변경 실패
**증상**: "Column does not exist" 에러 발생

**해결 방법**:
1. 현재 컬럼명 확인
2. 마이그레이션 스크립트의 컬럼명이 실제 테이블과 일치하는지 확인
3. 필요시 스크립트 수정 후 재실행

### 문제 2: 외래키 제약조건 에러
**증상**: Foreign key constraint 에러

**해결 방법**:
1. 마이그레이션 전 외래키 제약조건 확인
2. 필요시 제약조건을 임시로 비활성화 후 마이그레이션
3. 마이그레이션 후 제약조건 재활성화

### 문제 3: 애플리케이션 실행 오류
**증상**: 애플리케이션 시작 시 컬럼 매핑 오류

**해결 방법**:
1. Java 모델 클래스의 필드명 확인
2. MyBatis 매퍼 XML의 resultMap 확인
3. 애플리케이션 캐시 클리어 후 재시작

## 참고 자료

- [SCHEDULER_SERVICE_GUIDE.md](../src/main/java/egovframework/let/scheduler/SCHEDULER_SERVICE_GUIDE.md) - 스케쥴러 서비스 등록 가이드
- [IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md) - 전체 구현 명세
