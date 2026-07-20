import React, { useState } from 'react';
import { GridRowId, GridRowModel } from '@mui/x-data-grid';
import { ProcessFlowProcess } from '../../../../../types/processFlow';
import {ProcessType} from '../../../../../types/process';

interface Props {
  flowProcessRows: ProcessFlowProcess[];
  setFlowProcessRows: React.Dispatch<
    React.SetStateAction<ProcessFlowProcess[]>
  >;
}

export function useDetailProcessTab({
  flowProcessRows,
  setFlowProcessRows,
}: Props) {
  /** 선택 관리 */
  const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);
  const [lastProcessId, setLastProcessId] = useState<string | null>(null);

  /** 오른쪽으로 추가 */
  const addProcess = (
    selectedLeft: GridRowId[],
    processRows: ProcessType[],
    processFlowId: string,
    processFlowCode: string,
  ) => {
    if (selectedLeft.length === 0) return;

    setFlowProcessRows((prev) => {
      const existIds = new Set(
          prev.map((p) => p.flowProcessId).filter(Boolean)
      );

      // 현재 seq 최대값 구하기 (숫자만)
      const maxSeq =
          prev
          .map((p) => Number(p.seq))
          .filter((n) => !Number.isNaN(n))
          .reduce((acc, cur) => Math.max(acc, cur), 0);

      let nextSeq = maxSeq + 1;

      const newRows: ProcessFlowProcess[] = processRows
        .filter((p) => p.processId  && selectedLeft.includes(p.processId ))
        .filter((p) => p.processId  && !existIds.has(p.processId ))
        .map((p) => ({
          flowRowId: crypto.randomUUID(),
          flowProcessId: null,

          processFlowId,
          processFlowCode,

          flowProcessCode: p.processCode!,
          flowProcessName: p.processName,

          equipmentFlag: p.equipmentIntegrationYn ?? 'N',
          lastFlag: 'N',
          planFlag: 'N',
          // 자동증가
          seq: String(nextSeq++),
          processSeq: String(p.sortOrder ?? ''),
        }));

      return [...prev, ...newRows];
    });
  };

  /** 오른쪽 목록 삭제 */
  const removeProcess = () => {
    if (rightSelected.length === 0) return;
    setFlowProcessRows((prev) =>
      prev.filter(
        (p) => !rightSelected.includes(p.flowProcessId ?? p.flowRowId),
      ),
    );

    setRightSelected([]);
  };

  /** -----------------------------
   *  seq, lastFlag 등 업데이트
   * ------------------------------*/
  const updateProcessRow = (
    newRow: GridRowModel,
    oldRow: GridRowModel,
  ): GridRowModel => {
    setFlowProcessRows((prev) => {
      const updated = prev.map((p) =>
        (p.flowProcessId ?? p.flowRowId) ===
        (newRow.flowProcessId ?? newRow.flowRowId)
          ? { ...p, seq: newRow.seq }
          : p,
      );

      return [...updated].sort((a, b) => {
        const sa = a.seq ? Number(a.seq) : null;
        const sb = b.seq ? Number(b.seq) : null;

        if (sa === null && sb === null) return 0;
        if (sa === null) return 1;
        if (sb === null) return -1;

        return sa - sb;
      });
    });

    return newRow;
  };

  // planFlag 라디오 선택
  const selectPlanFlag = (rid: string) => {
    setFlowProcessRows((prev) =>
      prev.map((p) =>
        (p.flowProcessId ?? p.flowRowId) === rid
          ? { ...p, planFlag: 'Y' }
          : { ...p, planFlag: 'N' },
      ),
    );
    setLastProcessId(rid);
  };

  // lastFlag(I/F 연동) 체크박스 토글 - 다건 선택 가능
  const toggleLastFlag = (rid: string) => {
    setFlowProcessRows((prev) =>
      prev.map((p) =>
        (p.flowProcessId ?? p.flowRowId) === rid
          ? { ...p, lastFlag: p.lastFlag === 'Y' ? 'N' : 'Y' }
          : p,
      ),
    );
  };

  return {
    rightSelected,
    setRightSelected,
    lastProcessId,

    addProcess,
    removeProcess,
    updateProcessRow,
    selectPlanFlag,
    toggleLastFlag,
  };
}
