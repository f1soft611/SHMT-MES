import React, {useState} from 'react';
import {Box, Card, CardActions, CardContent, CardHeader, IconButton, Stack} from '@mui/material';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Add as AddIcon,
} from "@mui/icons-material";

interface Props {
    rows: any[];
    rowCount: number;
    loading: boolean;
    onRowClick?: (row: any) => void;
    paginationModel: any;
    onPaginationModelChange: (model: any) => void;
}

interface DetailRow {
    id: string;
    WORKDATE: string;
    STARTTIME: string;
    ENDTIME: string;
    PRODQTY: number;
}

const detailMap: Record<string, DetailRow[]> = {
    "row1": [
        {
            id: "row1-1",
            WORKDATE: "2025-12-01",
            STARTTIME: "08:00",
            ENDTIME: "12:00",
            PRODQTY: 100,
        },
    ],
};

export default function ProdResultList({
    rows,
    rowCount,
    loading, onRowClick,
    paginationModel,
    onPaginationModelChange,
}: Props) {

    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const columns: GridColDef[] = [
        {
            field: "collapse",
            headerName: "",
            width: 40,
            align: "center",
            renderCell: (p) => (
                <IconButton
                    size="small"
                    onClick={() =>
                        setExpandedRowId(prev => prev === p.row.TPR504ID ? null : p.row.TPR504ID)
                    }
                >
                    {expandedRowId === p.row.TPR504ID
                        ? <KeyboardArrowUpIcon />
                        : <KeyboardArrowDownIcon />}
                </IconButton>
            ),
        },
        {
            field: "WORK_NAME",
            headerName: "공정명",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "EQUIPMENT_CODE",
            headerName: "설비코드",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "EQUIPMENT_NAME",
            headerName: "설비명",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "MATERIAL_CODE",
            headerName: "생산품목코드",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "MATERIAL_NAME",
            headerName: "생산품목명",
            width: 150,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "MATERIAL_SPEC",
            headerName: "생산품목규격",
            width: 150,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ORDER_QTY",
            headerName: "작업지시량",
            width: 100,
            headerAlign: "center",
            align: "right",
            editable: true,
            renderCell: (params) => (params.value ?? 0).toLocaleString(),
        },
        {
            field: "START_DATE",
            headerName: "시작일",
            width: 100,
            headerAlign: "center",
            align: "center",
            editable: true,
            renderCell: (params) => {
                const v = params.row.START_DATE;
                if (!v) return "";

                // 20251212 → 2025-12-12
                const formatted = `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
                return <span>{formatted}</span>;
            },
            renderEditCell: (params) => {
                return (
                    <input
                        type="date"
                        value={params.value || ""}
                        onChange={(e) => {
                            const yyyymmdd = e.target.value.replace(/-/g, "");
                            // START_DATE 변경
                            params.api.setEditCellValue({
                                id: params.id,
                                field: "START_DATE",
                                value: yyyymmdd,
                            });
                            // END_DATE 비어 있으면 같이 세팅
                            if (!params.row.END_DATE) {
                                params.api.setEditCellValue({
                                    id: params.id,
                                    field: "END_DATE",
                                    value: yyyymmdd,
                                });
                            }
                        }}
                    />
                );
            },
        },
        {
            field: "END_DATE",
            headerName: "종료일",
            width: 100,
            headerAlign: "center",
            align: "center",
            editable: true,
            renderCell: (params) => {
                const v = params.row.END_DATE;
                if (!v) return "";

                // 20251212 → 2025-12-12
                const formatted = `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
                return <span>{formatted}</span>;
            },
            renderEditCell: (params) => {
                const rid = params.row.PRODPLAN_ID + "_" + params.row.PRODWORK_SEQ;
                return (
                    <input
                        type="date"
                        value={params.value || ""}
                        onChange={(e) => {
                            const raw = e.target.value;      // 'yyyy-mm-dd'
                            const yyyymmdd = raw.replace(/-/g, "");
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: yyyymmdd,
                            });
                        }}
                    />
                );
            }
        },
        {
            field: "actions",
            headerName: "실적등록",
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick?.(params.row);
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Stack>
                </Box>
            )
        },
    ];

    const detailColumns: GridColDef[] = [
        { field: "WORKDATE", headerName: "작업일", width: 100 },
        { field: "STARTTIME", headerName: "시작", width: 80 },
        { field: "ENDTIME", headerName: "종료", width: 80 },
        { field: "PRODQTY", headerName: "생산수량", width: 100, align: "right" },
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
                    {expandedRowId && (
                        <Box sx={{ mt: 1, ml: 6 }}>
                            <DataGrid
                                rows={detailMap[expandedRowId]}
                                columns={detailColumns}
                                hideFooter
                                autoHeight
                            />
                        </Box>
                    )}
                </Box>
            </CardContent>
            <CardActions sx={{ display: 'none' }} />
        </Card>

    );

}