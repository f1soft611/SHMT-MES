import React from 'react';
import {DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {Box, Card, CardHeader, CardContent, CardActions} from '@mui/material';

interface Props {
    rows: any[];
    loading: boolean;
    onRowClick?: (row: any) => void;
    paginationModel: GridPaginationModel;
    totalCount: number;
    onPaginationChange: (model: GridPaginationModel) => void;
}

const ProdPlanList = ({ rows, loading, onRowClick, paginationModel, totalCount, onPaginationChange }: Props) => {

    const columns: GridColDef[] = [
        {
            field: "planStatus",
            headerName: "계획상태",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ORDER_FLAG",
            headerName: "지시상태",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODPLAN_ID",
            headerName: "의뢰번호",
            width: 140,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "prodType",
            headerName: "생산구분",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODPLAN_DATE",
            headerName: "생산계획일",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ITEM_CODE",
            headerName: "품목코드",
            width: 80,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ITEM_NAME",
            headerName: "품목명",
            width: 250,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROD_QTY",
            headerName: "계획량",
            width: 70,
            headerAlign: "center",
            align: "right",
            renderCell: (params) => (params.value ?? 0).toLocaleString(),
        },
        {
            field: "LOT_NO",
            headerName: "LOT_NO",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "BIGO",
            headerName: "비고",
            width: 200,
            headerAlign: "center",
            align: "left",
        },

    ];

    return(
        <Card sx={{boxShadow: 2 }}>
            {/* 타이틀 */}
            <CardHeader sx={{ p: 1, }}
                title="생산계획 목록"
                titleTypographyProps={{
                    fontSize: 16,
                }}
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 250 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        onRowClick={(params) => onRowClick?.(params.row)}
                        getRowId={(row) => row.PRODPLAN_ID}
                        pagination
                        paginationMode="server"
                        rowCount={totalCount}
                        pageSizeOptions={[10, 20, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={onPaginationChange}
                        rowHeight={35}
                        columnHeaderHeight={40}
                        sx={{
                            fontSize: 14,
                            "& .MuiDataGrid-cell": {
                                padding: "0 2px",     // 셀 패딩 축소
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ display: 'none' }} />
        </Card>
    )
}

export default ProdPlanList