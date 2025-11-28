import React, { useState } from 'react';
import { Box, Paper, Button, Tabs, Tab } from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from '../../services/schedulerService';
import SchedulerList from './components/SchedulerList';
import SchedulerForm from './components/SchedulerForm';
import SchedulerHistoryList from './components/SchedulerHistoryList';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import ConfirmDialog from '../../components/common/Feedback/ConfirmDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scheduler-tabpanel-${index}`}
      aria-labelledby={`scheduler-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SchedulerManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSchedulerId, setSelectedSchedulerId] = useState<number | null>(
    null
  );
  const [confirmRestart, setConfirmRestart] = useState(false);
  const { showToast } = useToast();

  const queryClient = useQueryClient();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClick = () => {
    setSelectedSchedulerId(null);
    setFormOpen(true);
  };

  const handleEditClick = (schedulerId: number) => {
    setSelectedSchedulerId(schedulerId);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedSchedulerId(null);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedSchedulerId(null);
    queryClient.invalidateQueries({ queryKey: ['schedulers'] });
    showToast({
      message: '스케쥴러가 성공적으로 저장되었습니다.',
      severity: 'success',
    });
  };

  const restartMutation = useMutation({
    mutationFn: () => schedulerService.restartSchedulers(),
    onSuccess: () => {
      showToast({
        message: '스케쥴러가 재시작되었습니다.',
        severity: 'success',
      });
    },
    onError: (error: any) => {
      showToast({
        message: `재시작 실패: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const handleRestartClick = () => {
    setConfirmRestart(true);
  };

  return (
    <Box>
      <PageHeader
        title=""
        crumbs={[{ label: '시스템 관리' }, { label: '스케쥴러 관리' }]}
        actionsRight={
          <>
            <Button
              variant="contained"
              color="info"
              startIcon={<RefreshIcon />}
              onClick={handleRestartClick}
              disabled={restartMutation.isPending}
            >
              스케쥴러 재시작
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              스케쥴러 등록
            </Button>
          </>
        }
      />

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="scheduler tabs"
          sx={{ mb: 2 }}
        >
          <Tab
            icon={<ScheduleIcon />}
            iconPosition="start"
            label="스케쥴러 관리"
          />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="실행 이력" />
        </Tabs>
      </Paper>

      <Paper>
        <TabPanel value={tabValue} index={0}>
          <SchedulerList onEdit={handleEditClick} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SchedulerHistoryList />
        </TabPanel>
      </Paper>

      {formOpen && (
        <SchedulerForm
          open={formOpen}
          schedulerId={selectedSchedulerId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmDialog
        open={confirmRestart}
        onClose={() => setConfirmRestart(false)}
        title="스케쥴러 재시작"
        message="모든 스케쥴러를 재시작하시겠습니까? 진행 중인 작업이 있다면 중단됩니다."
        confirmText="재시작"
        onConfirm={() => {
          restartMutation.mutate();
          setConfirmRestart(false);
        }}
      />
    </Box>
  );
};

export default SchedulerManagement;
