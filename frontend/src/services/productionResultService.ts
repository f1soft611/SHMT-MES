import apiClient from './api';
import { ProductionResult, ApiResponse, PaginatedResponse } from '../types';

export const productionResultService = {
  // 생산실적 목록 조회
  getProductionResults: async (
    page: number = 0,
    size: number = 20,
    orderId?: string
  ): Promise<PaginatedResponse<ProductionResult>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(orderId && { orderId }),
    });
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ProductionResult>>>(
      `/production-results?${params}`
    );
    return response.data.data;
  },

  // 생산실적 등록
  createProductionResult: async (
    data: Omit<ProductionResult, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductionResult> => {
    const response = await apiClient.post<ApiResponse<ProductionResult>>(
      '/production-results',
      data
    );
    return response.data.data;
  },

  // 생산실적 수정
  updateProductionResult: async (
    id: string,
    data: Partial<ProductionResult>
  ): Promise<ProductionResult> => {
    const response = await apiClient.put<ApiResponse<ProductionResult>>(
      `/production-results/${id}`,
      data
    );
    return response.data.data;
  },

  // 생산실적 삭제
  deleteProductionResult: async (id: string): Promise<void> => {
    await apiClient.delete(`/production-results/${id}`);
  },

  // ERP로 생산실적 전송
  sendToERP: async (id: string): Promise<void> => {
    await apiClient.post(`/production-results/${id}/send-to-erp`);
  },
};