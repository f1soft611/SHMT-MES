import { useCallback, useMemo, useRef, useState } from 'react';
import type { GridRowId } from '@mui/x-data-grid';
import type { ProcessType } from '../../../../types/process';
import type {
  ProcessFlowProcessDraft,
  ProcessFlowProcessDto,
} from '../types';
import type { ValidationResult } from './validators';

export function useProcessDraft(
  initialRows: ProcessFlowProcessDto[],
  createRowId: () => string = () => crypto.randomUUID(),
) {
  const toDraft = useCallback(
    (canonical: ProcessFlowProcessDto[]) =>
      canonical.map((row) => ({ ...row, rowId: row.flowProcessId })),
    [],
  );
  const [baseRows, setBaseRows] = useState<ProcessFlowProcessDraft[]>(() =>
    toDraft(initialRows),
  );
  const [rows, setRows] = useState<ProcessFlowProcessDraft[]>(() =>
    toDraft(initialRows),
  );
  const rowsRef = useRef(rows);

  const replaceRows = useCallback((next: ProcessFlowProcessDraft[]) => {
    rowsRef.current = next;
    setRows(next);
  }, []);

  const resetCanonical = useCallback(
    (canonical: ProcessFlowProcessDto[]) => {
      const next = toDraft(canonical);
      setBaseRows(next);
      replaceRows(next);
    },
    [replaceRows, toDraft],
  );

  const add = useCallback(
    (ids: GridRowId[], source: ProcessType[]): ValidationResult => {
      const selected = source.filter((row) => ids.includes(row.processId));
      const current = rowsRef.current;
      if (current.length + selected.length > 5) {
        return { ok: false, message: '공정은 최대 5개까지 등록할 수 있습니다.' };
      }

      let nextSeq = Math.max(0, ...current.map((row) => row.seq || 0)) + 1;
      replaceRows(
        current.concat(
          selected.map((row) => ({
              rowId: createRowId(),
              flowProcessId: null,
              flowProcessCode: row.processCode || '',
              flowProcessName: row.processName,
              equipmentFlag: row.equipmentIntegrationYn === 'Y' ? 'Y' : 'N',
              seq: nextSeq++,
              planFlag: 'N',
              lastFlag: 'N',
            })),
        ),
      );

      return { ok: true };
    },
    [createRowId, replaceRows],
  );

  const remove = useCallback((rowIds: GridRowId[]) => {
    replaceRows(
      rowsRef.current.filter((row) => !rowIds.includes(row.rowId)),
    );
  }, [replaceRows]);

  const updateSeq = useCallback((rowId: string, seq: number | null) => {
    replaceRows(
      rowsRef.current.map((row) =>
        row.rowId === rowId ? { ...row, seq: seq as number } : row,
      ),
    );
  }, [replaceRows]);

  const selectPlan = useCallback((rowId: string) => {
    replaceRows(
      rowsRef.current.map((row) => ({
        ...row,
        planFlag: row.rowId === rowId ? 'Y' : 'N',
      })),
    );
  }, [replaceRows]);

  const toggleLast = useCallback((rowId: string) => {
    replaceRows(
      rowsRef.current.map((row) =>
        row.rowId === rowId
          ? { ...row, lastFlag: row.lastFlag === 'Y' ? 'N' : 'Y' }
          : row,
      ),
    );
  }, [replaceRows]);

  const dirty = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(baseRows),
    [rows, baseRows],
  );

  const discard = useCallback(() => replaceRows(baseRows), [baseRows, replaceRows]);

  return {
    rows,
    dirty,
    add,
    remove,
    updateSeq,
    selectPlan,
    toggleLast,
    resetCanonical,
    discard,
  };
}
