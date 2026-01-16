import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Stack,
  Divider,
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowId,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { productionRequestService } from '../../../services/productionRequestService';
import { ProductionRequest } from '../../../types/productionRequest';
import productionPlanService, {
  ProductionPlanRequest,
} from '../../../services/productionPlanService';
import { useToast } from '../../../components/common/Feedback/ToastProvider';

interface ProductionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (requests: ProductionRequest[]) => void;
  onRegisterComplete?: () => void; // 등록 완료 시 호출되는 콜백
  multiSelect?: boolean;
  workplaceCode?: string;
  selectedDate?: string;
  equipmentId?: string; // EQUIP_SYS_CD 값
  equipmentCode?: string; // EQUIP_CD 값
  processCode?: string;
  workerCode?: string;
  shift?: string;
}

const ProductionRequestDialog: React.FC<ProductionRequestDialogProps> = ({
  open,
  onClose,
  onSelect,
  onRegisterComplete,
  multiSelect = true,
  workplaceCode,
  selectedDate,
  equipmentId,
  equipmentCode,
  processCode,
  workerCode,
  shift,
}) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerProgress, setRegisterProgress] = useState({
    current: 0,
    total: 0,
  });
  // 선택모델 (커스텀 GridRowSelectionModel 사용)
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>(),
  });
  const [error, setError] = useState<string>('');

  // 검색 조건 (실제 조회에 사용)
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    dateFrom: '',
    dateTo: '',
    workplaceCode: workplaceCode || '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    dateFrom: '',
    dateTo: '',
    workplaceCode: workplaceCode || '',
  });

  // 페이지네이션
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalCount, setTotalCount] = useState(0);

  // 데이터 로드
  const loadProductionRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productionRequestService.getProductionRequestList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );

      if (response.resultCode === 200 && response.result?.resultList) {
        setRequests(response.result.resultList);
        const totalCount =
          response.result.paginationInfo?.totalRecordCount || 0;
        setTotalCount(totalCount);
      } else {
        setRequests([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load production requests:', error);
      setRequests([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchParams]);

  useEffect(() => {
    if (open) {
      loadProductionRequests();
    }
  }, [open, loadProductionRequests]);

  // workplaceCode 변경 시 검색 조건 업데이트
  useEffect(() => {
    if (workplaceCode) {
      setSearchParams((prev) => ({
        ...prev,
        workplaceCode: workplaceCode,
      }));
      setInputValues((prev) => ({
        ...prev,
        workplaceCode: workplaceCode,
      }));
    }
  }, [workplaceCode]);

  // 검색 실행 (입력값을 검색 파라미터로 복사하고 페이지를 0으로 리셋)
  const handleSearch = () => {
    setSearchParams({ ...inputValues });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleInputChange = (field: string, value: string) => {
    setInputValues({
      ...inputValues,
      [field]: value,
    });
  };

  const handleRegisterProductionPlans = async () => {
    // 선택된 항목 확인
    console.log('selectionModel:', selectionModel);

    let selectedIds: GridRowId[] = [];

    if (Array.isArray(selectionModel)) {
      selectedIds = selectionModel;
    } else if (selectionModel && typeof selectionModel === 'object') {
      const modelType = (selectionModel as any).type;
      const ids = (selectionModel as any).ids;

      if (modelType === 'exclude') {
        // type이 'exclude'이고 ids가 비어있으면 전체 선택
        if (ids instanceof Set && ids.size === 0) {
          // 모든 항목 선택
          selectedIds = requests.map(
            (req) =>
              `${req.orderNo}-${req.orderSeqno}-${req.orderHistno}-${req.itemCode}`
          );
        } else if (ids instanceof Set) {
          // exclude 항목을 제외한 나머지
          const excludeSet = new Set(Array.from(ids).map(String));
          selectedIds = requests
            .map(
              (req) =>
                `${req.orderNo}-${req.orderSeqno}-${req.orderHistno}-${req.itemCode}`
            )
            .filter((id) => !excludeSet.has(id));
        }
      } else if (modelType === 'include') {
        // type이 'include'이면 ids에 있는 항목만 선택
        if (ids instanceof Set) {
          selectedIds = Array.from(ids);
        } else if (Array.isArray(ids)) {
          selectedIds = ids;
        }
      }
    }

    console.log('selectedIds:', selectedIds);

    if (selectedIds.length === 0) {
      setError('생산의뢰를 1개 이상 선택해주세요.');
      showToast({
        message: '생산의뢰를 1개 이상 선택해주세요.',
        severity: 'warning',
      });
      return;
    }

    const selectedKeys = selectedIds.map(String);
    const selectedItems = requests.filter((req) =>
      selectedKeys.includes(
        `${req.orderNo}-${req.orderSeqno}-${req.orderHistno}-${req.itemCode}`
      )
    );

    if (selectedItems.length === 0) {
      setError('선택한 생산의뢰를 찾을 수 없습니다.');
      return;
    }

    // 작업장 코드 확인
    if (!workplaceCode) {
      setError('작업장 정보가 없습니다.');
      return;
    }

    setRegistering(true);
    setError('');
    setRegisterProgress({ current: 0, total: selectedItems.length });

    try {
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // 각 생산의뢰마다 개별 생산계획 등록
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setRegisterProgress({ current: i + 1, total: selectedItems.length });
        try {
          const today = new Date()
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');
          // selectedDate를 8자리 형식(YYYYMMDD)으로 변환
          const planDate = selectedDate
            ? selectedDate.replace(/-/g, '')
            : today;

          const planData: ProductionPlanRequest = {
            master: {
              planDate: planDate,
              workplaceCode: workplaceCode,
              planStatus: '1',
              totalPlanQty: item.orderQty || 0,
              useYn: 'Y',
            },
            details: [
              {
                planDate: planDate,
                itemCode: item.itemCode || '',
                itemName: item.itemName || '',
                plannedQty: item.orderQty || 0,
                workplaceCode: workplaceCode,
                equipmentId: equipmentId || '', // EQUIP_SYS_CD 값 사용
                equipmentCode: equipmentCode || '',
                processCode: processCode || '',
                workerType: shift || '',
                workerCode: workerCode || '',
                orderNo: item.orderNo || '',
                orderSeqno: item.orderSeqno || 0,
                orderHistno: item.orderHistno || 0,
                customerCode: item.customerCode || '',
                customerName: item.customerName || '',
                deliveryDate: item.deliveryDate || '', // 납기일 추가
                useYn: 'Y',
              },
            ],
            references: [
              {
                orderNo: item.orderNo,
                orderSeqno: item.orderSeqno || 0,
                orderHistno: item.orderHistno || 0,
                orderQty: item.orderQty,
                workdtQty: 0,
                representOrder: 'Y',
                customerCode: item.customerCode || '',
              },
            ],
          };

          const response = await productionPlanService.createProductionPlan(
            planData
          );

          if (response.resultCode === 200) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${item.orderNo}: ${response.message}`);
          }
        } catch (err: any) {
          failCount++;
          errors.push(`${item.orderNo}: ${err.message || '등록 실패'}`);
        }
      }

      // 결과 메시지
      if (failCount === 0) {
        showToast({
          message: `${successCount}건의 생산계획이 성공적으로 등록되었습니다.`,
          severity: 'success',
        });
        handleClose();
        // 등록 완료 콜백 호출 (모달 닫기 + 데이터 새로고침)
        if (onRegisterComplete) {
          onRegisterComplete();
        } else {
          // 기존 방식 유지 (호환성)
          onSelect(selectedItems as any);
        }
      } else {
        const errorMsg = errors.join('\n');
        showToast({
          message: `등록 결과 - 성공: ${successCount}건, 실패: ${failCount}건${
            errorMsg ? '\n' + errorMsg : ''
          }`,
          severity: 'warning',
        });
        if (successCount > 0) {
          handleClose();
          if (onRegisterComplete) {
            onRegisterComplete();
          } else {
            onSelect(selectedItems as any);
          }
        }
      }
    } catch (error: any) {
      setError('생산계획 등록 중 오류가 발생했습니다.');
    } finally {
      setRegistering(false);
      setRegisterProgress({ current: 0, total: 0 });
    }
  };

  const handleClose = () => {
    onClose();
    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() });
    setError('');
    setInputValues({
      searchCnd: '1',
      searchWrd: '',
      dateFrom: '',
      dateTo: '',
      workplaceCode: workplaceCode || '',
    });
    setSearchParams({
      searchCnd: '1',
      searchWrd: '',
      dateFrom: '',
      dateTo: '',
      workplaceCode: workplaceCode || '',
    });
    setPaginationModel({ page: 0, pageSize: 100 });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(
        4,
        6
      )}-${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'orderNo',
      headerName: '생산의뢰번호',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'prodPlanDate',
      headerName: '생산의뢰일',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'customerName',
      headerName: '거래처',
      width: 150,
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'itemCode',
      headerName: '품목코드',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'itemNo',
      headerName: '품목번호',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'itemFlag',
      headerName: '품목구분',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const flag = params.value;
        const label = flag === '2' ? '제품' : flag === '4' ? '반제품' : '-';
        const color =
          flag === '2' ? 'success' : flag === '4' ? 'warning' : 'default';
        return <Chip label={label} size="small" color={color} />;
      },
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'specification',
      headerName: '규격',
      flex: 1,
      minWidth: 150,
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || 'EA',
    },
    {
      field: 'orderQty',
      headerName: '생산의뢰량',
      width: 120,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          color="default"
        />
      ),
    },
    {
      field: 'allocatedQty',
      headerName: '할당량',
      width: 100,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString() || '0'}
          size="small"
          color="info"
        />
      ),
    },
    {
      field: 'remainingQty',
      headerName: '남은수량',
      width: 120,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          color="success"
        />
      ),
    },
    {
      field: 'deliveryDate',
      headerName: '납기일',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => formatDate(value),
    },
    // {
    //   field: 'registrant',
    //   headerName: '등록자',
    //   width: 100,
    //   align: 'center',
    //   headerAlign: 'center',
    //   valueFormatter: (value) => value || '-',
    // },
    // {
    //   field: 'registTime',
    //   headerName: '등록시간',
    //   width: 100,
    //   align: 'center',
    //   headerAlign: 'center',
    //   valueFormatter: (value) => value || '-',
    // },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={
        {
          // sx: { height: '85vh' },
        }
      }
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="span">
          생산의뢰 연동
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, m: 2, bgcolor: 'grey.50' }} elevation={0}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          <FilterListIcon color="primary" />
          검색 필터
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>검색 조건</InputLabel>
            <Select
              value={inputValues.searchCnd}
              label="검색 조건"
              onChange={(e) => handleInputChange('searchCnd', e.target.value)}
            >
              <MenuItem value="1">품목코드</MenuItem>
              <MenuItem value="2">품목명</MenuItem>
              <MenuItem value="3">생산의뢰번호</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="검색어를 입력하세요"
            value={inputValues.searchWrd}
            onChange={(e) => handleInputChange('searchWrd', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="납기일 From"
            type="date"
            value={inputValues.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <Typography sx={{ color: 'text.secondary' }}>~</Typography>
          <TextField
            size="small"
            label="납기일 To"
            type="date"
            value={inputValues.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ px: 4 }}
          >
            검색
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Box sx={{ px: 2 }}>
          <Alert severity="warning" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      {/* 등록 진행 상태 표시 */}
      {registering && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              생산계획 등록 중... ({registerProgress.current}/
              {registerProgress.total})
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(registerProgress.current / registerProgress.total) * 100}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      )}

      {/* DataGrid 영역 */}
      <DialogContent
        sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}
      >
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <DataGrid
            rows={requests}
            columns={columns}
            getRowId={(row) =>
              `${row.orderNo}-${row.orderSeqno}-${row.orderHistno}-${row.itemCode}`
            }
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowCount={totalCount}
            paginationMode="server"
            loading={loading}
            checkboxSelection={true}
            disableMultipleRowSelection={!multiSelect}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={(newSelection) => {
              // 배열로 오면 커스텀 형탄로 변환
              if (Array.isArray(newSelection)) {
                setSelectionModel({
                  type: 'include',
                  ids: new Set(newSelection),
                });
              } else {
                setSelectionModel(newSelection);
              }
              setError('');
            }}
            disableRowSelectionOnClick={false}
            sx={{
              // border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              },
              '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root': {
                pointerEvents: 'auto',
                opacity: 1,
              },
            }}
          />
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleRegisterProductionPlans}
          variant="contained"
          disabled={registering}
          startIcon={<AddIcon />}
        >
          {registering ? '등록 중...' : '등록'}
        </Button>
        <Button onClick={handleClose} disabled={registering}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionRequestDialog;
