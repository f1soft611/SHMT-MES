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
import { People as PeopleIcon, Build as BuildIcon } from '@mui/icons-material';
import { Workplace } from '../../../../types/workplace';
import WorkplaceWorkerTab from './WorkplaceWorkerTab';
import WorkplaceProcessTab from './WorkplaceProcessTab';

interface WorkplaceDetailDialogProps {
  open: boolean;
  workplace: Workplace;
  onClose: () => void;
  detailTab: number;
  setDetailTab: (tab: number) => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const WorkplaceDetailDialog: React.FC<WorkplaceDetailDialogProps> = ({
  open,
  workplace,
  onClose,
  detailTab,
  setDetailTab,
  showSnackbar,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>작업장 상세 관리 - {workplace.workplaceName}</DialogTitle>
      <DialogContent dividers={true}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={detailTab}
            onChange={(e, newValue) => setDetailTab(newValue)}
          >
            <Tab
              label="작업자 관리"
              icon={<PeopleIcon />}
              iconPosition="start"
            />
            <Tab label="공정 관리" icon={<BuildIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        {detailTab === 0 && (
          <WorkplaceWorkerTab
            workplace={workplace}
            showSnackbar={showSnackbar}
          />
        )}
        {detailTab === 1 && (
          <WorkplaceProcessTab
            workplace={workplace}
            showSnackbar={showSnackbar}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkplaceDetailDialog;
