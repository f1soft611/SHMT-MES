import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  MenuInfo,
  permissionService,
} from '../services/admin/permissionService';
import { useAuth } from './AuthContext';

/**
 * 권한 레벨 타입
 */
type PermissionLevel = 'read' | 'write' | 'delete' | 'none';

interface PermissionContextType {
  userMenus: MenuInfo[];
  checkPermission: (menuUrl: string) => PermissionLevel;
  hasReadPermission: (menuUrl: string) => boolean;
  hasWritePermission: (menuUrl: string) => boolean;
  hasDeletePermission: (menuUrl: string) => boolean;
  refreshPermissions: () => Promise<void>;
  loading: boolean; // 현재 재로딩 중 여부
  ready: boolean; // 최소 1회 로딩 시도 완료 여부 (redirect 전에 이 값 확인)
  debug?: boolean;
}

/**
 * Provider 외부에서 사용할 수 있도록 context 정의
 */
const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: React.ReactNode;
  debug?: boolean;
  /**
   * prefixMatch:
   * true  => /admin/users/123 요청 시 /admin/users 메뉴 권한으로 fallback
   * false => 정확히 일치하는 menuUrl 만 권한 적용
   */
  prefixMatch?: boolean;
}

/**
 * 경로 정규화:
 * - 쿼리/해시 제거
 * - 앞뒤 공백 제거
 * - 선행 슬래시 보장
 * - 마지막 슬래시 제거(단, 루트 / 제외)
 */
function normalizePath(raw?: string | null): string {
  if (!raw) return '';
  let p = raw.trim();
  const hashIdx = p.indexOf('#');
  if (hashIdx >= 0) p = p.substring(0, hashIdx);
  const qIdx = p.indexOf('?');
  if (qIdx >= 0) p = p.substring(0, qIdx);
  if (p && !p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * PermissionProvider
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  debug = false,
  prefixMatch = true,
}) => {
  const { user } = useAuth();

  const [userMenus, setUserMenus] = useState<MenuInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false); // 최초 로딩 시도 여부

  /**
   * 메뉴/권한 정보 로딩
   * 병렬로 두 API 호출, 각각 실패해도 진행
   */
  const loadUserPermissions = useCallback(async () => {
    if (!user?.groupId) {
      setUserMenus([]);
      setLoadedOnce(true);
      return;
    }

    try {
      setLoading(true);

      let rolePermissions: any[] = [];
      let allMenus: any[] = [];

      // rolePermissions 조회 (실패해도 진행)
      try {
        rolePermissions = await permissionService.getRoleMenuPermissions(
          user.groupId
        );
      } catch (err) {
        console.warn('[Permissions] getRoleMenuPermissions failed:', err);
        rolePermissions = [];
      }

      // allMenus 조회 (실패해도 진행)
      try {
        allMenus = await permissionService.getMenus();
      } catch (err) {
        console.warn('[Permissions] getMenus failed:', err);
        allMenus = [];
      }

      // 둘 다 실패하면 에러
      if (rolePermissions.length === 0 && allMenus.length === 0) {
        throw new Error('메뉴와 권한 정보를 모두 조회할 수 없습니다.');
      }

      // 메뉴 데이터 구성
      const menusWithPermissions =
        allMenus.length > 0
          ? allMenus
              .filter((menu) => (menu as any).useAt === 'Y')
              .map((menu) => {
                const rolePerms = rolePermissions.filter(
                  (rp) => rp.menuId === menu.menuId
                );

                const permissionLevels = rolePerms
                  .map((rp) => (rp as any).permissionLevel)
                  .filter(Boolean);

                return {
                  ...menu,
                  accessible: rolePerms.length > 0 ? true : false,
                  permissionLevel: permissionLevels[0] || 'read',
                  permissionLevels,
                };
              })
          : rolePermissions.map((rp) => ({
              menuId: rp.menuId,
              menuNm: rp.menuNm,
              menuUrl: rp.menuUrl,
              accessible: true,
              permissionLevel: (rp as any).permissionLevel || 'read',
              permissionLevels: [(rp as any).permissionLevel || 'read'],
            }));

      // 방어: 배열 보장 + accessible 정규화 + 미사용 메뉴 제거
      const normalized = Array.isArray(menusWithPermissions)
        ? menusWithPermissions
            .map((m) => {
              const acc = (m as any).accessible;
              const accessible =
                acc === true || acc === 1 || acc === '1' || acc === 'Y';
              return { ...m, accessible };
            })
            .filter((m) => (m as any).accessible)
        : [];

      setUserMenus(normalized);
    } catch (error) {
      console.error('[Permissions] Failed to load user permissions:', error);
      setUserMenus([]);
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, [user?.groupId]);

  const refreshPermissions = useCallback(async () => {
    await loadUserPermissions();
  }, [loadUserPermissions]);

  /**
   * 사용자 groupId 변경 시 재로딩
   */
  useEffect(() => {
    if (user?.groupId) {
      loadUserPermissions();
    } else {
      // 로그아웃/미로그인 상태
      setUserMenus([]);
      setLoadedOnce(true);
    }
  }, [user?.groupId, loadUserPermissions]);

  /**
   * 빠른 권한 조회를 위한 맵 구성
   * - permissionMap: 정규화된 path -> 권한 레벨 집합
   * - prefixCandidates: prefix 매칭 시 길이 기준 정렬된 path 목록
   * - permissionLevels 배열에서 모든 권한을 수집
   */
  const { permissionMap, prefixCandidates } = useMemo(() => {
    const map = new Map<string, Set<PermissionLevel>>();
    const candidates: string[] = [];

    for (const m of userMenus) {
      if (!m) continue;
      const acc = (m as any).accessible;
      if (!acc) continue;

      const nurl = normalizePath((m as any).menuUrl);
      if (!nurl) continue;

      // permissionLevels 배열이 있으면 사용, 없으면 permissionLevel 사용
      const levels: PermissionLevel[] = (m as any).permissionLevels || [
        ((m as any).permissionLevel || 'read') as PermissionLevel,
      ];

      // 같은 경로에 여러 권한을 Set으로 저장
      if (!map.has(nurl)) {
        map.set(nurl, new Set<PermissionLevel>());
        candidates.push(nurl);
      }

      // 모든 권한 레벨 추가
      const permSet = map.get(nurl)!;
      for (const level of levels) {
        if (level) {
          permSet.add(level);
        }
      }
    }

    // 긴 경로 우선 (prefix 매칭 시 가장 구체적인 경로)
    candidates.sort((a, b) => b.length - a.length);

    return { permissionMap: map, prefixCandidates: candidates };
  }, [userMenus]);

  const ready = loadedOnce && !loading;

  /**
   * 권한 조회
   * - ready 이전에는 'none' 반환
   * - 경로에 해당하는 권한 레벨들을 반환
   * - exact match -> prefix fallback (prefixMatch=true)
   */
  const checkPermission = useCallback(
    (rawUrl: string): PermissionLevel => {
      const norm = normalizePath(rawUrl);
      if (!norm) return 'none';

      // 아직 데이터 확정 전이면 곧바로 'none' 반환
      if (!ready) {
        return 'none';
      }

      let permissions = permissionMap.get(norm);

      if (!permissions && prefixMatch) {
        // prefix fallback: 더 긴 경로를 먼저 확인
        for (const base of prefixCandidates) {
          if (norm === base || norm.startsWith(base + '/')) {
            permissions = permissionMap.get(base);
            if (permissions && permissions.size > 0) break;
          }
        }
      }

      if (!permissions || permissions.size === 0) {
        return 'none';
      }

      // 첫 번째 권한 반환 (실제로는 모든 권한을 가짐)
      const level = Array.from(permissions)[0];
      return level;
    },
    [permissionMap, prefixCandidates, prefixMatch, ready]
  );

  /**
   * 특정 권한이 있는지 확인하는 헬퍼 함수
   */
  const hasSpecificPermission = useCallback(
    (url: string, requiredLevel: PermissionLevel): boolean => {
      const norm = normalizePath(url);
      if (!norm || !ready) return false;

      let permissions = permissionMap.get(norm);

      if (!permissions && prefixMatch) {
        for (const base of prefixCandidates) {
          if (norm === base || norm.startsWith(base + '/')) {
            permissions = permissionMap.get(base);
            if (permissions && permissions.size > 0) break;
          }
        }
      }

      return permissions ? permissions.has(requiredLevel) : false;
    },
    [permissionMap, prefixCandidates, prefixMatch, ready]
  );

  const hasReadPermission = useCallback(
    (url: string) => hasSpecificPermission(url, 'read'),
    [hasSpecificPermission]
  );

  const hasWritePermission = useCallback(
    (url: string) => hasSpecificPermission(url, 'write'),
    [hasSpecificPermission]
  );

  const hasDeletePermission = useCallback(
    (url: string) => hasSpecificPermission(url, 'delete'),
    [hasSpecificPermission]
  );

  const value: PermissionContextType = {
    userMenus,
    checkPermission,
    hasReadPermission,
    hasWritePermission,
    hasDeletePermission,
    refreshPermissions,
    loading,
    ready,
    debug,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * 훅
 */
export const usePermissions = (): PermissionContextType => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return ctx;
};
