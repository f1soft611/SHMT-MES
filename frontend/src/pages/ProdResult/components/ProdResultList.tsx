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
import {ProductionResultDetail, ProdResultOrderRow} from "../../../types/productionResult";
import {useProdResultDetail} from "../hooks/useProdResultDetail";
import ConfirmDialog from "../../../components/common/Feedback/ConfirmDialog";
import BadQtyDialog from "./BadQtyDialog";
import processService from "../../../services/processService";
import {useToast} from "../../../components/common/Feedback/ToastProvider";

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

interface Props {
    parentRow: ProdResultOrderRow | null;
}

const ProdResultList = forwardRef<DetailGridRef, Props>(({parentRow}, ref) => {

    const details = useProdResultDetail(parentRow);

    const { showToast } = useToast();

    const [deleteTarget, setDeleteTarget] = useState<ProductionResultDetail | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [defectOptions, setDefectOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const handleCellClick = async  (params: any) => {
        if (params.field !== "badQty") return;
        try {
            const data = await processService.getProcessDefects(
                params.row.workCode
            );

            const list = data.result.resultList;
            setDefectOptions(
                list.map((d: any) => ({
                    value: d.processDefectId,
                    label: d.defectName
                }))
            );

            setSelectedRow(params.row);
            setDialogOpen(true);

        } catch (e) {
            console.error(e);
        }
    };

    useImperativeHandle(ref, () => ({
        addRow: details.addRow,
        getRows: () => details.rows,
        fetchDetails: details.fetchDetails,
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

                const labels = details.workerOptions
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
                            details.workerOptions
                            .filter(o => selected.includes(o.value))
                            .map(o => o.label)
                            .join(", ")
                        }
                    >
                        {details.workerOptions.map(opt => (
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
                    <Button size="small" variant="contained" onClick={details.addRow}>
                        실적 추가
                    </Button>
                    <Button size="small" variant="contained" onClick={details.handleSave}>
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
                                rows={details.rows}
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
                                processRowUpdate={details.processRowUpdate}
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
                loading={details.loading}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={async () => {
                    if (!deleteTarget) return;

                    await details.handleDeleteRow(deleteTarget);
                    setDeleteConfirmOpen(false);
                    setDeleteTarget(null);
                }}
            />

            <BadQtyDialog
                open={dialogOpen}
                selectedRow={selectedRow}
                defectOptions={defectOptions}
                onClose={() => setDialogOpen(false)}
                onSave={() => {}} />


        </>
    );

})

export default ProdResultList;