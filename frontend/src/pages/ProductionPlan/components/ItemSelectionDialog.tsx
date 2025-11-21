import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
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
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open, page, pageSize]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await itemService.getItemList(page, pageSize, {
        searchCnd: 'itemName',
        searchWrd: searchKeyword,
        useYn: 'Y',
      });

      if (response.resultCode === 200 && response.result?.resultList) {
        setItems(response.result.resultList);
        setTotalCount(
          response.result.paginationInfo?.totalRecordCount || response.result.resultList.length
        );
      } else {
        setError('품목 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load items:', error);
      setError('품목 목록을 불러오는 중 오류가 발생했습니다.');
      // Mock 데이터로 폴백
      const mockItems: Item[] = [
        { itemCode: 'ITEM001', itemName: '테스트 품목 1', unit: 'EA', specification: '규격1' },
        { itemCode: 'ITEM002', itemName: '테스트 품목 2', unit: 'EA', specification: '규격2' },
        { itemCode: 'ITEM003', itemName: '테스트 품목 3', unit: 'KG', specification: '규격3' },
      ];
      setItems(mockItems);
      setTotalCount(mockItems.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadItems();
  };

  const handleSelect = () => {
    if (selectionModel.length === 0) {
      alert('품목을 선택해주세요.');
      return;
    }

    const selectedItem = items.find((item) => item.itemCode === selectionModel[0]);
    if (selectedItem) {
      onSelect(selectedItem);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectionModel([]);
    setSearchKeyword('');
    setPage(0);
    setError('');
    onClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'itemCode',
      headerName: '품목코드',
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
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'unit',
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
              placeholder="품목명으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
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
          <Box sx={{ height: 400, width: '100%' }}>
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
        <Button onClick={handleClose} variant="outlined" color="inherit">
          취소
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          color="primary"
          disabled={selectionModel.length === 0}
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemSelectionDialog;
