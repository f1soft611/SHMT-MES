import React from 'react';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const ProdOrderList = () => {

    const columns: GridColDef[] = [
        { field: "ORDER_FLAG", headerName: "수주상태", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "생산상태", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "수주번호", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "영업담당자", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "수주일", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "수주처", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "표준BOM", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "제조BOM", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "품목코드", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "품목명", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "규격", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "단위", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "수주량", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "납기일", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "비고", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "PO일자", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "PO NO", width: 70, headerAlign: "center", align: "center" },
        { field: "PRODWORK_SEQ", headerName: "업체품목코드", width: 70, headerAlign: "center", align: "center" },
    ];
    return(
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
    );

}

export default ProdOrderList;