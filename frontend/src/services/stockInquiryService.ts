import api from './api';

/**
 * 재고조회 인터페이스
 */
export interface StockInquiry {
  itemSeq?: number;
  itemNo: string;
  itemName: string;
  whSeq?: number;
  whName: string;
  stockQty: number;
  unit?: string;
}

/**
 * 재고조회 검색 조건
 */
export interface StockInquirySearchParams {
  dateFr: string; // YYYYMMDD
  dateTo: string; // YYYYMMDD
  itemNo?: string;
  itemName?: string;
  whName?: string;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * 재고조회 서비스
 */
const stockInquiryService = {
  /**
   * 재고 목록 조회
   * @param params 검색 조건
   * @returns 재고 목록과 페이징 정보
   */
  getStockList: async (params: StockInquirySearchParams) => {
    const response = await api.get('/api/stock-inquiry', { params });
    return response.data;
  },
};

export default stockInquiryService;
