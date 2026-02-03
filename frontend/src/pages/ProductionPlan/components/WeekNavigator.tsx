import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CalendarToday as CalendarTodayIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';

interface WeekNavigatorProps {
  currentWeekStart: Date;
  viewDays: number;
  compactMode: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onCapture: () => void;
  formatDate: (date: Date, format: string) => string;
  addDays: (date: Date, days: number) => Date;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeekStart,
  viewDays,
  compactMode,
  onPrevWeek,
  onNextWeek,
  onToday,
  onCapture,
  formatDate,
  addDays,
}) => {
  return (
    <Card sx={{ mb: 1, boxShadow: 1 }}>
      <CardContent
        sx={{
          pt: compactMode ? 1 : 1.5,
          '&:last-child': { pb: compactMode ? 1 : 1.5 },
        }}
      >
        <Stack
          direction="row"
          spacing={compactMode ? 1 : 1.5}
          alignItems="center"
          justifyContent="center"
        >
          <Tooltip title="이전 주">
            <IconButton
              onClick={onPrevWeek}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ textAlign: 'center', minWidth: compactMode ? 260 : 350 }}>
            <Typography
              variant={compactMode ? 'h6' : 'h5'}
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              {formatDate(currentWeekStart, 'YYYY년 MM월 DD일')} ~{' '}
              {formatDate(addDays(currentWeekStart, viewDays - 1), 'MM월 DD일')}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              연속 {viewDays}일 보기
            </Typography>
          </Box>

          <Tooltip title="다음 주">
            <IconButton
              onClick={onNextWeek}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="warning"
            startIcon={<CalendarTodayIcon />}
            onClick={onToday}
          >
            오늘
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltIcon />}
            onClick={onCapture}
          >
            캡쳐
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeekNavigator;
