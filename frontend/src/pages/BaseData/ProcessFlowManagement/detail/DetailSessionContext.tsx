import { createContext, useContext } from 'react';
import type { ProcessFlowSummary } from '../types';

export type DetailSessionContextValue = {
  flow: ProcessFlowSummary;
  tabIndex: 0 | 1;
  setTabIndex: (tab: 0 | 1) => void;
  processDirty: boolean;
  itemDirty: boolean;
  hasDirtyChanges: boolean;
  isSaving: boolean;
  discardAll: () => void;
};

const DetailSessionContext = createContext<DetailSessionContextValue | null>(null);

export const DetailSessionContextProvider = DetailSessionContext.Provider;

export function useDetailSessionContext(): DetailSessionContextValue {
  const value = useContext(DetailSessionContext);
  if (!value) {
    throw new Error('useDetailSessionContext must be used within ProcessFlowDetailProvider');
  }
  return value;
}
