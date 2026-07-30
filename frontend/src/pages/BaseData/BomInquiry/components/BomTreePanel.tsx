import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BomTreeRow } from '../../../../types/bom';
import { decodeHtml } from '../../../../utils/stringUtils';

interface BomTreePanelProps {
  nodes: BomTreeRow[];
  loading: boolean;
}

const columns: GridColDef<BomTreeRow>[] = [
  // {
  //   field: 'itemName',
  //   headerName: '제품명',
  //   flex: 1,
  //   minWidth: 150,
  //   headerAlign: 'center',
  //   align: 'center',
  //   renderCell: (params) => decodeHtml(params.value ?? ''),
  // },
  { field: 'itemCode', headerName: '품목코드', width: 150, headerAlign: 'center', align: 'center' },
  { field: 'depth', headerName: 'BOM레벨', width: 150, headerAlign: 'center', align: 'left' },
  {
    field: 'matItemName',
    headerName: '자재명',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => decodeHtml(params.value ?? ''),
  },
  { field: 'matItemNo', headerName: '자재코드', width: 180, headerAlign: 'center', align: 'center' },
  {
    field: 'matItemSpec',
    headerName: '자재규격',
    flex: 1,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => decodeHtml(params.value ?? ''),
  },
];

const BomTreePanel: React.FC<BomTreePanelProps> = ({ nodes, loading }) => {
  return (
    <DataGrid
      rows={nodes}
      columns={columns}
      loading={loading}
      getRowId={(row) => `${row.depth}-${row.itemSeq}-${row.matItemSeq}`}
      localeText={{ noRowsLabel: '등록된 BOM이 없습니다' }}
      hideFooter
      sx={{ height: '100%', border: 'none' }}
    />
  );
};

export default BomTreePanel;
