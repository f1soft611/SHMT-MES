import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import {
  Box,
  Button,
  FormControl,
  GlobalStyles,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { ItemType } from '../../../../types/item';
import { useItemDraftContext } from '../detail/ItemDraftContext';

export default function ProcessFlowItemTab() {
  const item = useItemDraftContext();
  const { setCatalogParams } = item;
  const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
  const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchDraft, setSearchDraft] = useState({
    searchCnd: '1',
    searchWrd: '',
  });
  const [searchParams, setSearchParams] = useState(searchDraft);

  useEffect(() => {
    setCatalogParams({
      page,
      pageSize,
      ...searchParams,
    });
  }, [page, pageSize, searchParams, setCatalogParams]);

  const leftColumns: GridColDef[] = [
    { field: 'itemCode', headerName: '품목 코드', flex: 1, headerAlign: 'center' },
    { field: 'itemName', headerName: '품목명', flex: 1.2, headerAlign: 'center' },
    { field: 'specification', headerName: '규격', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'unitName', headerName: '단위', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'unit', headerName: '단위코드' },
  ];

  const rightColumns: GridColDef[] = [
    { field: 'itemId' },
    { field: 'itemCode', headerName: '품목 코드', flex: 1, headerAlign: 'center' },
    { field: 'itemName', headerName: '품목명', flex: 1.2, headerAlign: 'center' },
    { field: 'specification', headerName: '규격', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'unitName', headerName: '단위', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'unit', headerName: '단위코드' },
  ];

  const handleAdd = () => {
    item.add(leftSelected, item.catalogRows);
    setLeftSelected([]);
  };

  return (
    <>
      <GlobalStyles styles={{ '.MuiDataGrid-panel': { opacity: 0.6, transition: 'opacity 0.2s ease' }, '.MuiDataGrid-panel:hover': { opacity: 1 } }} />
      {item.error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">{item.error.message}</Typography>
          <Button size="small" onClick={item.retry}>다시 시도</Button>
        </Box>
      )}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>검색 조건</InputLabel>
            <Select
              value={searchDraft.searchCnd}
              label="검색 조건"
              onChange={(e) => setSearchDraft((prev) => ({ ...prev, searchCnd: e.target.value }))}
            >
              <MenuItem value="1">품목 코드</MenuItem>
              <MenuItem value="2">품목명</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            sx={{ flex: 1 }}
            placeholder="검색어를 입력하세요"
            value={searchDraft.searchWrd}
            onChange={(e) => setSearchDraft((prev) => ({ ...prev, searchWrd: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && setSearchParams(searchDraft)}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={() => { setPage(0); setSearchParams(searchDraft); }} sx={{ minWidth: 150 }}>
            검색
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1} direction="row">
        <Grid size={{ xs: 5.5 }} sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, py: 0.75, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight={600}>전체 제품</Typography>
          </Box>
          <DataGrid
            rows={item.catalogRows}
            columns={leftColumns}
            getRowId={(row: ItemType) => row.itemId}
            loading={item.isCatalogFetching}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            pagination
            paginationMode="server"
            rowCount={item.catalogTotalCount}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.pageSize !== pageSize ? 0 : model.page);
              setPageSize(model.pageSize);
              setLeftSelected([]);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            columnVisibilityModel={{ unit: false }}
            checkboxSelection
            disableRowSelectionExcludeModel
            rowSelectionModel={{ type: 'include', ids: new Set(leftSelected) }}
            onRowSelectionModelChange={(model) => setLeftSelected(Array.from(model.ids))}
            autoHeight={false}
            rowHeight={35}
            columnHeaderHeight={40}
            sx={{ height: 450, '& .MuiDataGrid-cell': { padding: '0 2px' } }}
          />
        </Grid>
        <Grid size={{ xs: 1 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleAdd} disabled={leftSelected.length === 0} aria-label="move selected right">&gt;</Button>
            <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={() => { item.remove(rightSelected); setRightSelected([]); }} disabled={rightSelected.length === 0} aria-label="move selected left">&lt;</Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 5.5 }} sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, py: 0.75, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight={600}>적용된 제품</Typography>
          </Box>
          <DataGrid
            rows={item.rows}
            columns={rightColumns}
            getRowId={(row) => row.rowId}
            loading={item.isAppliedItemsFetching}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            columnVisibilityModel={{ unit: false, itemId: false }}
            checkboxSelection
            disableRowSelectionOnClick
            disableRowSelectionExcludeModel
            onRowSelectionModelChange={(model) => setRightSelected(Array.from(model.ids))}
            pageSizeOptions={[10, 20, 50, 100]}
            autoHeight={false}
            rowHeight={35}
            columnHeaderHeight={40}
            sx={{ height: 450, '& .MuiDataGrid-cell': { padding: '0 2px' } }}
          />
        </Grid>
      </Grid>
    </>
  );
}
