import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../../../../components/common/Feedback/ToastProvider';
import type {
  CatalogParams,
  ProcessFlowItemDto,
  ProcessFlowSummary,
} from '../types';
import { DetailSessionContextProvider } from './DetailSessionContext';
import { ItemDraftContextProvider } from './ItemDraftContext';
import { ProcessDraftContextProvider } from './ProcessDraftContext';
import { useItemDeltaDraft } from './useItemDeltaDraft';
import {
  useSaveItemsMutation,
  useSaveProcessesMutation,
} from './useProcessFlowDetailMutations';
import { useProcessFlowDetailQueries } from './useProcessFlowDetailQueries';
import { useProcessDraft } from './useProcessDraft';
import { validateProcessDraft } from './validators';

type Props = {
  open: boolean;
  processFlow: ProcessFlowSummary;
  children: ReactNode;
};

const defaultCatalogParams: CatalogParams = { page: 0, pageSize: 10 };

const toError = (error: unknown) => (error instanceof Error ? error : null);

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : '저장 중 오류가 발생했습니다.';

export function ProcessFlowDetailProvider({
  open,
  processFlow,
  children,
}: Props) {
  const { showToast } = useToast();
  const flowId = processFlow.processFlowId || '';
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [processCatalogParams] =
    useState<CatalogParams>(defaultCatalogParams);
  const [itemCatalogParams, setCatalogParams] =
    useState<CatalogParams>(defaultCatalogParams);

  const queries = useProcessFlowDetailQueries(
    open,
    flowId,
    processCatalogParams,
    itemCatalogParams,
  );
  const {
    data: processData,
    isLoading: isProcessLoading,
    error: processError,
    refetch: refetchProcesses,
  } = queries.processes;
  const {
    data: itemData,
    isFetching: isAppliedItemsFetching,
    error: itemError,
    refetch: refetchItems,
  } = queries.items;
  const {
    data: itemCatalogData,
    isFetching: isCatalogFetching,
    error: itemCatalogError,
    refetch: refetchItemCatalog,
  } = queries.itemCatalog;

  const processDraft = useProcessDraft([]);
  const {
    rows: processRows,
    dirty: processDirty,
    add: addProcess,
    remove: removeProcess,
    updateSeq,
    selectPlan,
    toggleLast,
    resetCanonical: resetProcessCanonical,
    discard: discardProcesses,
  } = processDraft;

  const itemDraft = useItemDeltaDraft([]);
  const {
    rows: itemRows,
    addItemIds,
    deleteFlowItemIds,
    dirty: itemDirty,
    add: addItem,
    remove: removeItem,
    filterCatalog,
    resetCanonical: resetItemCanonical,
    discard: discardItems,
  } = itemDraft;

  const {
    mutateAsync: saveProcessesAsync,
    isPending: isSavingProcesses,
  } = useSaveProcessesMutation(flowId);
  const {
    mutateAsync: saveItemsAsync,
    isPending: isSavingItems,
  } = useSaveItemsMutation(flowId);

  const initializedProcessFlowId = useRef<string | null>(null);
  const initializedItemFlowId = useRef<string | null>(null);

  useEffect(() => {
    if (!flowId || !processData || initializedProcessFlowId.current === flowId) {
      return;
    }
    resetProcessCanonical(processData);
    initializedProcessFlowId.current = flowId;
  }, [flowId, processData, resetProcessCanonical]);

  useEffect(() => {
    if (!flowId || !itemData || initializedItemFlowId.current === flowId) {
      return;
    }
    resetItemCanonical(itemData);
    initializedItemFlowId.current = flowId;
  }, [flowId, itemData, resetItemCanonical]);

  const saveProcesses = useCallback(async () => {
    const validation = validateProcessDraft(processRows);
    if (!validation.ok) {
      showToast({ message: validation.message, severity: 'error' });
      return false;
    }

    try {
      const result = await saveProcessesAsync({
        processes: processRows.map(
          ({ flowProcessCode, seq, planFlag, lastFlag }) => ({
            flowProcessCode,
            seq: seq as number,
            planFlag,
            lastFlag,
          }),
        ),
      });
      resetProcessCanonical(result.processes);
      return true;
    } catch (error) {
      showToast({ message: getErrorMessage(error), severity: 'error' });
      return false;
    }
  }, [processRows, resetProcessCanonical, saveProcessesAsync, showToast]);

  const saveItems = useCallback(async () => {
    try {
      const result = await saveItemsAsync({
        addItemIds,
        deleteFlowItemIds,
      });
      const deleted = new Set(result.deletedFlowItemIds);
      const retainedItems: ProcessFlowItemDto[] = itemRows
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
      resetItemCanonical([...retainedItems, ...result.addedItems]);
      return true;
    } catch (error) {
      showToast({ message: getErrorMessage(error), severity: 'error' });
      return false;
    }
  }, [
    addItemIds,
    deleteFlowItemIds,
    itemRows,
    resetItemCanonical,
    saveItemsAsync,
    showToast,
  ]);

  const processValue = useMemo(
    () => ({
      rows: processRows,
      dirty: processDirty,
      isLoading: isProcessLoading,
      isSaving: isSavingProcesses,
      error: toError(processError),
      add: addProcess,
      remove: removeProcess,
      updateSeq,
      selectPlan,
      toggleLast,
      save: saveProcesses,
      retry: refetchProcesses,
    }),
    [
      processRows,
      processDirty,
      isProcessLoading,
      isSavingProcesses,
      processError,
      addProcess,
      removeProcess,
      updateSeq,
      selectPlan,
      toggleLast,
      saveProcesses,
      refetchProcesses,
    ],
  );

  const catalogData = itemCatalogData?.result;
  const itemValue = useMemo(
    () => ({
      rows: itemRows,
      catalogRows: filterCatalog(catalogData?.resultList || []),
      catalogTotalCount: Number(catalogData?.resultCnt ?? 0),
      dirty: itemDirty,
      isCatalogFetching,
      isAppliedItemsFetching,
      isSaving: isSavingItems,
      error: toError(itemError || itemCatalogError),
      add: addItem,
      remove: removeItem,
      save: saveItems,
      retry: () => Promise.all([refetchItems(), refetchItemCatalog()]),
      setCatalogParams,
    }),
    [
      itemRows,
      filterCatalog,
      catalogData,
      itemDirty,
      isCatalogFetching,
      isAppliedItemsFetching,
      isSavingItems,
      itemError,
      itemCatalogError,
      addItem,
      removeItem,
      saveItems,
      refetchItems,
      refetchItemCatalog,
    ],
  );

  const discardAll = useCallback(() => {
    discardProcesses();
    discardItems();
  }, [discardItems, discardProcesses]);

  const sessionValue = useMemo(
    () => ({
      flow: processFlow,
      tabIndex,
      setTabIndex,
      processDirty,
      itemDirty,
      hasDirtyChanges: processDirty || itemDirty,
      isSaving: isSavingProcesses || isSavingItems,
      discardAll,
    }),
    [
      processFlow,
      tabIndex,
      processDirty,
      itemDirty,
      isSavingProcesses,
      isSavingItems,
      discardAll,
    ],
  );

  return (
    <DetailSessionContextProvider value={sessionValue}>
      <ProcessDraftContextProvider value={processValue}>
        <ItemDraftContextProvider value={itemValue}>
          {children}
        </ItemDraftContextProvider>
      </ProcessDraftContextProvider>
    </DetailSessionContextProvider>
  );
}
