export interface ProductionDefectRate {}

// =======================
// [API] 조회 파라미터
// =======================
export interface ProductionDefectRateSearchParams {
  workplace?: string;
  equipment?: string;
  defectCode?: string;
  dateFrom: string; // 작업지시일 From (YYYY-MM-DD)
  dateTo: string; // 작업지시일 To (YYYY-MM-DD)
  completeFrom?: string; // 작업완료일 From (YYYY-MM-DD)
  completeTo?: string; // 작업완료일 To (YYYY-MM-DD)
  orderFlag?: string;
  page?: number;
  size?: number;
}

// =======================
// [API] 조회 결과 Row
// =======================
export interface ProductionDefectRateRow {
  // === 수주 정보 ===
  orderNo?: string;
  customerCode?: string;
  customerName?: string;
  orderQty?: number;

  // === 기본 키 ===
  factoryCode: string;
  prodplanDate: string; // YYYYMMDD
  prodplanSeq: number;
  prodworkSeq: number;
  workSeq: number;
  prodSeq?: number;

  // === 작업  ===
  workDtDate?: string;

  workCode: string;
  workName?: string;

  // === 품목 ===
  itemCode?: string;
  itemName?: string;
  itemSpec?: string;
  prodItemCode?: string;
  prodItemName?: string;
  prodItemSpec?: string;

  // === 수량 ===
  workQty?: number;
  prodQty?: number;
  goodQty?: number | null;
  badQty?: number | null;
  qcQty?: number | null;

  // === 계산값 ===
  remainQty?: number;
  rate?: number;
  defectRate?: number;
  defectRateTotal?: number;

  // === 불량 상세 ===
  badSeq?: number;
  qcCode?: string;
  qcName?: string;

  // === 참조 ID ===
  tpr601Id?: string;
  tpr504Id?: string;
}
