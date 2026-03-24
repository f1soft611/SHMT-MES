import React, {useEffect, useState} from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {BadDetail} from "../../../types/productionResult";


interface Props {
    open: boolean;
    defectOptions: BadDetail[];

    onSave: (details: BadDetail[]) => void;
    onClose: () => void;
}

export default function BadQtyDialog({
                                         open,
                                         defectOptions,
                                         onSave,
                                         onClose,
                                     }: Props) {

    const [rows, setRows] = useState<BadDetail[]>([]);



    const columns: GridColDef[] = [
        {
            field: "qcCode",
            headerName: "불량유형 코드",
            width: 120,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "qcName",
            headerName: "불량유형 이름",
            width: 220,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "qcQty",
            headerName: "수량",
            width: 200,
            headerAlign: "center",
            align: "center",
            editable: true,
            type: "number"
        }
    ];


    useEffect(() => {
        if (open) {
            setRows(defectOptions);
        }
    }, [open, defectOptions]);


    return(
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>불량 상세 입력</DialogTitle>

            <DialogContent>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.qcCode}
                    processRowUpdate={(newRow) => {
                        setRows(prev =>
                            prev.map(r =>
                                r.qcCode === newRow.qcCode ? newRow : r
                            )
                        );
                        return newRow;
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onSave(rows)}>적용</Button>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>

        </Dialog>
    );
}