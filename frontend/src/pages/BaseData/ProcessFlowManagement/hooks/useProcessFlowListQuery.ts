import { useQuery } from '@tanstack/react-query';
import processFlowService from '../../../../services/processFlowService';
import { processFlowKeys } from '../queryKeys';
import type { ProcessFlowListParams } from '../types';

export function useProcessFlowListQuery(params: ProcessFlowListParams) {
  return useQuery({
    queryKey: processFlowKeys.list(params),
    queryFn: () =>
      processFlowService.getProcessFlowList(params.page, params.pageSize, params),
    refetchOnWindowFocus: false,
  });
}
