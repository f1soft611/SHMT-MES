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
  permissionLevel: 'read' | 'write' | 'excel' | 'delete';
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
    if (!roleMenuPermission.groupId || !roleMenuPermission.menuId) {
      throw new Error('groupId와 menuId는 필수입니다.');
    }

    try {
      await apiClient.post('/api/admin/role-permissions', roleMenuPermission);
    } catch (error: any) {
      // 상세 에러 메시지 추출
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 400) {
        throw new Error(
          `요청 형식이 잘못되었습니다. ${message ? `: ${message}` : ''}`
        );
      } else if (status === 403) {
        throw new Error('권한이 없어 작업을 수행할 수 없습니다.');
      } else if (status === 409) {
        throw new Error('이미 부여된 권한입니다.');
      } else if (status >= 500) {
        throw new Error(
          `서버 오류가 발생했습니다. (${status}) ${
            message ? `: ${message}` : ''
          }`
        );
      } else {
        throw new Error(
          message || '권한 부여에 실패했습니다. 다시 시도해주세요.'
        );
      }
    }
  }

  async deleteRoleMenuPermission(
    groupId: string,
    menuId: string,
    permissionId?: string
  ): Promise<void> {
    if (!groupId || !menuId) {
      throw new Error('groupId와 menuId는 필수입니다.');
    }

    try {
      const params = new URLSearchParams();
      params.append('groupId', groupId);
      params.append('menuId', menuId);
      if (permissionId) params.append('permissionId', permissionId);

      await apiClient.delete(
        `/api/admin/role-permissions?${params.toString()}`
      );
    } catch (error: any) {
      // 상세 에러 메시지 추출
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 403) {
        throw new Error('권한이 없어 작업을 수행할 수 없습니다.');
      } else if (status === 404) {
        throw new Error('삭제할 권한이 존재하지 않습니다.');
      } else if (status === 409) {
        throw new Error('권한 삭제 중 충돌이 발생했습니다. 다시 시도해주세요.');
      } else if (status >= 500) {
        throw new Error(
          `서버 오류가 발생했습니다. (${status}) ${
            message ? `: ${message}` : ''
          }`
        );
      } else {
        throw new Error(
          message || '권한 삭제에 실패했습니다. 다시 시도해주세요.'
        );
      }
    }
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
