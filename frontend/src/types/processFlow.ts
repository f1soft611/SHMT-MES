/**
 * 공정 흐름 관련 타입 정의
 */

export interface ProcessFlow {
    workplaceCode: string; // 작업장
    workplaceName?: string | null;
    processFlowId?: string | null;
    processFlowCode?: string | null;
    processFlowName: string;
}

/**
 * 공정 흐름별 공정 타입 정의
 * TPR110D
 */
export interface ProcessFlowProcess {
    flowRowId: string;  // UI 전용 고유 ID
    flowProcessId?: string | null;   // PK (신규면 null)
    seq: string;                     // 정렬 순서 (UI에서 입력)
    processFlowCode: string;         // 상위 공정흐름 코드
    processFlowId: string;           // 상위 공정흐름 ID
    equipmentFlag: string;          // 장비연동 여부(Y/N)
    lastFlag: string;                // 마지막 공정 여부(Y/N)
    flowProcessCode: string;             // 공정 코드
    flowProcessName: string;            // 공정 명
    processSeq: string;             // 공정별 순서(백엔드 기준)
}

/**
 * 공정 흐름별 제품 타입 정의
 * TPR112
 */
export interface ProcessFlowItem {
    flowRowId: string;              // UI 전용 고유 ID
    flowItemId?: string | null;     // PK (신규면 null)
    flowItemCode: string;           // 제품 코드
    flowItemCodeId: string;           // 제품 코드 Id
    flowItemName: string;           // 제품 이름
    specification: string;
    unit: string;               // 단위 코드
    unitName: string;               // 단위 이름
    processFlowCode: string;        // 상위 공정흐름 코드
    processFlowId: string;          // 상위 공정흐름 ID
}



export type DetailSavePayload =
    | {
    processes: ProcessFlowProcess[];
}
    | {
    items: ProcessFlowItem[];
};

/**
 *
 */
export interface ProcessFlowSearchParams {
    searchCnd?: string;
    searchWrd?: string;
    status?: string;
    pageIndex?: number;
}

/**
 *
 */
export type DetailSaveResult = {
    ok: boolean;
    reason?: string;
};



