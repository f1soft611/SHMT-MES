import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';

interface ProductionPlanData {
  id?: string;
  date: string;
  itemCode: string;
  itemName: string;
  plannedQty: number;
  workplaceCode: string;
  workplaceName?: string;
  shift?: string;
  remark?: string;
}

interface Workplace {
  workplaceId?: string;
  workplaceCode: string;
  workplaceName: string;
  expanded?: boolean;
}

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  dialogMode: 'create' | 'edit';
  selectedDate: string;
  formData: ProductionPlanData;
  workplaces: Workplace[];
  onSave: () => void;
  onChange: (field: keyof ProductionPlanData, value: any) => void;
}

const PlanDialog: React.FC<PlanDialogProps> = ({
  open,
  onClose,
  dialogMode,
  selectedDate,
  formData,
  workplaces,
  onSave,
  onChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}
      >
        {dialogMode === 'create' ? '생산계획 등록' : '생산계획 수정'}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="계획일자"
            value={dialogMode === 'create' ? selectedDate : formData.date}
            disabled
          />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              required
              label="품목코드"
              value={formData.itemCode}
              onChange={(e) => onChange('itemCode', e.target.value)}
            />
            <TextField
              fullWidth
              required
              label="품목명"
              value={formData.itemName}
              onChange={(e) => onChange('itemName', e.target.value)}
            />
          </Stack>
          <TextField
            fullWidth
            required
            label="계획수량"
            type="number"
            value={formData.plannedQty}
            onChange={(e) => onChange('plannedQty', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>작업장</InputLabel>
              <Select
                value={formData.workplaceCode}
                label="작업장"
                onChange={(e) => {
                  const selectedWorkplace = workplaces.find(
                    (wp) => wp.workplaceCode === e.target.value
                  );
                  onChange('workplaceCode', e.target.value);
                  if (selectedWorkplace) {
                    onChange('workplaceName', selectedWorkplace.workplaceName);
                  }
                }}
              >
                {workplaces.map((wp) => (
                  <MenuItem key={wp.workplaceCode} value={wp.workplaceCode}>
                    {wp.workplaceName} ({wp.workplaceCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>교대</InputLabel>
              <Select
                value={formData.shift}
                label="교대"
                onChange={(e) => onChange('shift', e.target.value)}
              >
                <MenuItem value="DAY">주간</MenuItem>
                <MenuItem value="NIGHT">야간</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="비고"
            value={formData.remark}
            onChange={(e) => onChange('remark', e.target.value)}
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onSave} variant="contained" size="large" sx={{ px: 4 }}>
          저장
        </Button>
        <Button onClick={onClose} variant="outlined" size="large">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanDialog;
