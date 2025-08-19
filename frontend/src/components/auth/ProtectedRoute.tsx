import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { usePermissions } from '../../contexts/PermissionContext';
import URL from '../../constants/url';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'read' | 'write';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission = 'read',
  fallbackPath = URL.MAIN 
}) => {
  const location = useLocation();
  const { checkPermission, loading } = usePermissions();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>권한을 확인하는 중...</Typography>
      </Box>
    );
  }

  const userPermission = checkPermission(location.pathname);

  // 권한 없음
  if (userPermission === 'none') {
    return <Navigate to={fallbackPath} replace />;
  }

  // 쓰기 권한이 필요한데 읽기 권한만 있는 경우
  if (requiredPermission === 'write' && userPermission === 'read') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          이 기능을 사용하기 위해서는 쓰기 권한이 필요합니다.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;