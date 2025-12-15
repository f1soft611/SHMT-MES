import { useState }  from 'react';
import {ProcessFlow} from "../../../../../types/processFlow";

export function useProcessFlowDetailDialog() {

    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [detailTab, setDetailTab] = useState(0);
    const [selectedFlow, setSelectedFlow] = useState<ProcessFlow | null>(null);


    // detail Dialog 열기
    const handleOpenDetailDialog = (row: ProcessFlow, tabIndex: number) => {
        setSelectedFlow(row);
        setDetailTab(tabIndex);
        setOpenDetailDialog(true);
    };

    // detail Dialog 닫기
    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
    };

    return {
        openDetailDialog,
        detailTab,
        setDetailTab,
        selectedFlow,
        handleOpenDetailDialog,
        handleCloseDetailDialog,
    };


}