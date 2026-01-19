import apiClient from '../../util/axios';

/**
 * 로그인 이력 인터페이스
 */
export interface LoginHistory {
  loginHistoryId: number;
  factoryCode: string;
  userId: string;
  userName: string;
  loginDt: string;
  loginIp: string;
  loginType: string; // 'JWT' | 'SESSION'
  userAgent: string;
  loginResult: string; // 'Y' | 'N'
  failReason?: string;
  logoutDt?: string;
  sessionTime?: number;
}

/**
 * 로그인 이력 검색 파라미터
 */
export interface LoginHistorySearchParams {
  searchStartDt?: string;
  searchEndDt?: string;
  searchUserId?: string;
  searchUserName?: string;
  searchLoginResult?: string;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * 로그인 이력 목록 응답
 */
export interface LoginHistoryListResponse {
  loginHistoryList: LoginHistory[];
  paginationInfo: {
    currentPageNo: number;
    recordCountPerPage: number;
    pageSize: number;
    totalRecordCount: number;
    totalPageCount: number;
    firstPageNo: number;
    lastPageNo: number;
    firstRecordIndex: number;
    lastRecordIndex: number;
  };
  totalCount: number;
}

/**
 * 로그인 이력 관리 서비스
 */
export const loginHistoryService = {
  /**
   * 로그인 이력 목록 조회
   */
  getLoginHistoryList: async (
    params: LoginHistorySearchParams = {}
  ): Promise<LoginHistoryListResponse> => {
    try {
      const response = await apiClient.get('/api/loginHistory/list', {
        params: {
          factoryCode: '000001',
          pageIndex: params.pageIndex || 1,
          pageSize: params.pageSize || 10,
          pageUnit: 10,
          ...params,
        },
      });

      if (response.data.resultCode === 200 || response.data.resultCode === '200') {
        return response.data.result;
      } else {
        throw new Error(
          response.data.resultMessage || '로그인 이력 목록 조회 실패'
        );
      }
    } catch (error) {
      console.error('로그인 이력 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 로그인 이력 상세 조회
   */
  getLoginHistoryDetail: async (
    loginHistoryId: number
  ): Promise<LoginHistory> => {
    try {
      const response = await apiClient.get(`/api/loginHistory/${loginHistoryId}`);

      if (response.data.resultCode === 200 || response.data.resultCode === '200') {
        return response.data.result.loginHistory;
      } else {
        throw new Error(
          response.data.resultMessage || '로그인 이력 상세 조회 실패'
        );
      }
    } catch (error) {
      console.error('로그인 이력 상세 조회 오류:', error);
      throw error;
    }
  },
};
