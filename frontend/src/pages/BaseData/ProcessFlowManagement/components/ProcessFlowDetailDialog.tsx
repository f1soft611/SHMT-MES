import React, {useEffect} from 'react';
import {
    Box,  Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Tab, Tabs,
} from '@mui/material';
import {
    Extension as ExtensionIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import ProcessFlowItemTab from "./ProcessFlowItemTab";
import ProcessFlowProcessTab from "./ProcessFlowProcessTab";
import { ProcessFlow, DetailSavePayload, DetailSaveResult } from '../../../../types/processFlow';
import {
    ProcessFlowDetailProvider,
    useProcessFlowDetailContext
} from "../hooks/detail/useProcessFlowDetailContext";
import {useToast} from "../../../../components/common/Feedback/ToastProvider";


interface Props {
    open: boolean;
    onClose: () => void;
    selectedFlow: ProcessFlow | null;
    onSave: (data: DetailSavePayload) => Promise<DetailSaveResult>;
    initialTab: number;
}

function DetailDialogContent({
                                selectedFlow,
                                tabIndex,
                                setTabIndex
                            }: {
    selectedFlow: ProcessFlow | null;
    tabIndex: number;
    setTabIndex: (v: number) => void;
}) {
    return (
        <>
            <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
                <Tab label="공정 관리" icon={<BuildIcon />} iconPosition="start" />
                <Tab label="제품 관리" icon={<ExtensionIcon />} iconPosition="start" />
            </Tabs>

            <Box sx={{ mt: 2, minHeight: 0, }}>
                {tabIndex === 0 && <ProcessFlowProcessTab />}
                {tabIndex === 1 && <ProcessFlowItemTab />}
            </Box>
        </>
    );
}

function DetailDialogActions({
                                onSave,
                                onClose,
                                tabIndex
                            }: {
    onSave: (data: DetailSavePayload) => Promise<DetailSaveResult>;
    onClose: () => void;
    tabIndex: number;
}) {
    const { getSavePayload  } = useProcessFlowDetailContext();
    const { showToast } = useToast();

    const handleSave = async () => {
        const result = await onSave(getSavePayload(tabIndex));

        if (!result.ok) {
            showToast({
                message: result.reason ?? "저장 실패",
                severity: "error",
            });
            return;
        }

        showToast({
            message: "등록되었습니다.",
            severity: "success",
        });

        onClose();
    };

    return (
        <DialogActions>
            <Button variant="contained" onClick={handleSave}>
                저장
            </Button>
            <Button onClick={onClose}>닫기</Button>
        </DialogActions>
    );
}

export default function ProcessFlowDetailDialog({
                                                    open,
                                                    onClose,
                                                    selectedFlow,
                                                    onSave,
                                                    initialTab
}: Props) {
    const [tabIndex, setTabIndex] = React.useState(0);

    useEffect(() => {
        if (open) {
            setTabIndex(initialTab);
        }
    },[open, initialTab]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <ProcessFlowDetailProvider processFlow={selectedFlow}>
                <DialogTitle>공정흐름 상세 관리</DialogTitle>

                <DialogContent
                    sx={{
                        height: '650px',          // 원하는 높이
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                    dividers>
                    <DetailDialogContent
                        selectedFlow={selectedFlow}
                        tabIndex={tabIndex}
                        setTabIndex={setTabIndex}
                    />
                </DialogContent>

                <DetailDialogActions
                    tabIndex={tabIndex}
                    onSave={onSave}
                    onClose={onClose}
                />
            </ProcessFlowDetailProvider>
        </Dialog>
    );
}