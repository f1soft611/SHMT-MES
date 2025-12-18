import React from "react";
import {
    Stack, Select, InputLabel, Chip, IconButton, Box,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, FormControl, FormHelperText,
    Card, CardContent, Typography, Divider
} from "@mui/material";
import {
    Add as AddIcon,
} from '@mui/icons-material';
import {DataGrid, GridColDef} from "@mui/x-data-grid";

interface Props {
    open: boolean;
    plan: any | null;
    rows: any[];
    onClose: () => void;
    onSubmit: () => void;
    onAddRow: (index: number) => void;
    onProcessRowUpdate: (newRow: any) => any;
    canWrite: boolean;
}

export default function ProdOrderDialog({open, plan, rows, onClose, onSubmit, onAddRow, onProcessRowUpdate, canWrite}:Props){

    const columns: GridColDef[] =[
        { field: 'PRODPLAN_ID'},
        { field: 'PRODPLAN_DATE'},
        { field: 'PRODPLAN_SEQ'},
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
                    onClick={() => {
                        const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
                        onAddRow(index);
                    }}
                >
                    <AddIcon fontSize="small" />
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
            field: "MATERIAL_UNIT",
            headerName: "단위",
            width: 50,
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
            field: 'LAST_FLAG',
            headerName: "최종공정",
            width: 100,
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
            field: 'OPMAN_CODE2',
            headerName: "최종수정자",
            width: 100,
            headerAlign: "center",
            align: "center",
            // renderHeader: () => (
            //     // <div style={{ textAlign: "center" }}>
            //     //     최종<br/>수정자
            //     // </div>
            // )
        },
        {
            field: 'OPTIME2',
            headerName: "최종수정일시",
            width: 150,
            headerAlign: "center",
            align: "center",
        },
    ];

    const formatYmd = (yyyymmdd?: string) => {
        if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
        return `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`;
    };

    return(
        <Dialog open={open} maxWidth="xl" fullWidth>
            <DialogTitle>
                생산지시 등록
            </DialogTitle>
            <DialogContent dividers={true}>
                {/* 선택된 생산계획 요약 */}
                {plan && (
                    <Box
                        sx={{
                            mb: 1.5,
                            px: 2,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            backgroundColor: 'action.hover',
                            borderRadius: 1,
                        }}
                    >
                        {/* 지시상태 */}
                        <Chip
                            label={plan.ORDER_FLAG}
                            size="small"
                            color={plan.ORDER_FLAG === 'ORDERED' ? 'primary' : 'default'}
                        />

                        {/* 작업장 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                작업장
                            </Typography>
                            <Typography fontWeight={600} sx={{fontSize: '0.9rem', }}>
                                {plan.WORKCENTER_NAME}
                            </Typography>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.3, opacity: 1 }}
                        />

                        {/* 설비명 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                설비
                            </Typography>
                            <Typography fontWeight={600} sx={{fontSize: '0.9rem', }}>
                                {plan.EQUIPMENT_NAME}({plan.EQUIP_SYS_CD})
                            </Typography>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.3, opacity: 1 }}
                        />

                        {/* 생산계획 ID */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                생산계획 ID
                            </Typography>
                            <Typography fontWeight={600} sx={{fontSize: '0.9rem', }}>
                                {plan.PRODPLAN_ID}
                            </Typography>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.3, opacity: 1 }}
                        />

                        {/* 생산계획일 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                생산계획일
                            </Typography>
                            <Typography fontWeight={600} sx={{fontSize: '0.9rem', }}>
                                {formatYmd(plan.PRODPLAN_DATE)}
                            </Typography>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.3, opacity: 1 }}
                        />

                        {/* 품목명 */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                minWidth: 0, // ellipsis 필수
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                품목명
                            </Typography>
                            <Typography
                                fontWeight={600}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {plan.ITEM_NAME}
                            </Typography>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.3, opacity: 1 }}
                        />

                        {/* 계획량 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                계획량
                            </Typography>
                            <Typography fontWeight={600} sx={{fontSize: '0.9rem', }}>
                                {plan.PROD_QTY?.toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ height: 400}}>
                    <DataGrid
                        columns={columns}
                        rows={rows}
                        getRowId={(row) => row.IDX}
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
                        processRowUpdate={onProcessRowUpdate}
                        sx={{
                            fontSize: '0.8rem',                 // 기본 폰트
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!canWrite}
                >
                    저장
                </Button>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>
        </Dialog>
    )
}