---
name: multi-db-sql-review
description: 'Use when: reviewing MyBatis SQL for multiple DB dialects, checking upsert key consistency, preventing PROD_DATE aggregation bugs, or validating mapper parity across mysql/mssql/oracle/altibase/cubrid/tibero. Triggers on: mybatis review, 멀티db sql, upsert key, prod_date'
---

# Multi-DB SQL Review

MyBatis XML 변경을 멀티 DB 관점에서 빠르게 점검하기 위한 워크플로우입니다.

## 대상

- `backend/src/main/resources/egovframework/mapper/**`
- 동일 도메인의 `_SQL_mysql.xml`, `_SQL_mssql.xml`, `_SQL_oracle.xml` 등 DB별 매퍼

## 점검 절차

1. 같은 기능의 DB별 매퍼 존재 여부 확인
2. SQL Injection 위험 패턴(`${}`) 확인
3. Upsert의 키 일관성(INSERT/COUNT/UPDATE WHERE) 확인
4. 집계 컬럼 기준(`PROD_DATE` vs `PRODPLAN_DATE`) 확인
5. 페이징/NULL/문자열 결합 함수의 DB 방언 적합성 확인

## 필수 체크리스트

- [ ] DB별 매퍼 파일이 동일 기능을 포함한다
- [ ] 사용자 입력은 `#{}` 바인딩을 사용한다 (`${}` 최소화)
- [ ] MSSQL upsert의 조건 키가 INSERT 키와 동일하다
- [ ] 월/일 집계는 요구사항에 맞는 날짜 컬럼을 사용한다
- [ ] 동적 ORDER BY/컬럼명은 화이트리스트 검증이 있다

## SHMT-MES 회귀 위험 포인트

- 생산계획 월별 실적 집계는 `PROD_DATE` 기준
- 생산의뢰 인터페이스 upsert 키 불일치 위험(INSERT/COUNT/UPDATE 키 비교 필수)
- 설비/공정 조인 키(`WORK_CODE + EQUIP_SYS_CD`) 동기화 필요

## 출력 형식

```markdown
## Multi-DB SQL 리뷰 결과

### 파일 범위

- ...

### Critical/High 이슈

- [심각도] 파일:문맥 - 문제 / 영향 / 권고

### DB 방언 호환성

- MSSQL: ...
- MySQL: ...
- Oracle/Tibero/Altibase/Cubrid: ...

### 수정 우선순위 Top 3

1. ...
```
