import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { getServerDate } from '../../../utils/dateUtils';

interface DateRangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fromDate: string, toDate: string) => void;
  schedulerName: string;
}

const DateRangeDialog: React.FC<DateRangeDialogProps> = ({
  open,
  onClose,
  onConfirm,
  schedulerName,
}) => {
  const today = getServerDate().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  const handleConfirm = () => {
    onConfirm(fromDate, toDate);
    onClose();
  };

  const handleClose = () => {
    // Reset to today's date when closing
    setFromDate(today);
    setToDate(today);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>스케쥴러 즉시 실행 - 기간 선택</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <strong>스케쥴러:</strong> {schedulerName}
          </Box>
          <TextField
            label="시작 날짜"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="종료 날짜"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          실행
        </Button>
        <Button onClick={handleClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;
