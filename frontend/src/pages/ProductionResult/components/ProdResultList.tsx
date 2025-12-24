import React, {useState} from 'react';
import {IconButton} from '@mui/material';
import {DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';

const ProdResurlList = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 20,
    });
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});

    const toggle = (id: string) =>
        setOpen(prev => ({ ...prev, [id]: !prev[id] }));

    const columns: GridColDef[] = [
        {
            field: "collapse",
            headerName: "",
            width: 40,
            renderCell: (p) => (
                <IconButton size="small" onClick={() => toggle(p.row.id)}>
                    {open[p.row.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            ),
        },
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
            <DataGrid
                rows={[]}
                columns={columns}
                rowHeight={35}
                columnHeaderHeight={40}
                pagination
                pageSizeOptions={[10, 20, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                sx={{
                    fontSize: 14,
                    "& .MuiDataGrid-cell": { padding: "0 2px" },
                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                    "& .MuiDataGrid-row:hover": { backgroundColor: "action.hover" },
                }}
            />
    );

}

export default ProdResurlList;