import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { usePermissions } from '../../contexts/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'read' | 'write';
  fallbackPath?: string; // 권한 없을 때 이동
  loadingMessage?: string;
  matchMode?: 'exact' | 'prefix'; // /admin 하위 경로 허용 여부
  debug?: boolean;
}

/**
 * 권장 사용:
 * <ProtectedRoute requiredPermission="read">
 *   <AdminDashboard/>
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission = 'read',
  fallbackPath = '/unauthorized',
  loadingMessage = '권한을 확인하는 중...',
  matchMode = 'exact',
  debug = false,
}) => {
  const location = useLocation();
  const { checkPermission, loading, ready, userMenus } =
    usePermissions() as any;

  // ready 전에는 절대 redirect 하지 않음
  if (loading || !ready) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="body2">{loadingMessage}</Typography>
      </Box>
    );
  }

  // 경로 정규화 (간단)
  const normalize = (p: string) =>
    (p || '')
      .trim()
      .replace(/[#?].*$/, '')
      .replace(/\/+$/, '')
      .replace(/^$/, '/');

  const currentPath = normalize(location.pathname);

  // prefix 모드면 가장 긴 매칭 탐색
  const resolvePermission = () => {
    if (matchMode === 'exact') {
      return checkPermission(currentPath);
    }
    // prefix 매칭
    const candidates = userMenus
      .filter((m: any) => m.accessible && m.menuUrl)
      .map((m: any) => normalize(m.menuUrl))
      .sort((a: string, b: string) => b.length - a.length);

    for (const path of candidates) {
      if (currentPath === path || currentPath.startsWith(path + '/')) {
        return checkPermission(path); // 해당 메뉴 기준 권한
      }
    }
    return 'none';
  };

  const userPermission = resolvePermission();

  if (debug) {
    // eslint-disable-next-line no-console
    console.log('[ProtectedRoute]', {
      currentPath,
      userPermission,
      requiredPermission,
      matchMode,
      ready,
    });
  }

  // 권한 부족 판단
  const lackPermission =
    userPermission === 'none' ||
    (requiredPermission === 'write' && userPermission !== 'write');

  if (lackPermission) {
    const alreadyAtFallback = normalize(fallbackPath) === currentPath;
    if (alreadyAtFallback) {
      // fallback 자체에서는 안내만
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error" variant="outlined">
            이 페이지에 접근할 권한이 없습니다.
          </Alert>
        </Box>
      );
    }
    return (
      <Navigate
        to={fallbackPath}
        replace
        state={{ from: location.pathname, reason: 'permission-denied' }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
