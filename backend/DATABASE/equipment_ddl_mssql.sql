-- 설비 관리 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TB_EQUIPMENT]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TB_EQUIPMENT] (
        [EQUIPMENT_ID] NVARCHAR(20) NOT NULL PRIMARY KEY,
        [EQUIP_SYS_CD] NVARCHAR(6) NOT NULL,
        [EQUIP_CD] NVARCHAR(6) NOT NULL,
        [EQUIP_SPEC] NVARCHAR(99) NULL,
        [EQUIP_STRUCT] NVARCHAR(99) NULL,
        [USE_FLAG] NCHAR(1) NOT NULL DEFAULT 'Y',
        [OPTIME] NVARCHAR(12) NULL,
        [MANAGER_CODE] NVARCHAR(10) NULL,
        [MANAGER2_CODE] NVARCHAR(10) NULL,
        [OPMAN_CODE] NVARCHAR(10) NULL,
        [OPMAN2_CODE] NVARCHAR(10) NULL,
        [PLC_ADDRESS] NVARCHAR(18) NULL,
        [LOCATION] NVARCHAR(1000) NULL,
        [STATUS_FLAG] NVARCHAR(1) NOT NULL DEFAULT '1',
        [OPTIME2] NVARCHAR(12) NULL,
        [REMARK] NVARCHAR(18) NULL,
        [EQUIPMENT_NAME] NVARCHAR(18) NULL,
        [CHANGE_DATE] NVARCHAR(8) NULL,
        [REG_USER_ID] NVARCHAR(20) NULL,
        [REG_DT] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UPD_USER_ID] NVARCHAR(20) NULL,
        [UPD_DT] DATETIME2 NULL,
        
        CONSTRAINT [UK_EQUIPMENT_CODE] UNIQUE ([EQUIP_SYS_CD], [EQUIP_CD])
    );
END
GO

-- 설비 테이블에 설명 추가
IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID('TB_EQUIPMENT') AND minor_id = 0)
BEGIN
    EXEC sys.sp_addextendedproperty 
        @name = N'MS_Description', 
        @value = N'설비 정보', 
        @level0type = N'SCHEMA', @level0name = N'dbo', 
        @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT';
END
GO

-- 컬럼별 설명 추가 (TB_EQUIPMENT)
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIPMENT_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'시스템 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIP_SYS_CD';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIP_CD';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비 규격', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIP_SPEC';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비 구조', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIP_STRUCT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'사용 여부 (Y/N)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'USE_FLAG';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'가동 시간', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'OPTIME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'관리자 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'MANAGER_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'부관리자 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'MANAGER2_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'작업자 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'OPMAN_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'부작업자 코드', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'OPMAN2_CODE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'PLC 주소', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'PLC_ADDRESS';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'위치', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'LOCATION';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'상태 플래그', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'STATUS_FLAG';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'가동 시간 2', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'OPTIME2';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'비고', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'REMARK';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'설비명', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'EQUIPMENT_NAME';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'변경 일자 (YYYYMMDD)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'CHANGE_DATE';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'REG_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'등록일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'REG_DT';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정자 ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'UPD_USER_ID';
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'수정일시', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'TB_EQUIPMENT', @level2type = N'COLUMN', @level2name = N'UPD_DT';
GO

-- ID 생성을 위한 테이블 데이터 추가 (IDS 테이블이 존재한다고 가정)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IDS]') AND type in (N'U'))
BEGIN
    -- TB_EQUIPMENT ID 초기화
    IF NOT EXISTS (SELECT 1 FROM IDS WHERE TABLE_NAME = 'TB_EQUIPMENT')
    BEGIN
        INSERT INTO IDS (TABLE_NAME, NEXT_ID) VALUES ('TB_EQUIPMENT', 1);
    END
END
GO

-- 인덱스 추가 (성능 향상을 위해)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_EQUIPMENT') AND name = 'IX_TB_EQUIPMENT_STATUS_FLAG')
BEGIN
    CREATE INDEX IX_TB_EQUIPMENT_STATUS_FLAG ON TB_EQUIPMENT (STATUS_FLAG);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('TB_EQUIPMENT') AND name = 'IX_TB_EQUIPMENT_USE_FLAG')
BEGIN
    CREATE INDEX IX_TB_EQUIPMENT_USE_FLAG ON TB_EQUIPMENT (USE_FLAG);
END
GO

-- 샘플 데이터 삽입
IF NOT EXISTS (SELECT 1 FROM TB_EQUIPMENT WHERE EQUIPMENT_ID = 'EQ001')
BEGIN
INSERT INTO TB_EQUIPMENT (
    EQUIPMENT_ID, EQUIP_SYS_CD, EQUIP_CD, EQUIP_SPEC, EQUIP_STRUCT,
    USE_FLAG, OPTIME, MANAGER_CODE, OPMAN_CODE, PLC_ADDRESS,
    LOCATION, STATUS_FLAG, EQUIPMENT_NAME, REG_USER_ID
) VALUES
      ('EQ001', 'SYS01', 'EQ001', 'Model-A 2023', 'Type-1 구조', 'Y', '0800-1800', 'MGR001', 'OPR001', '192.168.1.100', '1공장 1라인', '1', '조립설비 A', 'socra710'),
      ('EQ002', 'SYS01', 'EQ002', 'Model-B 2023', 'Type-2 구조', 'Y', '0800-1800', 'MGR001', 'OPR002', '192.168.1.101', '1공장 2라인', '1', '조립설비 B', 'socra710'),
      ('EQ003', 'SYS02', 'EQ003', 'Model-C 2022', 'Type-3 구조', 'Y', '0900-1700', 'MGR002', 'OPR003', '192.168.1.102', '2공장 1라인', '1', '용접설비 A', 'socra710'),
      ('EQ004', 'SYS03', 'EQ004', 'Model-D 2023', 'Type-4 구조', 'Y', '0800-2000', 'MGR003', 'OPR004', '192.168.1.103', '3공장 도장라인', '1', '도장설비 A', 'socra710'),
      ('EQ005', 'SYS04', 'EQ005', 'Model-E 2023', 'Type-5 구조', 'N', '0800-1800', 'MGR004', 'OPR005', '192.168.1.104', '품질검사실', '0', '검사설비 A', 'socra710');
END
GO
