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
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface ProcessWorkplace {
  processWorkplaceId?: string;
  processId: string;
  workplaceId: string;
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
  defectCode: string;
  defectName: string;
  defectType?: string;
  description?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface ProcessInspection {
  processInspectionId?: string;
  processId: string;
  inspectionCode: string;
  inspectionName: string;
  inspectionType?: string;
  standardValue?: string;
  upperLimit?: number;
  lowerLimit?: number;
  unit?: string;
  description?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface ProcessSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  status?: string;
  useYn?: string;
  equipmentIntegrationYn?: string;
  pageIndex?: number;
}
