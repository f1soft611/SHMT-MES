import { useCallback, useRef, useState } from 'react';
import type { GridRowId } from '@mui/x-data-grid';
import type { ItemType } from '../../../../types/item';
import type { ProcessFlowItemDraft, ProcessFlowItemDto } from '../types';

export function useItemDeltaDraft(
  initialRows: ProcessFlowItemDto[],
  createRowId: () => string = () => crypto.randomUUID(),
) {
  const toDraft = useCallback(
    (canonical: ProcessFlowItemDto[]) =>
      canonical.map((row) => ({ ...row, rowId: row.flowItemId })),
    [],
  );
  const [baseRows, setBaseRows] = useState<ProcessFlowItemDraft[]>(() =>
    toDraft(initialRows),
  );
  const [rows, setRows] = useState<ProcessFlowItemDraft[]>(() =>
    toDraft(initialRows),
  );
  const rowsRef = useRef(rows);
  const [addedItems, setAddedItems] = useState<
    Map<string, ProcessFlowItemDraft>
  >(new Map());
  const addedItemsRef = useRef(addedItems);
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set());
  const removedItemIdsRef = useRef(removedItemIds);

  const replaceRows = useCallback((next: ProcessFlowItemDraft[]) => {
    rowsRef.current = next;
    setRows(next);
  }, []);

  const replaceAddedItems = useCallback(
    (next: Map<string, ProcessFlowItemDraft>) => {
      addedItemsRef.current = next;
      setAddedItems(next);
    },
    [],
  );

  const replaceRemovedItemIds = useCallback((next: Set<string>) => {
    removedItemIdsRef.current = next;
    setRemovedItemIds(next);
  }, []);

  const resetCanonical = useCallback(
    (canonical: ProcessFlowItemDto[]) => {
      const next = toDraft(canonical);
      setBaseRows(next);
      replaceRows(next);
      replaceAddedItems(new Map());
      replaceRemovedItemIds(new Set());
    },
    [replaceAddedItems, replaceRemovedItemIds, replaceRows, toDraft],
  );

  const remove = useCallback((rowIds: GridRowId[]) => {
    const current = rowsRef.current;
    const targets = current.filter((row) => rowIds.includes(row.rowId));
    const nextAdded = new Map(addedItemsRef.current);
    const nextRemoved = new Set(removedItemIdsRef.current);
    targets
      .filter((row) => row.flowItemId === null)
      .forEach((row) => nextAdded.delete(row.itemId));
    targets
      .filter((row) => row.flowItemId !== null)
      .forEach((row) => nextRemoved.add(row.flowItemId as string));

    replaceRows(current.filter((row) => !rowIds.includes(row.rowId)));
    replaceAddedItems(nextAdded);
    replaceRemovedItemIds(nextRemoved);
  }, [replaceAddedItems, replaceRemovedItemIds, replaceRows]);

  const add = useCallback(
    (itemIds: GridRowId[], source: ItemType[]) => {
      const nextRows = [...rowsRef.current];
      const nextAdded = new Map(addedItemsRef.current);
      const nextRemoved = new Set(removedItemIdsRef.current);
      const appliedIds = new Set(rowsRef.current.map((row) => row.itemId));

      itemIds.forEach((gridId) => {
        const itemId = String(gridId);
        if (appliedIds.has(itemId)) {
          return;
        }
        const saved = baseRows.find((row) => row.itemId === itemId);
        if (saved?.flowItemId && nextRemoved.has(saved.flowItemId)) {
          nextRemoved.delete(saved.flowItemId);
          nextRows.push(saved);
          appliedIds.add(itemId);
          return;
        }
        const item = source.find((row) => row.itemId === itemId);
        if (!item || nextAdded.has(itemId)) {
          return;
        }
        const draft: ProcessFlowItemDraft = {
          rowId: createRowId(),
          flowItemId: null,
          itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          specification: item.specification,
          unit: item.unit,
          unitName: item.unitName,
        };
        nextAdded.set(itemId, draft);
        nextRows.push(draft);
        appliedIds.add(itemId);
      });

      replaceRows(nextRows);
      replaceAddedItems(nextAdded);
      replaceRemovedItemIds(nextRemoved);
    },
    [
      baseRows,
      createRowId,
      replaceAddedItems,
      replaceRemovedItemIds,
      replaceRows,
    ],
  );

  const filterCatalog = useCallback(
    (catalog: ItemType[]) => {
      const applied = new Set(rows.map((row) => row.itemId));
      return catalog.filter((item) => !applied.has(item.itemId));
    },
    [rows],
  );

  const discard = useCallback(() => {
    replaceRows(baseRows);
    replaceAddedItems(new Map());
    replaceRemovedItemIds(new Set());
  }, [baseRows, replaceAddedItems, replaceRemovedItemIds, replaceRows]);

  return {
    rows,
    addItemIds: Array.from(addedItems.keys()),
    deleteFlowItemIds: Array.from(removedItemIds),
    dirty: addedItems.size > 0 || removedItemIds.size > 0,
    add,
    remove,
    filterCatalog,
    resetCanonical,
    discard,
  };
}
