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
} from '@mui/icons-material';
import { productionRequestService } from '../../../services/productionRequestService';
import { ProductionRequest } from '../../../types/productionRequest';

interface ProductionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (requests: ProductionRequest[]) => void;
  multiSelect?: boolean;
}

const ProductionRequestDialog: React.FC<ProductionRequestDialogProps> = ({
  open,
  onClose,
  onSelect,
  multiSelect = true,
}) => {
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  // 선택모델 (현재 프로젝트의 커스텀 형태 사용)
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>(),
  } as any);
  const [error, setError] = useState<string>('');

  // 검색 조건 (실제 조회에 사용)
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    dateFrom: '',
    dateTo: '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    dateFrom: '',
    dateTo: '',
  });

  // 페이지네이션
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
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
        setTotalCount(response.result.paginationInfo.totalRecordCount);
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

  const handleConfirmSelection = () => {
    if (!selectionModel || (selectionModel as any).ids?.size === 0) {
      setError('생산의뢰를 선택해주세요.');
      return;
    }

    const selectedKeys = Array.from((selectionModel as any).ids).map(String);
    const selectedItems = requests.filter((req) =>
      selectedKeys.includes(
        `${req.orderNo}-${req.orderSeqno}-${req.orderHistno}-${req.itemCode}`
      )
    );

    if (selectedItems.length === 0) {
      setError('선택한 생산의뢰를 찾을 수 없습니다.');
      return;
    }

    // 선택된 항목에 다른 품목코드가 섞여 있으면 저장 불가
    if (selectedItems.length > 1) {
      const firstItemCode = selectedItems[0].itemCode;
      const allSameItem = selectedItems.every(
        (item) => item.itemCode === firstItemCode
      );
      if (!allSameItem) {
        setError(
          '다른 품목코드가 섞여 있습니다. 같은 품목만 선택해서 저장할 수 있습니다.'
        );
        return;
      }
    }

    // 수량 합계 계산
    const totalQuantity = selectedItems.reduce(
      (sum, item) => sum + (item.orderQty || 0),
      0
    );

    // 마스터 데이터에 수량 합계 반영
    const masterData = {
      totalQuantity: totalQuantity,
    };

    // references 데이터 구성 (TPR301R에 저장될 개별 생산의뢰 정보)
    const references = selectedItems.map((item) => ({
      orderNo: item.orderNo,
      orderSeqno: item.orderSeqno || 0,
      orderHistno: item.orderHistno || 0,
      orderQty: item.orderQty,
      workdtQty: 0,
      representOrder: selectedItems.length === 1 ? 'Y' : 'N',
      customerCode: item.customerCode || '',
    }));

    // 선택된 데이터와 마스터 데이터, references 처리
    onSelect({
      masterData,
      selectedItems,
      references,
    } as any);

    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() } as any);
    setError('');
    setInputValues({
      searchCnd: '1',
      searchWrd: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchParams({
      searchCnd: '1',
      searchWrd: '',
      dateFrom: '',
      dateTo: '',
    });
    setPaginationModel({ page: 0, pageSize: 10 });
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
      width: 130,
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
            pageSizeOptions={[5, 10, 25, 50]}
            rowCount={totalCount}
            paginationMode="server"
            loading={loading}
            checkboxSelection={true}
            disableMultipleRowSelection={!multiSelect}
            rowSelectionModel={selectionModel as any}
            onRowSelectionModelChange={(newSelection: any, details?: any) => {
              // 헤더 체크박스 클릭 시 현재 페이지 데이터만 모두 선택
              const isHeaderCheck =
                details && details.reason === 'selectAllRows';
              if (isHeaderCheck) {
                const pageRequests = requests;
                const firstItemCode = pageRequests[0]?.itemCode;
                const allSame = pageRequests.every(
                  (it) => it.itemCode === firstItemCode
                );

                if (!allSame) {
                  setError('전체 선택은 같은 품목코드일 때만 가능합니다.');
                  setSelectionModel({ type: 'include', ids: new Set() } as any);
                  return;
                }

                // 전체 선택 대상 구성
                const ids = new Set(
                  pageRequests.map(
                    (item) =>
                      `${item.orderNo}-${item.orderSeqno}-${item.orderHistno}-${item.itemCode}`
                  )
                );

                newSelection = { type: 'include', ids };
                setError('');

                // ⭐⭐ 강제 트리거 → 선택 버튼 즉시 활성화됨
                setSelectionModel({ type: 'include', ids: new Set(ids) });
                return; // 아래 기본 로직 실행 방지
              }

              setSelectionModel(newSelection);
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
                pointerEvents: 'none',
                opacity: 0.4,
              },
            }}
          />
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleConfirmSelection}
          variant="contained"
          disabled={
            !selectionModel?.ids || (selectionModel as any).ids.size === 0
          }
          startIcon={<CheckCircleIcon />}
        >
          선택
        </Button>
        <Button onClick={handleClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionRequestDialog;
