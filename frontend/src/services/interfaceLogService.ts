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
const getMockInterfaceLogs = (
  page: number = 0,
  size: number = 10
): PaginatedResponse<InterfaceLog> => {
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
      const backendData = response.data?.result.resultList || [];
      const totalCount = parseInt(response.data?.result.resultCnt || '0');

      const transformedData: InterfaceLog[] = backendData.map((item: any) => ({
        logNo: item.logNo,
        interfaceName: item.interfaceName,
        startTime: item.startTime,
        endTime: item.endTime,
        resultStatus: item.resultStatus,
        registDate: item.registDate,
        registerId: item.registerId,
        errorMessage: item.errorMessage,
        requestData: item.requestData,
        responseData: item.responseData,
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

  // 인터페이스 로그 상세 조회
  getInterfaceLogDetail: async (logNo: number): Promise<InterfaceLog> => {
    try {
      const response = await apiClient.get<any>(`/interface-logs/${logNo}`);

      const backendData = response.data?.result.interfaceLog;
      if (!backendData) {
        throw new Error('Interface log not found');
      }

      return {
        logNo: backendData.logNo,
        interfaceName: backendData.interfaceName,
        startTime: backendData.startTime,
        endTime: backendData.endTime,
        resultStatus: backendData.resultStatus,
        registDate: backendData.registDate,
        registerId: backendData.registerId,
        errorMessage: backendData.errorMessage,
        requestData: backendData.requestData,
        responseData: backendData.responseData,
      };
    } catch (error) {
      console.warn('Backend not available, using mock detail data:', error);
      // Return mock detail data when backend is not available
      if (logNo % 3 === 0) {
        // Failed case
        return {
          logNo: logNo,
          interfaceName: 'ERP_TO_MES',
          startTime: '20250805143400',
          endTime: '20250805143400',
          resultStatus: 'FAILED',
          registDate: '2025-08-05 14:34:00',
          errorMessage: 'Connection timeout error',
        };
      } else if (logNo === 2 || logNo === 5) {
        // Array data cases
        return {
          logNo: logNo,
          interfaceName: 'ERP_TO_MES',
          startTime: '20250805143400',
          endTime: '20250805143400',
          resultStatus: 'SUCCESS',
          registDate: '2025-08-05 14:34:00',
          requestData: JSON.stringify(
            [
              {
                orderId: 'ORD-2025-001',
                productCode: 'PROD001',
                quantity: 100,
                dueDate: '2025-08-10',
              },
              {
                orderId: 'ORD-2025-002', 
                productCode: 'PROD002',
                quantity: 200,
                dueDate: '2025-08-11',
              },
              {
                orderId: 'ORD-2025-003',
                productCode: 'PROD003', 
                quantity: 150,
                dueDate: '2025-08-12',
              },
            ],
            null,
            2
          ),
          responseData: JSON.stringify(
            [
              {
                orderId: 'ORD-2025-001',
                status: 'SUCCESS',
                processedQuantity: 100,
                timestamp: '2025-08-05T14:34:00Z',
              },
              {
                orderId: 'ORD-2025-002',
                status: 'SUCCESS', 
                processedQuantity: 200,
                timestamp: '2025-08-05T14:35:00Z',
              },
              {
                orderId: 'ORD-2025-003',
                status: 'SUCCESS',
                processedQuantity: 150,
                timestamp: '2025-08-05T14:36:00Z',
              },
            ],
            null,
            2
          ),
        };
      } else {
        // Single object cases  
        return {
          logNo: logNo,
          interfaceName: 'ERP_TO_MES',
          startTime: '20250805143400',
          endTime: '20250805143400',
          resultStatus: 'SUCCESS',
          registDate: '2025-08-05 14:34:00',
          requestData: JSON.stringify(
            {
              orderId: 'ORD-2025-001',
              productCode: 'PROD001',
              quantity: 100,
              dueDate: '2025-08-10',
            },
            null,
            2
          ),
          responseData: JSON.stringify(
            {
              status: 'SUCCESS',
              message: 'Order processed successfully',
              processedQuantity: 100,
              timestamp: '2025-08-05T14:34:00Z',
            },
            null,
            2
          ),
        };
      }
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
