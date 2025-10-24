import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Item } from '../../../types/item';
import itemService from '../../../services/itemService';

const ItemManagement: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 폼 상태
  const [formData, setFormData] = useState<Item>({
    itemCode: '',
    itemName: '',
    itemType: 'PRODUCT',
    specification: '',
    unit: '',
    stockQty: '0',
    safetyStock: '0',
    remark: '',
    interfaceYn: 'N',
    useYn: 'Y',
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    itemType: '',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    itemType: '',
  });

  // 품목 목록 조회 (searchParams, paginationModel 의존성으로 자동 실행)
  const fetchItems = useCallback(async () => {
    try {
      const response = await itemService.getItemList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setItems(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      showSnackbar('품목 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, [searchParams, paginationModel]);

  // 컴포넌트 마운트 시와 searchParams 변경 시에만 조회
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      itemCode: '',
      itemName: '',
      itemType: 'PRODUCT',
      specification: '',
      unit: '',
      stockQty: '0',
      safetyStock: '0',
      remark: '',
      interfaceYn: 'N',
      useYn: 'Y',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item: Item) => {
    setDialogMode('edit');
    setFormData(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof Item, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const result = await itemService.createItem(formData);
        if (result.resultCode === 200) {
          showSnackbar('품목이 등록되었습니다.', 'success');
        } else {
          showSnackbar(result.result.message, 'error');
        }
      } else {
        await itemService.updateItem(formData.itemId!, formData);
        showSnackbar('품목이 수정되었습니다.', 'success');
      }
      handleCloseDialog();
      // 저장 후 현재 검색 조건으로 다시 조회
      fetchItems();
    } catch (error) {
      console.error('Failed to save item:', error);
      showSnackbar('저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await itemService.deleteItem(itemId);
        showSnackbar('품목이 삭제되었습니다.', 'success');
        // 삭제 후 현재 검색 조건으로 다시 조회
        fetchItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
        showSnackbar('삭제에 실패했습니다.', 'error');
      }
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    return itemType === 'PRODUCT' ? '제품' : itemType === 'MATERIAL' ? '자재' : itemType;
  };

  const getItemTypeColor = (itemType: string) => {
    return itemType === 'PRODUCT' ? 'primary' : 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'itemCode',
      headerName: '품목코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemType',
      headerName: '품목타입',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getItemTypeLabel(params.value || 'PRODUCT')}
          color={getItemTypeColor(params.value || 'PRODUCT') as any}
          size="small"
        />
      ),
    },
    {
      field: 'specification',
      headerName: '규격',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'unit',
      headerName: '단위',
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'stockQty',
      headerName: '재고수량',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'regDt',
      headerName: '등록일',
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              title="수정"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.itemId!)}
              title="삭제"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">품목 관리</Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            품목 등록
          </Button>
        </Box>
      </Box>

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={inputValues.searchCnd}
                label="검색 조건"
                onChange={(e) => handleInputChange('searchCnd', e.target.value)}
              >
                <MenuItem value="0">품목코드</MenuItem>
                <MenuItem value="1">품목명</MenuItem>
                <MenuItem value="2">규격</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 150px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>품목타입</InputLabel>
              <Select
                value={inputValues.itemType}
                label="품목타입"
                onChange={(e) => handleInputChange('itemType', e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="PRODUCT">제품</MenuItem>
                <MenuItem value="MATERIAL">자재</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 200px' }}>
            <TextField
              fullWidth
              size="small"
              label="검색어"
              value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요"
            />
          </Box>

          <Box sx={{ flex: '1 1 150px' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* 품목 목록 */}
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.itemId || ''}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalCount}
          paginationMode="server"
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          localeText={{
            noRowsLabel: '조회된 데이터가 없습니다',
            footerRowSelected: (count) => `${count}개 선택됨`,
          }}
        />
      </Paper>

      {/* 품목 등록/수정 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? '품목 등록' : '품목 수정'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                label="품목코드"
                value={formData.itemCode}
                onChange={(e) => handleChange('itemCode', e.target.value)}
                disabled={dialogMode === 'edit' || formData.interfaceYn === 'Y'}
                helperText={formData.interfaceYn === 'Y' ? '인터페이스 항목은 수정할 수 없습니다' : ''}
              />
              <TextField
                fullWidth
                required
                label="품목명"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                disabled={formData.interfaceYn === 'Y'}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth disabled={formData.interfaceYn === 'Y'}>
                <InputLabel>품목타입</InputLabel>
                <Select
                  value={formData.itemType}
                  label="품목타입"
                  onChange={(e) => handleChange('itemType', e.target.value)}
                >
                  <MenuItem value="PRODUCT">제품</MenuItem>
                  <MenuItem value="MATERIAL">자재</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="규격"
                value={formData.specification}
                onChange={(e) => handleChange('specification', e.target.value)}
                disabled={formData.interfaceYn === 'Y'}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="단위"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                disabled={formData.interfaceYn === 'Y'}
              />
              <TextField
                fullWidth
                label="재고수량"
                type="number"
                value={formData.stockQty}
                onChange={(e) => handleChange('stockQty', e.target.value)}
              />
              <TextField
                fullWidth
                label="안전재고"
                type="number"
                value={formData.safetyStock}
                onChange={(e) => handleChange('safetyStock', e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>사용 여부</InputLabel>
                <Select
                  value={formData.useYn}
                  label="사용 여부"
                  onChange={(e) => handleChange('useYn', e.target.value)}
                >
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth disabled>
                <InputLabel>인터페이스 여부</InputLabel>
                <Select
                  value={formData.interfaceYn}
                  label="인터페이스 여부"
                >
                  <MenuItem value="Y">예</MenuItem>
                  <MenuItem value="N">아니오</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="비고"
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" color="primary">
            저장
          </Button>
          <Button onClick={handleCloseDialog}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemManagement;
