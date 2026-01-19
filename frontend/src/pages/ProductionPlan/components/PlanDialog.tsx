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
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Link as LinkIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProductionRequestDialog from './ProductionRequestDialog';
import ItemSelectionDialog from './ItemSelectionDialog';
import { ProductionRequest } from '../../../types/productionRequest';
import { Item } from '../../../types/item';
import { Equipment } from '../../../types/equipment';
import { WorkplaceWorker } from '../../../types/workplace';
import { ProductionPlanData } from '../../../types/productionPlan';
import { CommonDetailCode } from '../../../types/commonCode';
import commonCodeService from '../../../services/commonCodeService';

/**
 * 근무구분(COM006) 코드를 한글 표시명으로 변환
 * @param code 근무구분 코드 (D, N, A, B, C, DAY, NIGHT)
 * @returns 한글 표시명
 */
const getShiftDisplayName = (code?: string): string => {
  if (!code) return '';

  switch (code) {
    case 'D':
      return 'D - 주간';
    case 'N':
      return 'N - 야간';
    case 'A':
      return 'A - 1교대';
    case 'B':
      return 'B - 2교대';
    case 'C':
      return 'C - 3교대';
    case 'DAY':
      return '주간';
    case 'NIGHT':
      return '야간';
    default:
      return code; // 알 수 없는 코드는 그대로 표시
  }
};

const formatShiftLabel = (
  code?: string,
  shiftCodes?: CommonDetailCode[]
): string => {
  if (!code) return '';
  const matched = shiftCodes?.find((c) => c.code === code);
  if (matched) return `${matched.codeNm} (${matched.code})`;
  return getShiftDisplayName(code);
};

// 생산계획 등록 유효성 검사 스키마 (UI에서 사용하는 필드 중심 + 선택적 백엔드 필드 포함)
const productionPlanSchema = yup.object({
  id: yup.string(),
  date: yup.string().required('계획일자는 필수입니다.'),
  itemCode: yup.string().required('품목코드는 필수입니다.'),
  itemName: yup.string().required('품목명은 필수입니다.'),
  plannedQty: yup
    .number()
    .required('계획수량은 필수입니다.')
    .min(1, '계획수량은 1 이상이어야 합니다.')
    .typeError('계획수량은 숫자여야 합니다.'),
  equipmentId: yup.string().notRequired(),
  equipmentCode: yup.string().required('설비는 필수입니다.'),
  equipmentName: yup.string(),
  shift: yup.string().required('근무구분은 필수입니다.'),
  remark: yup.string().notRequired().default(''),
  orderNo: yup.string(),
  orderSeqno: yup.number(),
  orderHistno: yup.number(),
  workplaceCode: yup.string(),
  workplaceName: yup.string(),
  workerCode: yup.string().required('작업자는 필수입니다.'),
  workerName: yup.string(),
  customerCode: yup.string(),
  customerName: yup.string(),
  additionalCustomers: yup.array().of(yup.string().required()),
  deliveryDate: yup.string(), // 납기일 (YYYY-MM-DD 또는 YYYYMMDD)
  // 선택적 확장/백엔드 매핑 필드
  processCode: yup.string(),
  processName: yup.string(),
  planNo: yup.string(),
  planSeq: yup.number().notRequired(),
  factoryCode: yup.string(),
  actualQty: yup.number(),
  lotNo: yup.string(),
  useYn: yup.string(),
});

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  dialogMode: 'create' | 'edit';
  selectedDate: string;
  formData: ProductionPlanData;
  equipments: Equipment[];
  workplaceWorkers?: WorkplaceWorker[];
  workplaceCode?: string;
  onSave: (data: ProductionPlanData, references?: any[]) => void;
  onChange: (field: keyof ProductionPlanData, value: any) => void;
  onBatchChange: (updates: Partial<ProductionPlanData>) => void;
  onRefresh?: () => void; // 데이터 새로고침
}

const PlanDialog: React.FC<PlanDialogProps> = ({
  open,
  onClose,
  dialogMode,
  selectedDate,
  formData,
  workplaceWorkers = [],
  workplaceCode,
  onSave,
  onBatchChange,
  onRefresh,
}) => {
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<ProductionRequest[]>(
    []
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [productionReferences, setProductionReferences] = useState<any[]>([]);
  const [shiftCodes, setShiftCodes] = useState<CommonDetailCode[]>([]);

  // react-hook-form 설정
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductionPlanData>({
    resolver: yupResolver(productionPlanSchema) as any,
    defaultValues: formData,
  });

  // formData가 변경될 때마다 폼을 리셋 (외부에서 값이 변경되었을 때 반영)
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  // 근무구분(COM006) 공통코드 조회
  useEffect(() => {
    const fetchShiftCodes = async () => {
      try {
        const response = await commonCodeService.getCommonDetailCodeList(
          'COM006',
          'Y'
        );
        if (response.resultCode === 200 && response.result?.detailCodeList) {
          setShiftCodes(response.result.detailCodeList);
        }
      } catch (error) {
        setShiftCodes([]);
      }
    };

    if (open) {
      fetchShiftCodes();
    }
  }, [open]);

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
      // 품목 직접 선택 시, 저장될 필드인 itemCode에 품목 ID를 매핑
      // (기존 품목코드 대신 내부 식별자 사용)
      itemCode:
        (item as any).itemId ||
        (item as any).id ||
        (item as any).itemCode ||
        '',
      itemDisplayCode: (item as any).itemCode || '',
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

  const handleSelectRequest = (requestsOrData: ProductionRequest[] | any) => {
    // 다중 선택 시 references가 포함된 객체가 전달됨
    let requests: ProductionRequest[] = [];
    let references: any[] = [];

    if (Array.isArray(requestsOrData)) {
      requests = requestsOrData;
    } else if (requestsOrData.selectedItems) {
      // 다중 선택 시
      requests = requestsOrData.selectedItems;
      references = requestsOrData.references || [];
      setProductionReferences(references);
    }

    if (requests.length === 0) return;

    // 생산의뢰 선택 시 품목 선택 초기화
    setSelectedItem(null);
    setSelectedRequests(requests);

    // 첫 번째 생산의뢰의 품목 정보를 기준으로 설정
    const firstRequest = requests[0];

    // 여러 생산의뢰의 수량 합계
    // remainingQty가 있으면 남은 수량을, 없으면 orderQty를 사용
    const totalQty = requests.reduce(
      (sum, req) =>
        sum +
        (req.remainingQty !== undefined && req.remainingQty !== null
          ? req.remainingQty
          : req.orderQty || 0),
      0
    );

    // 거래처 정보 처리
    const customerCodes = requests
      .map((r) => r.customerCode)
      .filter(Boolean) as string[];
    const customerNames = requests
      .map((r) => r.customerName)
      .filter(Boolean) as string[];
    const uniqueCustomers = Array.from(new Set(customerCodes));

    const updates = {
      itemCode: firstRequest.itemCode || '',
      itemDisplayCode: firstRequest.itemCode || '',
      itemName: firstRequest.itemName || '',
      plannedQty: totalQty,
      orderNo: firstRequest.orderNo,
      orderSeqno: firstRequest.orderSeqno,
      orderHistno: firstRequest.orderHistno,
      customerCode: uniqueCustomers[0],
      customerName: customerNames[0],
      additionalCustomers: uniqueCustomers.slice(1),
      deliveryDate: firstRequest.deliveryDate || '', // 납기일 추가
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
    onSave(data, productionReferences);
  };

  const handleDialogClose = () => {
    setSelectedRequests([]);
    setSelectedItem(null);
    setProductionReferences([]);
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
              {/* ================================
                      연동된 생산의뢰 정보 (Callout)
                  ================================ */}
              {formData.orderNo && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #E5E5E5',
                    bgcolor: '#FAFAFA',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  {/* 좌측 컬러바 */}
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: '#A8A8A8',
                      borderRadius: 1,
                      mt: 0.2,
                    }}
                  />

                  {/* 내용 */}
                  <Box sx={{ flex: 1 }}>
                    {/* 헤더 */}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      연동된 생산의뢰 정보
                    </Typography>

                    {/* 선택 Chip 목록 */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={`의뢰번호: ${formData.orderNo}`}
                        size="small"
                        sx={{
                          borderRadius: '5px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E0E0E0',
                          color: '#333',
                        }}
                      />

                      {formData.customerName && (
                        <Chip
                          label={`거래처: ${formData.customerName}${
                            formData.additionalCustomers?.length
                              ? ` 외 ${formData.additionalCustomers.length}건`
                              : ''
                          }`}
                          size="small"
                          sx={{
                            borderRadius: '5px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                            color: '#333',
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* ================================
                      생산의뢰 연동 (Callout)
                  ================================ */}
              {dialogMode === 'create' && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #B2D4F8',
                    bgcolor: '#F2F8FF',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  {/* 좌측 컬러바 */}
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: '#4A90E2',
                      borderRadius: 1,
                      mt: 0.2,
                    }}
                  />

                  {/* 내용 */}
                  <Box sx={{ flex: 1 }}>
                    {/* 헤더 + 버튼 */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          생산의뢰 연동
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          ERP 생산의뢰 정보를 불러와 계획을 생성할 수 있습니다.
                          (멀티 선택 가능, 동일 품목만)
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={handleOpenRequestDialog}
                      >
                        선택
                      </Button>
                    </Box>

                    {/* 선택된 목록 */}
                    {selectedRequests.length > 0 && (
                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: '1px solid #D0E3FF',
                        }}
                      >
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">
                            선택된 생산의뢰: {selectedRequests.length}건
                          </Typography>

                          {selectedRequests.map((req) => (
                            <Chip
                              key={`${req.orderNo}-${req.orderSeqno}`}
                              label={`${req.orderNo} (${
                                req.customerName || '거래처 미상'
                              })`}
                              size="small"
                              sx={{
                                bgcolor: '#E9F2FF',
                                color: '#1E5BB8',
                                borderRadius: '5px',
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* ================================
                      품목 직접 선택 (Callout)
                  ================================ */}
              {dialogMode === 'create' && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #E5E5E5',
                    bgcolor: '#FAFAFA',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  {/* 좌측 컬러바 */}
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: '#5CB176',
                      borderRadius: 1,
                      mt: 0.2,
                    }}
                  />

                  {/* 내용 */}
                  <Box sx={{ flex: 1 }}>
                    {/* 헤더 + 버튼 */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          품목 직접 선택
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          품목 마스터에서 직접 품목을 선택하여 계획을 생성할 수
                          있습니다.
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<InventoryIcon />}
                        onClick={handleOpenItemDialog}
                        sx={{
                          borderColor: '#C7C7C7',
                          '&:hover': {
                            bgcolor: '#F5F5F5',
                            borderColor: '#B5B5B5',
                          },
                        }}
                      >
                        선택
                      </Button>
                    </Box>

                    {/* 선택된 품목 */}
                    {selectedItem && (
                      <Stack
                        spacing={1}
                        sx={{
                          mt: 1.5,
                          p: 1.25,
                          borderRadius: 1,
                          border: '1px solid #E0E0E0',
                          bgcolor: '#FFFFFF',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          선택된 품목
                        </Typography>

                        <Chip
                          label={`${selectedItem.itemCode} - ${selectedItem.itemName}`}
                          size="small"
                          sx={{
                            borderRadius: '5px',
                            bgcolor: '#F7F7F7',
                            border: '1px solid #E0E0E0',
                            color: '#333',
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
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

              <Stack direction="row" spacing={2}>
                {/* 작업장 */}
                <TextField
                  fullWidth
                  required
                  label="작업장"
                  value={
                    formData.workplaceName
                      ? `${formData.workplaceName} (${formData.workplaceCode})`
                      : ''
                  }
                  disabled
                  InputProps={{ readOnly: true }}
                />

                {/* 공정 */}
                <TextField
                  fullWidth
                  required
                  label="공정"
                  value={
                    formData.processCode
                      ? `${formData.processName} (${formData.processCode})`
                      : ''
                  }
                  disabled
                  InputProps={{ readOnly: true }}
                />

                {/* 설비 */}
                <TextField
                  fullWidth
                  required
                  label="설비"
                  value={
                    formData.equipmentCode
                      ? `${formData.equipmentName || ''} (${
                          formData.equipmentCode
                        })`
                      : ''
                  }
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Stack>

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
                      disabled={
                        dialogMode === 'edit' ||
                        selectedRequests.length > 0 ||
                        selectedItem !== null
                      }
                      InputProps={{
                        readOnly: dialogMode === 'edit',
                      }}
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
                      disabled={
                        dialogMode === 'edit' ||
                        selectedRequests.length > 0 ||
                        selectedItem !== null
                      }
                      InputProps={{
                        readOnly: dialogMode === 'edit',
                      }}
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
                    disabled={dialogMode === 'edit'}
                    InputProps={{
                      readOnly: dialogMode === 'edit',
                    }}
                    error={!!errors.plannedQty}
                    helperText={errors.plannedQty?.message}
                  />
                )}
              />

              {/* 납기일 */}
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => {
                  // YYYYMMDD -> YYYY-MM-DD 변환
                  let displayValue = field.value || '';
                  if (
                    displayValue &&
                    displayValue.length === 8 &&
                    !displayValue.includes('-')
                  ) {
                    displayValue = `${displayValue.substring(
                      0,
                      4
                    )}-${displayValue.substring(4, 6)}-${displayValue.substring(
                      6,
                      8
                    )}`;
                  }

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="납기일"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={displayValue}
                      error={!!errors.deliveryDate}
                      helperText={errors.deliveryDate?.message}
                    />
                  );
                }}
              />

              <Stack direction="row" spacing={2}>
                {/* 작업자 */}
                <Controller
                  name="workerCode"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.workerCode}>
                      <InputLabel>작업자 선택</InputLabel>
                      <Select
                        {...field}
                        label="작업자 선택"
                        value={field.value || ''} // Ensure a valid value is passed
                        onChange={(e) => {
                          const selectedWorker = workplaceWorkers.find(
                            (w) => w.workerCode === e.target.value
                          );
                          field.onChange(e.target.value);
                          if (selectedWorker) {
                            setValue('workerName', selectedWorker.workerName);
                            // 작업자에 근무구분이 없을 수 있으므로, 일단 자동 설정 후 비어있으면 직접 선택하도록 유지
                            setValue('shift', selectedWorker.position || '');
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>작업자를 선택하세요</em>
                        </MenuItem>
                        {workplaceWorkers.map((worker) => (
                          <MenuItem
                            key={worker.workerCode}
                            value={worker.workerCode}
                          >
                            {worker.workerName} ({worker.workerCode})
                            {worker.position &&
                              ` - ${formatShiftLabel(
                                worker.position,
                                shiftCodes
                              )}`}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.workerCode && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {errors.workerCode.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                {/* 근무구분 */}
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.shift}>
                      <InputLabel>근무구분</InputLabel>
                      <Select
                        {...field}
                        label="근무구분"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>선택(작업자에 없는 경우 직접 지정)</em>
                        </MenuItem>
                        {shiftCodes.map((option) => (
                          <MenuItem key={option.code} value={option.code}>
                            {`${option.codeNm} (${option.code})`}
                          </MenuItem>
                        ))}
                        {field.value &&
                          !shiftCodes.some(
                            (option) => option.code === field.value
                          ) && (
                            <MenuItem value={field.value}>
                              {formatShiftLabel(field.value, shiftCodes)}
                            </MenuItem>
                          )}
                      </Select>
                      {errors.shift && (
                        <FormHelperText>{errors.shift.message}</FormHelperText>
                      )}
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
        onRegisterComplete={() => {
          // 생산의뢰에서 직접 등록 완료 시
          handleCloseRequestDialog();
          onClose(); // PlanDialog도 닫기
          if (onRefresh) {
            onRefresh(); // 데이터 새로고침
          }
        }}
        workplaceCode={workplaceCode}
        selectedDate={selectedDate}
        equipmentId={formData.equipmentId}
        equipmentCode={formData.equipmentCode}
        processCode={formData.processCode}
        workerCode={formData.workerCode}
        shift={formData.shift}
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
