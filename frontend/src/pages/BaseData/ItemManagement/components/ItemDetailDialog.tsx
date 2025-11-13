import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Item } from '../../../../types/item';

// 천단위 콤마 포맷 함수
const formatNumber = (value: string | number | undefined): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('ko-KR');
};

// 콤마 제거 함수
const removeCommas = (value: string): string => {
  return value.replace(/,/g, '');
};

interface ItemDetailDialogProps {
  open: boolean;
  dialogMode: 'create' | 'edit';
  onClose: () => void;
  onSave: () => void;
  control: Control<Item>;
  errors: FieldErrors<Item>;
}

const ItemDetailDialog: React.FC<ItemDetailDialogProps> = ({
  open,
  dialogMode,
  onClose,
  onSave,
  control,
  errors,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {dialogMode === 'create' ? '품목 등록' : '품목 수정'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <Controller
              name="itemCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="품목코드"
                  disabled={dialogMode === 'edit'}
                  error={!!errors.itemCode}
                  helperText={
                    errors.itemCode?.message ||
                    (dialogMode === 'edit'
                      ? '수정 시 품목코드는 변경할 수 없습니다'
                      : '')
                  }
                />
              )}
            />
            <Controller
              name="itemName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="품목명"
                  error={!!errors.itemName}
                  helperText={errors.itemName?.message}
                />
              )}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Controller
              name="specification"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="규격" />
              )}
            />
            <Controller
              name="itemType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>품목타입</InputLabel>
                  <Select {...field} label="품목타입">
                    <MenuItem value="PRODUCT">제품</MenuItem>
                    <MenuItem value="MATERIAL">자재</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="단위" />
              )}
            />
            <Controller
              name="stockQty"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="재고수량"
                  value={formatNumber(field.value)}
                  onChange={(e) => {
                    const value = removeCommas(e.target.value);
                    if (/^\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9,]*',
                    style: { textAlign: 'right' },
                  }}
                />
              )}
            />
            <Controller
              name="safetyStock"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="안전재고"
                  value={formatNumber(field.value)}
                  onChange={(e) => {
                    const value = removeCommas(e.target.value);
                    if (/^\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9,]*',
                    style: { textAlign: 'right' },
                  }}
                />
              )}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Controller
              name="useYn"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>사용 여부</InputLabel>
                  <Select {...field} label="사용 여부">
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="interfaceYn"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled>
                  <InputLabel>인터페이스 여부</InputLabel>
                  <Select {...field} label="인터페이스 여부">
                    <MenuItem value="Y">예</MenuItem>
                    <MenuItem value="N">아니오</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
          <Controller
            name="remark"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth multiline rows={3} label="비고" />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSave} variant="contained" color="primary">
          저장
        </Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemDetailDialog;
