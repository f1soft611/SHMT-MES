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
    keyword?: string;
    dateFrom: string;   // YYYY-MM-DD
    dateTo: string;     // YYYY-MM-DD
    prodFrom?: string;   // YYYY-MM-DD
    prodTo?: string;     // YYYY-MM-DD
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
    orderSeqno?: number;
    orderHistno?: number;
    factoryCode: string;
    prodplanDate: string;     // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
    prodplanId: string;
    prodplanDetailId:string;
    prodDate?: string;
    itemCodeId: string;
    itemCode: string;
    itemName: string;
    workcenterCode: string;
    workcenterName: string;
    workcenterSeq?: string;
    workCode: string;
    equipSysCd: string;
    equipmentName?: string;
    workerType?: string;
    workerCode?: string;
    workerName?: string;
    lotNo?: string;
    prodQty: number;
    orderQty: number;
    workorderSeq?: number;
    bigo?: string;
    selCustomerNames?: string;
    opmanCode?: string;
    optime?: string;
    opmanCode2?: string;
    optime2?: string;
    orderDate?: string;
    erpProcYn: string | null;
    erpStatus: string | null;
    erpResult: string | null;
    workSeq: number | null;
}


// 생산계획 기준 조회 파라미터
export interface ProdOrderSearchParam {
    prodplanDate: string;   // yyyyMMdd
    prodplanSeq: number;
    prodworkSeq?: number;
}

export interface ProdOrderRow {
    idx: string;   // number → string
    factoryCode: string;
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;
    orderSeq: number;
    prodplanId: string;
    prodplanDetailId: string;
    prodorderId: string;
    workorderSeq: number;
    workCode: string;
    workCodeId: number;
    workName: string;
    equipmentCode: string;
    equipmentName: string;
    workdtDate: string;
    itemCodeId: string;
    itemCode: string;
    itemUnitId: number;
    prodCodeId: string;
    prodCode: string;
    materialName: string;
    materialSpec: string;
    itemCtTime: number;
    itemOnePerQty: number;
    materialUnit: string;
    orderFlag: string;
    lotNo: string;
    orderQty: number;
    bigo: string;
    lastFlag:string;
    customerCode:number;
    copyRow:number;
    opmanCode2: string;
    optime2: number;
    rstCnt: number;
    tpr110dSeq:number;
    workcenterSeq?: string;

    orderSeqno?: number;
    orderHistno?: number;

    // ===== UI 전용 필드 =====
    _isNew?: boolean;
    _dirty?: boolean;
}


export interface ProdOrderInsertDto {
    prodplanDate: string;
    prodplanSeq: number;
    prodworkSeq: number;

    prodplanId: string;
    prodplanDetailId: string;
    prodorderId?: string;   // 서버에서 채번
    newWorkorderSeq: number;

    workCode: string;
    workCodeId: number;
    workdtDate: string;

    itemCodeId: string;
    itemCode: string;
    itemUnitId: number;
    prodCodeId: string;
    equipmentCode?: string;

    itemCtTime: number;
    itemOnePerQty:number;

    lotNo?: string;
    orderQty: number;

    customerCode:number;
    bigo?: string;
    opmanCode?: string;
    tpr110dSeq: number;
    workcenterSeq?: string;
    orderDate: string;  // yyyyMMdd, 서버시간 기준

    orderSeqno?: number;
    orderHistno?: number;
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
    prodorderId?: string;
    lotNo?: string;
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
    prodplanDetailId?: string;
    lotNo?: string;

    orderSeqno?: number;
    orderHistno?: number;
}


export interface StopWorkDto {
    prodplanDate: string;   // YYYYMMDD
    prodplanSeq: number;
    prodworkSeq: number;
    prodQty: number;        // 변경수량
}
