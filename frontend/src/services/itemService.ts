import apiClient from './api';
import { Item, ItemSearchParams } from '../types/item';

/**
 * 품목 API 서비스
 */

export const itemService = {
  /**
   * 품목 목록 조회
   */
  getItemList: async (params?: ItemSearchParams) => {
    const response = await apiClient.get('/api/items', { params });
    return response.data;
  },

  /**
   * 품목 상세 조회
   */
  getItem: async (itemId: string) => {
    const response = await apiClient.get(`/api/items/${itemId}`);
    return response.data;
  },

  /**
   * 품목 등록
   */
  createItem: async (item: Item) => {
    const response = await apiClient.post('/api/items', item);
    return response.data;
  },

  /**
   * 품목 수정
   */
  updateItem: async (itemId: string, item: Item) => {
    const response = await apiClient.put(`/api/items/${itemId}`, item);
    return response.data;
  },

  /**
   * 품목 삭제
   */
  deleteItem: async (itemId: string) => {
    const response = await apiClient.delete(`/api/items/${itemId}`);
    return response.data;
  },
};

export default itemService;
