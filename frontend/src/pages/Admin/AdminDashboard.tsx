import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import URL from '../../constants/url';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const adminMenus = [
    {
      title: '권한 관리',
      description: '사용자 권한 및 역할별 메뉴 접근 권한을 관리합니다.',
      icon: <SecurityIcon color="primary" sx={{ fontSize: 40 }} />,
      path: URL.ADMIN_PERMISSIONS,
    },
    {
      title: '메뉴 관리',
      description: '시스템 메뉴를 추가, 수정, 삭제할 수 있습니다.',
      icon: <MenuIcon color="primary" sx={{ fontSize: 40 }} />,
      path: URL.ADMIN_MENUS,
    },
    {
      title: '사용자 관리',
      description: '시스템 사용자를 관리하고 권한을 할당합니다.',
      icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} />,
      path: URL.ADMIN_USERS,
    },
  ];

  const quickStats = [
    {
      title: '총 메뉴 수',
      value: '9',
      description: '현재 등록된 메뉴',
      icon: <MenuIcon />,
    },
    {
      title: '권한 유형',
      value: '8',
      description: '설정된 권한 유형',
      icon: <SecurityIcon />,
    },
    {
      title: '사용자 역할',
      value: '5',
      description: '정의된 사용자 역할',
      icon: <PeopleIcon />,
    },
    {
      title: '활성 사용자',
      value: '12',
      description: '현재 활성 사용자',
      icon: <AssignmentIcon />,
    },
  ];

  return (
    <ProtectedRoute requiredPermission="read" matchMode="prefix">
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              시스템 관리 대시보드
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              SHMT-MES 시스템의 권한 및 메뉴를 관리할 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* 빠른 통계 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 관리 메뉴 */}
        <Grid container spacing={3}>
          {adminMenus.map((menu, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{ height: '100%', cursor: 'pointer' }}
                onClick={() => navigate(menu.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{menu.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {menu.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {menu.description}
                  </Typography>
                  <Button variant="contained" fullWidth>
                    관리하기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 시스템 정보 */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              권한 관리 시스템 정보
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText
                  primary="메뉴 기반 권한 제어"
                  secondary="각 메뉴별로 읽기/쓰기 권한을 세분화하여 제어합니다."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="역할 기반 접근 제어 (RBAC)"
                  secondary="사용자 역할에 따라 메뉴 접근 권한을 자동으로 관리합니다."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MenuIcon />
                </ListItemIcon>
                <ListItemText
                  primary="동적 메뉴 시스템"
                  secondary="사용자 권한에 따라 사이드바 메뉴가 동적으로 변경됩니다."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="세분화된 권한 유형"
                  secondary="관리자, 생산실적등록, 생산실적조회 등 업무별 권한을 제공합니다."
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
