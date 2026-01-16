import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { ProcessFlowItem } from '../../../../../types/processFlow';
import { Item } from '../../../../../types/item';

interface Props {
  flowItemRows: ProcessFlowItem[];
  setFlowItemRows: React.Dispatch<React.SetStateAction<ProcessFlowItem[]>>;
}

export function useDetailItemTab({ flowItemRows, setFlowItemRows }: Props) {
  /** 선택 관리 */
  const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);

  /** 오른쪽으로 추가 */
  const addItems = (
    leftSelected: GridRowId[],
    itemRows: Item[],
    processFlowId: string,
    processFlowCode: string
  ) => {
    if (!leftSelected.length) return;

    setFlowItemRows((prev) => {
      const existCodes = new Set(prev.map((r) => r.flowItemCode));

      const newList: ProcessFlowItem[] = itemRows
        .filter((it) => leftSelected.includes(it.itemCode))
        .filter((it) => !existCodes.has(it.itemCode))
        .map((it) => ({
          flowRowId: crypto.randomUUID(),
          flowItemId: null,

          processFlowId,
          processFlowCode,

          flowItemCode: it.itemCode,
          flowItemCodeId: it.itemId ?? '',
          flowItemName: it.itemName,
          specification: it.specification ?? '',
          unit: it.unit ?? '',
          unitName: it.unitName ?? '',
        }));

      return [...prev, ...newList];
    });
  };

  /** 오른쪽 목록 삭제 */
  const removeItems = () => {
    if (rightSelected.length === 0) return;

    setFlowItemRows((prev) =>
      prev.filter((r) => !rightSelected.includes(r.flowItemId ?? r.flowRowId))
    );

    setRightSelected([]);
  };

  return {
    /** 선택 */
    rightSelected,
    setRightSelected,

    /** 조작 */
    addItems,
    removeItems,
  };
}
