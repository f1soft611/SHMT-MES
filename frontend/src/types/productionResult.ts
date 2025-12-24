/**
 * 생산실적 타입 정의
 */
export interface ProductionResult {
    FACTORY_CODE: string;

    PRODPLAN_ID: string;
    PRODPLAN_DATE: string;   // YYYYMMDD
    PRODPLAN_SEQ: number;
    PRODWORK_SEQ: number;
    WORK_SEQ: number;
    PROD_SEQ: number;

    WORKDT_DATE: string; // 작업시작예정일

    ITEM_CODE: string;
    ITEM_NAME: string;

    WORK_CODE: string;
    WORK_NAME: string;

    EQUIP_SYS_CD: string;
    EQUIP_SYS_CD_NM: string;

    PROD_QTY: number;        // BigDecimal → number
    GOOD_QTY: number | null;
    BAD_QTY: number | null;
    RCV_QTY: number | null;

    WORKORDER_SEQ: number | null;

    ORDER_FLAG: string;

    OPMANCODE: string;
    OPTIME: string;

    OPMANCODE2: string;
    OPTIME2: string;

    TPR601ID: string;
    TPR504ID: string;
}

/**
 *
 */
export interface ProductionResultDetail {
    id: string;
    FACTORY_CODE: string;

    PRODPLAN_ID: string;
    PRODPLAN_DATE: string;   // YYYYMMDD
    PRODPLAN_SEQ: number;
    PRODWORK_SEQ: number;
    WORK_SEQ: number;
    PROD_SEQ: number;

    WORKDT_DATE: string; // 작업시작예정일
    PROD_STIME: string;
    PROD_ETIME: string;

    ITEM_CODE: string;
    WORK_CODE: string;

    PROD_QTY: number;        // BigDecimal → number
    GOOD_QTY: number | null;
    BAD_QTY: number | null;
    RCV_QTY: number | null;

    ORDER_FLAG: string;

    WORKER: string;
    INPUTMATERIAL: string;

    TPR504ID: string;
    TPR601ID: string;
    TPR601WID: string;
    TPR601MID: string;
}

/**
 *
 */
export interface ProductionResultMaterial {

}


