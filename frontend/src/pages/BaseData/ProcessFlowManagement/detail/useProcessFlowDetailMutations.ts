import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processFlowService } from '../../../../services/processFlowService';
import { processFlowKeys } from '../queryKeys';
import type {
  SaveFlowItemsDeltaRequest,
  SaveFlowProcessesRequest,
} from '../types';

export function useSaveProcessesMutation(flowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveFlowProcessesRequest) =>
      processFlowService.saveFlowProcesses(flowId, request),
    retry: false,
    onSuccess: (result) => {
      queryClient.setQueryData(
        processFlowKeys.processes(flowId),
        result.processes,
      );
    },
  });
}

export function useSaveItemsMutation(flowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveFlowItemsDeltaRequest) =>
      processFlowService.saveFlowItemsDelta(flowId, request),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['processFlow', 'catalog', 'items', flowId],
      });
    },
  });
}
