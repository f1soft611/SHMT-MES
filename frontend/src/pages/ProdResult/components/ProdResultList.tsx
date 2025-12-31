import React, {forwardRef, useImperativeHandle} from "react";
import {
    DataGrid,
    GridColDef,
    GridToolbarContainer,
} from "@mui/x-data-grid";
import {
    Button, Select, MenuItem, Checkbox, ListItemText,
    Box, Stack, IconButton
} from "@mui/material";
import {
    Delete as DeleteIcon
} from "@mui/icons-material";
import {ProductionResultOrder, ProductionResultDetail} from "../../../types/productionResult";
import { useProdResultDetail } from "../hooks/useProdResultDetail";

export interface DetailGridRef {
    addRow: () => void;
    getRows: () => ProductionResultDetail[];
    fetchDetails: () => void;
}

interface Props {
    parentRow: ProductionResultOrder;
}

const ProdResultList = forwardRef<DetailGridRef, Props>(({ parentRow }, ref) => {

    const details = useProdResultDetail(parentRow);

    useImperativeHandle(ref, () => ({
        addRow: details.addRow,
        getRows: () => details.rows,
        fetchDetails: details.fetchDetails,
    }));

    const columns: GridColDef[] = [
        { field: "WORKSDATE", headerName: "작업시작일", width: 120,
            headerAlign: 'center',
            align: 'center', editable: true },
        { field: "PROD_STIME", headerName: "시작시간", width: 120,
            headerAlign: 'center',
            align: 'center', editable: true },
        { field: "WORKEDATE", headerName: "작업종료일", width: 120,
            headerAlign: 'center',
            align: 'center', editable: true },
        { field: "PROD_ETIME", headerName: "종료시간", width: 120,
            headerAlign: 'center',
            align: 'center', editable: true },
        { field: "PROD_QTY", headerName: "생산수량", width: 120,
            headerAlign: 'center',
            align: 'right', type: "number", editable: true },
        { field: "GOOD_QTY", headerName: "양품수량", width: 120,
            headerAlign: 'center',
            align: 'right', type: "number", editable: true },
        { field: "BAD_QTY", headerName: "불량수량", width: 120,
            headerAlign: 'center',
            align: 'right', type: "number", editable: true },
        { field: "RCV_QTY", headerName: "인수수량", width: 120,
            headerAlign: 'center',
            align: 'right', type: "number", editable: true },
        {
            field: "WORKER",
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
        <DataGrid
            rows={details.rows}
            columns={columns}
            getRowId={(row) => row.TPR601ID}
            autoHeight
            hideFooter
            rowHeight={35}
            columnHeaderHeight={40}
            disableRowSelectionOnClick
            processRowUpdate={details.processRowUpdate}
            showToolbar
            slots={{ toolbar: Toolbar }}
        />
    );

})

export default ProdResultList;