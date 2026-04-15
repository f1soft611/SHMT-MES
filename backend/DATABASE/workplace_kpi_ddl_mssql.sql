-- =====================================================
-- TPR701 : 작업장별 KPI 원시 데이터
-- 2026-04-15 신규 생성
-- =====================================================

IF OBJECT_ID('dbo.TPR701', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TPR701 (
        KPI_SEQ          INT              IDENTITY(1,1)  NOT NULL,   -- PK
        FACTORY_CODE     NVARCHAR(20)     NOT NULL,                   -- 공장코드
        WORKCENTER_CODE  NVARCHAR(20)     NOT NULL,                   -- 작업장코드
        PROCESS_TYPE     NVARCHAR(10)     NOT NULL DEFAULT '',        -- 공정 구분(MG 등)
        WORK_DATE        NVARCHAR(8)      NOT NULL,                   -- 작업일 (yyyyMMdd)
        WORK_ORDER_NO    NVARCHAR(100)    NOT NULL DEFAULT '',        -- 작업지시번호
        ITEM_NAME        NVARCHAR(200)    NOT NULL DEFAULT '',        -- 품명
        ITEM_CODE        NVARCHAR(100)    NOT NULL DEFAULT '',        -- 품번
        PROD_QTY         DECIMAL(15,3)    NOT NULL DEFAULT 0,         -- 생산수량
        GOOD_QTY         DECIMAL(15,3)    NOT NULL DEFAULT 0,         -- 양품수량
        BAD_QTY          DECIMAL(15,3)    NOT NULL DEFAULT 0,         -- 불량수량
        BAD_RATE         DECIMAL(8,4)     NOT NULL DEFAULT 0,         -- 불량률 (%)
        WORK_TIME        DECIMAL(10,2)    NOT NULL DEFAULT 0,         -- 작업시간 (h)
        QTY_PER_HOUR     DECIMAL(10,2)    NOT NULL DEFAULT 0,         -- 시간당생산량
        REG_DT           NVARCHAR(20)     NOT NULL DEFAULT '',        -- 등록일시
        REG_ID           NVARCHAR(50)     NOT NULL DEFAULT '',        -- 등록자
        CONSTRAINT PK_TPR701 PRIMARY KEY (KPI_SEQ)
    );
END
GO

-- 조회 성능을 위한 인덱스 (작업장 + 작업일)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TPR701_WC_DATE' AND object_id = OBJECT_ID('dbo.TPR701')
)
BEGIN
    CREATE INDEX IX_TPR701_WC_DATE ON dbo.TPR701 (FACTORY_CODE, WORKCENTER_CODE, WORK_DATE);
END
GO
