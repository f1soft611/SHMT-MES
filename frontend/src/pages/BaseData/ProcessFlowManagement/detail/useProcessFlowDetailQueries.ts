import { useQuery } from '@tanstack/react-query';
import { itemService } from '../../../../services/itemService';
import { processService } from '../../../../services/processService';
import { processFlowService } from '../../../../services/processFlowService';
import { processFlowKeys } from '../queryKeys';
import type { CatalogParams } from '../types';

export function useProcessFlowDetailQueries(
  open: boolean,
  flowId: string | null,
  processCatalogParams: CatalogParams,
  itemCatalogParams: CatalogParams,
) {
  const enabled = open && Boolean(flowId);
  const processes = useQuery({
    queryKey: processFlowKeys.processes(flowId || ''),
    queryFn: () => processFlowService.getProcessFlowProcess(flowId as string),
    enabled,
    refetchOnWindowFocus: false,
  });
  const items = useQuery({
    queryKey: processFlowKeys.items(flowId || ''),
    queryFn: () => processFlowService.getProcessFlowItem(flowId as string),
    enabled,
    refetchOnWindowFocus: false,
  });
  const processCatalog = useProcessCatalogQuery(processCatalogParams);
  const itemCatalog = useItemCatalogQuery(flowId || '', itemCatalogParams);

  return { processes, items, processCatalog, itemCatalog };
}

export function useProcessCatalogQuery(params: CatalogParams) {
  return useQuery({
    queryKey: processFlowKeys.processCatalog(params),
    queryFn: () => processService.getProcessList(params.page, params.pageSize, params),
    refetchOnWindowFocus: false,
  });
}

export function useItemCatalogQuery(flowId: string, params: CatalogParams) {
  const request = { ...params, availableForProcessFlowId: flowId, useYn: 'Y' };
  return useQuery({
    queryKey: processFlowKeys.itemCatalog(flowId, request),
    queryFn: () => itemService.getItemList(request.page, request.pageSize, request),
    enabled: Boolean(flowId),
    refetchOnWindowFocus: false,
  });
}
