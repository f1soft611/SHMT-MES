// =====================================================
// 작업장별 KPI 집계 - 타입 정의
// =====================================================

/** 검색 조건 */
export interface WorkplaceKpiSearchParams {
  workcenterCode: string;
  yearMonth: string; // yyyyMM
}

/** 업로드 요청 단건 (엑셀 행 1개) */
export interface WorkplaceKpiReqDTO {
  workcenterCode: string;
  processType: string;
  workDate: string; // yyyyMMdd
  workOrderNo: string;
  itemName: string;
  itemCode: string;
  prodQty: number;
  goodQty: number;
  badQty: number;
  badRate: number;
  workTime: number;
  qtyPerHour: number;
}

/** 로우 데이터 Row */
export interface WorkplaceKpiRow {
  kpiSeq: number;
  factoryCode: string;
  workcenterCode: string;
  processType: string;
  workDate: string;
  workOrderNo: string;
  itemName: string;
  itemCode: string;
  prodQty: number;
  goodQty: number;
  badQty: number;
  badRate: number;
  workTime: number;
  qtyPerHour: number;
  regDt: string;
  regId: string;
}

/** 일별 집계 Row (차트용) */
export interface WorkplaceKpiSummaryRow {
  workDate: string;
  workcenterCode: string;
  processType: string;
  totalProdQty: number;
  totalGoodQty: number;
  totalBadQty: number;
  avgBadRate: number;
  totalWorkTime: number;
  avgQtyPerHour: number;
  rowCount: number;
}
