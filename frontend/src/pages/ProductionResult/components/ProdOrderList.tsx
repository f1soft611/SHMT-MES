import React from 'react';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import {Box, Card, CardContent, CardHeader} from '@mui/material';

const ProdOrderList = () => {

    const columns: GridColDef[] = [
        { field: "ORDER_FLAG", headerName: "수주상태", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "생산상태", width: 70, headerAlign: "center", align: "center" },
        { field: "test1", headerName: "수주번호", width: 70, headerAlign: "center", align: "center" },
        { field: "test2", headerName: "영업담당자", width: 100, headerAlign: "center", align: "center" },
        { field: "test3", headerName: "수주일", width: 70, headerAlign: "center", align: "center" },
        { field: "test4", headerName: "수주처", width: 70, headerAlign: "center", align: "center" },
        { field: "test5", headerName: "표준BOM", width: 100, headerAlign: "center", align: "center" },
        { field: "test6", headerName: "제조BOM", width: 100, headerAlign: "center", align: "center" },
        { field: "test7", headerName: "품목코드", width: 70, headerAlign: "center", align: "center" },
        { field: "test8", headerName: "품목명", width: 70, headerAlign: "center", align: "center" },
        { field: "test9", headerName: "규격", width: 70, headerAlign: "center", align: "center" },
        { field: "test0", headerName: "단위", width: 70, headerAlign: "center", align: "center" },
        { field: "test11", headerName: "수주량", width: 70, headerAlign: "center", align: "center" },
        { field: "test12", headerName: "납기일", width: 70, headerAlign: "center", align: "center" },
        { field: "test13", headerName: "비고", width: 70, headerAlign: "center", align: "center" },
        { field: "test14", headerName: "PO일자", width: 70, headerAlign: "center", align: "center" },
        { field: "test15", headerName: "PO NO", width: 70, headerAlign: "center", align: "center" },
        { field: "test16", headerName: "업체품목코드", width: 100, headerAlign: "center", align: "center" },
    ];
    return(
        <Card sx={{boxShadow: 2 }}>
            <CardHeader
                sx={{ p: 1, }}
                title="생산지시 목록"
                titleTypographyProps={{
                    fontSize: 16,
                }}
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 400 }}>
                    <DataGrid
                        rows={[]}
                        columns={columns}
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
        </Card>
    );

}

export default ProdOrderList;