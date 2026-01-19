-- =============================================
-- 생산지시 테이블 DDL (TPR504)
-- Based on ProductionOrder_SQL_mssql.xml mapper
-- =============================================

-- TPR504: 생산지시 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TPR504]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TPR504] (
        -- 기본 키 필드
        [FACTORY_CODE]      NVARCHAR(6) NOT NULL,       -- 공장코드
        [PRODPLAN_DATE]     NVARCHAR(8) NOT NULL,       -- 생산계획일자
        [PRODPLAN_SEQ]      INT NOT NULL,               -- 생산계획순번
        [PRODWORK_SEQ]      INT NOT NULL,               -- 생산작업순번
        [WORK_SEQ]          INT NOT NULL,               -- 작업순번
        
        -- 참조 필드
        [PRODPLAN_ID]       NVARCHAR(20) NULL,          -- 생산계획ID
        [PRODORDER_ID]      NVARCHAR(20) NULL,          -- 생산지시ID
        [WORKORDER_SEQ]     INT NULL,                   -- 작업지시순번
        
        -- 작업 정보
        [WORK_CODE]         NVARCHAR(10) NULL,          -- 작업코드 (공정코드)
        [WORKDT_DATE]       NVARCHAR(8) NULL,           -- 작업일자
        
        -- 품목 정보
        [ITEM_CODE]         NVARCHAR(20) NULL,          -- 품목코드
        [PROD_CODE]         NVARCHAR(20) NULL,          -- 제품코드
        
        -- 설비 정보
        [EQUIP_SYS_CD]      NVARCHAR(10) NULL,          -- 설비시스템코드
        
        -- 상태 및 수량
        [ORDER_FLAG]        NVARCHAR(1) NULL,           -- 지시상태 (O:지시, C:완료)
        [LOT_NO]            NVARCHAR(20) NULL,          -- LOT번호
        [PROD_QTY]          INT NULL,                   -- 생산수량 (지시수량)
        
        -- ERP 연계
        [ERP_SEND_FLAG]     NVARCHAR(1) NULL,           -- ERP전송여부
        [ERP_WORKDT_IDX]    INT NULL,                   -- ERP작업일자인덱스
        
        -- 작업자 정보
        [OPMAN_CODE]        NVARCHAR(10) NULL,          -- 등록작업자코드
        [OPTIME]            DATETIME NULL,              -- 등록시간
        [OPMAN_CODE2]       NVARCHAR(10) NULL,          -- 수정작업자코드
        [OPTIME2]           DATETIME NULL,              -- 수정시간
        
        -- 시스템 필드
        [TPR504ID]          NVARCHAR(20) NULL,          -- 생산지시고유ID
        
        -- Primary Key
        CONSTRAINT [PK_TPR504] PRIMARY KEY CLUSTERED (
            [FACTORY_CODE] ASC,
            [PRODPLAN_DATE] ASC,
            [PRODPLAN_SEQ] ASC,
            [PRODWORK_SEQ] ASC,
            [WORK_SEQ] ASC
        )
    );
    
    PRINT 'Table TPR504 created successfully.';
END
ELSE
BEGIN
    PRINT 'Table TPR504 already exists.';
END
GO

-- 인덱스 생성
-- 생산계획 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR504_PRODPLAN' AND object_id = OBJECT_ID('TPR504'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TPR504_PRODPLAN]
    ON [dbo].[TPR504] ([FACTORY_CODE], [PRODPLAN_DATE], [PRODPLAN_SEQ]);
    
    PRINT 'Index IX_TPR504_PRODPLAN created successfully.';
END
GO

-- 작업일자 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR504_WORKDT' AND object_id = OBJECT_ID('TPR504'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TPR504_WORKDT]
    ON [dbo].[TPR504] ([FACTORY_CODE], [WORKDT_DATE]);
    
    PRINT 'Index IX_TPR504_WORKDT created successfully.';
END
GO

-- 품목 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR504_ITEM' AND object_id = OBJECT_ID('TPR504'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TPR504_ITEM]
    ON [dbo].[TPR504] ([FACTORY_CODE], [ITEM_CODE]);
    
    PRINT 'Index IX_TPR504_ITEM created successfully.';
END
GO

-- 공정 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR504_WORK' AND object_id = OBJECT_ID('TPR504'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TPR504_WORK]
    ON [dbo].[TPR504] ([FACTORY_CODE], [WORK_CODE]);
    
    PRINT 'Index IX_TPR504_WORK created successfully.';
END
GO

-- 지시상태 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TPR504_FLAG' AND object_id = OBJECT_ID('TPR504'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TPR504_FLAG]
    ON [dbo].[TPR504] ([FACTORY_CODE], [ORDER_FLAG]);
    
    PRINT 'Index IX_TPR504_FLAG created successfully.';
END
GO

-- 주석 추가
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'생산지시 테이블 - 생산계획에 대한 실제 생산지시 정보', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'TPR504';
GO

-- =============================================
-- 컬럼 설명
-- =============================================
-- FACTORY_CODE: 공장코드 (항상 '000001')
-- PRODPLAN_DATE: 생산계획일자 (YYYYMMDD)
-- PRODPLAN_SEQ: 생산계획순번
-- PRODWORK_SEQ: 생산작업순번 (계획 내 작업 순서)
-- WORK_SEQ: 작업순번 (생산지시 순번)
-- 
-- PRODPLAN_ID: 생산계획ID (TPR301M 참조)
-- PRODORDER_ID: 생산지시ID (고유 ID)
-- WORKORDER_SEQ: 작업지시순번 (TPR110 참조)
-- 
-- WORK_CODE: 공정코드 (TPR102 참조)
-- WORKDT_DATE: 실제 작업일자
-- ITEM_CODE: 품목코드 (TPR121 참조)
-- PROD_CODE: 제품코드 (BOM TPR112 참조)
-- EQUIP_SYS_CD: 설비코드 (TPR151 참조)
-- 
-- ORDER_FLAG: 지시상태 ('O':지시완료, 'C':작업완료)
-- LOT_NO: LOT번호
-- PROD_QTY: 생산지시수량
-- 
-- ERP_SEND_FLAG: ERP 전송여부
-- ERP_WORKDT_IDX: ERP 작업일자 인덱스
-- 
-- OPMAN_CODE: 등록작업자
-- OPTIME: 등록시간
-- OPMAN_CODE2: 수정작업자
-- OPTIME2: 수정시간
-- 
-- TPR504ID: 생산지시 고유 ID
-- =============================================

-- =============================================
-- 테이블 관계
-- =============================================
-- TPR504 → TPR301M: PRODPLAN_DATE, PRODPLAN_SEQ로 생산계획 참조
-- TPR504 → TPR301: PRODPLAN_DATE, PRODPLAN_SEQ, PRODWORK_SEQ로 생산계획상세 참조
-- TPR504 → TPR601: PRODPLAN_DATE, PRODPLAN_SEQ, WORK_SEQ로 생산실적 참조
-- TPR504 → TPR102: WORK_CODE로 공정마스터 참조
-- TPR504 → TPR121: ITEM_CODE로 품목마스터 참조
-- TPR504 → TPR151: EQUIP_SYS_CD로 설비마스터 참조
-- 
-- 주의: TPR504에는 WORK_ORDER 컬럼이 없음
--       작업지시(TPR110)와 연결하려면 TPR301 → TPR112 → TPR110 경로 필요
-- =============================================
