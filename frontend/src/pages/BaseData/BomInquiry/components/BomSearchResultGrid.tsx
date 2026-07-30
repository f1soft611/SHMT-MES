import React from 'react';
import { Paper } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DataTable from '../../../../components/common/DataTable/DataTable';
import { BomItemSearchRow } from '../../../../types/bom';
import {decodeHtml} from "../../../../utils/stringUtils";

interface BomSearchResultGridProps {
  rows: BomItemSearchRow[];
  loading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSelect: (itemSeq: number) => void;
}

const columns: GridColDef<BomItemSearchRow>[] = [
  // { field: 'itemSeq', headerName: '품목 Seq', width: 100, headerAlign: 'center', align: 'center' },
  { field: 'itemCode', headerName: '품목 코드', width: 150, headerAlign: 'center', align: 'center' },
  { field: 'itemName', headerName: '품목명', flex: 1, headerAlign: 'center', align: 'center', renderCell: (params) => decodeHtml(params.value ?? ''), },
  { field: 'itemSpec', headerName: '규격', width: 200, headerAlign: 'center', renderCell: (params) => decodeHtml(params.value ?? ''), },
];

const BomSearchResultGrid: React.FC<BomSearchResultGridProps> = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onSelect,
}) => {
  return (
    <Paper sx={{ height: '100%', width: '100%' }}>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.itemSeq}
        onRowClick={(params) => onSelect(params.row.itemSeq)}
        emptyMessage="검색된 품목이 없습니다"
      />
    </Paper>
  );
};

export default BomSearchResultGrid;
