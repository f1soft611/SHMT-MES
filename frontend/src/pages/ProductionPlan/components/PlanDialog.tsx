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
} from '@mui/material';
import { Link as LinkIcon, Info as InfoIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProductionRequestDialog from './ProductionRequestDialog';
import ItemSelectionDialog from './ItemSelectionDialog';
import { ProductionRequest } from '../../../types/productionRequest';
import { Item } from '../../../types/item';
import { Equipment } from '../../../types/equipment';
import { WorkplaceWorker } from '../../../types/workplace';

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
  // 작업장 및 작업자 정보
  workplaceCode?: string;
  workplaceName?: string;
  workerCode?: string;
  workerName?: string;
  // 거래처 정보
  customerCode?: string;
  customerName?: string;
  additionalCustomers?: string[]; // 추가 거래처 목록
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
  workplaceCode: yup.string(),
  workplaceName: yup.string(),
  workerCode: yup.string(),
  workerName: yup.string(),
  customerCode: yup.string(),
  customerName: yup.string(),
  additionalCustomers: yup.array().of(yup.string().required()),
});

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  dialogMode: 'create' | 'edit';
  selectedDate: string;
  formData: ProductionPlanData;
  equipments: Equipment[];
  workplaceWorkers?: WorkplaceWorker[];
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
  workplaceWorkers = [],
  onSave,
  onChange,
  onBatchChange,
}) => {
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<ProductionRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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

  const handleOpenItemDialog = () => {
    setOpenItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
  };

  const handleSelectItem = (item: Item) => {
    // 품목 선택 시 생산의뢰 선택 초기화
    setSelectedRequests([]);
    setSelectedItem(item);

    const updates = {
      itemCode: item.itemCode || '',
      itemName: item.itemName || '',
      plannedQty: 1, // 기본값
      // 생산의뢰 정보 초기화
      orderNo: undefined,
      orderSeqno: undefined,
      orderHistno: undefined,
      customerCode: undefined,
      customerName: undefined,
      additionalCustomers: undefined,
    };

    // react-hook-form의 setValue를 사용하여 각 필드 업데이트
    Object.entries(updates).forEach(([key, value]) => {
      setValue(key as keyof ProductionPlanData, value);
    });

    // 부모 컴포넌트의 상태도 업데이트
    onBatchChange(updates);
    setOpenItemDialog(false);
  };

  const handleSelectRequest = (requests: ProductionRequest[]) => {
    console.log('Selected requests:', requests);

    if (requests.length === 0) return;

    // 생산의뢰 선택 시 품목 선택 초기화
    setSelectedItem(null);
    setSelectedRequests(requests);
    
    // 첫 번째 생산의뢰의 품목 정보를 기준으로 설정
    const firstRequest = requests[0];
    
    // 여러 생산의뢰의 수량 합계
    const totalQty = requests.reduce((sum, req) => sum + (req.orderQty || 0), 0);
    
    // 거래처 정보 처리
    const customerCodes = requests.map(r => r.customerCode).filter(Boolean) as string[];
    const customerNames = requests.map(r => r.customerName).filter(Boolean) as string[];
    const uniqueCustomers = Array.from(new Set(customerCodes));
    
    const updates = {
      itemCode: firstRequest.itemCode || '',
      itemName: firstRequest.itemName || '',
      plannedQty: totalQty,
      orderNo: firstRequest.orderNo,
      orderSeqno: firstRequest.orderSeqno,
      orderHistno: firstRequest.orderHistno,
      customerCode: uniqueCustomers[0],
      customerName: customerNames[0],
      additionalCustomers: uniqueCustomers.slice(1),
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
    setSelectedRequests([]);
    setSelectedItem(null);
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
              {/* 생산의뢰 정보 표시 (연동된 경우) - 상단으로 이동 */}
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
                    variant="subtitle2"
                    sx={{ display: 'block', mb: 1, fontWeight: 600 }}
                  >
                    연동된 생산의뢰 정보
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`생산의뢰번호: ${formData.orderNo}`}
                      size="small"
                      color="primary"
                    />
                    {formData.customerName && (
                      <Chip
                        label={`거래처: ${formData.customerName}${formData.additionalCustomers && formData.additionalCustomers.length > 0 ? ` 외 ${formData.additionalCustomers.length}건` : ''}`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Stack>
                </Box>
              )}

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
                        ERP 생산의뢰 정보를 불러와 계획을 생성할 수 있습니다. (멀티 선택 가능, 동일 품목만)
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
                  {selectedRequests.length > 0 && (
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          선택된 생산의뢰: {selectedRequests.length}건
                        </Typography>
                        {selectedRequests.map((req, idx) => (
                          <Chip
                            key={`${req.orderNo}-${req.orderSeqno}`}
                            label={`${req.orderNo} (${req.customerName || '거래처 미상'})`}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}

              {/* 품목 직접 선택 버튼 */}
              {dialogMode === 'create' && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.main',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <InventoryIcon color="success" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        품목 직접 선택
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        품목 마스터에서 직접 품목을 선택하여 계획을 생성할 수 있습니다.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<InventoryIcon />}
                      onClick={handleOpenItemDialog}
                      size="small"
                    >
                      품목 선택
                    </Button>
                  </Stack>
                  {selectedItem && (
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
                          선택된 품목:
                        </Typography>
                        <Chip
                          label={`${selectedItem.itemCode} - ${selectedItem.itemName}`}
                          size="small"
                          color="success"
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

              {/* 작업장 정보 (읽기전용) */}
              <TextField
                fullWidth
                label="작업장"
                value={formData.workplaceName ? `${formData.workplaceName} (${formData.workplaceCode})` : ''}
                disabled
                InputProps={{
                  readOnly: true,
                }}
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
                      disabled={selectedRequests.length > 0 || selectedItem !== null}
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
                      disabled={selectedRequests.length > 0 || selectedItem !== null}
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

              {/* 설비 정보 (읽기전용) */}
              <TextField
                fullWidth
                required
                label="설비"
                value={formData.equipmentCode ? `${formData.equipmentName || ''} (${formData.equipmentCode})` : ''}
                disabled
                InputProps={{
                  readOnly: true,
                }}
                helperText="설비는 계획 추가 버튼 클릭 시 자동으로 설정됩니다."
              />

              {/* 작업자 선택 */}
              {workplaceWorkers.length > 0 && (
                <Controller
                  name="workerCode"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>작업자 선택</InputLabel>
                      <Select
                        {...field}
                        label="작업자 선택"
                        onChange={(e) => {
                          const selectedWorker = workplaceWorkers.find(
                            (w) => w.workerCode === e.target.value
                          );
                          field.onChange(e.target.value);
                          if (selectedWorker) {
                            setValue('workerName', selectedWorker.workerName);
                            // 작업자의 근무구분(position) 정보로 shift 자동 설정
                            if (selectedWorker.position) {
                              setValue('shift', selectedWorker.position);
                            }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>작업자를 선택하세요</em>
                        </MenuItem>
                        {workplaceWorkers.map((worker) => (
                          <MenuItem key={worker.workerCode} value={worker.workerCode}>
                            {worker.workerName} ({worker.workerCode})
                            {worker.position && ` - ${
                              worker.position === 'D' ? '주간' :
                              worker.position === 'N' ? '야간' :
                              worker.position === 'A' ? 'A(1교대)' :
                              worker.position === 'B' ? 'B(2교대)' :
                              worker.position === 'C' ? 'C(3교대)' : ''
                            }`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              )}

              {/* 근무구분 (읽기전용) - 작업자 선택 시 자동 세팅 */}
              <Controller
                name="shift"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="근무구분"
                    value={
                      field.value === 'D' ? 'D - 주간' :
                      field.value === 'N' ? 'N - 야간' :
                      field.value === 'A' ? 'A - 1교대' :
                      field.value === 'B' ? 'B - 2교대' :
                      field.value === 'C' ? 'C - 3교대' :
                      field.value === 'DAY' ? '주간' :
                      field.value === 'NIGHT' ? '야간' :
                      ''
                    }
                    disabled
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="근무구분은 작업자 선택 시 자동으로 설정됩니다. (공통코드 COM006)"
                  />
                )}
              />

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

      {/* 품목 선택 다이얼로그 */}
      <ItemSelectionDialog
        open={openItemDialog}
        onClose={handleCloseItemDialog}
        onSelect={handleSelectItem}
      />
    </>
  );
};

export default PlanDialog;
