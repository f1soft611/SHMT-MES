import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProcessFlow } from '../../../../types/processFlow';
import processFlowService from '../../../../services/processFlowService';
import { processFlowKeys } from '../queryKeys';

export function useProcessFlowMasterMutations() {
  const queryClient = useQueryClient();
  const refreshLists = () =>
    queryClient.invalidateQueries({ queryKey: processFlowKeys.lists() });

  return {
    create: useMutation({
      mutationFn: processFlowService.createProcessFlow,
      onSuccess: refreshLists,
      retry: false,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: ProcessFlow }) =>
        processFlowService.updateProcessFlow(id, data),
      onSuccess: refreshLists,
      retry: false,
    }),
    remove: useMutation({
      mutationFn: processFlowService.deleteProcessFlow,
      onSuccess: refreshLists,
      retry: false,
    }),
  };
}
