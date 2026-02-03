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
  Typography,
} from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Equipment } from '../../../../types/equipment';

interface EquipmentDetailDialogProps {
  open: boolean;
  dialogMode: 'create' | 'edit';
  onClose: () => void;
  onSave: () => void;
  control: Control<Equipment>;
  errors: FieldErrors<Equipment>;
}

const EquipmentDetailDialog: React.FC<EquipmentDetailDialogProps> = ({
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
        {dialogMode === 'create' ? '설비 등록' : '설비 수정'}
      </DialogTitle>
      <DialogContent dividers={true}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            {/* <Controller
              name="equipSysCd"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="시스템 코드"
                  disabled={dialogMode === 'edit'}
                  error={!!errors.equipSysCd}
                  helperText={errors.equipSysCd?.message}
                />
              )}
            /> */}
            <Controller
              name="equipCd"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="설비 코드 (미입력시 설비ID 자동설정)"
                  disabled={dialogMode === 'edit'}
                  error={!!errors.equipCd}
                  helperText={errors.equipCd?.message}
                />
              )}
            />
          </Stack>
          <Controller
            name="equipmentName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="설비명"
                error={!!errors.equipmentName}
                helperText={errors.equipmentName?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <Controller
              name="equipSpec"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="설비 규격" />
              )}
            />
            <Controller
              name="equipStruct"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="설비 종류" />
              )}
            />
          </Stack>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="위치" />
            )}
          />
          {/* <Stack direction="row" spacing={2}>
            <Controller
              name="managerCode"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="관리자 코드" />
              )}
            />
            <Controller
              name="manager2Code"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="관리자2 코드" />
              )}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Controller
              name="opmanCode"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="작업자 코드" />
              )}
            />
            <Controller
              name="opman2Code"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="작업자2 코드" />
              )}
            />
          </Stack> */}
          {/* <Stack direction="row" spacing={2}>
            <Controller
              name="optime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="가동 시간"
                  placeholder="예: 0800-1800"
                />
              )}
            />
            <Controller
              name="optime2"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="가동 시간2"
                  placeholder="예: 1800-2400"
                />
              )}
            />
          </Stack> */}
          <Controller
            name="plcAddress"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="PLC 주소"
                error={!!errors.plcAddress}
                helperText={errors.plcAddress?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <Controller
              name="statusFlag"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.statusFlag}>
                  <InputLabel>상태</InputLabel>
                  <Select {...field} label="상태">
                    <MenuItem value="1">정상</MenuItem>
                    <MenuItem value="0">정지</MenuItem>
                  </Select>
                  {errors.statusFlag && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {errors.statusFlag.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="useFlag"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.useFlag}>
                  <InputLabel>사용 여부</InputLabel>
                  <Select {...field} label="사용 여부">
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                  {errors.useFlag && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      {errors.useFlag.message}
                    </Typography>
                  )}
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

export default EquipmentDetailDialog;
