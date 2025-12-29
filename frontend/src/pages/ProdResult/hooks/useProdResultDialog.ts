import {useState} from "react";

export function useProdResultDialog(){
    const [open, setOpen] = useState(false);

    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const submit = async () => {
        // 실제 저장 로직
        setOpen(false); // 성공 후 dialog 닫힘
    };

    return {
        open,
        openDialog,
        closeDialog,
        submit,
    };
}