import React from 'react';
import {DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Box, IconButton, Button, Chip,
    Card, CardHeader, CardContent, CardActions
} from '@mui/material';
import {
    Add as AddIcon,
    Save as SavetIcon,
    Edit as EditIcon
} from '@mui/icons-material';

interface Props {
    rows: any[];
    setRows: React.Dispatch<React.SetStateAction<any[]>>;
    loading: boolean;
    selectedPlan?: any;
    onRowClick?: (row: any) => void;
    onAddRow?: (index: number) => void;
    onSave?: () => void;
    onEdit?: () => void;
}

const ProdOrderList = ({
                           rows, setRows, loading, selectedPlan, onRowClick, onAddRow, onSave, onEdit
}: Props) => {

    const CustomToolbar = () => {
        const status = selectedPlan?.ORDER_FLAG.trim();
        return (
            <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={status === "PLANNED" ? <SavetIcon /> : <EditIcon />}
                onClick={status === "PLANNED" ? onSave : onEdit}>
                {status === "PLANNED" ? '저장' : '수정'}
            </Button>
        );
    }

    const columns: GridColDef[] = [
        {
            field: "add",
            headerName: "분할",
            width: 60,
            headerAlign: "center",
            align: "center",
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
                        onAddRow?.(index);
                    }}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            ),
        },
        { field: 'PRODPLAN_ID'},
        { field: 'PRODPLAN_DATE'},
        { field: 'PRODPLAN_SEQ'},
        {
            field: "ORDER_FLAG",
            headerName: "등록상태",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PRODWORK_SEQ",
            headerName: "공정순서",
            width: 70,
            headerAlign: "center",
            align: "center",
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
            field: "MATERIAL_UNIT",
            headerName: "단위",
            width: 50,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "EXPACT_STOCK",
            headerName: "예상재고",
            width: 50,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "UNIT_SPEND",
            headerName: "단위소요량",
            width: 50,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "ORDER_QTY",
            headerName: "작업지시량",
            width: 80,
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
                            const raw = e.target.value;      // 'yyyy-mm-dd'
                            const yyyymmdd = raw.replace(/-/g, "");
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: yyyymmdd,
                            });
                        }}
                        style={{
                            width: "110px",
                            height: "28px",
                            fontSize: "12px",
                            padding: "2px 4px",
                        }}
                    />
                );
            }
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
                        style={{
                            padding: "0px",
                        }}
                    />
                );
            }
        },
        {
            field: "LABORCOST",
            headerName: "사내조립",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "LABORCOST2",
            headerName: "외주조립",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'STOCK',
            headerName: "안전재고",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'LAST_FLAG',
            headerName: "최종공정",
            width: 70,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                if (params.value !== 'Y') return null;

                return (
                    <Chip
                        label="최종"
                        color="primary"
                        size="small"
                    />
                );
            },
        },
        {
            field: 'OUT_FLAG',
            headerName: "외주공정",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'BIGO',
            headerName: "참조사항",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'PRODQTY',
            headerName: "생산실적량",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'LABORCOAST_IN',
            headerName: "조립공수단위(사내)",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'LABORCOAST_OUT',
            headerName: "조립공수단위(외주)",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'LABORCOAST_IN_TOTAL',
            headerName: "총(사내)SEC",
            width: 70,
            headerAlign: "center",
            align: "center",
        },
        {
            field: 'OPMAN_CODE2',
            width: 70,
            align: "center",
            renderHeader: () => (
                <div style={{ textAlign: "center" }}>
                    최종<br/>수정자
                </div>
            )
        },
        {
            field: 'OPTIME2',
            headerName: "최종수정일시",
            width: 150,
            headerAlign: "center",
            align: "center",
        },

    ];

    return(
        <Card sx={{boxShadow: 2 }}>
            {/* 타이틀 */}
            <CardHeader
                sx={{ p: 1, }}
                title="생산지시 목록"
                titleTypographyProps={{fontSize: 16,}}
                action={
                    <Box sx={{ m:1 }}>
                        <CustomToolbar />
                    </Box>
                }
            />
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 400 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        onRowClick={(params) => onRowClick?.(params.row)}
                        getRowId={(row) => row.PRODPLAN_ID + '_' + row.PRODWORK_SEQ}
                        hideFooter
                        hideFooterPagination
                        hideFooterSelectedRowCount
                        rowHeight={35}
                        columnHeaderHeight={40}
                        columnVisibilityModel={{
                            PRODPLAN_ID: false,
                            PRODPLAN_DATE: false,
                            PRODPLAN_SEQ: false,
                        }}   // 화면에서만 숨김
                        processRowUpdate={(newRow) => {
                            setRows((prev) =>
                                prev.map((p) =>
                                    p.PRODPLAN_ID + "_" + p.PRODWORK_SEQ ===
                                    newRow.PRODPLAN_ID + "_" + newRow.PRODWORK_SEQ
                                        ? newRow
                                        : p
                                )
                            );
                            return newRow;
                        }}
                        onProcessRowUpdateError={(error) => console.error(error)}
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

export default ProdOrderList