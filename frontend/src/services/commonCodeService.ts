import apiClient from './api';
import { CommonCode, CommonCodeSearchParams, CommonDetailCode } from '../types/commonCode';

/**
 * 공통코드 API 서비스
 */

export const commonCodeService = {
  /**
   * 공통코드 목록 조회
   */
  getCommonCodeList: async (
    page: number = 0,
    pageSize: number = 10,
    params?: CommonCodeSearchParams
  ) => {
    const requestParams = {
      pageIndex: page + 1,
      pageUnit: pageSize,
      ...params,
    };
    const response = await apiClient.get('/api/common-codes', { params: requestParams });
    return response.data;
  },

  /**
   * 공통코드 상세 조회
   */
  getCommonCode: async (codeId: string) => {
    const response = await apiClient.get(`/api/common-codes/${codeId}`);
    return response.data;
  },

  /**
   * 공통코드 등록
   */
  createCommonCode: async (commonCode: CommonCode) => {
    const response = await apiClient.post('/api/common-codes', commonCode);
    return response.data;
  },

  /**
   * 공통코드 수정
   */
  updateCommonCode: async (codeId: string, commonCode: CommonCode) => {
    const response = await apiClient.put(`/api/common-codes/${codeId}`, commonCode);
    return response.data;
  },

  /**
   * 공통코드 삭제
   */
  deleteCommonCode: async (codeId: string) => {
    const response = await apiClient.delete(`/api/common-codes/${codeId}`);
    return response.data;
  },

  /**
   * 공통코드 상세 목록 조회
   */
  getCommonDetailCodeList: async (codeId: string, useAt?: string) => {
    const params = useAt ? { useAt } : {};
    const response = await apiClient.get(`/api/common-codes/${codeId}/details`, { params });
    return response.data;
  },

  /**
   * 공통코드 상세 정보 조회
   */
  getCommonDetailCode: async (codeId: string, code: string) => {
    const response = await apiClient.get(`/api/common-codes/${codeId}/details/${code}`);
    return response.data;
  },

  /**
   * 공통코드 상세 등록
   */
  createCommonDetailCode: async (codeId: string, detailCode: CommonDetailCode) => {
    const response = await apiClient.post(`/api/common-codes/${codeId}/details`, detailCode);
    return response.data;
  },

  /**
   * 공통코드 상세 수정
   */
  updateCommonDetailCode: async (codeId: string, code: string, detailCode: CommonDetailCode) => {
    const response = await apiClient.put(`/api/common-codes/${codeId}/details/${code}`, detailCode);
    return response.data;
  },

  /**
   * 공통코드 상세 삭제
   */
  deleteCommonDetailCode: async (codeId: string, code: string) => {
    const response = await apiClient.delete(`/api/common-codes/${codeId}/details/${code}`);
    return response.data;
  },
};

export default commonCodeService;
