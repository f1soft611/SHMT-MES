import { createContext, useContext } from 'react';
import type { GridRowId } from '@mui/x-data-grid';
import type { ItemType } from '../../../../types/item';
import type { CatalogParams, ProcessFlowItemDraft } from '../types';

export type ItemDraftContextValue = {
  rows: ProcessFlowItemDraft[];
  catalogRows: ItemType[];
  catalogTotalCount: number;
  dirty: boolean;
  isCatalogFetching: boolean;
  isAppliedItemsFetching: boolean;
  isSaving: boolean;
  error: Error | null;
  add: (ids: GridRowId[], source: ItemType[]) => void;
  remove: (rowIds: GridRowId[]) => void;
  save: () => Promise<boolean>;
  retry: () => Promise<unknown>;
  setCatalogParams: (params: CatalogParams) => void;
};

const ItemDraftContext = createContext<ItemDraftContextValue | null>(null);

export const ItemDraftContextProvider = ItemDraftContext.Provider;

export function useItemDraftContext(): ItemDraftContextValue {
  const value = useContext(ItemDraftContext);
  if (!value) {
    throw new Error('useItemDraftContext must be used within ProcessFlowDetailProvider');
  }
  return value;
}
