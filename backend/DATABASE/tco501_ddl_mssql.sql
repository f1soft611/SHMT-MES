-- MES 제품별공정별소요자재 테이블 (TCO501) 생성 스크립트 (MSSQL)
-- 모든 컬럼은 대문자+스네이크케이스로 작성

CREATE TABLE TCO501 (
    COMPANY_SEQ           INT            NOT NULL, -- 법인코드
    ITEM_SEQ              INT            NOT NULL, -- 품목코드
    BOM_REV               NCHAR(2)       NOT NULL, -- BOM차수
    PROC_REV              NCHAR(2)       NOT NULL, -- 공정차수
    PROC_SEQ              INT            NOT NULL, -- 공정코드
    SERL                  INT            NOT NULL, -- 순번
    MAT_ITEM_SEQ          INT            NULL,     -- 자재코드
    UNIT_SEQ              INT            NULL,     -- 단위코드
    NEED_QTY_NUMERATOR    DECIMAL(19,5)  NULL,     -- 소요량분자
    NEED_QTY_DENOMINATOR  DECIMAL(19,5)  NULL,     -- 소요량분모
    SM_DELV_TYPE          INT            NULL,     -- 조달구분코드
    UPPER_ITEM_SEQ        INT            NULL,     -- 상위품목코드
    UPPER_BOM_REV         NCHAR(2)       NULL,     -- 상위BOM차수
    BOM_ITEM_SERL         INT            NULL,     -- 순번
    LAST_USER_SEQ         INT            NULL,     -- 최종수정자내부코드
    LAST_DATE_TIME        DATETIME       NULL,     -- 최종수정일시
    CONSTRAINT PK_TCO501 PRIMARY KEY (COMPANY_SEQ, ITEM_SEQ, BOM_REV, PROC_REV, PROC_SEQ, SERL)
);
