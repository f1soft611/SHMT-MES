import { useState } from 'react';
import {ProdPlanRow, StopWorkDto} from '../../../types/productionOrder';
import {productionOrderService} from "../../../services/productionOrderService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";

interface UseStopWorkDialogReturn {
  open: boolean;
  orderQty: number;
  isLoading: boolean;
  setOrderQty: (v: number) => void;
  handleOpen: () => void;
  handleClose: () => void;
  handleConfirm: () => Promise<void>;
}

export function useStopWorkDialog(
    selectedRows: ProdPlanRow[],
    clear: () => void,
    onReload: () => void,
): UseStopWorkDialogReturn {
  const [open, setOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleOpen = () => {
    setOrderQty(selectedRows[0]?.prodQty ?? 0);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    const row = selectedRows[0];
    if (!row) return;

    const dto: StopWorkDto = {
      prodplanDate: row.prodplanDate,
      prodplanSeq: row.prodplanSeq,
      prodworkSeq: row.prodworkSeq,
      prodQty: orderQty,
    };

    try {
      setIsLoading(true);
      const response = await productionOrderService.stopWork(dto);

      if (response.data.resultCode !== 200) {
        showToast({
          message: response.data.resultMessage ?? '작업중단 처리 실패',
          severity: 'error',
        });
        return;
      }

      showToast({
        message: response.data.resultMessage ?? '작업중단 처리가 완료되었습니다.',
        severity: 'success',
      });
      setOpen(false);
      clear();
      onReload();
    } catch {
      showToast({
        message: '서버 오류가 발생했습니다.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { open, orderQty, isLoading, setOrderQty, handleOpen, handleClose, handleConfirm };
}
