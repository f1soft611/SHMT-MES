import api from './api';
import {
  ProductionProgressResponse,
  ProductionProgressListResponse,
  ProcessProgressListResponse,
  DashboardKPIResponse,
  WorkplaceProgressResponse,
  DashboardAlertResponse,
} from '../types/dashboard';

/**
 * 대시보드 API 서비스
 */
export const dashboardService = {
  /**
   * 생산계획별 진행 현황 조회
   */
  getProductionProgress: async (
    planNo: string,
    planSeq?: number
  ): Promise<ProductionProgressResponse> => {
    const params = planSeq ? { planSeq } : {};
    const response = await api.get(
      `/api/dashboard/production-progress/${planNo}`,
      {
        params,
      }
    );
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      progress: apiResponse.result?.resultList?.[0] || null,
    };
  },

  /**
   * 진행 중인 생산계획 목록 조회
   */
  getActiveProductionList: async (
    workplaceCode?: string
  ): Promise<ProductionProgressListResponse> => {
    const params = workplaceCode ? { workplaceCode } : {};
    const response = await api.get('/api/dashboard/active-productions', {
      params,
    });
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, resultCnt, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      resultList: apiResponse.result?.resultList || [],
      resultCnt: apiResponse.result?.resultCnt || 0,
    };
  },

  /**
   * 오늘의 생산계획 진행 현황 목록
   */
  getTodayProductionProgressList: async (
    planDate?: string,
    workplaceCode?: string
  ): Promise<ProductionProgressListResponse> => {
    const params: any = {};
    if (planDate) params.planDate = planDate;
    if (workplaceCode) params.workplaceCode = workplaceCode;

    const response = await api.get('/api/dashboard/today-progress', {
      params,
    });
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, resultCnt, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      resultList: apiResponse.result?.resultList || [],
      resultCnt: apiResponse.result?.resultCnt || 0,
      planDate: apiResponse.result?.planDate,
    };
  },

  /**
   * 작업장별 생산 진행 현황
   */
  getProductionProgressByWorkplace: async (
    planDate?: string
  ): Promise<WorkplaceProgressResponse> => {
    const params = planDate ? { planDate } : {};
    const response = await api.get('/api/dashboard/workplace-progress', {
      params,
    });
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, resultCnt, ... } }
    const apiResponse = response.data;

    // 완료율 계산 추가
    const resultList = (apiResponse.result?.resultList || []).map(
      (item: any) => ({
        ...item,
        completionRate:
          item.plannedQty > 0
            ? Math.round((item.actualQty / item.plannedQty) * 1000) / 10
            : 0,
      })
    );

    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      resultList,
      resultCnt: apiResponse.result?.resultCnt || 0,
      planDate: apiResponse.result?.planDate,
    };
  },

  /**
   * 공정별 진행 현황 조회
   */
  getProcessProgressList: async (
    planDate: string,
    planSeq: number
  ): Promise<ProcessProgressListResponse> => {
    const response = await api.get('/api/dashboard/process-progress', {
      params: { planDate, planSeq },
    });
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, resultCnt, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      resultList: apiResponse.result?.resultList || [],
      resultCnt: apiResponse.result?.resultCnt || 0,
    };
  },

  /**
   * 금일 대시보드 KPI 통계 조회
   */
  getTodayKPI: async (planDate?: string): Promise<DashboardKPIResponse> => {
    const params = planDate ? { planDate } : {};
    const response = await api.get('/api/dashboard/today-kpi', {
      params,
    });
    // API 응답 구조: { resultCode, resultMessage, result: { kpi, planDate, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      kpi: apiResponse.result?.kpi || null,
    };
  },

  /**
   * 실시간 알림/이슈 목록 조회
   */
  getRecentAlerts: async (
    planDate?: string
  ): Promise<DashboardAlertResponse> => {
    const params = planDate ? { planDate } : {};
    const response = await api.get('/api/dashboard/recent-alerts', {
      params,
    });
    // API 응답 구조: { resultCode, resultMessage, result: { resultList, resultCnt, ... } }
    const apiResponse = response.data;
    return {
      resultCode: apiResponse.resultCode,
      resultMessage: apiResponse.resultMessage,
      resultList: apiResponse.result?.resultList || [],
      resultCnt: apiResponse.result?.resultCnt || 0,
      planDate: apiResponse.result?.planDate,
    };
  },
};

export default dashboardService;
