// components/ProcessList.tsx
import React, {useEffect, useState} from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import processService from "../../../../services/processService";


export default function ProcessList() {

    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await processService.getProcessList(0, 9999);
                const list = res?.result?.resultList ?? [];
                setRows(list);
            } catch (err) {
                console.error("공정 조회 실패:", err);
            }
        };

        fetchData();
    }, []);

    const columns: GridColDef[] = [
        {
            field: 'processCode',
            headerName: '공정 코드',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'processName',
            headerName: '공정 명',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'bigo',
            headerName: '비고',
            flex: 1,
            headerAlign: 'center',
        },
    ];

    return (
        <>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.factoryCode || ''}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            />
        </>

    );
}
