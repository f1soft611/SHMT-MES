import { useState } from 'react';
import { ProdPlanRow } from '../../../types/productionOrder';

interface UseStopWorkDialogReturn {
  open: boolean;
  orderQty: number;
  setOrderQty: (v: number) => void;
  handleOpen: () => void;
  handleClose: () => void;
}

export function useStopWorkDialog(selectedRows: ProdPlanRow[]): UseStopWorkDialogReturn {
  const [open, setOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(0);

  const handleOpen = () => {
    setOrderQty(selectedRows[0]?.prodQty ?? 0);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return { open, orderQty, setOrderQty, handleOpen, handleClose };
}
