import React, {forwardRef, useImperativeHandle} from "react";
import {
    DataGrid,
    GridColDef,
    GridRenderEditCellParams,
    GridToolbarContainer,
} from "@mui/x-data-grid";
import {
    Button, Select, MenuItem, Checkbox, ListItemText
} from "@mui/material";
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

const workerOptions = [
    { value: "W001", label: "홍길동" },
    { value: "W002", label: "김철수" },
    { value: "W003", label: "이영희" },
];

const ProdResultList = forwardRef<DetailGridRef, Props>(({ parentRow }, ref) => {

    const details = useProdResultDetail(parentRow);

    useImperativeHandle(ref, () => ({
        addRow: details.addRow,
        getRows: () => details.rows,
        fetchDetails: details.fetchDetails,
    }));

    const columns: GridColDef[] = [
        { field: "WORKSDATE", headerName: "작업시작일", width: 120, editable: true },
        { field: "PROD_STIME", headerName: "시작시간", width: 120, editable: true },
        { field: "WORKEDATE", headerName: "작업종료일", width: 120, editable: true },
        { field: "PROD_ETIME", headerName: "종료시간", width: 120, editable: true },
        { field: "PROD_QTY", headerName: "생산수량", width: 120, type: "number", editable: true },
        { field: "GOOD_QTY", headerName: "양품수량", width: 120, type: "number", editable: true },
        { field: "BAD_QTY", headerName: "불량수량", width: 120, type: "number", editable: true },
        { field: "RCV_QTY", headerName: "인수수량", width: 120, type: "number", editable: true },
        {
            field: "WORKER",
            headerName: "작업자",
            width: 150,
            editable: true,
            renderEditCell: (params: GridRenderEditCellParams) => (
                <Select
                    multiple
                    fullWidth
                    value={params.value || []}
                    onChange={(e) =>
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: e.target.value,
                        })
                    }
                    renderValue={(selected) =>
                        workerOptions
                        .filter(o => selected.includes(o.value))
                        .map(o => o.label)
                        .join(", ")
                    }
                >
                    {workerOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                            <Checkbox checked={(params.value || []).includes(opt.value)} />
                            <ListItemText primary={opt.label} />
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
    ];

    const Toolbar = () => (
        <GridToolbarContainer sx={{ p: 1, justifyContent: "flex-end" }}>
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