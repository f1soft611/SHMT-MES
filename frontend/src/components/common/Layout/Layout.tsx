import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Person, ExitToApp, LockReset } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { PermissionProvider } from '../../../contexts/PermissionContext';
import Sidebar from '../Sidebar/Sidebar';
import PasswordChangeDialog from '../PasswordChangeDialog/PasswordChangeDialog';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  // 데스크톱 사이드바 토글 상태 (localStorage에서 초기값 로드)
  const [desktopOpen, setDesktopOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 사이드바 상태를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(desktopOpen));
  }, [desktopOpen]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handlePasswordChange = () => {
    setPasswordDialogOpen(true);
    handleProfileMenuClose();
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
  };

  return (
    <PermissionProvider>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: {
              xs: '100%',
              md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
            },
            ml: {
              xs: 0,
              md: desktopOpen ? `${DRAWER_WIDTH}px` : 0,
            },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              SHMT-MES 시스템
            </Typography>

            {/* 사용자 정보 및 로그아웃 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {user?.name}님 안녕하세요
              </Typography>
              <Button
                onClick={handleProfileMenuOpen}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                >
                  <Person />
                </Avatar>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Person sx={{ mr: 2 }} />
                  {user?.name}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handlePasswordChange}>
                  <LockReset sx={{ mr: 2 }} />
                  비밀번호 변경
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 2 }} />
                  로그아웃
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{
            width: {
              xs: 0,
              md: desktopOpen ? DRAWER_WIDTH : 0,
            },
            flexShrink: { md: 0 },
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {/* 모바일용 임시 Drawer */}
          {isMobile && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                },
              }}
            >
              <Sidebar />
            </Drawer>
          )}

          {/* 데스크톱용 Persistent Drawer - 부드러운 애니메이션 */}
          {!isMobile && (
            <Drawer
              variant="persistent"
              open={desktopOpen}
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                  transition: theme.transitions.create('transform', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                },
              }}
            >
              <Sidebar />
            </Drawer>
          )}
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: {
              xs: '100%',
              md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
            },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar />
          {children}
        </Box>

        {/* 비밀번호 변경 다이얼로그 */}
        <PasswordChangeDialog
          open={passwordDialogOpen}
          onClose={handlePasswordDialogClose}
        />
      </Box>
    </PermissionProvider>
  );
};

export default Layout;
