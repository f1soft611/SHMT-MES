import React from 'react';
import { Card, CardContent } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { WorkplaceKpiRow } from '../../../types/workplaceKpi';
import { formatNumberWithCommas } from '../../../utils/formatUtils';

interface Props {
  rows: WorkplaceKpiRow[];
  loading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
}

const numCol: Partial<GridColDef> = {
  type: 'number',
  headerAlign: 'center',
  align: 'right',
  valueFormatter: (value) => formatNumberWithCommas(value),
};

const columns: GridColDef[] = [
  //   {
  //     field: 'workcenterCode',
  //     headerName: '작업장',
  //     width: 90,
  //     headerAlign: 'center',
  //     align: 'center',
  //   },
  {
    field: 'processType',
    headerName: '작업장',
    width: 70,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'workDate',
    headerName: '작업일',
    width: 120,
    headerAlign: 'center',
    align: 'center',
    valueFormatter: (value: string) =>
      value
        ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
        : '',
  },
  {
    field: 'workOrderNo',
    headerName: '작업지시번호',
    width: 150,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'itemName',
    headerName: '품명',
    flex: 1,
    minWidth: 120,
    headerAlign: 'center',
    align: 'left',
  },
  {
    field: 'itemCode',
    headerName: '품번',
    width: 120,
    headerAlign: 'center',
    align: 'center',
  },
  { field: 'prodQty', headerName: '생산수량', width: 90, ...numCol },
  { field: 'goodQty', headerName: '양품수량', width: 90, ...numCol },
  { field: 'badQty', headerName: '불량수량', width: 90, ...numCol },
  {
    field: 'badRate',
    headerName: '불량률(%)',
    width: 100,
    type: 'number',
    headerAlign: 'center',
    align: 'right',
    valueGetter: (_value: number, row: WorkplaceKpiRow) =>
      row.prodQty > 0 ? (row.badQty / row.prodQty) * 100 : 0,
    valueFormatter: (value: number) =>
      value != null ? `${value.toFixed(2)}%` : '0.00%',
  },
  { field: 'workTime', headerName: '작업시간(h)', width: 100, ...numCol },
  { field: 'qtyPerHour', headerName: '시간당생산', width: 100, ...numCol },
];

const WorkplaceKpiGrid: React.FC<Props> = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  onPaginationChange,
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent
        sx={{ flex: 1, p: 0, minHeight: 0, '&:last-child': { pb: 0 } }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.kpiSeq}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationChange}
          pageSizeOptions={[50, 100, 200]}
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
            border: 'none',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default WorkplaceKpiGrid;
