export interface WipInventoryRow {
  factoryCode: string;
  prodplanDate: string;
  prodplanSeq: number;
  prodworkSeq: number;
  workSeq: number;
  itemCode: string;
  workCode: string;
  prodCode: string;
  lotNo: string;
  workdtDate: string;
  workName: string;
  prodItemCode: string;
  prodItemName: string;
  prodItemSpec: string;
  prodName: string;
  wipQty: number;
  processFlow: string;
}

export interface WipInventorySearchParams {
  searchDate?: string;
  workCode?: string;
  searchKeyword?: string;
  offset?: number;
  size?: number;
}