import apiClient from './api';
import { Workplace, WorkplaceWorker, WorkplaceSearchParams } from '../types/workplace';
import { WorkplaceProcess } from '../types/process';

/**
 * 작업장 API 서비스
 */

export const workplaceService = {
  /**
   * 작업장 목록 조회
   */
  getWorkplaceList: async (
    page: number = 0,
    pageSize: number = 10,
    params?: WorkplaceSearchParams
  ) => {
    const requestParams = {
      pageIndex: page + 1,
      pageUnit: pageSize,
      ...params,
    };
    const response = await apiClient.get('/api/workplaces', { params: requestParams });
    return response.data;
  },

  /**
   * 작업장 상세 조회
   */
  getWorkplace: async (workplaceId: string) => {
    const response = await apiClient.get(`/api/workplaces/${workplaceId}`);
    return response.data;
  },

  /**
   * 작업장 등록
   */
  createWorkplace: async (workplace: Workplace) => {
    const response = await apiClient.post('/api/workplaces', workplace);
    return response.data;
  },

  /**
   * 작업장 수정
   */
  updateWorkplace: async (workplaceId: string, workplace: Workplace) => {
    const response = await apiClient.put(`/api/workplaces/${workplaceId}`, workplace);
    return response.data;
  },

  /**
   * 작업장 삭제
   */
  deleteWorkplace: async (workplaceId: string) => {
    const response = await apiClient.delete(`/api/workplaces/${workplaceId}`);
    return response.data;
  },

  /**
   * 작업장별 작업자 목록 조회
   */
  getWorkplaceWorkers: async (workplaceId: string) => {
    const response = await apiClient.get(`/api/workplaces/${workplaceId}/workers`);
    return response.data;
  },

  /**
   * 작업장별 작업자 등록
   */
  addWorkplaceWorker: async (workplaceId: string, worker: WorkplaceWorker) => {
    const response = await apiClient.post(`/api/workplaces/${workplaceId}/workers`, worker);
    return response.data;
  },

  /**
   * 작업장별 작업자 삭제
   */
  removeWorkplaceWorker: async (workplaceId: string, workplaceWorkerId: string) => {
    const response = await apiClient.delete(`/api/workplaces/${workplaceId}/workers/${workplaceWorkerId}`);
    return response.data;
  },

  /**
   * 작업장별 공정 목록 조회
   */
  getWorkplaceProcesses: async (workplaceId: string) => {
    const response = await apiClient.get(`/api/workplaces/${workplaceId}/processes`);
    return response.data;
  },

  /**
   * 작업장별 공정 등록
   */
  addWorkplaceProcess: async (workplaceId: string, workplaceProcess: WorkplaceProcess) => {
    const response = await apiClient.post(`/api/workplaces/${workplaceId}/processes`, workplaceProcess);
    return response.data;
  },

  /**
   * 작업장별 공정 삭제
   */
  removeWorkplaceProcess: async (workplaceId: string, workplaceProcessId: string) => {
    const response = await apiClient.delete(`/api/workplaces/${workplaceId}/processes/${workplaceProcessId}`);
    return response.data;
  },
};

export default workplaceService;
