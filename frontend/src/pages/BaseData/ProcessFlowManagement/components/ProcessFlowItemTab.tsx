import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import {
  Button,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Item } from '../../../../types/item';
import { useProcessFlowDetailContext } from '../hooks/detail/useProcessFlowDetailContext';
import { useDetailItemTab } from '../hooks/detail/useDetailItemTab';
import { useItemList } from '../hooks/detail/useItemList';
import ConfirmDialog from "../../../../components/common/Feedback/ConfirmDialog";

export default function ProcessFlowItemTab() {
  //  공정흐름 기준
  const {
    processFlow,
    flowItemRows, // 흐름에 속한 제품 목록
    setFlowItemRows, // 흐름 제품 setter
  } = useProcessFlowDetailContext();

  // 좌측 전체 목록 (서버 페이징 + 검색)
  const {
    rows: itemRows,
    totalCount,
    page,
    pageSize,
    handlePaginationChange,

    searchDraft,
    updateSearchDraft,
    handleSearchItem,

    selected: leftSelected,
    setSelected: setLeftSelected,
  } = useItemList();

  // 우측 등록 공정
  const {
    rightSelected,
    setRightSelected,
    addItems,
    // removeItems
    requestRemoveItems,
    confirmRemoveItems,
    cancelRemoveItems,
    openConfirm,

  } =
    useDetailItemTab({
      flowItemRows,
      setFlowItemRows,
    });

  const leftColumns: GridColDef[] = [
    {
      field: 'itemCode',
      headerName: '품목 코드',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'specification',
      headerName: '규격',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unitName',
      headerName: '단위',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    { field: 'unit', headerName: '단위코드' },
  ];

  const rightColumns: GridColDef[] = [
    { field: 'flowItemCodeId' },
    {
      field: 'flowItemCode',
      headerName: '품목 코드',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'flowItemName',
      headerName: '품목명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'specification',
      headerName: '규격',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unitName',
      headerName: '단위',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    { field: 'unit', headerName: '단위코드' },
  ];

  /** 좌 → 우 추가 */
  const handleAdd = () => {
    if (!processFlow) return;

    addItems(
      leftSelected,
      itemRows,
      processFlow.processFlowId!,
      processFlow.processFlowCode!
    );

    setLeftSelected([]);
  };

  return (
    <>
      {/* 검색 영역 */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>검색 조건</InputLabel>
            <Select
              value={searchDraft.searchCnd}
              label="검색 조건"
              onChange={(e) => updateSearchDraft('searchCnd', e.target.value)}
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
            onChange={(e) => updateSearchDraft('searchWrd', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearchItem}
            sx={{ minWidth: 150 }}
          >
            검색
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1} direction="row">
        <Grid size={{ xs: 5.5 }} sx={{ overflow: 'hidden' }}>
          <DataGrid
            rows={itemRows}
            columns={leftColumns}
            getRowId={(row: Item) => row.itemCode}
            pagination
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationChange}
            pageSizeOptions={[10, 20, 50]}
            columnVisibilityModel={{ unit: false }} // 화면에서만 숨김
            checkboxSelection
            disableRowSelectionExcludeModel
            // ★ selectionModel은 include 방식으로만 설정 가능
            rowSelectionModel={{
              type: 'include',
              ids: new Set(leftSelected),
            }}
            onRowSelectionModelChange={(model) => {
              setLeftSelected(Array.from(model.ids));
            }}
            // onRowSelectionModelChange={(model) => {
            //     const anyModel = model as { ids: Set<GridRowId> };
            //     setLeftSelected(Array.from(anyModel.ids ?? []));
            // }}
            autoHeight={false}
            rowHeight={35}
            columnHeaderHeight={40}
            sx={{
              height: 450,
              '& .MuiDataGrid-cell': {
                padding: '0 2px', // 셀 패딩 축소
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 1 }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1, // 버튼 간격
            }}
          >
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleAdd}
              disabled={leftSelected.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={requestRemoveItems}
              disabled={rightSelected.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 5.5 }} sx={{ overflow: 'hidden' }}>
          <DataGrid
            rows={flowItemRows}
            columns={rightColumns}
            getRowId={(row) => row.flowItemId ?? row.flowRowId}
            columnVisibilityModel={{
              unit: false,
              flowItemCodeId: false,
            }} // 화면에서만 숨김
            checkboxSelection
            disableRowSelectionOnClick
            disableRowSelectionExcludeModel
            onRowSelectionModelChange={(model) => {
              const anyModel = model as { ids: Set<GridRowId> };
              setRightSelected(Array.from(anyModel.ids ?? []));
            }}
            autoHeight={false}
            rowHeight={35}
            columnHeaderHeight={40}
            sx={{
              height: 450,
              '& .MuiDataGrid-cell': {
                padding: '0 2px', // 셀 패딩 축소
              },
            }}
          />
        </Grid>
      </Grid>


      <ConfirmDialog
          open={openConfirm}
          title="삭제 확인"
          message="선택한 품목을 공정흐름에서 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmRemoveItems}
          onClose={cancelRemoveItems}
      />
    </>
  );
}
