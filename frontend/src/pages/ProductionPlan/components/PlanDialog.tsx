import React, { useState, useEffect } from 'react';
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
  FormHelperText,
} from '@mui/material';
import { Link as LinkIcon, Info as InfoIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

// 생산계획 등록 유효성 검사 스키마
const productionPlanSchema: yup.ObjectSchema<ProductionPlanData> = yup.object({
  id: yup.string(),
  date: yup.string().required('계획일자는 필수입니다.'),
  itemCode: yup.string().required('품목코드는 필수입니다.'),
  itemName: yup.string().required('품목명은 필수입니다.'),
  plannedQty: yup
    .number()
    .required('계획수량은 필수입니다.')
    .min(1, '계획수량은 1 이상이어야 합니다.')
    .typeError('계획수량은 숫자여야 합니다.'),
  equipmentCode: yup.string().required('설비는 필수입니다.'),
  equipmentName: yup.string(),
  shift: yup.string(),
  remark: yup.string(),
  orderNo: yup.string(),
  orderSeqno: yup.number(),
  orderHistno: yup.number(),
  lotNo: yup.string(),
});

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  dialogMode: 'create' | 'edit';
  selectedDate: string;
  formData: ProductionPlanData;
  equipments: Equipment[];
  onSave: (data: ProductionPlanData) => void;
  onChange: (field: keyof ProductionPlanData, value: any) => void;
  onBatchChange: (updates: Partial<ProductionPlanData>) => void;
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
  onBatchChange,
}) => {
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ProductionRequest | null>(null);

  // react-hook-form 설정
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductionPlanData>({
    resolver: yupResolver(productionPlanSchema),
    defaultValues: formData,
  });

  // formData가 변경될 때마다 폼을 리셋 (외부에서 값이 변경되었을 때 반영)
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const handleOpenRequestDialog = () => {
    setOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
  };

  const handleSelectRequest = (request: ProductionRequest) => {
    console.log(request);

    setSelectedRequest(request);
    // 생산의뢰 정보를 폼 데이터에 한 번에 반영
    const updates = {
      itemCode: request.itemCode || '',
      itemName: request.itemName || '',
      plannedQty: request.orderQty || 0,
      orderNo: request.orderNo,
      orderSeqno: request.orderSeqno,
      orderHistno: request.orderHistno,
    };
    
    // react-hook-form의 setValue를 사용하여 각 필드 업데이트
    Object.entries(updates).forEach(([key, value]) => {
      setValue(key as keyof ProductionPlanData, value);
    });
    
    // 부모 컴포넌트의 상태도 업데이트
    onBatchChange(updates);
    setOpenRequestDialog(false);
  };

  const handleFormSubmit = (data: ProductionPlanData) => {
    onSave(data);
  };

  const handleDialogClose = () => {
    setSelectedRequest(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
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
        <form onSubmit={handleSubmit(handleFormSubmit)}>
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

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="계획일자"
                    value={dialogMode === 'create' ? selectedDate : field.value}
                    disabled
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />

              {/* LOT 번호 */}
              <Controller
                name="lotNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="LOT 번호"
                    placeholder="LOT 번호를 입력하세요"
                    error={!!errors.lotNo}
                    helperText={errors.lotNo?.message}
                  />
                )}
              />

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
                      disabled={!!selectedRequest}
                      error={!!errors.itemCode}
                      helperText={errors.itemCode?.message}
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
                      disabled={!!selectedRequest}
                      error={!!errors.itemName}
                      helperText={errors.itemName?.message}
                    />
                  )}
                />
              </Stack>

              <Controller
                name="plannedQty"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="계획수량"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!errors.plannedQty}
                    helperText={errors.plannedQty?.message}
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <Controller
                  name="equipmentCode"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.equipmentCode}>
                      <InputLabel>설비</InputLabel>
                      <Select
                        {...field}
                        label="설비"
                        onChange={(e) => {
                          const selectedEquipment = equipments.find(
                            (eq) => eq.equipCd === e.target.value
                          );
                          field.onChange(e.target.value);
                          if (selectedEquipment) {
                            setValue('equipmentName', selectedEquipment.equipmentName);
                          }
                        }}
                      >
                        {equipments.map((eq) => (
                          <MenuItem key={eq.equipCd} value={eq.equipCd}>
                            {eq.equipmentName} ({eq.equipCd})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.equipmentCode && (
                        <FormHelperText>{errors.equipmentCode.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>교대</InputLabel>
                      <Select {...field} label="교대">
                        <MenuItem value="DAY">주간</MenuItem>
                        <MenuItem value="NIGHT">야간</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>

              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="비고"
                  />
                )}
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
            <Button type="submit" variant="contained" color="primary">
              저장
            </Button>
            <Button onClick={handleDialogClose}>취소</Button>
          </DialogActions>
        </form>
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
