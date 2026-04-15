import apiClient from './api';
import { ApiResponse, ListResult } from '../types';
import {
  WorkplaceKpiReqDTO,
  WorkplaceKpiRow,
  WorkplaceKpiSearchParams,
  WorkplaceKpiSummaryRow,
} from '../types/workplaceKpi';

export const workplaceKpiService = {
  /** 엑셀 파싱 데이터 업로드 */
  uploadKpiData: async (
    dataList: WorkplaceKpiReqDTO[],
  ): Promise<ApiResponse<{ savedCount: number }>> => {
    const response = await apiClient.post(
      '/api/prod/workplace-kpi/upload',
      dataList,
    );
    return response.data;
  },

  /** 로우 데이터 목록 조회 */
  getKpiList: async (
    params: WorkplaceKpiSearchParams,
    page: number,
    size: number,
  ): Promise<ApiResponse<ListResult<WorkplaceKpiRow>>> => {
    const response = await apiClient.get('/api/prod/workplace-kpi/list', {
      params: { ...params, page, size },
    });
    return response.data;
  },

  /** 일별 집계 조회 (차트용) */
  getKpiSummary: async (
    params: WorkplaceKpiSearchParams,
  ): Promise<ApiResponse<{ resultList: WorkplaceKpiSummaryRow[] }>> => {
    const response = await apiClient.get('/api/prod/workplace-kpi/summary', {
      params,
    });
    return response.data;
  },
};
