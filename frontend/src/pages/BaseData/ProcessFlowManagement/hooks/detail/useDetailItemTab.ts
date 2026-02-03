import React, { useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { ProcessFlowItem } from '../../../../../types/processFlow';
import { Item } from '../../../../../types/item';
import processFlowService from "../../../../../services/processFlowService";
import {useToast} from "../../../../../components/common/Feedback/ToastProvider";

interface Props {
  flowItemRows: ProcessFlowItem[];
  setFlowItemRows: React.Dispatch<React.SetStateAction<ProcessFlowItem[]>>;
}

export function useDetailItemTab({ flowItemRows, setFlowItemRows }: Props) {
  const { showToast } = useToast();

  /** 선택 관리 */
  const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<GridRowId[]>([]);

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

  // /** 오른쪽 목록 삭제 */
  // const removeItems = () => {
  //   if (rightSelected.length === 0) return;
  //
  //   setFlowItemRows((prev) =>
  //     prev.filter((r) => !rightSelected.includes(r.flowItemId ?? r.flowRowId))
  //   );
  //
  //   setRightSelected([]);
  // };

  /** 삭제 버튼 클릭 */
  const requestRemoveItems = () => {
    if (rightSelected.length === 0) return;

    const selectedRows = flowItemRows.filter((r) =>
        rightSelected.includes(r.flowItemId ?? r.flowRowId)
    );

    const hasSavedRow = selectedRows.some(
        (r) => r.flowItemId !== null
    );

    //  전부 신규 → 바로 제거
    if (!hasSavedRow) {
      setFlowItemRows((prev) =>
          prev.filter(
              (r) => !rightSelected.includes(r.flowItemId ?? r.flowRowId)
          )
      );
      setRightSelected([]);
      return;
    }

    //  하나라도 저장된 게 있으면 확인 필요
    setPendingDeleteIds(
        selectedRows.map((r) => r.flowItemId ?? r.flowRowId)
    );
    setOpenConfirm(true);
  };

  /** 실제 삭제 */
  const confirmRemoveItems = async () => {
    // 1. 삭제 대상 중 저장된 것만 추림
    const deleteTargets = flowItemRows
    .filter((r) =>
        pendingDeleteIds.includes(r.flowItemId ?? r.flowRowId)
    )
    .filter((r) => r.flowItemId !== null)
    .map((r) => ({ flowItemId: r.flowItemId! }));

    try {
      // 2. 백엔드 삭제
      if (deleteTargets.length > 0) {
        await processFlowService.deleteFlowItems(deleteTargets);
      }

      // 3. 성공 후 화면 반영
      setFlowItemRows((prev) =>
          prev.filter(
              (r) => !pendingDeleteIds.includes(r.flowItemId ?? r.flowRowId)
          )
      );

      setRightSelected([]);
      setPendingDeleteIds([]);
      setOpenConfirm(false);

      showToast({
        message: '공정흐름 품목이 삭제되었습니다.',
        severity: 'success',
      });
    } catch (e) {
      // 실패 시 화면 유지
      console.error(e);
      showToast({
        message: '삭제 처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  /** 취소 */
  const cancelRemoveItems = () => {
    setPendingDeleteIds([]);
    setOpenConfirm(false);
  };

  return {
    /** 선택 */
    rightSelected,
    setRightSelected,

    /** 조작 */
    addItems,
    // removeItems,

    // 삭제 플로우
    requestRemoveItems,
    confirmRemoveItems,
    cancelRemoveItems,
    openConfirm,
  };

}
