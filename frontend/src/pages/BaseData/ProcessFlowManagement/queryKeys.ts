import { CatalogParams, ProcessFlowListParams } from './types';

export const processFlowKeys = {
  all: ['processFlow'] as const,
  lists: () => [...processFlowKeys.all, 'list'] as const,
  list: (params: ProcessFlowListParams) =>
    [...processFlowKeys.lists(), params] as const,
  detail: (flowId: string) => [...processFlowKeys.all, 'detail', flowId] as const,
  processes: (flowId: string) =>
    [...processFlowKeys.detail(flowId), 'processes'] as const,
  items: (flowId: string) => [...processFlowKeys.detail(flowId), 'items'] as const,
  processCatalog: (params: CatalogParams) =>
    [...processFlowKeys.all, 'catalog', 'processes', params] as const,
  itemCatalog: (flowId: string, params: CatalogParams) =>
    [...processFlowKeys.all, 'catalog', 'items', flowId, params] as const,
};
