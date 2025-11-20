/**
 * 공정 관련 타입 정의
 */

export interface Process {
  processId?: string;
  processCode: string;
  processName: string;
  description?: string;
  processType?: string;
  equipmentIntegrationYn?: string;
  status?: string;
  useYn?: string;
  sortOrder?: number;
}

export interface WorkplaceProcess {
  workplaceProcessId?: string;
  workplaceId: string;
  workplaceCode: string;
  processId: string;
  workplaceName: string;
  processCode?: string;
  processName?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface ProcessDefect {
  processDefectId?: string;
  processId: string;
  processCode: string;
  defectCode: string;
  defectName: string;
  defectType?: string;
  description?: string;
  useYn?: string;
}

export interface ProcessInspection {
  processInspectionId?: string;
  processId: string;
  processCode: string;
  inspectionCode: string;
  inspectionName: string;
  inspectionType?: string;
  standardValue?: string;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  unit?: string;
  description?: string;
  useYn?: string;
}

export interface ProcessStopItem {
  processStopItemId?: string;
  processId: string;
  processCode: string;
  stopItemCode: string;
  stopItemName: string;
  stopType?: string;
  description?: string;
  useYn?: string;
}

export interface ProcessEquipment {
  processEquipmentId?: string;
  processId: string;
  processCode: string;
  equipSysCd: string;
  equipCd?: string;
  equipmentName?: string;
  equipSpec?: string;
  equipStruct?: string;
  description?: string;
  useYn?: string;
}

export interface ProcessSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  status?: string;
  useYn?: string;
  equipmentIntegrationYn?: string;
  pageIndex?: number;
}
