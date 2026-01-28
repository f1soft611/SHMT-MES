import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Chip,
  Box,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { Search as SearchIcon } from '@mui/icons-material';
import itemService from '../../../services/itemService';
import { Item } from '../../../types/item';

interface ItemSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

const ItemSelectionDialog: React.FC<ItemSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>(),
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actualSearchKeyword, setActualSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await itemService.getItemList(page, pageSize, {
          searchCnd: '1', // 품목번호 검색',
          searchWrd: actualSearchKeyword,
          useYn: 'Y',
        });

        if (response.resultCode === 200 && response.result?.resultList) {
          setItems(response.result.resultList);
          setTotalCount(
            response.result.paginationInfo?.totalRecordCount ||
              response.result.resultList.length,
          );
        } else {
          setError('품목 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to load items:', error);
        setError('품목 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadItems();
    }
  }, [open, page, pageSize, actualSearchKeyword]);

  const handleSearch = () => {
    setPage(0);
    setActualSearchKeyword(searchKeyword);
  };

  const handleSelect = () => {
    if (selectionModel.ids.size === 0) {
      setError('품목을 선택해주세요.');
      return;
    }

    const selectedItemCode = String(Array.from(selectionModel.ids)[0]);
    const selectedItem = items.find(
      (item) => item.itemCode === selectedItemCode,
    );
    if (!selectedItem) {
      setError('선택한 품목을 찾을 수 없습니다.');
      return;
    }

    onSelect(selectedItem);
    handleClose();
  };

  const handleClose = () => {
    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() });
    setSearchKeyword('');
    setActualSearchKeyword('');
    setPage(0);
    setError('');
    onClose();
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'PRODUCT':
        return '제품';
      case '1':
        return '상품';
      case 'HALF_PRODUCT':
        return '반제품';
      case '3':
        return '서비스';
      case '6':
        return '원자재';
      default:
        return itemType;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'PRODUCT':
        return 'primary';
      case '1':
        return 'success';
      case 'HALF_PRODUCT':
        return 'info';
      case '3':
        return 'warning';
      case '6':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'itemCode',
      headerName: '품목번호',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemName',
      headerName: '품목명',
      width: 250,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'specification',
      headerName: '규격',
      width: 150,
      align: 'left',
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'itemType',
      headerName: '품목타입',
      width: 100,
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
      field: 'unitName',
      headerName: '단위',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || 'EA',
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}
      >
        품목 선택
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          {/* 검색 영역 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="품목번호로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              검색
            </Button>
          </Box>

          {error && (
            <Alert severity="warning" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 품목 목록 DataGrid */}
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={items}
              columns={columns}
              getRowId={(row) => row.itemCode}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              rowCount={totalCount}
              paginationMode="server"
              checkboxSelection
              disableMultipleRowSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={(newSelection) => {
                setSelectionModel(newSelection);
              }}
              sx={{
                // border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                  cursor: 'pointer',
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSelect}
          variant="contained"
          color="primary"
          disabled={selectionModel.ids.size === 0}
        >
          선택
        </Button>
        <Button onClick={handleClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemSelectionDialog;
