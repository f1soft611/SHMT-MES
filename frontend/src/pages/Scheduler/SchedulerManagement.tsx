import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from '../../services/schedulerService';
import SchedulerList from '../../components/Scheduler/SchedulerList';
import SchedulerForm from '../../components/Scheduler/SchedulerForm';
import SchedulerHistoryList from '../../components/Scheduler/SchedulerHistoryList';

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
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
    setAlertMessage({
      type: 'success',
      message: '스케쥴러가 성공적으로 저장되었습니다.',
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const restartMutation = useMutation({
    mutationFn: () => schedulerService.restartSchedulers(),
    onSuccess: () => {
      setAlertMessage({
        type: 'success',
        message: '스케쥴러가 재시작되었습니다.',
      });
      setTimeout(() => setAlertMessage(null), 3000);
    },
    onError: (error: any) => {
      setAlertMessage({
        type: 'error',
        message: `재시작 실패: ${error.message}`,
      });
      setTimeout(() => setAlertMessage(null), 5000);
    },
  });

  const handleRestartClick = () => {
    if (
      window.confirm(
        '모든 스케쥴러를 재시작하시겠습니까? 진행 중인 작업이 있다면 중단됩니다.'
      )
    ) {
      restartMutation.mutate();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">스케쥴러 관리</Typography>
        </Box>

        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRestartClick}
            disabled={restartMutation.isPending}
            sx={{ mr: 1 }}
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
        </Box>
      </Box>

      {alertMessage && (
        <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
          {alertMessage.message}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="scheduler tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="스케쥴러 관리" />
          <Tab label="실행 이력" />
        </Tabs>

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
    </Box>
  );
};

export default SchedulerManagement;
