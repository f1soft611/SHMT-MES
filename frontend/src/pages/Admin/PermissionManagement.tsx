import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
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

const PermissionManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuInfo[]>([]);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RoleMenuPermission[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  // 기본 역할 그룹
  const roles = [
    { id: 1, name: 'ROLE_ADMIN (관리자)' },
    { id: 2, name: 'ROLE_USER (일반사용자)' },
    // {
    //   id: 3,
    //   name: 'ROLE_PRODUCTION_MANAGER (생산관리자)',
    // },
    // { id: 4, name: 'ROLE_PRODUCTION_USER (생산사용자)' },
    // { id: 5, name: 'ROLE_VIEWER (조회전용)' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [menusResult, permissionsResult] = await Promise.all([
        permissionService.getMenus(),
        permissionService.getPermissionTypes(),
      ]);

      setMenus(menusResult);
      setPermissions(permissionsResult);

      if (selectedRole) {
        const rolePermsResult = await permissionService.getRoleMenuPermissions(
          selectedRole
        );
        setRolePermissions(rolePermsResult);
      }
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRole]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handlePermissionChange = async (
    menuId: string,
    permissionId: string,
    granted: boolean
  ) => {
    if (!selectedRole) return;

    try {
      setLoading(true);

      if (granted) {
        // 권한 부여
        await permissionService.createRoleMenuPermission({
          groupId: selectedRole,
          menuId,
          permissionId,
          useAt: 'Y',
          frstRegisterId: 'ADMIN',
          lastUpdusrId: 'ADMIN',
        });
      } else {
        // 권한 제거
        await permissionService.deleteRoleMenuPermission(
          selectedRole,
          menuId,
          permissionId
        );
      }

      // 권한 목록 재로드
      const rolePermsResult = await permissionService.getRoleMenuPermissions(
        selectedRole
      );
      setRolePermissions(rolePermsResult);
    } catch (err: any) {
      setError(err.message || '권한 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (menuId: string, permissionId: string): boolean => {
    return rolePermissions.some(
      (rp) => rp.menuId === menuId && rp.permissionId === permissionId
    );
  };

  const getMenuHierarchy = () => {
    const parentMenus = menus.filter((menu) => !menu.parentMenuId);
    return parentMenus.map((parent) => ({
      ...parent,
      children: menus.filter((child) => child.parentMenuId === parent.menuId),
    }));
  };

  const menuHierarchy = getMenuHierarchy();

  return (
    <ProtectedRoute requiredPermission="write">
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5">권한 관리</Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* 역할 선택 */}
          <Box sx={{ width: { xs: '100%', md: '33%' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  역할 선택
                </Typography>
                <FormControl fullWidth>
                  {/* <InputLabel>역할</InputLabel> */}
                  <Select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* 권한 유형 정보 */}
            <Card sx={{ mt: 2 }}>
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
                          <DescriptionIcon /> // 또는 <TableChartIcon />
                        ) : (
                          <VisibilityIcon /> // 또는 <RemoveRedEyeIcon />
                        )
                      }
                      label={`${permission.permissionNm} (${permission.permissionLevel})`}
                      color={
                        permission.permissionLevel === 'write'
                          ? 'primary'
                          : permission.permissionLevel === 'excel'
                          ? 'success' // 또는 'secondary', 'info'
                          : 'default'
                      }
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>

          {/* 메뉴별 권한 설정 */}
          <Box sx={{ width: { xs: '100%', md: '67%' } }}>
            {selectedRole ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    메뉴별 권한 설정
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>메뉴</TableCell>
                          {permissions.map((permission) => (
                            <TableCell
                              key={permission.permissionId}
                              align="center"
                            >
                              {permission.permissionNm}
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
                              {permissions.map((permission) => (
                                <TableCell
                                  key={permission.permissionId}
                                  align="center"
                                >
                                  <Checkbox
                                    checked={hasPermission(
                                      parent.menuId,
                                      permission.permissionId
                                    )}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        parent.menuId,
                                        permission.permissionId,
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
                                {permissions.map((permission) => (
                                  <TableCell
                                    key={permission.permissionId}
                                    align="center"
                                  >
                                    <Checkbox
                                      checked={hasPermission(
                                        child.menuId,
                                        permission.permissionId
                                      )}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          child.menuId,
                                          permission.permissionId,
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
                    권한을 설정할 역할을 선택해주세요.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>

        {/* 현재 설정된 권한 목록 */}
        {selectedRole && rolePermissions.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                현재 설정된 권한
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>메뉴</TableCell>
                      <TableCell>권한</TableCell>
                      <TableCell>권한 레벨</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rolePermissions.map((rp) => (
                      <TableRow key={rp.roleMenuId}>
                        <TableCell>{rp.menuNm}</TableCell>
                        <TableCell>{rp.permissionNm}</TableCell>
                        <TableCell>
                          <Chip
                            label={rp.permissionLevel}
                            color={
                              rp.permissionLevel === 'write'
                                ? 'primary'
                                : rp.permissionLevel === 'excel'
                                ? 'success'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handlePermissionChange(
                                rp.menuId,
                                rp.permissionId,
                                false
                              )
                            }
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </ProtectedRoute>
  );
};

export default PermissionManagement;
