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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
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
    <Card
      sx={{
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          px: compactMode ? 1.5 : 2,
          py: compactMode ? 1.25 : 1.5,
          '&:last-child': { pb: compactMode ? 1.25 : 1.5 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={compactMode ? 1.25 : 2}
          alignItems="center"
          justifyContent="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="이전 기간">
              <IconButton
                onClick={onPrevWeek}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: '#133f7c',
                  color: 'common.white',
                  '&:hover': { bgcolor: '#0f3364' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                minWidth: { xs: '100%', md: compactMode ? 260 : 360 },
                textAlign: 'center',
              }}
            >
              <Typography
                variant={compactMode ? 'h6' : 'h5'}
                sx={{
                  fontWeight: 800,
                  color: '#133f7c',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                {formatDate(currentWeekStart, 'YYYY년 MM월 DD일')} ~{' '}
                {formatDate(
                  addDays(currentWeekStart, viewDays - 1),
                  'MM월 DD일',
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                연속 {viewDays}일 보기
              </Typography>
            </Box>

            <Tooltip title="다음 기간">
              <IconButton
                onClick={onNextWeek}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: '#133f7c',
                  color: 'common.white',
                  '&:hover': { bgcolor: '#0f3364' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Button
              variant="contained"
              onClick={onToday}
              startIcon={<CalendarTodayIcon />}
              sx={{
                minWidth: 108,
                height: 42,
                px: 2,
                borderRadius: 1.5,
                bgcolor: '#f57c00',
                boxShadow: 'none',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#d96d00',
                  boxShadow: 'none',
                },
              }}
            >
              오늘
            </Button>

            <Button
              variant="contained"
              onClick={onCapture}
              startIcon={<CameraAltIcon />}
              sx={{
                minWidth: 108,
                height: 42,
                px: 2,
                borderRadius: 1.5,
                bgcolor: '#133f7c',
                boxShadow: 'none',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#0f3364',
                  boxShadow: 'none',
                },
              }}
            >
              캡쳐
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeekNavigator;
