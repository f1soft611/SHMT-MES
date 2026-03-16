export interface ProductionDefectRate {
}

// =======================
// [API] 조회 파라미터
// =======================
export interface ProductionDefectRateSearchParams {
    workplace?: string;
    equipment?: string;
    dateFrom: string;   // YYYYMMDD
    dateTo: string;     // YYYYMMDD
    orderFlag?:string;
    page?: number;
    size?: number;
}


// =======================
// [API] 조회 결과 Row
// =======================
export interface ProductionDefectRateRow {
    // === 수주 정보 ===
    orderNo?: string;
    orderSeqNo?: string;
    orderHistNo?: string;
    customerCode?: string;
    customerName?: string;

    // === 기본 키 ===
    factoryCode: string;
    prodplanId: string;
    prodplanDate: string;   // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
    workSeq: number;
    prodSeq: number;

    // === 작업  ===
    workdtDate: string;

    // === 작업장 / 공정 ===
    workcenterCode: string;
    workcenterName: string;

    workCode: string;
    workName: string;

    // === 품목 ===
    itemCode: string;
    itemName: string;

    prodCode: string;
    prodName: string;
    prodSpec: string;

    // === 설비 ===
    equipSysCd: string;
    equipSysCdNm: string;

    // === 수량 ===
    prodQty: number;
    goodQty: number | null;
    badQty: number | null;
    rcvQty: number | null;

    // === 지시 / 상태 ===
    workorderSeq: number | null;
    orderFlag: string;
    bigo: string;

    // === 작업자 / 시간 ===
    opmanCode: string;
    optime: string;
    opmanCode2: string;
    optime2: string;

    // === 참조 ID ===
    tpr601Id: string;
    tpr504Id: string;
}