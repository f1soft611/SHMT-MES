import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { passwordService } from '../../../services/passwordService';
import { useToast } from '../Feedback/ToastProvider';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const validatePassword = (): boolean => {
    if (!oldPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('새 비밀번호는 6자 이상이어야 합니다.');
      return false;
    }
    if (newPassword === oldPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError(''); // 에러 초기화
    try {
      const response = await passwordService.changePassword(
        oldPassword,
        newPassword,
      );

      if (response.resultCode === 200) {
        showToast({
          message: '비밀번호가 성공적으로 변경되었습니다.',
          severity: 'success',
        });
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // result.error를 우선적으로 확인 (백엔드에서 구체적인 에러 메시지를 담아서 보냄)
        const errorMsg =
          response.result?.error ||
          response.resultMessage ||
          '비밀번호 변경에 실패했습니다.';
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('비밀번호 변경 에러:', err);
      console.error('에러 응답:', err.response);
      const errorMessage =
        err.response?.data?.result?.error ||
        err.response?.data?.resultMessage ||
        err.response?.data?.message ||
        err.message ||
        '비밀번호 변경 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>비밀번호 변경</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label="현재 비밀번호"
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="새 비밀번호"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            helperText="6자 이상 입력해주세요"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="새 비밀번호 확인"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          color="primary"
        >
          {loading ? '변경 중...' : '변경'}
        </Button>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;
