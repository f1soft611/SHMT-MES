import apiClient from './api';
import { Equipment, EquipmentSearchParams } from '../types/equipment';

/**
 * 설비 API 서비스
 */

export const equipmentService = {
  /**
   * 설비 목록 조회
   */
  getEquipmentList: async (
    page: number = 0,
    pageSize: number = 10,
    params?: EquipmentSearchParams
  ) => {
    const requestParams = {
      pageIndex: page + 1,
      pageUnit: pageSize,
      ...params,
    };
    const response = await apiClient.get('/api/equipments', {
      params: requestParams,
    });
    return response.data;
  },

  /**
   * 설비 상세 조회
   */
  getEquipment: async (equipmentId: string) => {
    const response = await apiClient.get(`/api/equipments/${equipmentId}`);
    return response.data;
  },

  /**
   * 설비 등록
   */
  createEquipment: async (equipment: Equipment) => {
    const response = await apiClient.post('/api/equipments', equipment);
    return response.data;
  },

  /**
   * 설비 수정
   */
  updateEquipment: async (equipCd: string, equipment: Equipment) => {
    const response = await apiClient.put(
      `/api/equipments/${equipCd}`,
      equipment
    );
    return response.data;
  },

  /**
   * 설비 삭제
   */
  deleteEquipment: async (equipmentId: string) => {
    const response = await apiClient.delete(`/api/equipments/${equipmentId}`);
    return response.data;
  },

  /**
   * 작업장별 설비목록 조회
   */
  getEquipmentsByWorkplaceId: async (workplaceId: string) => {
    const response = await apiClient.get(`/api/equipments/wokrplace/${workplaceId}`);
    return response.data;
  },
};

export default equipmentService;
