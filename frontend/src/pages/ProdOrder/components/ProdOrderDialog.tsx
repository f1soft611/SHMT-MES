import React from "react";
import dayjs from "dayjs";
import {
    Chip, IconButton, Box,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Divider, Tooltip
} from "@mui/material";
import {
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';
import {DataGrid, GridColDef} from "@mui/x-data-grid";

interface Props {
    open: boolean;
    plan: any | null;
    rows: any[];
    onClose: () => void;
    onSubmit: () => void;
    onDelete: () => void;
    onAddRow: (index: number) => void;
    onRemoveRow: (index: number) => void;
    onProcessRowUpdate: (newRow: any) => any;
    canWrite: boolean;
}

export default function ProdOrderDialog({
    open,
    plan, rows,
    onClose, onSubmit, onDelete,
    onAddRow, onRemoveRow,
    onProcessRowUpdate, canWrite
}:Props){

    const columns: GridColDef[] =[
        { field: 'PRODPLAN_ID'},
        { field: 'PRODPLAN_DATE'},
        { field: 'PRODPLAN_SEQ'},
        { field: 'PRODORDER_ID'},
        { field: 'ORDER_SEQ'},
        {
            field: "add",
            headerName: "분할",
            width: 60,
            headerAlign: "center",
            align: "center",
            sortable: false,
            renderCell: (params) => {
                const isNew = params.row._isNew === true;
                const disabled = params.row.RST_CNT > 0;
                return (
                    <IconButton
                        size="small"
                        color={isNew ? "error" : "primary"}
                        disabled={disabled}
                        onClick={() => {
                            const index =
                                params.api.getRowIndexRelativeToVisibleRows(params.id);

                            if (isNew) {
                                onRemoveRow(index);   // 행 삭제
                            } else {
                                onAddRow(index);      // 행 분할
                            }
                        }}
                    >
                        {isNew ? (
                            <RemoveIcon fontSize="small" />
                        ) : (
                            <AddIcon fontSize="small" />
                        )}
                    </IconButton>
                );
            },
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
            field: "ITEM_CODE",
            headerName: "아이템코드",
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "PROD_CODE",
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
            field: "WORKDT_DATE",
            headerName: "시작일",
            width: 100,
            headerAlign: "center",
            align: "center",
            editable: true,
            renderCell: (params) => {
                const v = params.row.WORKDT_DATE || params.row.PRODPLAN_DATE;
                if (!v) return "";

                // 20251212 → 2025-12-12
                return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
            },
            renderEditCell: (params) => {
                const raw =
                    params.value ||
                    params.row.WORKDT_DATE ||
                    params.row.PRODPLAN_DATE ||
                    "";

                if (!params.value && raw) {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: "WORKDT_DATE",
                        value: raw,
                    });
                }

                const formatted =
                    raw && raw.length === 8
                        ? `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`
                        : "";

                return (
                    <input
                        type="date"
                        value={formatted}
                        onChange={(e) => {
                            params.api.setEditCellValue({
                                id: params.id,
                                field: "WORKDT_DATE",
                                value: e.target.value.replace(/-/g, ""),
                            });
                        }}
                    />
                );
            },
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
        },
        {
            field: 'OPTIME2',
            headerName: "최종수정일시",
            width: 150,
            headerAlign: "center",
            align: "center",
            valueFormatter: (value) =>
                value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "",
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
                            <Tooltip title={plan.ITEM_NAME} arrow>
                            <Typography
                                fontWeight={600}
                                sx={{
                                    maxWidth: 220,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {plan.ITEM_NAME}
                            </Typography>
                            </Tooltip>
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
                            PRODORDER_ID: false,
                            ORDER_SEQ: false,
                        }}   // 화면에서만 숨김
                        processRowUpdate={onProcessRowUpdate}
                        isCellEditable={(params) => {
                            // RST_CNT > 0 이면 전체 편집 불가
                            return params.row.RST_CNT <= 0;
                        }}
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
                    {plan?.ORDER_FLAG === 'ORDERED' ? '수정' : '저장'}
                </Button>
                {plan?.ORDER_FLAG === 'ORDERED' && (
                    <Button
                        variant="contained"
                        color="error"
                        disabled={!canWrite}
                        onClick={() => {
                            if (window.confirm('이미 생성된 생산지시를 삭제하시겠습니까?')) {
                                onDelete();
                            }
                        }}
                    >
                        삭제
                    </Button>
                )}
                <Button onClick={onClose}>취소</Button>
            </DialogActions>
        </Dialog>
    )
}