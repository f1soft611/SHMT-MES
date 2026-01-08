import api from './api';
import {
  ProductionRequest,
  ProductionRequestSearchParams,
} from '../types/productionRequest';

export interface ProductionRequestListResponse {
  result: {
    resultList: ProductionRequest[];
    resultCnt: string;
    paginationInfo: {
      currentPageNo: number;
      recordCountPerPage: number;
      pageSize: number;
      totalRecordCount: number;
    };
  };
  resultCode: number;
  resultMessage: string;
}

export interface ProductionRequestDetailResponse {
  result: {
    productionRequest: ProductionRequest;
  };
  resultCode: number;
  resultMessage: string;
}

class ProductionRequestService {
  /**
   * 생산의뢰 목록 조회 (TSA308 테이블)
   */
  async getProductionRequestList(
    page: number = 0,
    pageSize: number = 10,
    searchParams?: ProductionRequestSearchParams
  ): Promise<ProductionRequestListResponse> {
    const params: any = {
      pageIndex: page + 1,
      pageUnit: pageSize,
    };

    if (searchParams) {
      // 백엔드 VO 기준 파라미터 매핑
      if (searchParams.searchCnd) params.searchCnd = searchParams.searchCnd;
      if (searchParams.searchWrd) params.searchWrd = searchParams.searchWrd;
      if (searchParams.factoryCode)
        params.factoryCode = searchParams.factoryCode;
      if (searchParams.orderNo) params.orderNo = searchParams.orderNo;
      if (searchParams.itemCode) params.itemCode = searchParams.itemCode;
      if (searchParams.itemName) params.itemName = searchParams.itemName;
      if (searchParams.workplaceCode)
        params.workplaceCode = searchParams.workplaceCode;
      // 날짜는 YYYY-MM-DD 입력 가능 -> YYYYMMDD로 변환
      if (searchParams.dateFrom)
        params.dateFrom = searchParams.dateFrom.replace(/-/g, '');
      if (searchParams.dateTo)
        params.dateTo = searchParams.dateTo.replace(/-/g, '');
    }

    const response = await api.get('/api/production-requests', { params });
    return response.data;
  }

  /**
   * 생산의뢰 상세 조회
   */
  async getProductionRequestDetail(
    factoryCode: string,
    orderNo: string,
    orderHistno: number,
    orderSeqno: number
  ): Promise<ProductionRequestDetailResponse> {
    const response = await api.get(
      `/api/production-requests/${factoryCode}/${orderNo}/${orderHistno}/${orderSeqno}`
    );
    return response.data;
  }

  /**
   * 생산의뢰 검색 (상세검색)
   */
  async searchProductionRequests(
    searchParams: ProductionRequestSearchParams
  ): Promise<ProductionRequestListResponse> {
    const response = await api.post(
      '/api/production-requests/search',
      searchParams
    );
    return response.data;
  }
}

export const productionRequestService = new ProductionRequestService();
