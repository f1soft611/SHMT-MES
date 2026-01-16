import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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

  // Health Check 주기적 조회 (30초마다)
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['schedulerHealth'],
    queryFn: () => schedulerService.getSchedulerHealth(),
    refetchInterval: 30000, // 30초
    retry: 1,
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'INITIALIZED_NO_TASKS':
        return 'warning';
      case 'NOT_INITIALIZED':
      case 'UNHEALTHY':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <HealthyIcon />;
      case 'INITIALIZED_NO_TASKS':
        return <WarningIcon />;
      case 'NOT_INITIALIZED':
      case 'UNHEALTHY':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return '정상';
      case 'INITIALIZED_NO_TASKS':
        return '초기화됨 (작업없음)';
      case 'NOT_INITIALIZED':
        return '초기화 안됨';
      case 'UNHEALTHY':
        return '비정상';
      default:
        return '알 수 없음';
    }
  };

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
      // Health Check 다시 조회
      setTimeout(() => refetchHealth(), 1000);
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
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Health Status */}
            {healthData?.result && (
              <Tooltip
                title={
                  <Box>
                    <div>
                      상태: {getHealthStatusLabel(healthData.result.status)}
                    </div>
                    <div>
                      초기화:{' '}
                      {healthData.result.isInitialized ? '완료' : '미완료'}
                    </div>
                    <div>
                      TaskScheduler: {healthData.result.taskSchedulerStatus}
                    </div>
                    <div>
                      등록된 작업: {healthData.result.registeredTasksCount}개
                    </div>
                    <div>활성 작업: {healthData.result.activeTasksCount}개</div>
                    <div>
                      DB 활성 스케줄러:{' '}
                      {healthData.result.enabledSchedulersInDb}개
                    </div>
                    <div>확인 시간: {healthData.result.checkTime}</div>
                  </Box>
                }
              >
                <Chip
                  icon={getHealthStatusIcon(healthData.result.status)}
                  label={`상태: ${getHealthStatusLabel(
                    healthData.result.status
                  )}`}
                  color={getHealthStatusColor(healthData.result.status) as any}
                  size="small"
                />
              </Tooltip>
            )}

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
          </Stack>
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
