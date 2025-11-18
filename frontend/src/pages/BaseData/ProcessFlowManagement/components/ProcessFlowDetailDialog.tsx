import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Extension as ExtensionIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import {ProcessFlowItemTab, ProcessFlowProcessTab} from "./index";
import { ProcessFlow } from '../../../../types/processFlow';

interface ProcessFlowDetailDialogProps {
    open: boolean;
    onClose: () => void;
    selectedFlow: ProcessFlow | null;
}

const ProcessFlowDetailDialog: React.FC<ProcessFlowDetailDialogProps> = ({
                                                                             open,
                                                                             onClose, selectedFlow
                                                                         }) => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>공정흐름 상세 관리</DialogTitle>
            <DialogContent dividers={true}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="공정 관리" icon={<BuildIcon />} iconPosition="start" />
                    <Tab
                        label="제품 관리"
                        icon={<ExtensionIcon />}
                        iconPosition="start"
                    />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {/* 공정 관리 그리드 */}
                    {tabIndex === 0 && (
                        <ProcessFlowProcessTab />
                    )}

                    {/* 제품 관리 그리드 */}
                    {tabIndex === 1 && (
                        <ProcessFlowItemTab
                            // itemRows={itemRows}
                            // flowItemRows={flowItemRows}
                        />
                    )}
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProcessFlowDetailDialog;
