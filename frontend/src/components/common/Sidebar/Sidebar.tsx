import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactoryIcon from '@mui/icons-material/Factory';
import SyncIcon from '@mui/icons-material/Sync';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: '대시보드',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: '생산지시',
      icon: <AssignmentIcon />,
      path: '/production-orders',
    },
    {
      text: '생산실적',
      icon: <FactoryIcon />,
      path: '/production-results',
    },
    {
      text: '인터페이스 모니터',
      icon: <SyncIcon />,
      path: '/interface',
    },
  ];

  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SHMT-MES
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;