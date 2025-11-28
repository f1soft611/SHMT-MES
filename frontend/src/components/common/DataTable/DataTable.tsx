import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbarContainer,
  GridValidRowModel,
  GridRowIdGetter,
} from '@mui/x-data-grid';

export interface DataTableProps<
  T extends GridValidRowModel = GridValidRowModel
> {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId?: GridRowIdGetter<T>; // 선택적: 기본은 row.id 사용
  loading?: boolean;
  error?: string | null;
  rowCount?: number; // 서버 페이지네이션 총 개수
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  pageSizeOptions?: number[];
  onRefresh?: () => void;
  toolbarRightSlot?: React.ReactNode; // 우측 커스텀 액션 (엑셀, 필터 등)
  emptyMessage?: string;
}

const DefaultToolbar: React.FC<{
  onRefresh?: () => void;
  rightSlot?: React.ReactNode;
}> = ({ onRefresh, rightSlot }) => {
  return (
    <GridToolbarContainer
      sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRefresh && (
          <Button variant="outlined" size="small" onClick={onRefresh}>
            새로고침
          </Button>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>{rightSlot}</Box>
    </GridToolbarContainer>
  );
};

const DataTable = <T extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  loading = false,
  error = null,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50],
  onRefresh,
  toolbarRightSlot,
  emptyMessage = '데이터가 없습니다',
}: DataTableProps<T>) => {
  const isServerPaging = rowCount !== undefined;
  const defaultPagination: GridPaginationModel = {
    page: 0,
    pageSize: pageSizeOptions?.[0] || 10,
  };

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* 에러 상태 */}
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography variant="body2" color="error.contrastText">
            {error}
          </Typography>
        </Box>
      )}

      {/* DataGrid */}
      <DataGrid<T>
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        localeText={{
          noRowsLabel: emptyMessage || '데이터가 없습니다.',
          noResultsOverlayLabel: emptyMessage || '데이터가 없습니다.',
          footerTotalRows: '총 행',
          footerTotalVisibleRows: (visibleCount, totalCount) =>
            `${visibleCount} / ${totalCount}`,
          footerRowSelected: (count) => `${count}개 선택됨`,
          paginationRowsPerPage: '페이지당 행',
        }}
        {...(isServerPaging ? { rowCount } : {})}
        paginationMode={isServerPaging ? 'server' : 'client'}
        paginationModel={paginationModel || defaultPagination}
        {...(onPaginationModelChange ? { onPaginationModelChange } : {})}
        pageSizeOptions={pageSizeOptions}
        slots={{
          toolbar: () => (
            <DefaultToolbar
              onRefresh={onRefresh}
              rightSlot={toolbarRightSlot}
            />
          ),
          noRowsOverlay: () => (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {emptyMessage || '데이터가 없습니다.'}
              </Typography>
            </Box>
          ),
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
        }}
      />
    </Box>
  );
};

export default DataTable;
