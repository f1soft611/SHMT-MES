import apiClient from '../api';

export interface MenuInfo {
  menuId: string;
  menuNm: string;
  menuDc?: string;
  parentMenuId?: string;
  menuOrdr: number;
  menuUrl?: string;
  iconNm?: string;
  useAt: string;
  frstRegistPnttm?: Date;
  frstRegisterId?: string;
  lastUpdtPnttm?: Date;
  lastUpdusrId?: string;
  parentMenuNm?: string;
  hasChildren?: boolean;
  permissionLevel?: string;
  accessible?: boolean;
}

export interface PermissionType {
  permissionId: string;
  permissionNm: string;
  permissionDc?: string;
  permissionLevel: 'read' | 'write' | 'excel';
  useAt: string;
  frstRegistPnttm?: Date;
  frstRegisterId?: string;
  lastUpdtPnttm?: Date;
  lastUpdusrId?: string;
}

export interface RoleMenuPermission {
  roleMenuId: string;
  groupId: string;
  menuId: string;
  permissionId: string;
  useAt: string;
  frstRegistPnttm?: Date;
  frstRegisterId?: string;
  lastUpdtPnttm?: Date;
  lastUpdusrId?: string;
  groupNm?: string;
  menuNm?: string;
  permissionNm?: string;
  permissionLevel?: string;
  menuUrl?: string;
}

class PermissionService {
  // 메뉴 관리
  async getMenus(menuNm?: string, parentMenuId?: string): Promise<MenuInfo[]> {
    const params = new URLSearchParams();
    if (menuNm) params.append('menuNm', menuNm);
    if (parentMenuId) params.append('parentMenuId', parentMenuId);

    const response = await apiClient.get(
      `/api/admin/menus?${params.toString()}`
    );
    return response.data.result.menuList;
  }

  async getMenuDetail(menuId: string): Promise<MenuInfo> {
    const response = await apiClient.get(`/api/admin/menus/${menuId}`);
    return response.data.result.menuInfo;
  }

  async createMenu(menuInfo: Partial<MenuInfo>): Promise<void> {
    await apiClient.post('/api/admin/menus', menuInfo);
  }

  async updateMenu(menuId: string, menuInfo: Partial<MenuInfo>): Promise<void> {
    await apiClient.put(`/api/admin/menus/${menuId}`, menuInfo);
  }

  async deleteMenu(menuId: string): Promise<void> {
    await apiClient.delete(`/api/admin/menus/${menuId}`);
  }

  // 권한 유형 관리
  async getPermissionTypes(
    permissionNm?: string,
    permissionLevel?: string
  ): Promise<PermissionType[]> {
    const params = new URLSearchParams();
    if (permissionNm) params.append('permissionNm', permissionNm);
    if (permissionLevel) params.append('permissionLevel', permissionLevel);

    const response = await apiClient.get(
      `/api/admin/permissions?${params.toString()}`
    );
    return response.data.result.permissionList;
  }

  async createPermissionType(
    permissionType: Partial<PermissionType>
  ): Promise<void> {
    await apiClient.post('/api/admin/permissions', permissionType);
  }

  // 역할 메뉴 권한 관리
  async getRoleMenuPermissions(
    groupId?: string,
    menuId?: string
  ): Promise<RoleMenuPermission[]> {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (menuId) params.append('menuId', menuId);

    const response = await apiClient.get(
      `/api/admin/role-permissions?${params.toString()}`
    );
    return response.data.result.rolePermissionList;
  }

  async createRoleMenuPermission(
    roleMenuPermission: Partial<RoleMenuPermission>
  ): Promise<void> {
    await apiClient.post('/api/admin/role-permissions', roleMenuPermission);
  }

  async deleteRoleMenuPermission(
    groupId: string,
    menuId: string,
    permissionId?: string
  ): Promise<void> {
    const params = new URLSearchParams();
    params.append('groupId', groupId);
    params.append('menuId', menuId);
    if (permissionId) params.append('permissionId', permissionId);

    await apiClient.delete(`/api/admin/role-permissions?${params.toString()}`);
  }

  // 사용자 메뉴 접근 권한
  async getUserAccessibleMenus(groupId: string): Promise<MenuInfo[]> {
    const response = await apiClient.get(`/api/admin/user-menus/${groupId}`);
    return response.data.result.menuList;
  }

  async checkUserMenuPermission(
    groupId: string,
    menuUrl: string
  ): Promise<string> {
    const params = new URLSearchParams();
    params.append('menuUrl', menuUrl);

    const response = await apiClient.get(
      `/api/admin/user-permissions/${groupId}?${params.toString()}`
    );
    return response.data.permission;
  }
}

export const permissionService = new PermissionService();
