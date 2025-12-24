import { useState } from "react";


export function useProdOrderDialog(
    onSubmit: () => Promise<void>,
    onDelete: () => Promise<void>
) {
    const [open, setOpen] = useState(false);

    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const submit = async () => {
        await onSubmit();   // 실제 저장
        setOpen(false); // 성공 후 dialog 닫힘
    };

    const deleteOrder = async () => {
        await onDelete();   // 실제 저장
        setOpen(false); // 성공 후 dialog 닫힘
    };


    return {
        open,
        openDialog,
        closeDialog,
        submit,
        deleteOrder,
    };
}