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
  CircularProgress,
  Collapse,
} from '@mui/material';

import { usePermissions } from '../../../contexts/PermissionContext';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BaseDataIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactoryIcon from '@mui/icons-material/Factory';
import MoniterIcon from '@mui/icons-material/Monitor';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const iconMap: { [key: string]: React.ReactElement } = {
  Dashboard: <DashboardIcon />,
  Settings: <BaseDataIcon />,
  Assignment: <AssignmentIcon />,
  Factory: <FactoryIcon />,
  Monitor: <MoniterIcon />,
  AdminPanelSettings: <AdminPanelSettingsIcon />,
  Security: <SecurityIcon />,
  Menu: <MenuIcon />,
  People: <PeopleIcon />,
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userMenus, loading } = usePermissions();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    {}
  );

  // 하위 메뉴의 부모를 찾아서 오픈
  React.useEffect(() => {
    if (!loading && Array.isArray(userMenus)) {
      const list = userMenus.filter((m) => !!m && !!m.accessible);
      const childMenu = list.find((menu) => menu.menuUrl === location.pathname);
      if (childMenu && childMenu.parentMenuId != null) {
        setOpenMenus((prev) => ({
          ...prev,
          [String(childMenu.parentMenuId)]: true,
        }));
      }
    }
  }, [location.pathname, userMenus, loading]);

  // 메뉴 항목 구성
  const buildMenuItems = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    const list = Array.isArray(userMenus) ? userMenus : [];
    const accessibleMenus = list.filter((m) => !!m && !!m.accessible);

    const parentMenus = accessibleMenus.filter((menu) => !menu.parentMenuId);
    const childMenus = accessibleMenus.filter((menu) => menu.parentMenuId);

    parentMenus.sort((a, b) => a.menuOrdr - b.menuOrdr);

    return parentMenus.map((parentMenu) => {
      const children = childMenus
        .filter((child) => child.parentMenuId === parentMenu.menuId)
        .sort((a, b) => a.menuOrdr - b.menuOrdr);

      const hasChildren = children.length > 0;
      const isOpen = openMenus[parentMenu.menuId] || false;

      const handleParentClick = () => {
        if (hasChildren) {
          setOpenMenus((prev) => ({
            ...prev,
            [parentMenu.menuId]: !prev[parentMenu.menuId],
          }));
        } else if (parentMenu.menuUrl) {
          navigate(parentMenu.menuUrl);
        }
      };

      return (
        <React.Fragment key={parentMenu.menuId}>
          <ListItem disablePadding>
            <ListItemButton
              selected={
                !hasChildren && location.pathname === parentMenu.menuUrl
              }
              onClick={handleParentClick}
            >
              <ListItemIcon>
                {iconMap[parentMenu.iconNm || 'Dashboard'] || <DashboardIcon />}
              </ListItemIcon>
              <ListItemText primary={parentMenu.menuNm} />
              {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>

          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {children.map((childMenu) => (
                  <ListItem key={childMenu.menuId} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      selected={location.pathname === childMenu.menuUrl}
                      onClick={() =>
                        childMenu.menuUrl && navigate(childMenu.menuUrl)
                      }
                    >
                      <ListItemIcon>
                        {iconMap[childMenu.iconNm || 'Dashboard'] || (
                          <DashboardIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={childMenu.menuNm} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SHMT-MES
        </Typography>
      </Box>
      <Divider />
      <List>{buildMenuItems()}</List>
    </Box>
  );
};

export default Sidebar;
