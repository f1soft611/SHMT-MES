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
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { productionRequestService } from '../../../services/productionRequestService';
import { ProductionRequest } from '../../../types/productionRequest';

interface ProductionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (request: ProductionRequest) => void;
}

const ProductionRequestDialog: React.FC<ProductionRequestDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductionRequest | null>(null);
  
  // 검색 조건
  const [searchParams, setSearchParams] = useState({
    itemCode: '',
    itemName: '',
    orderNo: '',
  });

  // 페이지네이션 - DataGrid 형식으로 변경
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (open) {
      loadProductionRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paginationModel.page, paginationModel.pageSize]);

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
        // Mock data for development
        const mockRequests: ProductionRequest[] = [
          {
            factoryCode: 'F001',
            orderNo: 'ORD2024001',
            orderHistno: 1,
            orderSeqno: 1,
            itemCode: 'ITEM001',
            itemName: '제품A',
            specification: '100x200mm',
            unit: 'EA',
            orderQty: 1000,
            deliveryDate: '20241231',
            registrant: '홍길동',
            registDate: '20241101',
            registTime: '09:00:00',
          },
          {
            factoryCode: 'F001',
            orderNo: 'ORD2024002',
            orderHistno: 1,
            orderSeqno: 1,
            itemCode: 'ITEM002',
            itemName: '제품B',
            specification: '150x250mm',
            unit: 'EA',
            orderQty: 500,
            deliveryDate: '20241230',
            registrant: '김철수',
            registDate: '20241102',
            registTime: '10:30:00',
          },
        ];
        setRequests(mockRequests);
        setTotalCount(mockRequests.length);
      }
    } catch (error) {
      console.error('Failed to load production requests:', error);
      // Use mock data on error
      const mockRequests: ProductionRequest[] = [
        {
          factoryCode: 'F001',
          orderNo: 'ORD2024001',
          orderHistno: 1,
          orderSeqno: 1,
          itemCode: 'ITEM001',
          itemName: '제품A',
          specification: '100x200mm',
          unit: 'EA',
          orderQty: 1000,
          deliveryDate: '20241231',
          registrant: '홍길동',
          registDate: '20241101',
          registTime: '09:00:00',
        },
      ];
      setRequests(mockRequests);
      setTotalCount(mockRequests.length);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchParams]);

  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    loadProductionRequests();
  };

  const handleSearchParamChange = (field: string, value: string) => {
    setSearchParams({ ...searchParams, [field]: value });
  };

  const handleConfirmSelection = () => {
    if (selectedRequest) {
      onSelect(selectedRequest);
      onClose();
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  // DataGrid 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'selected',
      headerName: '선택',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        selectedRequest?.orderNo === params.row.orderNo && 
        selectedRequest?.orderSeqno === params.row.orderSeqno ? (
          <CheckCircleIcon color="primary" />
        ) : null
      ),
    },
    {
      field: 'orderNo',
      headerName: '생산의뢰번호',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'registDate',
      headerName: '생산의뢰일',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'itemCode',
      headerName: '품목코드',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ),
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
      width: 120,
      align: 'center',
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
    {
      field: 'registrant',
      headerName: '등록자',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'registTime',
      headerName: '등록시간',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '85vh' }
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
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      
      {/* 검색 영역 */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          상세검색
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            label="품목코드"
            value={searchParams.itemCode}
            onChange={(e) => handleSearchParamChange('itemCode', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="품목명"
            value={searchParams.itemName}
            onChange={(e) => handleSearchParamChange('itemName', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="생산의뢰번호"
            value={searchParams.orderNo}
            onChange={(e) => handleSearchParamChange('orderNo', e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ px: 3 }}
          >
            검색
          </Button>
        </Stack>
      </Box>
      
      <Divider />

      {/* DataGrid 영역 */}
      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <DataGrid
            rows={requests}
            columns={columns}
            getRowId={(row) => `${row.orderNo}-${row.orderSeqno}`}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            rowCount={totalCount}
            paginationMode="server"
            loading={loading}
            onRowClick={(params) => setSelectedRequest(params.row)}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
            localeText={{
              noRowsLabel: '생산의뢰 데이터가 없습니다.',
            }}
          />
        </Box>
      </DialogContent>
      
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={handleConfirmSelection} 
          variant="contained" 
          size="large" 
          sx={{ px: 4 }}
          disabled={!selectedRequest}
          startIcon={<CheckCircleIcon />}
        >
          선택
        </Button>
        <Button onClick={onClose} variant="outlined" size="large">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionRequestDialog;
