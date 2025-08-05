import apiClient from './api';
import { InterfaceLog, PaginatedResponse } from '../types';

export interface InterfaceLogSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Mock data function for when backend is not available
const getMockInterfaceLogs = (page: number = 0, size: number = 10): PaginatedResponse<InterfaceLog> => {
  const mockLogs: InterfaceLog[] = [
    {
      logNo: 1,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143400',
      endTime: '20250805143400',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:34:00',
    },
    {
      logNo: 2,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143500',
      endTime: '20250805143500',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:35:00',
    },
    {
      logNo: 3,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143600',
      endTime: '20250805143600',
      resultStatus: 'FAILED',
      registDate: '2025-08-05 14:36:00',
    },
    {
      logNo: 4,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143700',
      endTime: '20250805143700',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:37:00',
    },
    {
      logNo: 5,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143800',
      endTime: '20250805143800',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:38:00',
    },
  ];

  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedContent = mockLogs.slice(startIndex, endIndex);

  return {
    content: paginatedContent,
    totalElements: mockLogs.length,
    totalPages: Math.ceil(mockLogs.length / size),
    size: size,
    number: page,
  };
};

export const interfaceLogService = {
  // 인터페이스 로그 목록 조회
  getInterfaceLogs: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<PaginatedResponse<InterfaceLog>> => {
    try {
      const params = new URLSearchParams({
        pageIndex: (page + 1).toString(), // Backend uses 1-based pagination
        pageUnit: size.toString(),
        ...(keyword && { searchWrd: keyword }),
        ...(dateFrom && { searchBgnDe: dateFrom }),
        ...(dateTo && { searchEndDe: dateTo }),
      });

      const response = await apiClient.get<any>(`/interface-logs?${params}`);

      // Transform backend response to frontend format
      const backendData = response.data?.resultList || [];
      const totalCount = parseInt(response.data?.resultCnt || '0');

      const transformedData: InterfaceLog[] = backendData.map((item: any) => ({
        logNo: item.logNo,
        interfaceName: item.interfaceName,
        startTime: item.startTime,
        endTime: item.endTime,
        resultStatus: item.resultStatus,
        registDate: item.registDate,
        registerId: item.registerId,
      }));

      return {
        content: transformedData,
        totalElements: totalCount,
        totalPages: Math.ceil(totalCount / size),
        size: size,
        number: page,
      };
    } catch (error) {
      console.warn('Backend not available, using mock data:', error);
      // Use mock data when backend is not available
      return getMockInterfaceLogs(page, size);
    }
  },

  // 인터페이스 로그 검색
  searchInterfaceLogs: async (
    searchParams: InterfaceLogSearchParams
  ): Promise<PaginatedResponse<InterfaceLog>> => {
    const { page = 0, size = 10, ...filters } = searchParams;
    return interfaceLogService.getInterfaceLogs(
      page,
      size,
      filters.keyword,
      filters.dateFrom,
      filters.dateTo
    );
  },
};