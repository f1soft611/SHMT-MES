import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  PanTool as PanToolIcon,
} from '@mui/icons-material';
import { Process } from '../../../../types/process';
import ProcessDefectTab from './ProcessDefectTab';

interface ProcessDetailDialogProps {
  open: boolean;
  process: Process;
  onClose: () => void;
  detailTab: number;
  setDetailTab: (tab: number) => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const ProcessDetailDialog: React.FC<ProcessDetailDialogProps> = ({
  open,
  process,
  onClose,
  detailTab,
  setDetailTab,
  showSnackbar,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>공정 상세 관리 - {process.processName}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={detailTab}
            onChange={(e, newValue) => setDetailTab(newValue)}
          >
            <Tab
              label="불량코드 관리"
              icon={<BugReportIcon />}
              iconPosition="start"
            />
            <Tab
              label="검사항목 관리"
              icon={<CheckCircleIcon />}
              iconPosition="start"
            />
            <Tab
              label="중지항목 관리"
              icon={<PanToolIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        {detailTab === 0 && (
          <ProcessDefectTab process={process} showSnackbar={showSnackbar} />
        )}
        {detailTab === 1 && (
          <Box>검사항목 관리 (To be extracted)</Box>
        )}
        {detailTab === 2 && (
          <Box>중지항목 관리 (To be extracted)</Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessDetailDialog;
