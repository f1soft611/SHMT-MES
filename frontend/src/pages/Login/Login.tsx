import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  id: string;
  password: string;
}

const loginSchema = yup.object({
  id: yup
    .string()
    .required('사용자 ID를 입력해주세요')
    .min(3, '사용자 ID는 3자 이상이어야 합니다'),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .min(6, '비밀번호는 6자 이상이어야 합니다'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      id: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    if (data.id.trim() === 'admin' || data.password.trim() === 'f1soft@611') {
      sessionStorage.setItem('accessToken', 'dummyAccessToken');
      sessionStorage.setItem(
        'user',
        JSON.stringify({ id: 'admin', name: '관리자' })
      );
      navigate('/');
      return;
    }
    try {
      await login({
        id: data.id,
        password: data.password,
      });

      // 로그인 성공 시 메인 페이지로 이동
      navigate('/');
    } catch (error: any) {
      setLoginError(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #043269 0%, #065A9E 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* 로고 영역 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                SHMT-MES
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: 'text.secondary', mt: 1 }}
              >
                제조실행시스템
              </Typography>
            </Box>

            {/* 로그인 폼 */}
            <Box component="form" onSubmit={handleSubmit(handleLogin)}>
              {loginError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {loginError}
                </Alert>
              )}

              <Controller
                name="id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="사용자 ID"
                    variant="outlined"
                    margin="normal"
                    error={!!errors.id}
                    helperText={errors.id?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="비밀번호"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </Box>

            {/* 테스트 계정 안내 */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                테스트 계정: admin / f1soft@611
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
