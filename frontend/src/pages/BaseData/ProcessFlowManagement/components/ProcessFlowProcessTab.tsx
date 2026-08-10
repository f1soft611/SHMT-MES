import { useState } from 'react';
import { DataGrid, GridColDef, GridRowId, GridRowModel } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  GlobalStyles,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { ProcessType } from '../../../../types/process';
import { useToast } from '../../../../components/common/Feedback/ToastProvider';
import { useProcessDraftContext } from '../detail/ProcessDraftContext';
import { useProcessCatalogQuery } from '../detail/useProcessFlowDetailQueries';

export default function ProcessFlowProcessTab() {
  const process = useProcessDraftContext();
  const { showToast } = useToast();
  const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
  const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);
  const [searchDraft, setSearchDraft] = useState({
    searchCnd: '0',
    searchWrd: '',
    useYn: 'Y',
  });
  const [searchParams, setSearchParams] = useState(searchDraft);
  const catalog = useProcessCatalogQuery({
    page: 0,
    pageSize: 0,
    unpaged: true,
    ...searchParams,
  });
  const catalogResult = catalog.data?.result;
  const processRows = catalogResult?.resultList ?? [];
  const error = process.error || (catalog.error instanceof Error ? catalog.error : null);
  // ponytail: MUI DataGrid(커뮤니티)는 페이징을 완전히 끌 수 없어, 전체 행이 한 페이지에 담기도록 페이지 크기를 맞추고 footer만 숨긴다
  const leftPageSize = Math.max(processRows.length, 1);

  const leftColumns: GridColDef[] = [
    { field: 'processCode', headerName: '공정 코드', width: 100, headerAlign: 'center', align: 'center' },
    { field: 'processName', headerName: 'MES공정 이름', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'erpProcessName', headerName: 'ERP공정 이름', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'equipmentIntegrationYn',
      headerName: '설비연동',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'Y' ? '연동' : '미연동'}
          color={params.value === 'Y' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
  ];

  const rightColumns: GridColDef[] = [
    { field: 'flowProcessCode', headerName: '공정 코드', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'flowProcessName', headerName: '공정 이름', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'planFlag',
      headerName: '계획공정',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Radio
          name="planFlag"
          checked={params.row.planFlag === 'Y'}
          onChange={() => process.selectPlan(params.row.rowId)}
        />
      ),
    },
    {
      field: 'equipmentFlag',
      headerName: '설비연동',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'Y' ? '연동' : '미연동'}
          color={params.value === 'Y' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    { field: 'seq', headerName: '순서', width: 80, headerAlign: 'center', align: 'center', type: 'number', editable: true },
    {
      field: 'lastFlag',
      headerName: 'I/F 연동',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Checkbox
          name="lastFlag"
          checked={params.row.lastFlag === 'Y'}
          onChange={() => process.toggleLast(params.row.rowId)}
        />
      ),
    },
    {
      field: 'erpResultFlag',
      headerName: '실적전송',
      width: 80,
      headerAlign: 'center',
      align: 'center',
    //   todo: lastFlag처럼 체크박스로 값 받고 실제 저장까지 (tpr110d테이블에는 ERP_RESULT_FLAG라는 칼럼 생성해 두었음)
    },
  ];

  const handleAdd = () => {
    const result = process.add(leftSelected, processRows);
    if (!result.ok) {
      showToast({ message: result.message, severity: 'error' });
      return;
    }
    setLeftSelected([]);
  };

  const updateProcessRow = (newRow: GridRowModel) => {
    process.updateSeq(newRow.rowId, Number(newRow.seq));
    return newRow;
  };

  return (
    <>
      <GlobalStyles styles={{ '.MuiDataGrid-panel': { opacity: 0.6, transition: 'opacity 0.2s ease' }, '.MuiDataGrid-panel:hover': { opacity: 1 } }} />
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">{error.message}</Typography>
          <Button size="small" onClick={() => { process.retry(); catalog.refetch(); }}>다시 시도</Button>
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
              <MenuItem value="0">공정 코드</MenuItem>
              <MenuItem value="1">공정 이름</MenuItem>
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
            <Button variant="contained" startIcon={<SearchIcon />} onClick={() => setSearchParams(searchDraft)} sx={{ minWidth: 150 }}>
            검색
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1} direction="row">
        <Grid size={{ xs: 5.0 }} sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, py: 0.75, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight={600}>전체공정</Typography>
          </Box>
          <DataGrid
              rows={processRows}
              columns={leftColumns}
              getRowId={(row: ProcessType) => row.processId}
              loading={catalog.isLoading}
              slotProps={{
                loadingOverlay: {
                  variant: 'linear-progress',
                  noRowsVariant: 'linear-progress',
                },
              }}
              pagination
              paginationModel={{ page: 0, pageSize: leftPageSize }}
              onPaginationModelChange={() => {}}
              pageSizeOptions={[leftPageSize]}
              hideFooterPagination
              hideFooter={true}
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
            <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={() => { process.remove(rightSelected); setRightSelected([]); }} disabled={rightSelected.length === 0} aria-label="move selected left">&lt;</Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Box sx={{ px: 1.5, py: 0.75, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight={600}>적용된 공정</Typography>
          </Box>
          <DataGrid
            rows={process.rows}
            columns={rightColumns}
            getRowId={(row) => row.rowId}
            loading={process.isLoading}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            editMode="cell"
            processRowUpdate={updateProcessRow}
            checkboxSelection
            disableRowSelectionOnClick
            disableRowSelectionExcludeModel
            onRowSelectionModelChange={(model) => setRightSelected(Array.from(model.ids))}
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
