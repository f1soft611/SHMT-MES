import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {BadDetail} from "../../../types/productionResult";


interface Props {
    open: boolean;
    initialData?: BadDetail[];
    defectOptions: { value: string; label: string }[];

    onClose: () => void;
    onSave: (details: BadDetail[]) => void;
}

export default function BadQtyDialog({
                                         open,
                                         initialData = [],
                                         defectOptions,
                                         onClose,
                                         onSave,
                                     }: Props) {

    const [details, setDetails] = useState<BadDetail[]>([
        { defectType: "test", qty: 0 },
    ]);

    // // 열릴 때 기존 데이터 세팅
    // useEffect(() => {
    //     if (open) {
    //         setDetails(
    //             initialData.length > 0
    //                 ? initialData
    //                 : [{ defectType: "test", qty: 0 }]
    //         );
    //     }
    // }, [open, initialData]);

    const columns: GridColDef[] = [
        {
            field: "defectType",
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

    // 합계
    const totalQty = details.reduce((sum, d) => sum + (d.qty || 0), 0);

    const handleChange = (idx: number, key: keyof BadDetail, value: any) => {
        const copy = [...details];
        (copy[idx] as any)[key] = value;
        setDetails(copy);
    };

    return(
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>불량 상세 입력</DialogTitle>

            <DialogContent>
                <DataGrid
                    rows={[]}
                    columns={columns}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
            </DialogActions>

        </Dialog>
    );
}