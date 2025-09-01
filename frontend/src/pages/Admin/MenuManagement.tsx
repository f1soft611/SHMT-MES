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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  MenuInfo,
  permissionService,
} from '../../services/admin/permissionService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuInfo | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const [formData, setFormData] = useState({
    menuNm: '',
    menuDc: '',
    parentMenuId: '',
    menuOrdr: 0,
    menuUrl: '',
    iconNm: '',
    useAt: 'Y',
  });

  const iconOptions = [
    'Dashboard',
    'Settings',
    'Assignment',
    'Factory',
    'Monitor',
    'AdminPanelSettings',
    'Security',
    'Menu',
    'People',
    'Build',
  ];

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await permissionService.getMenus();
      setMenus(result);
    } catch (err: any) {
      setError(err.message || '메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleAdd = () => {
    setEditingMenu(null);
    setFormData({
      menuNm: '',
      menuDc: '',
      parentMenuId: '',
      menuOrdr: 0,
      menuUrl: '',
      iconNm: '',
      useAt: 'Y',
    });
    setOpen(true);
  };

  const handleEdit = (menu: MenuInfo) => {
    setEditingMenu(menu);
    setFormData({
      menuNm: menu.menuNm,
      menuDc: menu.menuDc || '',
      parentMenuId: menu.parentMenuId || '',
      menuOrdr: menu.menuOrdr,
      menuUrl: menu.menuUrl || '',
      iconNm: menu.iconNm || '',
      useAt: menu.useAt,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingMenu) {
        await permissionService.updateMenu(editingMenu.menuId, formData);
      } else {
        await permissionService.createMenu(formData);
      }
      setOpen(false);
      await loadMenus();
    } catch (err: any) {
      setError(err.message || '메뉴 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      await permissionService.deleteMenu(menuId);
      await loadMenus();
    } catch (err: any) {
      setError(err.message || '메뉴 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // 메뉴 계층 구조 구성
  const buildMenuHierarchy = () => {
    const parentMenus = menus.filter((menu) => !menu.parentMenuId);
    const childMenus = menus.filter((menu) => menu.parentMenuId);

    return parentMenus.map((parent) => ({
      ...parent,
      children: childMenus.filter(
          (child) => child.parentMenuId === parent.menuId
      ),
    }));
  };

  const menuHierarchy = buildMenuHierarchy();

  return (
      <ProtectedRoute requiredPermission="write">
        <Box sx={{ p: 3 }}>
          <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
          >
            <Typography variant="h4" component="h1">
              메뉴 관리
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                disabled={loading}
            >
              메뉴 추가
            </Button>
          </Box>

          {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>메뉴명</TableCell>
                  <TableCell>설명</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>순서</TableCell>
                  <TableCell>아이콘</TableCell>
                  <TableCell>사용여부</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menuHierarchy.map((parent) => (
                    <React.Fragment key={parent.menuId}>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {parent.hasChildren && (
                                <IconButton
                                    size="small"
                                    onClick={() => toggleExpand(parent.menuId)}
                                >
                                  {expandedMenus[parent.menuId] ? (
                                      <ExpandLessIcon />
                                  ) : (
                                      <ExpandMoreIcon />
                                  )}
                                </IconButton>
                            )}
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold', ml: 1 }}
                            >
                              {parent.menuNm}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{parent.menuDc}</TableCell>
                        <TableCell>{parent.menuUrl}</TableCell>
                        <TableCell>{parent.menuOrdr}</TableCell>
                        <TableCell>{parent.iconNm}</TableCell>
                        <TableCell>
                          <Chip
                              label={parent.useAt === 'Y' ? '사용' : '미사용'}
                              color={parent.useAt === 'Y' ? 'success' : 'default'}
                              size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                              size="small"
                              onClick={() => handleEdit(parent)}
                              disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                              size="small"
                              onClick={() => handleDelete(parent.menuId)}
                              disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {expandedMenus[parent.menuId] &&
                          parent.children?.map((child) => (
                              <TableRow key={child.menuId}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ ml: 6 }}>
                                    ├─ {child.menuNm}
                                  </Typography>
                                </TableCell>
                                <TableCell>{child.menuDc}</TableCell>
                                <TableCell>{child.menuUrl}</TableCell>
                                <TableCell>{child.menuOrdr}</TableCell>
                                <TableCell>{child.iconNm}</TableCell>
                                <TableCell>
                                  <Chip
                                      label={child.useAt === 'Y' ? '사용' : '미사용'}
                                      color={child.useAt === 'Y' ? 'success' : 'default'}
                                      size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                      size="small"
                                      onClick={() => handleEdit(child)}
                                      disabled={loading}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                      size="small"
                                      onClick={() => handleDelete(child.menuId)}
                                      disabled={loading}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                          ))}
                    </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 메뉴 추가/수정 다이얼로그 */}
          <Dialog
              open={open}
              onClose={() => setOpen(false)}
              maxWidth="sm"
              fullWidth
          >
            <DialogTitle>{editingMenu ? '메뉴 수정' : '메뉴 추가'}</DialogTitle>
            <DialogContent>
              <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
              >
                <TextField
                    label="메뉴명"
                    value={formData.menuNm}
                    onChange={(e) =>
                        setFormData({ ...formData, menuNm: e.target.value })
                    }
                    required
                    fullWidth
                />
                <TextField
                    label="메뉴 설명"
                    value={formData.menuDc}
                    onChange={(e) =>
                        setFormData({ ...formData, menuDc: e.target.value })
                    }
                    fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="parent-menu-label">상위 메뉴</InputLabel>
                  <Select
                      labelId="parent-menu-label"
                      id="parent-menu"
                      value={formData.parentMenuId}
                      onChange={(e) =>
                          setFormData({ ...formData, parentMenuId: e.target.value })
                      }
                      label="상위 메뉴"   // ⭐ 중요: InputLabel과 매칭
                  >
                    <MenuItem value="">없음 (최상위 메뉴)</MenuItem>
                    {menus
                        .filter((m) => !m.parentMenuId)
                        .map((menu) => (
                            <MenuItem key={menu.menuId} value={menu.menuId}>
                              {menu.menuNm}
                            </MenuItem>
                        ))}
                  </Select>
                </FormControl>
                <TextField
                    label="메뉴 URL"
                    value={formData.menuUrl}
                    onChange={(e) =>
                        setFormData({ ...formData, menuUrl: e.target.value })
                    }
                    fullWidth
                />
                <TextField
                    label="순서"
                    type="number"
                    value={formData.menuOrdr}
                    onChange={(e) =>
                        setFormData({
                          ...formData,
                          menuOrdr: parseInt(e.target.value) || 0,
                        })
                    }
                    fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="icon-label">아이콘</InputLabel>
                  <Select
                      labelId="icon-label"
                      id="icon"
                      value={formData.iconNm}
                      onChange={(e) =>
                          setFormData({ ...formData, iconNm: e.target.value })
                      }
                      label="아이콘"
                  >
                    {iconOptions.map((icon) => (
                        <MenuItem key={icon} value={icon}>
                          {icon}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="use-label">사용여부</InputLabel>
                  <Select
                      labelId="use-label"
                      id="use"
                      value={formData.useAt}
                      onChange={(e) =>
                          setFormData({ ...formData, useAt: e.target.value })
                      }
                      label="사용여부"
                  >
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={loading || !formData.menuNm}
              >
                {editingMenu ? '수정' : '추가'}
              </Button>
              <Button onClick={() => setOpen(false)}>취소</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ProtectedRoute>
  );
};

export default MenuManagement;
