import { createContext, useContext } from 'react';
import type { GridRowId } from '@mui/x-data-grid';
import type { ProcessType } from '../../../../types/process';
import type { ProcessFlowProcessDraft } from '../types';
import type { ValidationResult } from './validators';

export type ProcessDraftContextValue = {
  rows: ProcessFlowProcessDraft[];
  dirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  add: (ids: GridRowId[], source: ProcessType[]) => ValidationResult;
  remove: (rowIds: GridRowId[]) => void;
  updateSeq: (rowId: string, seq: number | null) => void;
  selectPlan: (rowId: string) => void;
  toggleLast: (rowId: string) => void;
  save: () => Promise<boolean>;
  retry: () => Promise<unknown>;
};

const ProcessDraftContext = createContext<ProcessDraftContextValue | null>(null);

export const ProcessDraftContextProvider = ProcessDraftContext.Provider;

export function useProcessDraftContext(): ProcessDraftContextValue {
  const value = useContext(ProcessDraftContext);
  if (!value) {
    throw new Error('useProcessDraftContext must be used within ProcessFlowDetailProvider');
  }
  return value;
}
