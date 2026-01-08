import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Stack,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Factory as FactoryIcon,
  Monitor as MonitorIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import {
  MenuInfo,
  permissionService,
} from '../../services/admin/permissionService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import ConfirmDialog from '../../components/common/Feedback/ConfirmDialog';

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuInfo | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    targetId?: string;
  }>({ open: false });
  const { showToast } = useToast();

  // 검색 상태 (입력값과 실제 적용값 분리)
  const [inputValues, setInputValues] = useState({
    searchCnd: '0', // 0: 메뉴명, 1: URL, 2: 설명
    searchWrd: '',
    useAt: '', // 전체/사용(Y)/미사용(N)
  });
  const [searchParams, setSearchParams] = useState({
    searchCnd: '0',
    searchWrd: '',
    useAt: '',
  });

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
    'VpnKey',
  ];

  const iconMap = useMemo<Record<string, React.ReactElement>>(
    () => ({
      Dashboard: <DashboardIcon fontSize="small" />,
      Settings: <SettingsIcon fontSize="small" />,
      Assignment: <AssignmentIcon fontSize="small" />,
      Factory: <FactoryIcon fontSize="small" />,
      Monitor: <MonitorIcon fontSize="small" />,
      AdminPanelSettings: <AdminPanelSettingsIcon fontSize="small" />,
      Security: <SecurityIcon fontSize="small" />,
      Menu: <MenuIcon fontSize="small" />,
      People: <PeopleIcon fontSize="small" />,
      Build: <BuildIcon fontSize="small" />,
      VpnKey: <VpnKeyIcon fontSize="small" />,
    }),
    []
  );

  const renderIcon = (name?: string) => iconMap[name || ''] || null;

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

  const handleInputChange = (
    field: keyof typeof inputValues,
    value: string
  ) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setSearchParams({ ...inputValues });
  };

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
        showToast({ message: '메뉴가 수정되었습니다.', severity: 'success' });
      } else {
        await permissionService.createMenu(formData);
        showToast({ message: '메뉴가 추가되었습니다.', severity: 'success' });
      }
      setOpen(false);
      await loadMenus();
    } catch (err: any) {
      setError(err.message || '메뉴 저장에 실패했습니다.');
      showToast({ message: '메뉴 저장에 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    try {
      setLoading(true);
      await permissionService.deleteMenu(menuId);
      showToast({ message: '메뉴가 삭제되었습니다.', severity: 'success' });
      await loadMenus();
    } catch (err: any) {
      setError(err.message || '메뉴 삭제에 실패했습니다.');
      showToast({ message: '메뉴 삭제에 실패했습니다.', severity: 'error' });
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

  // 검색 필터 적용
  const filteredMenus = useMemo(() => {
    const q = searchParams.searchWrd.trim().toLowerCase();
    const match = (v?: string) => (v || '').toLowerCase().includes(q);
    return menus.filter((m) => {
      if (searchParams.useAt && m.useAt !== searchParams.useAt) return false;
      if (!q) return true;
      if (searchParams.searchCnd === '0') return match(m.menuNm);
      if (searchParams.searchCnd === '1') return match(m.menuUrl);
      if (searchParams.searchCnd === '2') return match(m.menuDc);
      return true;
    });
  }, [menus, searchParams]);

  // 메뉴 계층 구조 구성 (검색 적용)
  const menuHierarchy = useMemo(() => {
    const parents = filteredMenus.filter((m) => !m.parentMenuId);
    const children = filteredMenus.filter((m) => m.parentMenuId);
    return parents.map((p) => ({
      ...p,
      children: children.filter((c) => c.parentMenuId === p.menuId),
    }));
  }, [filteredMenus]);

  return (
    <ProtectedRoute requiredPermission="read" matchMode="prefix">
      <Box>
        <PageHeader
          title=""
          crumbs={[{ label: '시스템 관리' }, { label: '메뉴 관리' }]}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 검색 영역 (기준정보 패턴 통일) */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            <FilterListIcon color="primary" />
            검색 필터
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={inputValues.searchCnd}
                label="검색 조건"
                onChange={(e) =>
                  handleInputChange('searchCnd', String(e.target.value))
                }
              >
                <MenuItem value="0">메뉴명</MenuItem>
                <MenuItem value="1">URL</MenuItem>
                <MenuItem value="2">설명</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, minWidth: 240 }}
              placeholder="검색어를 입력하세요"
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>사용여부</InputLabel>
              <Select
                value={inputValues.useAt}
                label="사용여부"
                onChange={(e) =>
                  handleInputChange('useAt', String(e.target.value))
                }
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="Y">사용</MenuItem>
                <MenuItem value="N">미사용</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={loading}
            >
              메뉴 추가
            </Button>
          </Stack>
        </Paper>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            // maxHeight: 600,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Table stickyHeader size="small">
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
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  메뉴명
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  설명
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  URL
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  순서
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  아이콘
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: '1px solid', borderRightColor: 'divider' }}
                >
                  사용여부
                </TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuHierarchy.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
              {menuHierarchy.map((parent) => (
                <React.Fragment key={parent.menuId}>
                  <TableRow hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {parent.children && parent.children.length > 0 && (
                          <Tooltip
                            title={
                              expandedMenus[parent.menuId] ? '접기' : '펼치기'
                            }
                          >
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
                          </Tooltip>
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
                    <TableCell align="center">{parent.menuOrdr}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        {renderIcon(parent.iconNm)}
                        <Typography variant="body2" color="text.secondary">
                          {parent.iconNm || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={parent.useAt === 'Y' ? '사용' : '미사용'}
                        color={parent.useAt === 'Y' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="수정">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(parent)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({
                                open: true,
                                targetId: parent.menuId,
                              })
                            }
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {expandedMenus[parent.menuId] &&
                    parent.children?.map((child) => (
                      <TableRow key={child.menuId} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ ml: 6 }}>
                            ├─ {child.menuNm}
                          </Typography>
                        </TableCell>
                        <TableCell>{child.menuDc}</TableCell>
                        <TableCell>{child.menuUrl}</TableCell>
                        <TableCell align="center">{child.menuOrdr}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}
                          >
                            {renderIcon(child.iconNm)}
                            <Typography variant="body2" color="text.secondary">
                              {child.iconNm || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={child.useAt === 'Y' ? '사용' : '미사용'}
                            color={child.useAt === 'Y' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="수정">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(child)}
                                disabled={loading}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="삭제">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setConfirmDelete({
                                    open: true,
                                    targetId: child.menuId,
                                  })
                                }
                                disabled={loading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 삭제 확인 다이얼로그 */}
        <ConfirmDialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false })}
          title="메뉴 삭제"
          message="선택한 메뉴를 삭제하시겠습니까?"
          confirmText="삭제"
          onConfirm={async () => {
            if (confirmDelete.targetId) {
              await handleDelete(confirmDelete.targetId);
            }
            setConfirmDelete({ open: false });
          }}
        />

        {/* 메뉴 추가/수정 다이얼로그 */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingMenu ? '메뉴 수정' : '메뉴 추가'}</DialogTitle>
          <DialogContent dividers>
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
                  label="상위 메뉴" // ⭐ 중요: InputLabel과 매칭
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
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {renderIcon(icon)}
                      </ListItemIcon>
                      <ListItemText primary={icon} />
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
