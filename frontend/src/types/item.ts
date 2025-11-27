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
  remark?: string;
  interfaceYn?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface ItemSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  itemType?: string;
  useYn?: string;
  pageIndex?: number;
}
