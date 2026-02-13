export interface StockInquiry {
  itemSeq?: number;
  itemNo: string;
  itemName: string;
  whSeq?: number;
  whName: string;
  stockQty: number;
  unit?: string;
}

export interface StockInquirySearchParams {
  dateFr: string; // YYYYMMDD
  dateTo: string; // YYYYMMDD
  itemNo?: string;
  itemName?: string;
  whName?: string;
  pageIndex?: number;
  pageSize?: number;
}
