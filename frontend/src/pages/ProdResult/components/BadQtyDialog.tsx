import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {BadDetail, ProductionResultDetail} from "../../../types/productionResult";


interface Props {
    open: boolean;
    selectedRow?: ProductionResultDetail;
    initialData?: BadDetail[];
    defectOptions: { value: string; label: string}[];

    onClose: () => void;
    onSave: (details: BadDetail[]) => void;
}

export default function BadQtyDialog({
                                         open,
                                         selectedRow,
                                         initialData = [],
                                         defectOptions,
                                         onClose,
                                         onSave,
                                     }: Props) {


    const columns: GridColDef[] = [
        {
            field: "label",
            headerName: "불량 유형",
            width: 200,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "qty",
            headerName: "수량",
            width: 200,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: "number"
        }
    ];


    return(
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>불량 상세 입력</DialogTitle>

            <DialogContent>
                <DataGrid
                    rows={defectOptions}
                    columns={columns}
                    getRowId={(row) => row.value}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>

        </Dialog>
    );
}