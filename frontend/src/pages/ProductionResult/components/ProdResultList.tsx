import React from 'react';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const ProdResurlList = () => {

    const columns: GridColDef[] = [
        {
            field: "STATUS",
            headerName: "등록상태",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ADD",
            headerName: "추가",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROCESS",
            headerName: "공정",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROCESSITEMCODE",
            headerName: "품목코드",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROCESSITEMNAME",
            headerName: "품목명",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROCESSITEMSPEC",
            headerName: "품목규격",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "WORKDATE",
            headerName: "작업일",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "STARTTIME",
            headerName: "시작시간",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ENDDATE",
            headerName: "종료일",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ENDTIME",
            headerName: "종료시간",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ORDERQTY",
            headerName: "지시량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODQTY",
            headerName: "생산량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PASSQTY",
            headerName: "합격량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "FAILQTY",
            headerName: "불량량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "WORKER",
            headerName: "작업자",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROCESSRATE",
            headerName: "공정수율",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "BIGO",
            headerName: "비고",
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

export default ProdResurlList;