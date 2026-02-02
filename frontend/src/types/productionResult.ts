/**
 * 생산실적 타입 정의
 */
export interface ProdResultOrderRow {
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

    // === 작업자 / 시간 ===
    opmanCode: string;
    optime: string;
    opmanCode2: string;
    optime2: string;

    // === 참조 ID ===
    tpr601Id: string;
    tpr504Id: string;
}

/**
 * 생산실적 Detail Row
 */
export interface ProductionResultDetail {

    // === PK / FK ===
    factoryCode: string;
    prodplanDate: string;   // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
    workSeq: number;
    prodSeq: number;

    // === 기준 정보 ===
    itemCode: string;
    workCode: string;
    orderFlag?: string;


    workdtDate: string; // 작업시작예정일

    // === 작업 시간 ===
    prodStime: string;
    prodEtime: string;

    // === 수량 ===
    prodQty: number;
    goodQty: number | null;
    badQty: number | null;
    rcvQty: number | null;

    // === 지시 / 연동 ===
    workorderSeq: number | null;
    erpSendFlag: string | null;
    erpRsltIdx: number | null;

    worker: string[] | string;
    inputMaterial: string;

    // === 작업자 / 시간 ===
    opmanCode: string;
    optime: string;
    opmanCode2: string | null;
    optime2: string | null;

    // === 참조 ID ===
    tpr601Id: string;
    tpr504Id: string;
    prodplanId: string;

    // === 프론트 전용 (선택)
    id?: string;
    __isModified?: boolean;

}

/**
 *
 */
export interface ProductionResultMaterial {

}


/**
 * 생산실적 작업지시 조회 검색 조건
 * (/api/production-results/orders)
 */
export interface ProductionResultSearchParams {
    // 기간
    dateFrom?: string;   // YYYYMMDD
    dateTo?: string;     // YYYYMMDD

    // 작업장 / 설비
    workplace?: string;  // WORKCENTER_CODE
    equipment?: string;  // EQUIP_SYS_CD

    // 키워드 (품목명, 공정명, 설비명, 계획ID 등 서버에서 통합 처리)
    keyword?: string;

    // 페이징 (컨트롤러에서 offset 계산)
    page?: number;
    size?: number;
}

export interface ProductionResultSearchForm {
    workplace: string;
    equipment: string;
    dateFrom: string;
    dateTo: string;
    keyword: string;
}

/**
 * 생산실적
 */
export interface ProdResultRow {













}