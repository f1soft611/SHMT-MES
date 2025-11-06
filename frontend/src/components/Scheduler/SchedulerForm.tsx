import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  schedulerService,
  SchedulerConfig,
} from '../../services/schedulerService';

interface SchedulerFormProps {
  open: boolean;
  schedulerId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SchedulerFormData {
  schedulerName: string;
  schedulerDescription: string;
  cronExpression: string;
  jobClassName: string;
  isEnabled: string;
}

const SchedulerForm: React.FC<SchedulerFormProps> = ({
  open,
  schedulerId,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = schedulerId !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchedulerFormData>({
    defaultValues: {
      schedulerName: '',
      schedulerDescription: '',
      cronExpression: '',
      jobClassName: '',
      isEnabled: 'Y',
    },
  });

  // 수정 모드일 때 상세 정보 조회
  const { data: schedulerDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['scheduler', schedulerId],
    queryFn: () => schedulerService.getSchedulerDetail(schedulerId!),
    enabled: isEditMode && open,
  });

  useEffect(() => {
    if (isEditMode && schedulerDetail?.result?.scheduler) {
      const scheduler = schedulerDetail.result.scheduler;
      reset({
        schedulerName: scheduler.schedulerName,
        schedulerDescription: scheduler.schedulerDescription || '',
        cronExpression: scheduler.cronExpression,
        jobClassName: scheduler.jobClassName,
        isEnabled: scheduler.isEnabled,
      });
    } else if (!isEditMode) {
      reset({
        schedulerName: '',
        schedulerDescription: '',
        cronExpression: '',
        jobClassName: '',
        isEnabled: 'Y',
      });
    }
  }, [isEditMode, schedulerDetail, reset]);

  const mutation = useMutation({
    mutationFn: (data: SchedulerFormData) => {
      const scheduler: SchedulerConfig = {
        schedulerName: data.schedulerName,
        schedulerDescription: data.schedulerDescription,
        cronExpression: data.cronExpression,
        jobClassName: data.jobClassName,
        isEnabled: data.isEnabled,
      };

      if (isEditMode) {
        return schedulerService.updateScheduler(schedulerId, scheduler);
      } else {
        return schedulerService.createScheduler(scheduler);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulers'] });
      onSuccess();
    },
  });

  const onSubmit = (data: SchedulerFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? '스케쥴러 수정' : '스케쥴러 등록'}
      </DialogTitle>
      <DialogContent dividers>
        {isLoadingDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(mutation.error as Error).message}
              </Alert>
            )}

            <Controller
              name="schedulerName"
              control={control}
              rules={{ required: '스케쥴러명은 필수입니다.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="스케쥴러명"
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.schedulerName}
                  helperText={errors.schedulerName?.message}
                />
              )}
            />

            <Controller
              name="schedulerDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="설명"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              )}
            />

            <Controller
              name="cronExpression"
              control={control}
              rules={{ required: 'CRON 표현식은 필수입니다.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CRON 표현식"
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.cronExpression}
                  helperText={
                    errors.cronExpression?.message ||
                    '예: 0 0 * * * * (매시간 0분마다)'
                  }
                  placeholder="0 0 * * * *"
                />
              )}
            />

            <Controller
              name="jobClassName"
              control={control}
              rules={{ required: '작업 클래스명은 필수입니다.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="작업 클래스명"
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.jobClassName}
                  helperText={
                    errors.jobClassName?.message ||
                    '예: ErpToMesInterfaceService.executeUserInterface'
                  }
                />
              )}
            />

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">활성화 여부</FormLabel>
              <Controller
                name="isEnabled"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="Y"
                      control={<Radio />}
                      label="활성"
                    />
                    <FormControlLabel
                      value="N"
                      control={<Radio />}
                      label="비활성"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={mutation.isPending || isLoadingDetail}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : '저장'}
        </Button>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchedulerForm;
