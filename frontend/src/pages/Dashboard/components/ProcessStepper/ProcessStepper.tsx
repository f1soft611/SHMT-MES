import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import { ProcessProgress } from '../../../../types/dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';

interface ProcessStepperProps {
  processList: ProcessProgress[];
  loading?: boolean;
}

/**
 * 공정별 진행 현황 스텝퍼 컴포넌트
 */
const ProcessStepper: React.FC<ProcessStepperProps> = ({
  processList,
  loading = false,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '완료':
        return <CheckCircleIcon color="success" />;
      case '진행중':
        return <PendingIcon color="primary" />;
      default:
        return <RadioButtonUncheckedIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'success';
      case '진행중':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getActiveStep = () => {
    const inProgressIndex = processList.findIndex(
      (p) => p.processStatus === '진행중'
    );
    if (inProgressIndex !== -1) return inProgressIndex;

    const completedCount = processList.filter(
      (p) => p.processStatus === '완료'
    ).length;
    return completedCount;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!processList || processList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          공정 정보가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Stepper activeStep={getActiveStep()} orientation="vertical">
      {processList.map((process, index) => {
        const completionRate =
          process.plannedQty > 0
            ? Math.round((process.actualQty / process.plannedQty) * 100)
            : 0;

        return (
          <Step key={process.processSeq} expanded>
            <StepLabel
              StepIconComponent={() => getStatusIcon(process.processStatus)}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {process.processName}
                </Typography>
                <Chip
                  label={process.processStatus}
                  size="small"
                  color={getStatusColor(process.processStatus) as any}
                  variant="outlined"
                />
                <Chip
                  label={`${completionRate}%`}
                  size="small"
                  color={completionRate === 100 ? 'success' : 'default'}
                />
              </Box>
            </StepLabel>
            <StepContent>
              <Card variant="outlined" sx={{ mt: 1, mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        작업장
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {process.workplaceName || '-'}
                      </Typography>
                    </Grid>
                    {process.equipmentName && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          설비
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {process.equipmentName}
                        </Typography>
                      </Grid>
                    )}
                    {process.workerName && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          작업자
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {process.workerName}
                        </Typography>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        작업 진행률
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={completionRate}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                          }}
                          color={completionRate === 100 ? 'success' : 'primary'}
                        />
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 35, fontWeight: 600 }}
                        >
                          {completionRate}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        계획수량
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {process.plannedQty.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        실적수량
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {process.actualQty.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        양품수량
                      </Typography>
                      <Typography
                        variant="body2"
                        color="info.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {process.goodQty.toLocaleString()}
                      </Typography>
                    </Grid>
                    {process.remark && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          비고
                        </Typography>
                        <Typography variant="body2">
                          {process.remark}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default ProcessStepper;
