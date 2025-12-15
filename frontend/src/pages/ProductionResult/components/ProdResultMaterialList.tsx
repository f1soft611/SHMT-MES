import React from 'react';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const ProdResultMaterialList= () => {

    const columns: GridColDef[] = [
        {
            field: "ORDER_FLAG",
            headerName: "투입",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODWORK_SEQ",
            headerName: "품목계정",
            width: 90,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "CODE",
            headerName: "품목코드",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "NAME",
            headerName: "품목명",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "SPEC",
            headerName: "규격",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "UNIT",
            headerName: "단위",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "NEED",
            headerName: "소요량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "USED",
            headerName: "투입량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "STOCK",
            headerName: "재고량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "LOT",
            headerName: "Lot",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "WAREHOUSE",
            headerName: "창고",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "LOCATION",
            headerName: "위치",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
    ];
    return(
        <Box sx={{ height: 400 }}>
            <DataGrid
                rows={[]}
                columns={columns}
                rowHeight={35}
                columnHeaderHeight={40}
                hideFooter
                hideFooterPagination
                hideFooterSelectedRowCount
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

export default ProdResultMaterialList;