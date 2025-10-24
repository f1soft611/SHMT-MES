-- 품목 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_ITEM]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_ITEM] (
        [ITEM_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [ITEM_CODE] NVARCHAR(50) NOT NULL,
        [ITEM_NAME] NVARCHAR(100) NOT NULL,
        [ITEM_TYPE] NVARCHAR(20) NOT NULL DEFAULT 'PRODUCT',
        [SPECIFICATION] NVARCHAR(200) NULL,
        [UNIT] NVARCHAR(20) NULL,
        [STOCK_QTY] NVARCHAR(20) NULL DEFAULT '0',
        [SAFETY_STOCK] NVARCHAR(20) NULL DEFAULT '0',
        [REMARK] NVARCHAR(500) NULL,
        [INTERFACE_YN] NCHAR(1) NOT NULL DEFAULT 'N',
        [USE_YN] NCHAR(1) NOT NULL DEFAULT 'Y',
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [UK_ITEM_CODE] UNIQUE ([ITEM_CODE])
    );
END
GO

-- 품목 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_ITEM') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'품목 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_ITEM';
END
GO

-- 컬럼별 설명 추가 (TB_ITEM)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'품목 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'ITEM_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'품목 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'ITEM_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'품목명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'ITEM_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'품목 타입 (PRODUCT/MATERIAL)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'ITEM_TYPE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'규격', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'SPECIFICATION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'단위', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'UNIT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'재고 수량', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'STOCK_QTY';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'안전 재고', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'SAFETY_STOCK';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'비고', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'REMARK';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'인터페이스 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'INTERFACE_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'USE_YN';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'REG_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'REG_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'UPD_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_ITEM', @level2type = N'COLUMN', @level2name = N'UPD_DT';
GO

-- ID 생성을 위한 테이블 데이터 추가 (IDS 테이블이 존재한다고 가정)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- TB_ITEM ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_ITEM')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_ITEM', 1);
    END
END
GO

-- 인덱스 추가 (성능 향상을 위해)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_ITEM') AND name = 'IX_TB_ITEM_TYPE')
BEGIN
    CREATE INDEX IX_TB_ITEM_TYPE ON TB_ITEM (ITEM_TYPE);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_ITEM') AND name = 'IX_TB_ITEM_USE_YN')
BEGIN
    CREATE INDEX IX_TB_ITEM_USE_YN ON TB_ITEM (USE_YN);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_ITEM') AND name = 'IX_TB_ITEM_INTERFACE_YN')
BEGIN
    CREATE INDEX IX_TB_ITEM_INTERFACE_YN ON TB_ITEM (INTERFACE_YN);
END
GO

-- 샘플 데이터 삽입 (테스트용)
IF NOT EXISTS (SELECT 1 FROM TB_ITEM WHERE ITEM_ID = 'ITEM001')
BEGIN
INSERT INTO TB_ITEM (
    ITEM_ID, ITEM_CODE, ITEM_NAME, ITEM_TYPE,
    SPECIFICATION, UNIT, STOCK_QTY, SAFETY_STOCK,
    REMARK, INTERFACE_YN, USE_YN, REG_USER_ID
) VALUES
      ('ITEM001', 'PRD-001', 'A타입 제품', 'PRODUCT', '100x200x50mm', 'EA', '150', '50', 'ERP 연동 품목', 'Y', 'Y', 'socra710'),
      ('ITEM002', 'PRD-002', 'B타입 제품', 'PRODUCT', '150x250x60mm', 'EA', '200', '60', 'ERP 연동 품목', 'Y', 'Y', 'socra710'),
      ('ITEM003', 'MAT-001', '스틸 원자재', 'MATERIAL', 'SS400 10mm', 'KG', '1000', '300', 'ERP 연동 품목', 'Y', 'Y', 'socra710'),
      ('ITEM004', 'MAT-002', '알루미늄 원자재', 'MATERIAL', 'AL6061 5mm', 'KG', '500', '150', 'ERP 연동 품목', 'Y', 'Y', 'socra710'),
      ('ITEM005', 'PRD-003', 'C타입 제품', 'PRODUCT', '200x300x70mm', 'EA', '80', '30', 'MES 전용 품목', 'N', 'Y', 'socra710'),
      ('ITEM006', 'MAT-003', '플라스틱 원자재', 'MATERIAL', 'ABS 3mm', 'KG', '600', '200', 'MES 전용 품목', 'N', 'Y', 'socra710'),
      ('ITEM007', 'PRD-004', 'D타입 제품', 'PRODUCT', '120x180x40mm', 'EA', '120', '40', 'MES 전용 품목', 'N', 'Y', 'socra710'),
      ('ITEM008', 'MAT-004', '고무 원자재', 'MATERIAL', 'NBR 2mm', 'KG', '300', '100', 'MES 전용 품목', 'N', 'Y', 'socra710'),
      ('ITEM009', 'PRD-005', 'E타입 제품', 'PRODUCT', '80x150x30mm', 'EA', '0', '20', '재고 부족 품목', 'N', 'Y', 'socra710'),
      ('ITEM010', 'MAT-005', '구리 원자재', 'MATERIAL', 'CU 99.9% 8mm', 'KG', '250', '80', 'MES 전용 품목', 'N', 'Y', 'socra710');
END
GO
