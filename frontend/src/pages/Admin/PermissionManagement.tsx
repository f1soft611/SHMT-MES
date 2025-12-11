import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Alert,
  Chip,
  Card,
  CardContent,
  TextField,
  Checkbox,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  MenuInfo,
  PermissionType,
  RoleMenuPermission,
  permissionService,
} from '../../services/admin/permissionService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import ConfirmDialog from '../../components/common/Feedback/ConfirmDialog';

const PermissionManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuInfo[]>([]);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RoleMenuPermission[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [menuFilter, setMenuFilter] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState<{
    open: boolean;
    rp?: RoleMenuPermission;
  }>({ open: false });
  const { showToast } = useToast();

  // 기본 역할 그룹
  const roles = [
    { id: 1, name: 'ROLE_ADMIN (관리자)' },
    { id: 2, name: 'ROLE_USER (일반사용자)' },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 메뉴 및 권한 정보 로드
      const [menusResult, permissionsResult] = await Promise.all([
        permissionService.getMenus(),
        permissionService.getPermissionTypes(),
      ]);
      setMenus(menusResult ?? []);
      setPermissions(permissionsResult ?? []);

      // 역할이 선택된 경우 해당 역할의 권한 정보 로드
      if (selectedRole) {
        try {
          const rolePermsResult =
            await permissionService.getRoleMenuPermissions(selectedRole);
          setRolePermissions(rolePermsResult ?? []);
        } catch (roleErr: any) {
          const errorMsg =
            roleErr?.response?.data?.message ||
            roleErr?.message ||
            '역할 권한을 불러오는데 실패했습니다.';
          setError(`역할 권한 로드 실패: ${errorMsg}`);
          showToast({
            message: `역할 권한 로드 실패: ${errorMsg}`,
            severity: 'error',
          });
          setRolePermissions([]);
        }
      } else {
        setRolePermissions([]);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        '데이터를 불러오는데 실패했습니다.';
      setError(`데이터 로드 실패: ${errorMsg}`);
      showToast({
        message: `데이터 로드 실패: ${errorMsg}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRole, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handlePermissionChange = async (
    menuId: string,
    permissionId: string,
    granted: boolean
  ) => {
    if (!selectedRole) {
      showToast({ message: '역할을 먼저 선택해주세요.', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (granted) {
        await permissionService.createRoleMenuPermission({
          groupId: selectedRole,
          menuId,
          permissionId,
          useAt: 'Y',
          frstRegisterId: 'ADMIN',
          lastUpdusrId: 'ADMIN',
        });
        showToast({ message: '권한이 부여되었습니다.', severity: 'success' });
      } else {
        // 권한 해제 전에 확인
        try {
          await permissionService.deleteRoleMenuPermission(
            selectedRole,
            menuId,
            permissionId
          );
          showToast({ message: '권한이 해제되었습니다.', severity: 'success' });
        } catch (deleteErr: any) {
          const errorMsg =
            deleteErr?.response?.data?.message ||
            deleteErr?.message ||
            '권한 해제에 실패했습니다.';
          setError(`권한 해제 오류: ${errorMsg}`);
          showToast({
            message: `권한 해제 실패: ${errorMsg}`,
            severity: 'error',
          });
          setLoading(false);
          return;
        }
      }

      // 최신 권한 정보 다시 로드
      try {
        const rolePermsResult = await permissionService.getRoleMenuPermissions(
          selectedRole
        );
        setRolePermissions(rolePermsResult);
      } catch (reloadErr: any) {
        const reloadMsg =
          reloadErr?.response?.data?.message ||
          reloadErr?.message ||
          '권한 정보를 새로고침하는데 실패했습니다.';
        setError(`권한 정보 갱신 실패: ${reloadMsg}`);
        showToast({
          message: `권한 정보 갱신 실패: ${reloadMsg}`,
          severity: 'error',
        });
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        '권한 설정에 실패했습니다.';
      setError(`권한 설정 오류: ${errorMsg}`);
      showToast({
        message: `권한 설정 실패: ${errorMsg}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (menuId: string, permissionId: string): boolean =>
    rolePermissions.some(
      (rp) => rp.menuId === menuId && rp.permissionId === permissionId
    );

  const menuHierarchy = useMemo(() => {
    const parents = menus.filter((m) => !m.parentMenuId);
    const byParent = new Map(
      parents.map((p) => [
        p.menuId,
        menus.filter((c) => c.parentMenuId === p.menuId),
      ])
    );

    const q = menuFilter.trim().toLowerCase();
    if (!q)
      return parents.map((p) => ({
        ...p,
        children: byParent.get(p.menuId) || [],
      }));

    const match = (s?: string) => (s || '').toLowerCase().includes(q);
    return parents
      .map((p) => {
        const children = byParent.get(p.menuId) || [];
        const filteredChildren = children.filter((c) => match(c.menuNm));
        const parentOk = match(p.menuNm);
        if (parentOk || filteredChildren.length) {
          return {
            ...p,
            children: parentOk ? children : filteredChildren,
          } as MenuInfo & { children: MenuInfo[] };
        }
        return null;
      })
      .filter(Boolean) as Array<MenuInfo & { children: MenuInfo[] }>;
  }, [menus, menuFilter]);

  return (
    <ProtectedRoute requiredPermission="write">
      <Box>
        <PageHeader
          title=""
          crumbs={[{ label: '시스템 관리' }, { label: '권한 관리' }]}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {/* 역할 선택 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  역할 선택
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(String(e.target.value))}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
            {/* 권한 유형 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  권한 유형
                </Typography>
                {permissions.map((permission) => (
                  <Box key={permission.permissionId} sx={{ mb: 1 }}>
                    <Chip
                      icon={
                        permission.permissionLevel === 'write' ? (
                          <SecurityIcon />
                        ) : permission.permissionLevel === 'excel' ? (
                          <DescriptionIcon />
                        ) : permission.permissionLevel === 'delete' ? (
                          <DeleteIcon />
                        ) : (
                          <VisibilityIcon />
                        )
                      }
                      label={`${permission.permissionNm} (${permission.permissionLevel})`}
                      color={
                        permission.permissionLevel === 'write'
                          ? 'primary'
                          : permission.permissionLevel === 'excel'
                          ? 'success'
                          : permission.permissionLevel === 'delete'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
            {/* 현재 설정된 권한 */}
            <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent
                sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <Box sx={{ px: 2, pt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    현재 설정된 권한
                  </Typography>
                </Box>
                {selectedRole && rolePermissions.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 350, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead
                        sx={{
                          '& .MuiTableCell-head': {
                            bgcolor: '#fff',
                            fontWeight: 600,
                            py: 2,
                            // borderBottom: '2px solid',
                            borderBottomColor: 'divider',
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell align="center">메뉴</TableCell>
                          <TableCell align="center">권한</TableCell>
                          <TableCell align="center">권한 레벨</TableCell>
                          <TableCell align="center">작업</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rolePermissions.map((rp) => (
                          <TableRow key={rp.roleMenuId}>
                            <TableCell>{rp.menuNm}</TableCell>
                            <TableCell align="center">
                              {rp.permissionNm}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={rp.permissionLevel}
                                color={
                                  rp.permissionLevel === 'write'
                                    ? 'primary'
                                    : rp.permissionLevel === 'excel'
                                    ? 'success'
                                    : rp.permissionLevel === 'delete'
                                    ? 'error'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setConfirmRevoke({ open: true, rp })
                                }
                                disabled={loading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      표시할 권한이 없습니다.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 오른쪽: 메뉴별 권한 부여 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  메뉴별 권한 부여
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="메뉴 검색 (부모/자식)"
                  value={menuFilter}
                  onChange={(e) => setMenuFilter(e.target.value)}
                />
              </CardContent>
            </Card>

            {selectedRole ? (
              <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent
                  sx={{
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <TableContainer
                    sx={{ flex: 1, maxHeight: 630, overflow: 'auto' }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead
                        sx={{
                          '& .MuiTableCell-head': {
                            bgcolor: '#fff',
                            fontWeight: 600,
                            py: 2,
                            // borderBottom: '2px solid',
                            borderBottomColor: 'divider',
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell align="center">메뉴</TableCell>
                          {permissions.map((pm) => (
                            <TableCell key={pm.permissionId} align="center">
                              {pm.permissionNm}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {menuHierarchy.map((parent) => (
                          <React.Fragment key={parent.menuId}>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {parent.menuNm}
                                </Typography>
                              </TableCell>
                              {permissions.map((pm) => (
                                <TableCell key={pm.permissionId} align="center">
                                  <Checkbox
                                    checked={hasPermission(
                                      parent.menuId,
                                      pm.permissionId
                                    )}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        parent.menuId,
                                        pm.permissionId,
                                        e.target.checked
                                      )
                                    }
                                    disabled={loading}
                                    size="small"
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                            {parent.children?.map((child) => (
                              <TableRow key={child.menuId}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ ml: 3 }}>
                                    ├─ {child.menuNm}
                                  </Typography>
                                </TableCell>
                                {permissions.map((pm) => (
                                  <TableCell
                                    key={pm.permissionId}
                                    align="center"
                                  >
                                    <Checkbox
                                      checked={hasPermission(
                                        child.menuId,
                                        pm.permissionId
                                      )}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          child.menuId,
                                          pm.permissionId,
                                          e.target.checked
                                        )
                                      }
                                      disabled={loading}
                                      size="small"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    권한을 설정할 역할을 먼저 선택해주세요.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>

        {/* 권한 해제 확인 */}
        <ConfirmDialog
          open={confirmRevoke.open}
          onClose={() => setConfirmRevoke({ open: false })}
          title="권한 해제"
          message="선택한 권한을 해제하시겠습니까?"
          confirmText="해제"
          onConfirm={async () => {
            try {
              if (confirmRevoke.rp) {
                await handlePermissionChange(
                  confirmRevoke.rp.menuId,
                  confirmRevoke.rp.permissionId,
                  false
                );
              }
            } catch (err: any) {
              const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                '권한 해제 중 오류가 발생했습니다.';
              setError(`권한 해제 오류: ${errorMsg}`);
              showToast({
                message: `권한 해제 오류: ${errorMsg}`,
                severity: 'error',
              });
            } finally {
              setConfirmRevoke({ open: false });
            }
          }}
        />
      </Box>
    </ProtectedRoute>
  );
};

export default PermissionManagement;
