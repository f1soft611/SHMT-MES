/**
 * 품목 관련 타입 정의
 */

export interface Item {
  itemId?: string;
  itemCode: string;
  itemName: string;
  itemType?: string;
  specification?: string;
  unit?: string;
  unitName?: string;
  stockQty?: string;
  safetyStock?: string;
  productionPerCycle?: string;
  remark?: string;
  interfaceYn?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

/**
 * 품목 관련 타입 정의
 *
 * 공정 흐름 관리 화면의 품목 리스트 및 선택용
 */
export interface ItemType {
  itemId: string;
  itemCode: string;
  itemName: string;
  itemType?: string;
  specification?: string;
  unit?: string;
  unitName?: string;
  stockQty?: string;
  safetyStock?: string;
  productionPerCycle?: string;
  remark?: string;
  interfaceYn?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export const InProcessFlow = {
  ALL: 0,
  UNREGISTERED: 1,
  REGISTERED: 2,
} as const;

export type InProcessFlowFilter =
  (typeof InProcessFlow)[keyof typeof InProcessFlow];

export interface ItemSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  itemType?: string;
  useYn?: string;
  inProcessFlowYn?: InProcessFlowFilter;
  pageIndex?: number;
}
