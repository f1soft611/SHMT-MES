import apiClient from './api';
import {
  ProdResultOrderRow,
  ProductionResultDetail,
  ProductionResultSearchParams,
} from "../types/productionResult";
import {ApiResponse, ListResult} from "../types";

export const productionResultService = {  // 생산지시 목록 조회

  // 작업지시 목록 조회
  getProdOrders: async (params?: ProductionResultSearchParams): Promise<ApiResponse<ListResult<ProdResultOrderRow>>> => {
    const response = await apiClient.get('/api/production-results/orders', { params })
    return response.data;
  },

  //생산실적 신규 등록
  createProdResult: async(data: ProductionResultDetail[]) => await apiClient.post('/api/production-results',data),

  // 생산실적 수정
  updateProdResult: async(data: ProductionResultDetail[]) => await apiClient.post('/api/production-results/update',data),

  // 생산실적 삭제
  deleteProdResult: async(data: ProductionResultDetail) => await apiClient.post('/api/production-results/delete',data),

  // 생산실적 detail 조회
  getProdResultDetails: async(data: ProdResultOrderRow): Promise<ApiResponse<ListResult<ProductionResultDetail>>> => {
    const response = await apiClient.get('/api/production-results/details', { params: data, });
    return response.data;
  }


};