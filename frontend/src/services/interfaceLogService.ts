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
      detailMessage: '생산지시 데이터 전송 완료',
      processingTime: 1250,
      recordCount: 15,
    },
    {
      logNo: 2,
      interfaceName: 'MES_TO_ERP',
      startTime: '20250805143500',
      endTime: '20250805143500',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:35:00',
      detailMessage: '생산실적 데이터 전송 완료',
      processingTime: 850,
      recordCount: 28,
    },
    {
      logNo: 3,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143600',
      endTime: '20250805143600',
      resultStatus: 'FAILED',
      registDate: '2025-08-05 14:36:00',
      errorMessage: '네트워크 연결 오류',
      detailMessage: 'Connection timeout after 30 seconds. 서버 응답이 없습니다.',
      processingTime: 30000,
      recordCount: 0,
    },
    {
      logNo: 4,
      interfaceName: 'WMS_TO_MES',
      startTime: '20250805143700',
      endTime: '20250805143700',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:37:00',
      detailMessage: '자재 입고 정보 동기화 완료',
      processingTime: 2100,
      recordCount: 42,
    },
    {
      logNo: 5,
      interfaceName: 'MES_TO_QMS',
      startTime: '20250805143800',
      endTime: '20250805143800',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:38:00',
      detailMessage: '품질검사 결과 전송 완료',
      processingTime: 950,
      recordCount: 8,
    },
    {
      logNo: 6,
      interfaceName: 'ERP_TO_MES',
      startTime: '20250805143900',
      endTime: '20250805143900',
      resultStatus: 'PENDING',
      registDate: '2025-08-05 14:39:00',
      detailMessage: '데이터 처리 중...',
      processingTime: 0,
      recordCount: 0,
    },
    {
      logNo: 7,
      interfaceName: 'MES_TO_ERP',
      startTime: '20250805144000',
      endTime: '20250805144000',
      resultStatus: 'FAILED',
      registDate: '2025-08-05 14:40:00',
      errorMessage: '데이터 형식 오류',
      detailMessage: 'Invalid date format in field [dueDate]. Expected: YYYY-MM-DD',
      processingTime: 350,
      recordCount: 0,
    },
    {
      logNo: 8,
      interfaceName: 'SCM_TO_MES',
      startTime: '20250805144100',
      endTime: '20250805144100',
      resultStatus: 'SUCCESS',
      registDate: '2025-08-05 14:41:00',
      detailMessage: '공급업체 정보 동기화 완료',
      processingTime: 1850,
      recordCount: 12,
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
        errorMessage: item.errorMessage,
        detailMessage: item.detailMessage,
        processingTime: item.processingTime,
        recordCount: item.recordCount,
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