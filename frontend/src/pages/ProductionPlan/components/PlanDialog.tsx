import React, { useState } from 'react';
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
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Link as LinkIcon, Info as InfoIcon } from '@mui/icons-material';
import ProductionRequestDialog from './ProductionRequestDialog';
import { ProductionRequest } from '../../../types/productionRequest';
import { Equipment } from '../../../types/equipment';

interface ProductionPlanData {
  id?: string;
  date: string;
  itemCode: string;
  itemName: string;
  plannedQty: number;
  equipmentCode: string;
  equipmentName?: string;
  shift?: string;
  remark?: string;
  // 생산의뢰 연동 정보
  orderNo?: string;
  orderSeqno?: number;
  orderHistno?: number;
  lotNo?: string;
}

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  dialogMode: 'create' | 'edit';
  selectedDate: string;
  formData: ProductionPlanData;
  equipments: Equipment[];
  onSave: () => void;
  onChange: (field: keyof ProductionPlanData, value: any) => void;
}

const PlanDialog: React.FC<PlanDialogProps> = ({
  open,
  onClose,
  dialogMode,
  selectedDate,
  formData,
  equipments,
  onSave,
  onChange,
}) => {
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ProductionRequest | null>(null);

  const handleOpenRequestDialog = () => {
    setOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
  };

  const handleSelectRequest = (request: ProductionRequest) => {
    setSelectedRequest(request);
    // 생산의뢰 정보를 폼 데이터에 반영
    onChange('itemCode', request.itemCode || '');
    onChange('itemName', request.itemName || '');
    onChange('plannedQty', request.orderQty || 0);
    onChange('orderNo', request.orderNo);
    onChange('orderSeqno', request.orderSeqno);
    onChange('orderHistno', request.orderHistno);
    setOpenRequestDialog(false);
  };

  return (
    <>
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
            {/* 생산의뢰 연동 버튼 */}
            {dialogMode === 'create' && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'info.main',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <InfoIcon color="info" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      생산의뢰 연동
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ERP 생산의뢰 정보를 불러와 계획을 생성할 수 있습니다.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleOpenRequestDialog}
                    size="small"
                  >
                    생산의뢰 선택
                  </Button>
                </Stack>
                {selectedRequest && (
                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        선택된 생산의뢰:
                      </Typography>
                      <Chip
                        label={`${selectedRequest.orderNo} - ${selectedRequest.itemName}`}
                        size="small"
                        color="primary"
                      />
                    </Stack>
                  </Box>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              label="계획일자"
              value={dialogMode === 'create' ? selectedDate : formData.date}
              disabled
            />

            {/* LOT 번호 */}
            <TextField
              fullWidth
              label="LOT 번호"
              value={formData.lotNo || ''}
              onChange={(e) => onChange('lotNo', e.target.value)}
              placeholder="LOT 번호를 입력하세요"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                label="품목코드"
                value={formData.itemCode}
                onChange={(e) => onChange('itemCode', e.target.value)}
                disabled={!!selectedRequest}
              />
              <TextField
                fullWidth
                required
                label="품목명"
                value={formData.itemName}
                onChange={(e) => onChange('itemName', e.target.value)}
                disabled={!!selectedRequest}
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
                <InputLabel>설비</InputLabel>
                <Select
                  value={formData.equipmentCode || ''}
                  label="설비"
                  onChange={(e) => {
                    const selectedEquipment = equipments.find(
                      (eq) => eq.equipCd === e.target.value
                    );
                    onChange('equipmentCode', e.target.value);
                    if (selectedEquipment) {
                      onChange(
                        'equipmentName',
                        selectedEquipment.equipmentName
                      );
                    }
                  }}
                >
                  {equipments.map((eq) => (
                    <MenuItem key={eq.equipCd} value={eq.equipCd}>
                      {eq.equipmentName} ({eq.equipCd})
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

            {/* 생산의뢰 정보 표시 (연동된 경우) */}
            {formData.orderNo && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.main',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  연동된 생산의뢰 정보
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`생산의뢰번호: ${formData.orderNo}`}
                    size="small"
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onSave} variant="contained" color="primary">
            저장
          </Button>
          <Button onClick={onClose}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 생산의뢰 선택 다이얼로그 */}
      <ProductionRequestDialog
        open={openRequestDialog}
        onClose={handleCloseRequestDialog}
        onSelect={handleSelectRequest}
      />
    </>
  );
};

export default PlanDialog;
