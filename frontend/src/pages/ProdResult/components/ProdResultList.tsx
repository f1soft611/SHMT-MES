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
    Box, Stack, IconButton
} from "@mui/material";
import {
    Delete as DeleteIcon
} from "@mui/icons-material";
import {ProductionResultDetail, ProdResultOrderRow} from "../../../types/productionResult";
import { useProdResultDetail } from "../hooks/useProdResultDetail";

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

interface Props {
    parentRow: ProdResultOrderRow;
}

const ProdResultList = forwardRef<DetailGridRef, Props>(({ parentRow }, ref) => {

    const details = useProdResultDetail(parentRow);

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
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: v? v.format("YYYY-MM-DD HH:mm") : null,
                    });
                    params.api.stopCellEditMode({ id: params.id, field: params.field });
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
            valueFormatter: (value) =>
                value ? dayjs(value as Date).format("YYYY-MM-DD HH:mm") : "",
            renderEditCell: (params) => <DateTimeEditCell {...params} />,
        },
        { field: "prodEtime",
            headerName: "작업종료시간",
            type: "dateTime",
            width: 200,
            headerAlign: 'center',
            align: 'center',
            editable: true,
            valueFormatter: (value) =>
                value ? dayjs(value as Date).format("YYYY-MM-DD HH:mm") : "",
            renderEditCell: (params) => <DateTimeEditCell {...params} />,
        },
        { field: "prodQty", headerName: "생산수량", type: "number", width: 120,
            headerAlign: 'center',
            align: 'right', editable: true },
        { field: "goodQty", headerName: "양품수량", type: "number", width: 120,
            headerAlign: 'center',
            align: 'right', editable: true },
        { field: "badQty", headerName: "불량수량", type: "number", width: 120,
            headerAlign: 'center',
            align: 'right', editable: true },
        { field: "rcvQty", headerName: "인수수량", type: "number", width: 120,
            headerAlign: 'center',
            align: 'right', editable: true },
        {
            field: "worker",
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
                const value = Array.isArray(params.value) ? params.value : [];

                return (
                    <Select
                        multiple
                        fullWidth
                        value={value}
                        onChange={(e) =>
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: e.target.value,
                            })
                        }
                        renderValue={(selected) =>
                            details.workerOptions
                            .filter(o => selected.includes(o.value))
                            .map(o => o.label)
                            .join(", ")
                        }
                    >
                        {details.workerOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                                <Checkbox checked={value.includes(opt.value)} />
                                <ListItemText primary={opt.label} />
                            </MenuItem>
                        ))}
                    </Select>
                );
            },
        },
        { field: "input_mat", headerName: "투입자재", width: 120,
            headerAlign: 'center',
            align: 'center', editable: true },
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
                                details.handleDeleteRow(params.row);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                </Box>
            )
        },
    ];

    const Toolbar = () => (
        <GridToolbarContainer sx={{ p: 1, justifyContent: "flex-end" }}>
            <Button size="small" variant="contained" onClick={details.addRow}>
                실적 추가
            </Button>
            <Button size="small" variant="contained" onClick={details.handleSave}>
                저장
            </Button>
        </GridToolbarContainer>
    );



    return(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DataGrid
                rows={details.rows}
                columns={columns}
                getRowId={(row) => `${row.factoryCode}-${row.prodplanDate}-${row.prodplanSeq}-${row.prodworkSeq}-${row.workSeq}-${row.prodSeq}`}
                autoHeight
                hideFooter
                rowHeight={35}
                columnHeaderHeight={40}
                disableRowSelectionOnClick
                processRowUpdate={details.processRowUpdate}
                showToolbar
                slots={{ toolbar: Toolbar }}
            />
        </LocalizationProvider>

    );

})

export default ProdResultList;