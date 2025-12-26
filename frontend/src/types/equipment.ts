/**
 * 설비 관련 타입 정의
 */

export interface Equipment {
  equipmentId?: string;
  equipSysCd?: string;
  equipCd: string;
  equipSpec?: string;
  equipStruct?: string;
  useFlag?: string;
  optime?: string;
  managerCode?: string;
  manager2Code?: string;
  opmanCode?: string;
  opman2Code?: string;
  plcAddress?: string;
  location?: string;
  statusFlag?: string;
  optime2?: string;
  remark?: string;
  equipmentName?: string;
  changeDate?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface EquipmentSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  statusFlag?: string;
  useFlag?: string;
  pageIndex?: number;
  pageUnit?: number;
}


/**
 * 요약 설비 타입
 */
export interface EquipmentInfo {
  EQUIP_SYS_CD?: string;
  EQUIPMENT_NAME?: string;
  WORKCENTER_CODE: string;
  WORKCENTER_NAME?: string;
  WORK_CODE?: string;
  WORK_NAME?: string;
}