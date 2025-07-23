import apiClient from './api';
import { ProductionOrder, ApiResponse, PaginatedResponse } from '../types';
import { getMockProductionOrders } from './mockData';

export interface ProductionOrderSearchParams {
  page?: number;
  size?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

export const productionOrderService = {
  // 생산지시 목록 조회
  getProductionOrders: async (
    page: number = 0,
    size: number = 20,
    status?: string,
    dateFrom?: string,
    dateTo?: string,
    keyword?: string
  ): Promise<PaginatedResponse<ProductionOrder>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(keyword && { keyword }),
      });

      const response = await apiClient.get<
        ApiResponse<PaginatedResponse<ProductionOrder>>
      >(`/production-orders?${params}`);

      // 옵셔널 체이닝 사용
      const data = response.data?.data ?? response.data;

      if (!data) {
        throw new Error('응답 데이터를 찾을 수 없습니다.');
      }

      return getMockProductionOrders(page, size, dateFrom, dateTo, keyword);
      // return data;
    } catch (error) {
      console.warn('Backend not available, using mock data:', error);
      // Use mock data when backend is not available
      return getMockProductionOrders(page, size, dateFrom, dateTo, keyword);
    }
  },

  // 생산지시 목록 조회 (검색 매개변수 객체 사용)
  searchProductionOrders: async (
    searchParams: ProductionOrderSearchParams
  ): Promise<PaginatedResponse<ProductionOrder>> => {
    const { page = 0, size = 20, ...filters } = searchParams;
    return productionOrderService.getProductionOrders(
      page,
      size,
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      filters.keyword
    );
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
