import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuInfo, permissionService } from '../services/admin/permissionService';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  userMenus: MenuInfo[];
  checkPermission: (menuUrl: string) => 'read' | 'write' | 'none';
  hasReadPermission: (menuUrl: string) => boolean;
  hasWritePermission: (menuUrl: string) => boolean;
  refreshPermissions: () => Promise<void>;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userMenus, setUserMenus] = useState<MenuInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserPermissions = async () => {
    if (!user?.groupId) return;

    try {
      setLoading(true);
      const menus = await permissionService.getUserAccessibleMenus(user.groupId);
      setUserMenus(menus);
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      setUserMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (menuUrl: string): 'read' | 'write' | 'none' => {
    const menu = userMenus.find(m => m.menuUrl === menuUrl);
    if (!menu) return 'none';
    return (menu.permissionLevel as 'read' | 'write') || 'none';
  };

  const hasReadPermission = (menuUrl: string): boolean => {
    const permission = checkPermission(menuUrl);
    return permission === 'read' || permission === 'write';
  };

  const hasWritePermission = (menuUrl: string): boolean => {
    const permission = checkPermission(menuUrl);
    return permission === 'write';
  };

  const refreshPermissions = async () => {
    await loadUserPermissions();
  };

  useEffect(() => {
    if (user?.groupId) {
      loadUserPermissions();
    }
  }, [user?.groupId]);

  const value: PermissionContextType = {
    userMenus,
    checkPermission,
    hasReadPermission,
    hasWritePermission,
    refreshPermissions,
    loading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};