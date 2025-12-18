import apiClient from './api';

export const productionResultService = {  // 생산지시 목록 조회

  // 작업지시 목록 조회
  getProdOrders: async (params?: any) => {
    return (await apiClient.get('/api/production-results', { params })).data;
  },
};