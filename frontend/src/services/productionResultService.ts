import apiClient from './api';
import {ProductionResult, ProductionResultDetail} from "../types/productionResult";

export const productionResultService = {  // 생산지시 목록 조회

  // 작업지시 목록 조회
  getProdOrders: async (params?: any) => {
    return (await apiClient.get('/api/production-results', { params })).data;
  },

  //작업지시 신규 등록
  createProdResult: async(data: ProductionResultDetail[]) => {
    const response = await apiClient.post('/api/production-results',data);
    return response.data;
  },

  // 생산실적 detail 조회
  getProdResultDetails: async(data: ProductionResult) => {
    return (await apiClient.get('/api/production-results/details', { params: data, })).data;
  }
};