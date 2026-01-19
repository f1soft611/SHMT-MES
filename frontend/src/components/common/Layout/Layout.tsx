import React, { useState } from 'react';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
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
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
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
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
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
