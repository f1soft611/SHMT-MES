import React from 'react';
import { Paper } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../../components/common/DataTable/DataTable';
import { BomItemSearchRow } from '../../../../types/bom';

interface BomSearchResultGridProps {
  rows: BomItemSearchRow[];
  loading: boolean;
  onSelect: (itemSeq: number) => void;
}

const columns: GridColDef<BomItemSearchRow>[] = [
  { field: 'itemNo', headerName: '품번', width: 150, headerAlign: 'center' },
  { field: 'itemName', headerName: '품목명', flex: 1, headerAlign: 'center' },
  { field: 'itemSpec', headerName: '규격', width: 150, headerAlign: 'center' },
];

const BomSearchResultGrid: React.FC<BomSearchResultGridProps> = ({ rows, loading, onSelect }) => {
  return (
    <Paper sx={{ height: '100%', width: '100%' }}>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.itemSeq}
        onRowClick={(params) => onSelect(params.row.itemSeq)}
        emptyMessage="검색된 품목이 없습니다"
      />
    </Paper>
  );
};

export default BomSearchResultGrid;
