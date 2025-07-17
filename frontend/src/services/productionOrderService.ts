import apiClient from './api';
import { ProductionOrder, ApiResponse, PaginatedResponse } from '../types';

export const productionOrderService = {
  // 생산지시 목록 조회
  getProductionOrders: async (
    page: number = 0,
    size: number = 20,
    status?: string
  ): Promise<PaginatedResponse<ProductionOrder>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status && { status }),
    });
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ProductionOrder>>>(
      `/production-orders?${params}`
    );
    return response.data.data;
  },

  // 생산지시 상세 조회
  getProductionOrder: async (id: string): Promise<ProductionOrder> => {
    const response = await apiClient.get<ApiResponse<ProductionOrder>>(
      `/production-orders/${id}`
    );
    return response.data.data;
  },

  // 생산지시 상태 업데이트
  updateProductionOrderStatus: async (
    id: string,
    status: ProductionOrder['status']
  ): Promise<ProductionOrder> => {
    const response = await apiClient.patch<ApiResponse<ProductionOrder>>(
      `/production-orders/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  // ERP에서 생산지시 동기화
  syncProductionOrders: async (): Promise<void> => {
    await apiClient.post('/production-orders/sync');
  },
};