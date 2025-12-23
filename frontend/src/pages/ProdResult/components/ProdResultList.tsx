import React, {useState} from 'react';
import {Box, Card, CardActions, CardContent, CardHeader, IconButton} from '@mui/material';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';

interface Props {
    rows: any[];
    rowCount: number;
    loading: boolean;
    paginationModel: any;
    onPaginationModelChange: (model: any) => void;
}

export default function ProdResultList({
    rows,
    rowCount,
    loading,
    paginationModel,
    onPaginationModelChange,
}: Props) {

    // const [open, setOpen] = useState<{ [key: string]: boolean }>({});
    //
    // const toggle = (id: string) =>
    //     setOpen(prev => ({ ...prev, [id]: !prev[id] }));

    const columns: GridColDef[] = [
        // {
        //     field: "collapse",
        //     headerName: "",
        //     width: 40,
        //     renderCell: (p) => (
        //         <IconButton size="small" onClick={() => toggle(p.row.id)}>
        //             {open[p.row.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        //         </IconButton>
        //     ),
        // },
        {
            field: "PRODPLAN_DATE",
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
        <Card>
            <CardHeader sx={{ p: 1, }}
                        title="생산지시 목록"
                        titleTypographyProps={{
                            fontSize: 16,
                        }}
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 500 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.TPR504ID}
                        pagination
                        paginationMode="server"
                        rowCount={rowCount}
                        paginationModel={paginationModel}
                        onPaginationModelChange={onPaginationModelChange}
                        pageSizeOptions={[10, 20, 50]}
                        rowHeight={35}
                        columnHeaderHeight={40}
                        sx={{
                            fontSize: 14,
                            "& .MuiDataGrid-cell": { padding: "0 2px" },
                            "& .MuiDataGrid-cell:focus": { outline: "none" },
                            "& .MuiDataGrid-row:hover": { backgroundColor: "action.hover" },
                        }}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ display: 'none' }} />
        </Card>

    );

}