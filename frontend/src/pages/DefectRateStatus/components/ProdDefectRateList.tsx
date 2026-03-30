import React from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ProductionDefectRateRow } from '../../../types/productionDefectRate';
import { formatNumberWithCommas } from '../../../utils/formatUtils';
import { decodeHtml } from '../../../utils/stringUtils';

interface Props {
  rows: ProductionDefectRateRow[];
  loading: boolean;
  rowCount: number;
  paginationModel: any;
  onPaginationChange: (model: any) => void;
}

const numberCol: Partial<GridColDef> = {
  type: 'number',
  headerAlign: 'center',
  align: 'right',
  valueFormatter: (value) => formatNumberWithCommas(value),
};

const ProdDefectRateList = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  onPaginationChange,
}: Props) => {
  const columns: GridColDef[] = [
    {
      field: 'orderNo',
      headerName: '수주번호',
      width: 140,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'customerName',
      headerName: '거래처',
      minWidth: 100,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'itemCode',
      headerName: '제품번호',
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'itemName',
      headerName: '제품명',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (value) => decodeHtml(value),
    },
    {
      field: 'itemSpec',
      headerName: '제품규격',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (value) => decodeHtml(value),
    },
    {
      field: 'lotNo',
      headerName: '제품LOT No',
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'orderQty',
      headerName: '수주량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'workDtDate',
      headerName: '작업지시일',
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'workName',
      headerName: '공정명',
      minWidth: 100,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'prodItemCode',
      headerName: '공정품목코드',
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'prodItemName',
      headerName: '공정품목명',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (value) => decodeHtml(value),
    },
    {
      field: 'prodItemSpec',
      headerName: '공정품목규격',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (value) => decodeHtml(value),
    },
    {
      field: 'workQty',
      headerName: '작업지시량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'prodQty',
      headerName: '생산량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'goodQty',
      headerName: '합격량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'badQty',
      headerName: '총불량량',
      width: 90,
      ...numberCol,
    },
    {
      field: 'qcCode',
      headerName: '불량코드',
      width: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'qcName',
      headerName: '불량명',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      valueFormatter: (value) => decodeHtml(value),
    },
    {
      field: 'qcQty',
      headerName: '불량수량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'remainQty',
      headerName: '잔량',
      width: 80,
      ...numberCol,
    },
    {
      field: 'defectRate',
      headerName: '불량률(%)',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (value) =>
        value != null ? `${Number(value).toFixed(1)}%` : '0.0%',
    },
  ];

  return (
    <>
      <Card
        sx={{
          boxShadow: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ p: 0, position: 'relative', flex: 1, minHeight: 0 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                backgroundColor: 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={48} />
            </Box>
          )}
          <Box sx={{ height: '100%', minHeight: 420 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              getRowId={(row) =>
                `${row.tpr504Id ?? ''}_${row.prodSeq ?? ''}_${row.badSeq ?? ''}_${row.qcCode ?? ''}`
              }
              pagination
              paginationMode="server"
              rowCount={rowCount}
              pageSizeOptions={[10, 20, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationChange}
              rowHeight={30}
              columnHeaderHeight={35}
              sx={{
                fontSize: 12.5,
                border: 'none',
                '& .MuiDataGrid-cell': {
                  padding: '0 2px', // 셀 패딩 축소
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            ></DataGrid>
          </Box>
        </CardContent>
        <CardActions sx={{ display: 'none' }} />
      </Card>
    </>
  );
};

export default ProdDefectRateList;
