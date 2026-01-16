import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  DashboardAlert,
  AlertType,
  AlertPriority,
} from '../../../../types/dashboard';

interface AlertListProps {
  alerts: DashboardAlert[];
  loading?: boolean;
}

/**
 * 알림 유형별 아이콘 반환
 */
const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'EQUIPMENT_FAILURE':
      return <BuildIcon />;
    case 'QUALITY_ISSUE':
      return <ErrorIcon />;
    case 'MATERIAL_SHORTAGE':
      return <InventoryIcon />;
    case 'DELAY_WARNING':
      return <ScheduleIcon />;
    default:
      return <InfoIcon />;
  }
};

/**
 * 우선순위별 색상 반환
 */
const getPriorityColor = (
  priority: AlertPriority
): 'error' | 'warning' | 'info' => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'info';
    default:
      return 'info';
  }
};

/**
 * 우선순위 라벨 반환
 */
const getPriorityLabel = (priority: AlertPriority): string => {
  switch (priority) {
    case 'HIGH':
      return '높음';
    case 'MEDIUM':
      return '보통';
    case 'LOW':
      return '낮음';
    default:
      return priority;
  }
};

/**
 * 알림 유형 라벨 반환
 */
const getAlertTypeLabel = (type: AlertType): string => {
  switch (type) {
    case 'EQUIPMENT_FAILURE':
      return '설비 고장';
    case 'QUALITY_ISSUE':
      return '품질 이슈';
    case 'MATERIAL_SHORTAGE':
      return '자재 부족';
    case 'DELAY_WARNING':
      return '지연 경고';
    default:
      return type;
  }
};

/**
 * 시간 포맷팅 (YYYY-MM-DD HH:mm:ss -> MM/DD HH:mm)
 */
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

/**
 * 실시간 알림/이슈 목록 컴포넌트
 */
const AlertList: React.FC<AlertListProps> = ({ alerts, loading = false }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          실시간 알림/이슈
        </Typography>
        <Typography color="text.secondary">로딩 중...</Typography>
      </Paper>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          실시간 알림/이슈
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography color="text.secondary">현재 이슈가 없습니다</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          실시간 알림/이슈
        </Typography>
        <Chip label={`${alerts.length}건`} size="small" color="primary" />
      </Box>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {alerts.map((alert) => {
          const priorityColor = getPriorityColor(alert.priority);
          const isResolved = alert.isResolved === 'Y';

          return (
            <ListItem
              key={alert.alertId}
              sx={{
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: isResolved ? 'divider' : `${priorityColor}.main`,
                bgcolor: isResolved ? 'action.hover' : 'background.paper',
                opacity: isResolved ? 0.6 : 1,
                '&:hover': {
                  bgcolor: isResolved ? 'action.hover' : 'action.selected',
                },
              }}
              alignItems="flex-start"
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: isResolved
                      ? 'action.disabledBackground'
                      : `${priorityColor}.main`,
                  }}
                >
                  {getAlertIcon(alert.alertType)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={getAlertTypeLabel(alert.alertType)}
                      size="small"
                      color={priorityColor}
                      variant={isResolved ? 'outlined' : 'filled'}
                    />
                    <Chip
                      label={getPriorityLabel(alert.priority)}
                      size="small"
                      color={priorityColor}
                      variant="outlined"
                    />
                    {isResolved && (
                      <Chip
                        label="해결됨"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 0.5 }}
                    >
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.itemName} · {alert.workplaceName} ·{' '}
                      {formatTime(alert.occurredAt)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default AlertList;
