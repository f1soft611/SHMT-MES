/**
 * 공정 흐름 관련 타입 정의
 */

export interface ProcessFlow {
    workplaceCode: string;
    processFlowId?: string | null;
    processFlowCode: string;
    processFlowName: string;
}

/**
 * 공정 흐름별 공정 타입 정의
 * TPR110D
 */
export interface ProcessFlowProcess{

}

/**
 * 공정 흐름별 제품 타입 정의
 * TPR112
 */
export interface ProcessFlowItem {
    itemCode: string;
    itemName: string;
}

/**
 * 공정 흐름별 제품 타입 정의
 * TPR112
 */
export interface ProcessFlowSearchParams {
    searchCnd?: string;
    searchWrd?: string;
    status?: string;
    pageIndex?: number;
}


