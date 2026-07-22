import apiClient from './api';
import {
  ProcessFlow,
  ProcessFlowItem,
  ProcessFlowProcess,
  ProcessFlowSearchParams,
} from '../types/processFlow';
import type {
  ApiResult,
  ProcessFlowItemDto,
  ProcessFlowProcessDto,
  SaveFlowItemsDeltaRequest,
  SaveFlowItemsDeltaResult,
  SaveFlowProcessesRequest,
  SaveFlowProcessesResult,
} from '../pages/BaseData/ProcessFlowManagement/types';

type ProcessFlowItemApiRow = {
  flowItemId: string;
  flowItemCodeId: string;
  flowItemCode: string;
  flowItemName: string;
  specification?: string;
  unit?: string;
  unitName?: string;
};

type ProcessFlowProcessApiRow = Omit<ProcessFlowProcessDto, 'seq'> & {
  seq: string | number;
};

type DetailListResult<T> = {
  resultList: T[];
};

type LegacyCompatibleRows<T, LegacyRow> = T[] & {
  result: DetailListResult<LegacyRow>;
};

export function unwrapApiResult<T>(response: ApiResult<T>): T {
  if (response.resultCode !== 200 || response.result === undefined) {
    throw new Error(response.resultMessage || '요청 처리에 실패했습니다.');
  }
  return response.result;
}

const toProcessFlowItemDto = (
  row: ProcessFlowItemApiRow,
): ProcessFlowItemDto => ({
  flowItemId: row.flowItemId,
  itemId: row.flowItemCodeId,
  itemCode: row.flowItemCode,
  itemName: row.flowItemName,
  specification: row.specification,
  unit: row.unit,
  unitName: row.unitName,
});

const toProcessFlowProcessDto = (
  row: ProcessFlowProcessApiRow,
): ProcessFlowProcessDto => ({
  flowProcessId: row.flowProcessId,
  flowProcessCode: row.flowProcessCode,
  flowProcessName: row.flowProcessName,
  equipmentFlag: row.equipmentFlag,
  seq: Number(row.seq),
  planFlag: row.planFlag,
  lastFlag: row.lastFlag,
});

const withLegacyResult = <T, LegacyRow>(
  rows: T[],
  legacyRows: LegacyRow[],
): LegacyCompatibleRows<T, LegacyRow> =>
  Object.assign(rows, { result: { resultList: legacyRows } });

export const processFlowService = {
  getProcessFlowList: async (
    page: number = 0,
    pageSize: number = 10,
    params?: ProcessFlowSearchParams,
  ) => {
    const requestParams = {
      pageIndex: page + 1,
      pageUnit: pageSize,
      ...params,
    };
    const response = await apiClient.get('/api/processflow', {
      params: requestParams,
    });
    return response.data;
  },

  createProcessFlow: (data: ProcessFlow) => apiClient.post('/api/processflow', data),

  updateProcessFlow: (processFlowId: string, data: ProcessFlow) =>
    apiClient.put(`/api/processflow/${processFlowId}`, data),

  deleteProcessFlow: (processFlowId: string) =>
    apiClient.delete(`/api/processflow/${processFlowId}`),

  getProcessFlowProcess: async (
    processFlowId: string,
  ): Promise<LegacyCompatibleRows<ProcessFlowProcessDto, ProcessFlowProcess>> => {
    const { data } = await apiClient.get<
      ApiResult<DetailListResult<ProcessFlowProcessApiRow & ProcessFlowProcess>>
    >(`/api/processflow/${processFlowId}/process`);
    const resultList = unwrapApiResult(data).resultList;
    return withLegacyResult(
      resultList.map(toProcessFlowProcessDto),
      resultList,
    );
  },

  getProcessFlowItem: async (
    processFlowId: string,
  ): Promise<LegacyCompatibleRows<ProcessFlowItemDto, ProcessFlowItem>> => {
    const { data } = await apiClient.get<
      ApiResult<DetailListResult<ProcessFlowItemApiRow & ProcessFlowItem>>
    >(`/api/processflow/${processFlowId}/item`);
    const resultList = unwrapApiResult(data).resultList;
    return withLegacyResult(resultList.map(toProcessFlowItemDto), resultList);
  },

  saveFlowProcesses: async (
    processFlowId: string,
    request: SaveFlowProcessesRequest,
  ): Promise<SaveFlowProcessesResult> => {
    const { data } = await apiClient.post<ApiResult<SaveFlowProcessesResult>>(
      `/api/processflow/${processFlowId}/process`,
      request,
    );
    const result = unwrapApiResult(data);
    return {
      ...result,
      processes: result.processes.map((process) =>
        toProcessFlowProcessDto(
          process as unknown as ProcessFlowProcessApiRow,
        ),
      ),
    };
  },

  saveFlowItemsDelta: async (
    processFlowId: string,
    request: SaveFlowItemsDeltaRequest,
  ): Promise<SaveFlowItemsDeltaResult> => {
    const { data } = await apiClient.post<ApiResult<SaveFlowItemsDeltaResult>>(
      `/api/processflow/${processFlowId}/item/delta`,
      request,
    );
    const result = unwrapApiResult(data);
    return {
      ...result,
      addedItems: result.addedItems.map((item) =>
        toProcessFlowItemDto(item as unknown as ProcessFlowItemApiRow),
      ),
    };
  },
};

export default processFlowService;
