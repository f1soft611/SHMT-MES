import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tooltip,
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
  FilterList as FilterListIcon,
  Add as AddIcon,
  OpenInFull as OpenInFullIcon,
  CloseFullscreen as CloseFullscreenIcon,
} from '@mui/icons-material';
import { productionRequestService } from '../../../services/productionRequestService';
import {
  ProductionRequest,
  ProductionRequestAllocationStatus,
} from '../../../types/productionRequest';
import productionPlanService, {
  ProductionPlanRequest,
} from '../../../services/productionPlanService';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { getServerDate } from '../../../utils/dateUtils';

interface ProductionRequestSearchState {
  searchCnd: string;
  searchWrd: string;
  dateFrom: string;
  dateTo: string;
  workplaceCode: string;
  allocationStatus: ProductionRequestAllocationStatus;
}

const DEFAULT_SEARCH_CND = '4';
const DEFAULT_ALLOCATION_STATUS: ProductionRequestAllocationStatus = 'ALL';

const buildSearchState = (
  workplaceCode?: string,
): ProductionRequestSearchState => ({
  searchCnd: DEFAULT_SEARCH_CND,
  searchWrd: '',
  dateFrom: '',
  dateTo: '',
  workplaceCode: workplaceCode || '',
  allocationStatus: DEFAULT_ALLOCATION_STATUS,
});

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      message?: string;
      response?: { data?: { message?: string; error?: string } };
    };

    return (
      apiError.response?.data?.message ||
      apiError.response?.data?.error ||
      apiError.message ||
      fallback
    );
  }

  return fallback;
};

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
  const [fullScreen, setFullScreen] = useState(false);
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
  const [searchParams, setSearchParams] =
    useState<ProductionRequestSearchState>(() =>
      buildSearchState(workplaceCode),
    );

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState<ProductionRequestSearchState>(
    () => buildSearchState(workplaceCode),
  );

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
        searchParams,
      );

      // console.log('Production Request API Response:', response);

      if (response.resultCode === 200 && response.result?.resultList) {
        const resultList = response.result.resultList;
        setRequests(resultList);

        // totalRecordCount를 paginationInfo에서 가져오기
        const totalCount =
          response.result.paginationInfo?.totalRecordCount ||
          parseInt(response.result.resultCnt || '0', 10) ||
          resultList.length ||
          0;

        // console.log(
        //   'Total Count:',
        //   totalCount,
        //   'Result List Length:',
        //   resultList.length,
        // );
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
    const nextWorkplaceCode = workplaceCode || '';

    setSearchParams((prev) => {
      if (prev.workplaceCode === nextWorkplaceCode) {
        return prev;
      }
      return {
        ...prev,
        workplaceCode: nextWorkplaceCode,
      };
    });

    setInputValues((prev) => {
      if (prev.workplaceCode === nextWorkplaceCode) {
        return prev;
      }
      return {
        ...prev,
        workplaceCode: nextWorkplaceCode,
      };
    });
  }, [workplaceCode]);

  // 검색 실행 (입력값을 검색 파라미터로 복사하고 페이지를 0으로 리셋)
  const handleSearch = useCallback(() => {
    setSearchParams((prev) => {
      if (
        prev.searchCnd === inputValues.searchCnd &&
        prev.searchWrd === inputValues.searchWrd &&
        prev.dateFrom === inputValues.dateFrom &&
        prev.dateTo === inputValues.dateTo &&
        prev.workplaceCode === inputValues.workplaceCode &&
        prev.allocationStatus === inputValues.allocationStatus
      ) {
        return prev;
      }
      return { ...inputValues };
    });

    setPaginationModel((prev) => {
      if (prev.page === 0) {
        return prev;
      }
      return {
        ...prev,
        page: 0,
      };
    });
  }, [inputValues]);

  const handleInputChange = useCallback(
    <K extends keyof ProductionRequestSearchState>(
      field: K,
      value: ProductionRequestSearchState[K],
    ) => {
      setInputValues((prev) => {
        if (prev[field] === value) {
          return prev;
        }
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    [],
  );

  const getRequestRowId = useCallback(
    (request: ProductionRequest): GridRowId =>
      `${request.orderNo}-${request.orderSeqno}-${request.orderHistno}-${request.itemCode}`,
    [],
  );

  const isRequestSelectable = useCallback(
    (request: ProductionRequest): boolean =>
      Number(request.remainingQty ?? 0) > 0,
    [],
  );

  const getRequestGroupKey = useCallback(
    (request: ProductionRequest): string =>
      `${request.orderNo}-${request.orderSeqno}-${request.orderHistno}`,
    [],
  );

  const isProductItem = useCallback(
    (request?: ProductionRequest): boolean =>
      String(request?.itemFlag ?? '') === '2',
    [],
  );

  const isSemiItem = useCallback(
    (request?: ProductionRequest): boolean =>
      String(request?.itemFlag ?? '') === '4',
    [],
  );

  const normalizeSelectionModel = useCallback(
    (model: GridRowSelectionModel | GridRowId[]): GridRowSelectionModel => {
      if (Array.isArray(model)) {
        return {
          type: 'include',
          ids: new Set(model),
        };
      }

      const ids = model.ids;
      if (ids instanceof Set) {
        return {
          type: model.type,
          ids: new Set(ids),
        };
      }

      return {
        type: model.type,
        ids: new Set(Array.isArray(ids) ? ids : []),
      };
    },
    [],
  );

  const rowById = useMemo(() => {
    const map = new Map<string, ProductionRequest>();
    requests.forEach((request) => {
      map.set(String(getRequestRowId(request)), request);
    });
    return map;
  }, [requests, getRequestRowId]);

  const semiItemIdsByGroup = useMemo(() => {
    const map = new Map<string, GridRowId[]>();
    requests.forEach((request) => {
      if (!isSemiItem(request)) {
        return;
      }

      const groupKey = getRequestGroupKey(request);
      const rowId = getRequestRowId(request);
      const groupIds = map.get(groupKey);
      if (groupIds) {
        groupIds.push(rowId);
      } else {
        map.set(groupKey, [rowId]);
      }
    });
    return map;
  }, [requests, isSemiItem, getRequestGroupKey, getRequestRowId]);

  const handleRowSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel | GridRowId[]) => {
      const previousSelection = normalizeSelectionModel(selectionModel);
      const nextSelection = normalizeSelectionModel(newSelection);

      if (
        previousSelection.type !== 'include' ||
        nextSelection.type !== 'include'
      ) {
        setSelectionModel(nextSelection);
        setError('');
        return;
      }

      const adjustedIds = new Set(nextSelection.ids);
      const addedIds: GridRowId[] = [];
      const removedIds: GridRowId[] = [];

      nextSelection.ids.forEach((id) => {
        if (!previousSelection.ids.has(id)) {
          addedIds.push(id);
        }
      });

      previousSelection.ids.forEach((id) => {
        if (!nextSelection.ids.has(id)) {
          removedIds.push(id);
        }
      });

      const syncChildRowsForProduct = (
        rowId: GridRowId,
        shouldSelect: boolean,
      ) => {
        const row = rowById.get(String(rowId));
        if (!row || !isProductItem(row)) {
          return;
        }

        const groupKey = getRequestGroupKey(row);
        const semiItemIds = semiItemIdsByGroup.get(groupKey);
        if (!semiItemIds || semiItemIds.length === 0) {
          return;
        }

        semiItemIds.forEach((semiItemId) => {
          if (shouldSelect) {
            adjustedIds.add(semiItemId);
            return;
          }
          adjustedIds.delete(semiItemId);
        });
      };

      addedIds.forEach((addedId) => {
        syncChildRowsForProduct(addedId, true);
      });

      removedIds.forEach((removedId) => {
        syncChildRowsForProduct(removedId, false);
      });

      setSelectionModel({
        type: 'include',
        ids: adjustedIds,
      });
      setError('');
    },
    [
      normalizeSelectionModel,
      selectionModel,
      rowById,
      isProductItem,
      getRequestGroupKey,
      semiItemIdsByGroup,
    ],
  );

  const handleClose = useCallback(() => {
    onClose();
    setFullScreen(false);
    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() });
    setError('');
    setInputValues(buildSearchState(workplaceCode));
    setSearchParams(buildSearchState(workplaceCode));
    setPaginationModel({ page: 0, pageSize: 100 });
  }, [onClose, workplaceCode]);

  const handleRegisterProductionPlans = useCallback(async () => {
    // 선택된 항목 확인
    let selectedIds: GridRowId[] = [];

    if (Array.isArray(selectionModel)) {
      selectedIds = selectionModel;
    } else if (selectionModel && typeof selectionModel === 'object') {
      const { type: modelType, ids } = selectionModel;

      if (modelType === 'exclude') {
        // type이 'exclude'이고 ids가 비어있으면 전체 선택
        if (ids instanceof Set && ids.size === 0) {
          // 모든 항목 선택
          selectedIds = requests.map((req) => getRequestRowId(req));
        } else if (ids instanceof Set) {
          // exclude 항목을 제외한 나머지
          const excludeSet = new Set(Array.from(ids).map(String));
          selectedIds = requests
            .map((req) => getRequestRowId(req))
            .filter((id) => !excludeSet.has(String(id)));
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

    if (selectedIds.length === 0) {
      setError('생산의뢰를 1개 이상 선택해주세요.');
      showToast({
        message: '생산의뢰를 1개 이상 선택해주세요.',
        severity: 'warning',
      });
      return;
    }

    const selectedKeySet = new Set(selectedIds.map(String));
    const selectedItems: ProductionRequest[] = [];

    requests.forEach((request) => {
      const requestRowKey = String(getRequestRowId(request));
      if (selectedKeySet.has(requestRowKey) && isRequestSelectable(request)) {
        selectedItems.push(request);
      }
    });

    if (selectedItems.length === 0) {
      setError('등록 가능한 남은 수량이 있는 생산의뢰를 선택해주세요.');
      showToast({
        message: '등록 가능한 남은 수량이 있는 생산의뢰를 선택해주세요.',
        severity: 'warning',
      });
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
      const today = getServerDate()
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const planDate = selectedDate ? selectedDate.replace(/-/g, '') : today;

      // 각 생산의뢰마다 개별 생산계획 등록
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setRegisterProgress({ current: i + 1, total: selectedItems.length });
        try {
          const remainingPlanQty = Math.max(0, Number(item.remainingQty ?? 0));

          const planData: ProductionPlanRequest = {
            master: {
              planDate: planDate,
              workplaceCode: workplaceCode,
              planStatus: '1',
              totalPlanQty: remainingPlanQty,
              useYn: 'Y',
            },
            details: [
              {
                planDate: planDate,
                itemCode: item.itemCode || '',
                itemName: item.itemName || '',
                plannedQty: remainingPlanQty,
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

          const response =
            await productionPlanService.createProductionPlan(planData);

          if (response.resultCode === 200) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${item.orderNo}: ${response.message}`);
          }
        } catch (err) {
          failCount++;
          errors.push(`${item.orderNo}: ${getErrorMessage(err, '등록 실패')}`);
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
          onSelect(selectedItems);
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
            onSelect(selectedItems);
          }
        }
      }
    } catch (error) {
      setError(getErrorMessage(error, '생산계획 등록 중 오류가 발생했습니다.'));
    } finally {
      setRegistering(false);
      setRegisterProgress({ current: 0, total: 0 });
    }
  }, [
    selectionModel,
    requests,
    getRequestRowId,
    isRequestSelectable,
    workplaceCode,
    selectedDate,
    equipmentId,
    equipmentCode,
    processCode,
    shift,
    workerCode,
    onRegisterComplete,
    onSelect,
    showToast,
    handleClose,
  ]);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(
        4,
        6,
      )}-${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  }, []);

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'prodPlanDate',
        headerName: '생산의뢰일',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: 'itemName',
        headerName: '품명',
        flex: 1,
        minWidth: 180,
        headerAlign: 'center',
      },
      {
        field: 'itemNo',
        headerName: '품번',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value) => value || '-',
      },
      {
        field: 'customerName',
        headerName: '거래처',
        width: 150,
        headerAlign: 'center',
        valueFormatter: (value) => value || '-',
      },
      {
        field: 'remark',
        headerName: '비고',
        flex: 1,
        minWidth: 180,
        headerAlign: 'center',
        valueFormatter: (value) => value || '-',
      },
      {
        field: 'orderQty',
        headerName: '수량',
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
        headerName: '남은량',
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
        field: 'orderNo',
        headerName: '의뢰번호',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value) => value || '-',
      },
      {
        field: 'deliveryDate',
        headerName: '납기일',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (value) => formatDate(value),
      },
    ],
    [formatDate],
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth={fullScreen ? false : 'xl'}
      fullWidth
      PaperProps={{
        sx: {
          height: fullScreen ? '100vh' : '90vh',
          display: 'flex',
          overflow: 'hidden',
        },
      }}
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
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip
            title={fullScreen ? '기본 크기로 보기' : '전체화면으로 보기'}
          >
            <IconButton
              onClick={() => setFullScreen((prev) => !prev)}
              sx={{ color: 'white' }}
              size="small"
            >
              {fullScreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
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
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
        >
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
              <MenuItem value="4">품목번호</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="검색어를 입력하세요"
            value={inputValues.searchWrd}
            onChange={(e) => handleInputChange('searchWrd', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>조회 옵션</InputLabel>
            <Select
              value={inputValues.allocationStatus}
              label="조회 옵션"
              onChange={(e) =>
                handleInputChange(
                  'allocationStatus',
                  e.target.value as ProductionRequestAllocationStatus,
                )
              }
            >
              <MenuItem value="ALL">전체 조회</MenuItem>
              <MenuItem value="UNPLANNED">미계획건만</MenuItem>
              <MenuItem value="PLANNED">계획건만</MenuItem>
            </Select>
          </FormControl>
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
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            width: '100%',
          }}
        >
          <DataGrid
            rows={requests}
            columns={columns}
            getRowId={getRequestRowId}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowCount={totalCount}
            paginationMode="server"
            pagination
            loading={loading}
            checkboxSelection={true}
            disableMultipleRowSelection={!multiSelect}
            disableColumnMenu
            isRowSelectable={(params) => isRequestSelectable(params.row)}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={handleRowSelectionModelChange}
            disableRowSelectionOnClick={false}
            sx={{
              height: '100%',
              width: '100%',
              minHeight: 0,
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
