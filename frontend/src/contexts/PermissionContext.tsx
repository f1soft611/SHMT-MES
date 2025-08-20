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
type PermissionLevel = 'read' | 'write' | 'none';

interface PermissionContextType {
  userMenus: MenuInfo[];
  checkPermission: (menuUrl: string) => PermissionLevel;
  hasReadPermission: (menuUrl: string) => boolean;
  hasWritePermission: (menuUrl: string) => boolean;
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
   */
  const loadUserPermissions = useCallback(async () => {
    if (!user?.groupId) {
      if (debug)
        console.warn('[Permissions] user.groupId 없음 → 빈 메뉴로 설정');
      setUserMenus([]);
      setLoadedOnce(true);
      return;
    }

    try {
      setLoading(true);
      if (debug)
        console.log('[Permissions] Fetch menus for groupId=', user.groupId);
      const menus = await permissionService.getUserAccessibleMenus(
        user.groupId
      );

      // 방어: 배열 보장 + accessible 정규화
      const normalized = Array.isArray(menus)
        ? menus.map((m) => {
            const acc = (m as any).accessible;
            const accessible =
              acc === true || acc === 1 || acc === '1' || acc === 'Y';
            return { ...m, accessible };
          })
        : [];

      setUserMenus(normalized);
      if (debug) {
        console.log(
          '[Permissions] Loaded menus:',
          normalized.map((m) => ({
            url: m.menuUrl,
            perm: (m as any).permissionLevel,
            acc: (m as any).accessible,
          }))
        );
      }
    } catch (error) {
      console.error('[Permissions] Failed to load user permissions:', error);
      setUserMenus([]);
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, [user?.groupId, debug]);

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
   * - exactMap: 정규화된 path -> 메뉴
   * - prefixCandidates: prefix 매칭 시 길이 기준 정렬된 path 목록
   * - 동일 path 중 write 가 있다면 write 우선
   */
  const { exactMap, prefixCandidates } = useMemo(() => {
    const map = new Map<string, MenuInfo>();
    const candidates: string[] = [];

    for (const m of userMenus) {
      if (!m) continue;
      const acc = (m as any).accessible;
      if (!acc) continue;

      const nurl = normalizePath((m as any).menuUrl);
      if (!nurl) continue;

      const existing = map.get(nurl);
      if (!existing) {
        map.set(nurl, m);
      } else {
        const prevLevel = (existing as any).permissionLevel || 'read';
        const newLevel = (m as any).permissionLevel || 'read';
        if (newLevel === 'write' && prevLevel !== 'write') {
          map.set(nurl, m);
        }
      }
      candidates.push(nurl);
    }

    // 긴 경로 우선 (prefix 매칭 시 가장 구체적인 경로)
    candidates.sort((a, b) => b.length - a.length);

    if (debug) {
      console.log('[Permissions] exactMap keys:', Array.from(map.keys()));
      if (prefixMatch) {
        console.log('[Permissions] prefix order:', candidates);
      }
    }

    return { exactMap: map, prefixCandidates: candidates };
  }, [userMenus, debug, prefixMatch]);

  const ready = loadedOnce && !loading;

  /**
   * 권한 조회
   * - ready 이전에는 'none' 반환 (ProtectedRoute 등에서 ready 확인 후 redirect)
   * - exact match -> prefix fallback (prefixMatch=true)
   */
  const checkPermission = useCallback(
    (rawUrl: string): PermissionLevel => {
      const norm = normalizePath(rawUrl);
      if (!norm) return 'none';

      // 아직 데이터 확정 전이면 곧바로 'none' 반환 (호출 측에서 ready 확인)
      if (!ready) {
        if (debug)
          console.log('[Permissions] checkPermission before ready:', norm);
        return 'none';
      }

      let menu = exactMap.get(norm);

      if (!menu && prefixMatch) {
        // prefix fallback
        for (const base of prefixCandidates) {
          if (norm === base || norm.startsWith(base + '/')) {
            menu = exactMap.get(base);
            if (menu) break;
          }
        }
      }

      if (!menu) {
        if (debug) console.log('[Permissions] no menu for', norm);
        return 'none';
      }

      const level = ((menu as any).permissionLevel ||
        'read') as PermissionLevel;
      if (debug) {
        console.log('[Permissions] matched', norm, '=>', level, menu);
      }
      return level;
    },
    [exactMap, prefixCandidates, prefixMatch, ready, debug]
  );

  const hasReadPermission = useCallback(
    (url: string) => {
      const p = checkPermission(url);
      return p === 'read' || p === 'write';
    },
    [checkPermission]
  );

  const hasWritePermission = useCallback(
    (url: string) => checkPermission(url) === 'write',
    [checkPermission]
  );

  const value: PermissionContextType = {
    userMenus,
    checkPermission,
    hasReadPermission,
    hasWritePermission,
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
