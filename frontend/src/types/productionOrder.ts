/**
 * 생산지시 관련 타입 정의
 */

export interface ProductionOrder {
}
// =======================
// [API] 생산계획 조회 파라미터
// =======================
export interface ProdPlanSearchParams {
    workplace?: string;
    equipment?: string;
    dateFrom: string;   // YYYYMMDD
    dateTo: string;     // YYYYMMDD
    orderFlag?:string;
    page?: number;
    size?: number;
}

export interface ProdPlanPageResult<T> {
    resultList: T[];
    resultCnt: number;
}

// =======================
// [API] 생산계획 조회 결과 Row
// =======================
export interface ProdPlanRow {
    orderFlag: string;
    orderGubun: string;
    orderGubunFlag: number;
    orderNo?: string;
    orderHistno?: string;
    orderSeqno?: number;
    factoryCode: string;
    prodplanDate: string;     // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
    prodplanId: string;
    prodDate?: string;
    itemCodeId: string;
    itemCode: string;
    itemName: string;
    workcenterCode: string;
    workcenterName: string;
    workCode: string;
    equipSysCd: string;
    equipmentName?: string;
    workerType?: string;
    workerCode?: string;
    workerName?: string;
    lotNo?: string;
    prodQty: number;
    workorderSeq?: number;
    bigo?: string;
    selCustomerNames?: string;
    opmanCode?: string;
    optime?: string;
    opmanCode2?: string;
    optime2?: string;
}


// 생산계획 기준 조회 파라미터
export interface ProdOrderSearchParam {
    prodplanDate: string;   // yyyyMMdd
    prodplanSeq: number;
}

export interface ProdOrderRow {
    idx: string;   // number → string
    factoryCode: string;
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;
    orderSeq: number;
    prodplanId: string;
    prodorderId: string;
    workorderSeq: number;
    workCode: string;
    workName: string;
    equipmentCode: string;
    equipmentName: string;
    workdtDate: string;
    itemCodeId: string;
    itemCode: string;
    prodCodeId: string;
    prodCode: string;
    materialName: string;
    materialSpec: string;
    materialUnit: string;
    orderFlag: string;
    lotNo: string;
    orderQty: number;
    bigo: string;
    lastFlag:string;
    opmanCode2: string;
    optime2: number;
    rstCnt: number;
    tpr110dSeq:number;

    // ===== UI 전용 필드 =====
    _isNew?: boolean;
}


export interface ProdOrderInsertDto {
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;

    prodplanId: string;
    prodorderId?: string;   // 서버에서 채번
    newWorkorderSeq: number;

    workCode: string;
    workdtDate: string;

    itemCodeId: string;
    prodCodeId: string;
    equipmentCode?: string;

    lotNo?: string;
    orderQty: number;

    opmanCode?: string;
    bigo?: string;
    tpr110dSeq: number;
}

export interface ProdOrderUpdateDto {
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;
    orderSeq: number;

    workdtDate: string;
    orderQty: number;
    newWorkorderSeq: number;

    opmanCode?: string;
    bigo?: string;
}

export interface ProdOrderDeleteDto {
    prodplanDate: string; // yyyyMMdd
    prodplanSeq: number;
    prodworkSeq: number;
}

export type OrderFlag = "PLANNED" | "ORDERED";


// =======================
// [API] 생산계획 일괄 생산지시 Key DTO
// =======================
export interface ProdPlanKeyDto {
    prodplanId: string;
    prodplanDate: string;   // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
}