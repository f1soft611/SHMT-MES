import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../../../../components/common/Feedback/ToastProvider';
import type { ProcessFlowItemDto, ProcessFlowSummary, CatalogParams } from '../types';
import { DetailSessionContextProvider } from './DetailSessionContext';
import { ItemDraftContextProvider } from './ItemDraftContext';
import { ProcessDraftContextProvider } from './ProcessDraftContext';
import { useItemDeltaDraft } from './useItemDeltaDraft';
import { useSaveItemsMutation, useSaveProcessesMutation } from './useProcessFlowDetailMutations';
import { useProcessFlowDetailQueries } from './useProcessFlowDetailQueries';
import { useProcessDraft } from './useProcessDraft';
import { validateProcessDraft } from './validators';

type Props = { open: boolean; processFlow: ProcessFlowSummary; children: ReactNode };
const defaultCatalogParams: CatalogParams = { page: 0, pageSize: 10 };
const toError = (error: unknown) => error instanceof Error ? error : null;
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.';

export function ProcessFlowDetailProvider({ open, processFlow, children }: Props) {
  const { showToast } = useToast();
  const flowId = processFlow.processFlowId || '';
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [processCatalogParams] = useState<CatalogParams>(defaultCatalogParams);
  const [itemCatalogParams, setCatalogParams] = useState<CatalogParams>(defaultCatalogParams);
  const queries = useProcessFlowDetailQueries(open, flowId, processCatalogParams, itemCatalogParams);
  const processDraft = useProcessDraft([]);
  const itemDraft = useItemDeltaDraft([]);
  const saveProcessesMutation = useSaveProcessesMutation(flowId);
  const saveItemsMutation = useSaveItemsMutation(flowId);
  const initializedProcessFlowId = useRef<string | null>(null);
  const initializedItemFlowId = useRef<string | null>(null);

  useEffect(() => {
    if (!flowId || !queries.processes.data || initializedProcessFlowId.current === flowId) return;
    processDraft.resetCanonical(queries.processes.data);
    initializedProcessFlowId.current = flowId;
  }, [flowId, processDraft.resetCanonical, queries.processes.data]);

  useEffect(() => {
    if (!flowId || !queries.items.data || initializedItemFlowId.current === flowId) return;
    itemDraft.resetCanonical(queries.items.data);
    initializedItemFlowId.current = flowId;
  }, [flowId, itemDraft.resetCanonical, queries.items.data]);

  const saveProcesses = useCallback(async () => {
    const validation = validateProcessDraft(processDraft.rows);
    if (!validation.ok) {
      showToast({ message: validation.message, severity: 'error' });
      return false;
    }
    try {
      const result = await saveProcessesMutation.mutateAsync({
        processes: processDraft.rows.map(({ flowProcessCode, seq, planFlag, lastFlag }) => ({ flowProcessCode, seq: seq as number, planFlag, lastFlag })),
      });
      processDraft.resetCanonical(result.processes);
      return true;
    } catch (error) {
      showToast({ message: getErrorMessage(error), severity: 'error' });
      return false;
    }
  }, [processDraft, saveProcessesMutation, showToast]);

  const saveItems = useCallback(async () => {
    try {
      const result = await saveItemsMutation.mutateAsync({ addItemIds: itemDraft.addItemIds, deleteFlowItemIds: itemDraft.deleteFlowItemIds });
      const deleted = new Set(result.deletedFlowItemIds);
      const retainedItems: ProcessFlowItemDto[] = itemDraft.rows
        .filter((row) => row.flowItemId && !deleted.has(row.flowItemId))
        .map((row) => ({
          flowItemId: row.flowItemId as string,
          itemId: row.itemId,
          itemCode: row.itemCode,
          itemName: row.itemName,
          specification: row.specification,
          unit: row.unit,
          unitName: row.unitName,
        }));
      itemDraft.resetCanonical([...retainedItems, ...result.addedItems]);
      return true;
    } catch (error) {
      showToast({ message: getErrorMessage(error), severity: 'error' });
      return false;
    }
  }, [itemDraft, saveItemsMutation, showToast]);

  const processValue = useMemo(() => ({ rows: processDraft.rows, dirty: processDraft.dirty, isLoading: queries.processes.isLoading, isSaving: saveProcessesMutation.isPending, error: toError(queries.processes.error), add: processDraft.add, remove: processDraft.remove, updateSeq: processDraft.updateSeq, selectPlan: processDraft.selectPlan, toggleLast: processDraft.toggleLast, save: saveProcesses, retry: () => queries.processes.refetch() }), [processDraft.rows, processDraft.dirty, processDraft.add, processDraft.remove, processDraft.updateSeq, processDraft.selectPlan, processDraft.toggleLast, queries.processes.isLoading, queries.processes.error, queries.processes.refetch, saveProcessesMutation.isPending, saveProcesses]);
  const catalogData = queries.itemCatalog.data?.result;
  const itemValue = useMemo(() => ({ rows: itemDraft.rows, catalogRows: itemDraft.filterCatalog(catalogData?.resultList || []), catalogTotalCount: catalogData?.totalCount || 0, dirty: itemDraft.dirty, isLoading: queries.items.isLoading || queries.itemCatalog.isLoading, isSaving: saveItemsMutation.isPending, error: toError(queries.items.error || queries.itemCatalog.error), add: itemDraft.add, remove: itemDraft.remove, save: saveItems, retry: () => queries.items.refetch(), setCatalogParams }), [itemDraft.rows, itemDraft.dirty, itemDraft.add, itemDraft.remove, itemDraft.filterCatalog, catalogData, queries.items.isLoading, queries.items.error, queries.items.refetch, queries.itemCatalog.isLoading, queries.itemCatalog.error, saveItemsMutation.isPending, saveItems]);
  const sessionValue = useMemo(() => ({ flow: processFlow, tabIndex, setTabIndex, processDirty: processDraft.dirty, itemDirty: itemDraft.dirty, hasDirtyChanges: processDraft.dirty || itemDraft.dirty, isSaving: saveProcessesMutation.isPending || saveItemsMutation.isPending, discardAll: () => { processDraft.discard(); itemDraft.discard(); } }), [processFlow, tabIndex, processDraft.dirty, processDraft.discard, itemDraft.dirty, itemDraft.discard, saveProcessesMutation.isPending, saveItemsMutation.isPending]);

  return <DetailSessionContextProvider value={sessionValue}><ProcessDraftContextProvider value={processValue}><ItemDraftContextProvider value={itemValue}>{children}</ItemDraftContextProvider></ProcessDraftContextProvider></DetailSessionContextProvider>;
}
