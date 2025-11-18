// components/ItemList.tsx
import React, {useEffect, useState} from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import itemService from "../../../../services/itemService";

export default function ItemList() {

    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await itemService.getItemList(0, 9999);
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
            field: 'itemCode',
            headerName: '품목 코드',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'itmeName',
            headerName: '품목명',
            flex: 1.2,
            headerAlign: 'center',
        },
        {
            field: 'itemSpec',
            headerName: '규격',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'itemUnit',
            headerName: '단위',
            align: 'center',
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
