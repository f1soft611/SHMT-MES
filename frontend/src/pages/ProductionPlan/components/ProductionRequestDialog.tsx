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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material';
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

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (open) {
      loadProductionRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, pageSize]);

  const loadProductionRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productionRequestService.getProductionRequestList(
        page,
        pageSize,
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
  }, [page, pageSize, searchParams]);

  const handleSearch = () => {
    setPage(0);
    loadProductionRequests();
  };

  const handleSearchParamChange = (field: string, value: string) => {
    setSearchParams({ ...searchParams, [field]: value });
  };

  const handleSelectRequest = (request: ProductionRequest) => {
    setSelectedRequest(request);
  };

  const handleConfirmSelection = () => {
    if (selectedRequest) {
      onSelect(selectedRequest);
      onClose();
      setSelectedRequest(null);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
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
            label="검색 조건"
            value="품목코드"
            disabled
            sx={{ width: 120 }}
          />
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

      {/* 테이블 영역 */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ flex: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      선택
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      생산의뢰번호
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      생산의뢰일
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      품목코드
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      품목명
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      규격
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      단위
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      생산의뢰량
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      납기일
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      등록자
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      등록시간
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      등록일자
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          생산의뢰 데이터가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request, index) => (
                      <TableRow
                        key={`${request.orderNo}-${request.orderSeqno}-${index}`}
                        hover
                        selected={selectedRequest === request}
                        onClick={() => handleSelectRequest(request)}
                        sx={{ 
                          cursor: 'pointer',
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            '&:hover': {
                              bgcolor: 'primary.light',
                            }
                          }
                        }}
                      >
                        <TableCell align="center">
                          {selectedRequest === request && (
                            <CheckCircleIcon color="primary" />
                          )}
                        </TableCell>
                        <TableCell align="center">{request.orderNo}</TableCell>
                        <TableCell align="center">{formatDate(request.registDate)}</TableCell>
                        <TableCell align="center">
                          <Chip label={request.itemCode} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{request.itemName}</TableCell>
                        <TableCell align="center">{request.specification || '-'}</TableCell>
                        <TableCell align="center">{request.unit || 'EA'}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={request.orderQty?.toLocaleString()} 
                            size="small" 
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">{formatDate(request.deliveryDate)}</TableCell>
                        <TableCell align="center">{request.registrant || '-'}</TableCell>
                        <TableCell align="center">{request.registTime || '-'}</TableCell>
                        <TableCell align="center">{formatDate(request.registDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="페이지당 행:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
            />
          </>
        )}
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
