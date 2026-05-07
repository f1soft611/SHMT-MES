import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { getServerDate } from '../../../utils/dateUtils';

const MAX_SCHEDULER_RANGE_DAYS = 31;

interface DateRangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fromDate: string, toDate: string) => Promise<void> | void;
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
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateDateRange = (): string => {
    if (!fromDate || !toDate) {
      return '시작 날짜와 종료 날짜를 모두 입력해주세요.';
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return '유효한 날짜를 입력해주세요.';
    }

    if (from > to) {
      return '시작 날짜는 종료 날짜보다 늦을 수 없습니다.';
    }

    const diffDays =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > MAX_SCHEDULER_RANGE_DAYS) {
      return `조회 기간은 최대 ${MAX_SCHEDULER_RANGE_DAYS}일까지 가능합니다.`;
    }

    return '';
  };

  const handleConfirm = async () => {
    const errorMessage = validateDateRange();
    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    setValidationError('');
    setSubmitting(true);
    try {
      await onConfirm(fromDate, toDate);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset to today's date when closing
    setFromDate(today);
    setToDate(today);
    setValidationError('');
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
            onChange={(e) => {
              setFromDate(e.target.value);
              if (validationError) {
                setValidationError('');
              }
            }}
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
            onChange={(e) => {
              setToDate(e.target.value);
              if (validationError) {
                setValidationError('');
              }
            }}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          {validationError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {validationError}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={submitting}
        >
          {submitting ? '실행 중...' : '실행'}
        </Button>
        <Button onClick={handleClose} disabled={submitting}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;
