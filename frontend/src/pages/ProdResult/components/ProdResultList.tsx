import React, {forwardRef, useImperativeHandle, useState} from "react";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
    DataGrid,
    GridColDef, GridRenderEditCellParams,
    GridToolbarContainer,
} from "@mui/x-data-grid";
import {
    Button, Select, MenuItem, Checkbox, ListItemText,
    Box, Stack, IconButton,
    Card, CardContent, CardActions,
} from "@mui/material";
import {
    Delete as DeleteIcon
} from "@mui/icons-material";
import {ProductionResultDetail, ProdResultOrderRow, BadDetail} from "../../../types/productionResult";
import {useProdResultDetail} from "../hooks/useProdResultDetail";
import ConfirmDialog from "../../../components/common/Feedback/ConfirmDialog";
import BadQtyDialog from "./BadQtyDialog";
import processService from "../../../services/processService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {productionResultService} from "../../../services/productionResultService";

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

interface Props {
    parentRow: ProdResultOrderRow | null;
}

const ProdResultList = forwardRef<DetailGridRef, Props>(({parentRow}, ref) => {

    const detailHook = useProdResultDetail(parentRow);

    const { showToast } = useToast();

    const [deleteTarget, setDeleteTarget] = useState<ProductionResultDetail | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [defectOptions, setDefectOptions] = useState<BadDetail[]>([]);

    const [selectedRow, setSelectedRow] = useState<ProductionResultDetail | null>(null);


    // 불량상세 목록
    const handleCellClick = async  (params: any) => {
        if (params.field !== "badQty") return;

        const row = params.row;
        setSelectedRow(row);

        try {
            const data = await processService.getProcessDefects(params.row.workCode);
            const list = data.result.resultList;

            let existing: any[] = [];

            // 신규/기존 분기
            if (row.tpr601Id?.startsWith("NEW-")) {
                // 신규 → 현재 row 상태 사용
                existing = row.badDetails || [];
            } else {
                // 기존 → 서버에서 조회
                const res = await productionResultService.getBadDetails(row);
                existing = res.result?.resultList ?? [];
            }

            // merge
            const merged = list.map((d: any) => {
                const found = existing.find(
                    (e: any) => e.qcCode === d.defectCode
                );

                return {
                    qcCode: d.defectCode,
                    qcName: d.defectName,
                    qcQty: found ? found.qcQty : 0,
                };
            });

            setDefectOptions(merged);
            setDialogOpen(true);

        } catch (e) {
            console.error(e);
        }
    };

    useImperativeHandle(ref, () => ({
        addRow: detailHook.addRow,
        getRows: () => detailHook.rows,
        fetchDetails: detailHook.fetchDetails,
    }));

    const DateTimeEditCell = (params: GridRenderEditCellParams) => {
        const [temp, setTemp] = useState(
            params.value ? dayjs(params.value) : null
        );

        return (
            <DateTimePicker
                value={temp}
                onChange={setTemp}
                onAccept={(v) => {
                    const row = params.api.getRow(params.id);
                    const start =
                        params.field === "prodStime"
                            ? v
                            : row?.prodStime ? dayjs(row.prodStime) : null;
                    const end =
                        params.field === "prodEtime"
                            ? v
                            : row?.prodEtime ? dayjs(row.prodEtime) : null;

                    // 🔥 여기서 막기
                    if (start && end && !end.isAfter(start)) {
                        showToast({
                            message: "종료시간은 시작시간보다 커야 합니다.",
                            severity: "error",
                        });
                        return; // 🔥 값 반영 안함
                    }

                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: v ? v.format("YYYY-MM-DD HH:mm") : null,
                    });
                    params.api.stopCellEditMode({id: params.id, field: params.field});
                }}
                ampm={false}
                format="YYYY-MM-DD HH:mm"
                slotProps={{
                    textField: {
                        size: "small",
                        fullWidth: true,
                        variant: "outlined",
                    },
                }}
            />
        );
    };

    const columns: GridColDef[] = [
        {
            field: "prodStime",
            headerName: "작업시작시간",
            width: 200,
            headerAlign: 'center',
            align: 'center',
            editable: true,
            valueFormatter: (value) => value ? dayjs(value as Date).format("YYYY-MM-DD HH:mm") : "",
            renderEditCell: (params) => <DateTimeEditCell {...params} />,
        },
        {
            field: "prodEtime",
            headerName: "작업종료시간",
            type: "dateTime",
            width: 200,
            headerAlign: 'center',
            align: 'center',
            editable: true,
            valueFormatter: (value) => value ? dayjs(value as Date).format("YYYY-MM-DD HH:mm") : "",
            renderEditCell: (params) => <DateTimeEditCell {...params} />,
        },
        {
            field: "prodQty",
            headerName: "생산수량",
            type: "number",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            editable: true
        },
        {
            field: "goodQty",
            headerName: "양품수량",
            type: "number",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            editable: true
        },
        {
            field: "badQty",
            headerName: "불량수량",
            type: "number",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            editable: false
        },
        {
            field: "rcvQty",
            headerName: "인수수량",
            type: "number",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            editable: true
        },
        {
            field: "workerCodes",
            headerName: "작업자",
            width: 150,
            headerAlign: 'center',
            align: 'center',
            editable: true,
            renderCell: (params) => {
                const value: string[] = Array.isArray(params.value) ? params.value : [];

                if (value.length === 0) return "";

                const labels = detailHook.workerOptions
                .filter(o => value.includes(o.value))
                .map(o => o.label);

                if (labels.length === 0) return "";

                if (labels.length === 1) {
                    return labels[0];
                }

                return `${labels[0]} 외 ${labels.length - 1}명`;
            },
            renderEditCell: (params) => {
                const value: string[] = Array.isArray(params.value) ? params.value : [];

                return (
                    <Select
                        multiple
                        fullWidth
                        value={value}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation(); // 🔥 DataGrid로 안 넘어가게
                            }
                        }}
                        onChange={(e) =>
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: e.target.value as string[],
                            })
                        }
                        onClose={() => {
                            params.api.stopCellEditMode({
                                id: params.id,
                                field: params.field,
                            });
                        }}
                        renderValue={(selected) =>
                            detailHook.workerOptions
                            .filter(o => selected.includes(o.value))
                            .map(o => o.label)
                            .join(", ")
                        }
                    >
                        {detailHook.workerOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                                <Checkbox checked={value.includes(opt.value)}/>
                                <ListItemText primary={opt.label}/>
                            </MenuItem>
                        ))}
                    </Select>
                );
            },
        },
        {field: "input_mat", headerName: "투입자재", width: 120, headerAlign: 'center', align: 'center', editable: true},
        {
            field: "actionDelete",
            headerName: "삭제",
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
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();               // 행 클릭 방지
                                setDeleteTarget(params.row);
                                setDeleteConfirmOpen(true);
                                // details.handleDeleteRow(params.row);
                            }}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Stack>
                </Box>
            )
        },
    ];

    const Toolbar = () => (
        <GridToolbarContainer
            sx={{
                px: 1.5,
                py: 0.75,
                borderBottom: "1px solid #e0e0e0",
                fontSize: 16,
                fontWeight: 600,
            }}
        >
            <Box sx={{display: "flex", alignItems: "center", width: "100%"}}>
                <Box sx={{fontSize: 16, fontWeight: 600}}>
                    생산실적 목록
                </Box>

                <Box sx={{ml: "auto", display: "flex", gap: 1}}>
                    <Button size="small" variant="contained" onClick={detailHook.addRow}>
                        실적 추가
                    </Button>
                    <Button size="small" variant="contained" onClick={detailHook.handleSave}>
                        저장
                    </Button>
                </Box>
            </Box>


        </GridToolbarContainer>
    );


    return (
        <>
            <Card sx={{boxShadow: 2, mt: 1}}>
                <CardContent sx={{p: 0, position: 'relative'}}>
                    <Box sx={{height: 300}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DataGrid
                                rows={detailHook.rows}
                                columns={columns}
                                getRowId={(row) => row.tpr601Id}
                                autoHeight
                                hideFooter
                                rowHeight={30}
                                columnHeaderHeight={35}
                                sx={{
                                    fontSize: 12.5,
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
                                disableRowSelectionOnClick
                                processRowUpdate={detailHook.processRowUpdate}
                                showToolbar
                                slots={{toolbar: Toolbar}}
                                onCellDoubleClick={handleCellClick}
                            />
                        </LocalizationProvider>
                    </Box>
                </CardContent>
                <CardActions sx={{display: 'none'}}/>
            </Card>

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="생산실적 삭제"
                message={
                    <>
                        선택한 생산실적을 <b>삭제</b>하시겠습니까?
                    </>
                }
                confirmText="삭제"
                cancelText="닫기"
                loading={detailHook.loading}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={async () => {
                    if (!deleteTarget) return;

                    await detailHook.handleDeleteRow(deleteTarget);
                    setDeleteConfirmOpen(false);
                    setDeleteTarget(null);
                }}
            />

            <BadQtyDialog
                open={dialogOpen}
                defectOptions={defectOptions}
                onSave={(badDetails) => {
                    if (!selectedRow) return;
                    const prodQty = Number(selectedRow.prodQty ?? 0);

                    const filtered = badDetails.filter(d => Number(d.qcQty) > 0);
                    const sum = badDetails.reduce((acc, cur) => acc + (cur.qcQty || 0), 0);

                    if (sum > prodQty) {
                        showToast({
                            message: '불량수량이 생산수량보다 클 수 없습니다.',
                            severity: 'error',
                        });
                        return;
                    }

                    // 해당 row badQty 업데이트
                    detailHook.setRows((prev: ProductionResultDetail[]) =>
                        prev.map((r: ProductionResultDetail) =>
                            r.tpr601Id === selectedRow.tpr601Id
                                ? {
                                    ...r,
                                    badQty: sum,
                                    goodQty: prodQty - sum,
                                    badDetails: filtered,
                                    __isModified: true,
                                }
                                : r
                        )
                    );

                    setDialogOpen(false);
                    setSelectedRow(null);
                }}
                onClose={() => setDialogOpen(false)}
            />


        </>
    );

})

export default ProdResultList;