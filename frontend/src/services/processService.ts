import apiClient from './api';
import { 
  Process, 
  ProcessWorkplace, 
  ProcessDefect, 
  ProcessInspection, 
  ProcessSearchParams 
} from '../types/process';

/**
 * 공정 API 서비스
 */

export const processService = {
  /**
   * 공정 목록 조회
   */
  getProcessList: async (params?: ProcessSearchParams) => {
    const response = await apiClient.get('/api/processes', { params });
    return response.data;
  },

  /**
   * 공정 상세 조회
   */
  getProcess: async (processId: string) => {
    const response = await apiClient.get(`/api/processes/${processId}`);
    return response.data;
  },

  /**
   * 공정 등록
   */
  createProcess: async (process: Process) => {
    const response = await apiClient.post('/api/processes', process);
    return response.data;
  },

  /**
   * 공정 수정
   */
  updateProcess: async (processId: string, process: Process) => {
    const response = await apiClient.put(`/api/processes/${processId}`, process);
    return response.data;
  },

  /**
   * 공정 삭제
   */
  deleteProcess: async (processId: string) => {
    const response = await apiClient.delete(`/api/processes/${processId}`);
    return response.data;
  },

  /**
   * 공정별 작업장 목록 조회
   */
  getProcessWorkplaces: async (processId: string) => {
    const response = await apiClient.get(`/api/processes/${processId}/workplaces`);
    return response.data;
  },

  /**
   * 공정별 작업장 등록
   */
  addProcessWorkplace: async (processId: string, workplace: ProcessWorkplace) => {
    const response = await apiClient.post(`/api/processes/${processId}/workplaces`, workplace);
    return response.data;
  },

  /**
   * 공정별 작업장 삭제
   */
  removeProcessWorkplace: async (processId: string, processWorkplaceId: string) => {
    const response = await apiClient.delete(`/api/processes/${processId}/workplaces/${processWorkplaceId}`);
    return response.data;
  },

  /**
   * 공정별 불량코드 목록 조회
   */
  getProcessDefects: async (processId: string) => {
    const response = await apiClient.get(`/api/processes/${processId}/defects`);
    return response.data;
  },

  /**
   * 공정별 불량코드 등록
   */
  addProcessDefect: async (processId: string, defect: ProcessDefect) => {
    const response = await apiClient.post(`/api/processes/${processId}/defects`, defect);
    return response.data;
  },

  /**
   * 공정별 불량코드 수정
   */
  updateProcessDefect: async (processId: string, processDefectId: string, defect: ProcessDefect) => {
    const response = await apiClient.put(`/api/processes/${processId}/defects/${processDefectId}`, defect);
    return response.data;
  },

  /**
   * 공정별 불량코드 삭제
   */
  removeProcessDefect: async (processId: string, processDefectId: string) => {
    const response = await apiClient.delete(`/api/processes/${processId}/defects/${processDefectId}`);
    return response.data;
  },

  /**
   * 공정별 검사항목 목록 조회
   */
  getProcessInspections: async (processId: string) => {
    const response = await apiClient.get(`/api/processes/${processId}/inspections`);
    return response.data;
  },

  /**
   * 공정별 검사항목 등록
   */
  addProcessInspection: async (processId: string, inspection: ProcessInspection) => {
    const response = await apiClient.post(`/api/processes/${processId}/inspections`, inspection);
    return response.data;
  },

  /**
   * 공정별 검사항목 수정
   */
  updateProcessInspection: async (processId: string, processInspectionId: string, inspection: ProcessInspection) => {
    const response = await apiClient.put(`/api/processes/${processId}/inspections/${processInspectionId}`, inspection);
    return response.data;
  },

  /**
   * 공정별 검사항목 삭제
   */
  removeProcessInspection: async (processId: string, processInspectionId: string) => {
    const response = await apiClient.delete(`/api/processes/${processId}/inspections/${processInspectionId}`);
    return response.data;
  },
};

export default processService;
