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
  Pagination,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import {
  User,
  UserFormData,
  UserSearchParams,
  userService,
} from '../../services/admin/userService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 검색 및 페이징
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageIndex: 1,
    searchCnd: '',
    searchWrd: '',
  });
  const [pagination, setPagination] = useState({
    currentPageNo: 1,
    totalRecordCount: 0,
    recordCountPerPage: 10,
    pageSize: 10,
  });

  // 코드 데이터
  const [codeData, setCodeData] = useState<{
    passwordHint_result: Array<{ code: string; codeNm: string }>;
    sexdstnCode_result: Array<{ code: string; codeNm: string }>;
    mberSttus_result: Array<{ code: string; codeNm: string }>;
    groupId_result: Array<{ code: string; codeNm: string }>;
  }>({
    passwordHint_result: [],
    sexdstnCode_result: [],
    mberSttus_result: [],
    groupId_result: [],
  });

  // 폼 데이터
  const [formData, setFormData] = useState<UserFormData>({
    mberId: '',
    mberNm: '',
    password: '',
    passwordHint: '',
    passwordCnsr: '',
    mberSttus: 'A',
    sexdstnCode: '',
    adres: '',
    detailAdres: '',
    areaNo: '',
    middleTelno: '',
    endTelno: '',
    moblphonNo: '',
    mberFxnum: '',
    ihidnum: '',
    groupId: '',
    email: '',
  });

  const searchConditions = [
    { value: '1', label: '사용자ID' },
    { value: '2', label: '사용자명' },
    { value: '3', label: '이메일' },
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getUsers(searchParams);

      setUsers(result.resultList || []);
      setPagination(result.paginationInfo);

      // 첫 로드 시 코드 데이터도 함께 설정
      if (result.mberSttus_result) {
        setCodeData({
          passwordHint_result: result.passwordHint_result || [],
          sexdstnCode_result: result.sexdstnCode_result || [],
          mberSttus_result: result.mberSttus_result || [],
          groupId_result: result.groupId_result || [],
        });
      }
    } catch (err: any) {
      setError(err.message || '사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const result = await userService.getUserFormData();
      setCodeData(result);
    } catch (err: any) {
      setError(err.message || '폼 데이터를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      pageIndex: 1,
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setSearchParams({
      ...searchParams,
      pageIndex: value,
    });
  };

  const handleAdd = async () => {
    setEditingUser(null);
    setFormData({
      mberId: '',
      mberNm: '',
      password: '',
      passwordHint: '',
      passwordCnsr: '',
      mberSttus: 'A',
      sexdstnCode: '',
      adres: '',
      detailAdres: '',
      areaNo: '',
      middleTelno: '',
      endTelno: '',
      moblphonNo: '',
      mberFxnum: '',
      ihidnum: '',
      groupId: '',
      email: '',
    });

    // 코드 데이터가 없으면 로드
    if (codeData.mberSttus_result.length === 0) {
      await loadFormData();
    }

    setOpen(true);
  };

  const handleEdit = async (user: User) => {
    setEditingUser(user);

    // 사용자 상세 정보 로드
    try {
      setLoading(true);
      const userDetail = await userService.getUserDetail(user.uniqId);

      setFormData({
        mberId: userDetail.mberId,
        mberNm: userDetail.mberNm,
        password: '', // 보안상 빈값으로 시작
        passwordHint: userDetail.passwordHint || '',
        passwordCnsr: userDetail.passwordCnsr || '',
        mberSttus: userDetail.mberSttus,
        sexdstnCode: userDetail.sexdstnCode || '',
        adres: userDetail.adres || '',
        detailAdres: userDetail.detailAdres || '',
        areaNo: userDetail.areaNo || '',
        middleTelno: userDetail.middleTelno || '',
        endTelno: userDetail.endTelno || '',
        moblphonNo: userDetail.moblphonNo || '',
        mberFxnum: userDetail.mberFxnum || '',
        ihidnum: userDetail.ihidnum || '',
        groupId: userDetail.groupId || '',
        email: userDetail.email || '',
      });

      // 코드 데이터가 없으면 로드
      if (codeData.mberSttus_result.length === 0) {
        await loadFormData();
      }

      setOpen(true);
    } catch (err: any) {
      setError(err.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingUser) {
        // 수정
        await userService.updateUser({
          ...formData,
          uniqId: editingUser.uniqId,
        });
      } else {
        // 등록
        await userService.createUser(formData);
      }

      setOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || '사용자 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uniqId: string) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      await userService.deleteUser(uniqId);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || '사용자 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusItem = codeData.mberSttus_result.find(
      (item: any) => item.code === status
    );
    return statusItem ? statusItem.codeNm : status;
  };

  const getGroupLabel = (groupId: string) => {
    const groupItem = codeData.groupId_result.find(
      (item: any) => item.code === groupId
    );
    return groupItem ? groupItem.codeNm : groupId;
  };

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
            <Typography variant="h5">사용자 관리</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={loading}
          >
            사용자 추가
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 검색 영역 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>검색조건</InputLabel>
                <Select
                  value={searchParams.searchCnd}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      searchCnd: e.target.value,
                    })
                  }
                >
                  {searchConditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="검색어를 입력하세요"
                value={searchParams.searchWrd}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    searchWrd: e.target.value,
                  })
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                fullWidth
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 사용자 목록 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>사용자ID</TableCell>
                <TableCell>사용자명</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>그룹</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.uniqId}>
                    <TableCell>{user.mberId}</TableCell>
                    <TableCell>{user.mberNm}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user.mberSttus)}
                        color={user.mberSttus === 'A' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getGroupLabel(user.groupId || '')}</TableCell>
                    <TableCell>{user.sbscrbDe}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.uniqId)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? '로딩 중...' : '사용자가 없습니다.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이징 */}
        {pagination.totalRecordCount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(
                pagination.totalRecordCount / pagination.recordCountPerPage
              )}
              page={pagination.currentPageNo}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        )}

        {/* 사용자 추가/수정 다이얼로그 */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? '사용자 수정' : '사용자 추가'}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="사용자ID"
                    value={formData.mberId}
                    onChange={(e) =>
                      setFormData({ ...formData, mberId: e.target.value })
                    }
                    required
                    fullWidth
                    disabled={!!editingUser}
                    helperText={
                      editingUser ? '사용자ID는 수정할 수 없습니다' : ''
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="사용자명"
                    value={formData.mberNm}
                    onChange={(e) =>
                      setFormData({ ...formData, mberNm: e.target.value })
                    }
                    required
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="비밀번호"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    fullWidth
                    helperText={editingUser ? '변경 시에만 입력하세요' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>비밀번호 힌트</InputLabel>
                    <Select
                      value={formData.passwordHint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passwordHint: e.target.value,
                        })
                      }
                    >
                      {codeData.passwordHint_result.map((hint: any) => (
                        <MenuItem key={hint.code} value={hint.code}>
                          {hint.codeNm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="비밀번호 정답"
                    value={formData.passwordCnsr}
                    onChange={(e) =>
                      setFormData({ ...formData, passwordCnsr: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>사용자 상태</InputLabel>
                    <Select
                      value={formData.mberSttus}
                      onChange={(e) =>
                        setFormData({ ...formData, mberSttus: e.target.value })
                      }
                    >
                      {codeData.mberSttus_result.map((status: any) => (
                        <MenuItem key={status.code} value={status.code}>
                          {status.codeNm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>사용자 그룹</InputLabel>
                    <Select
                      value={formData.groupId}
                      onChange={(e) =>
                        setFormData({ ...formData, groupId: e.target.value })
                      }
                    >
                      {codeData.groupId_result.map((group: any) => (
                        <MenuItem key={group.code} value={group.code}>
                          {group.codeNm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="휴대폰번호"
                    value={formData.moblphonNo}
                    onChange={(e) =>
                      setFormData({ ...formData, moblphonNo: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading || !formData.mberId || !formData.mberNm}
            >
              {editingUser ? '수정' : '추가'}
            </Button>
            <Button onClick={() => setOpen(false)}>취소</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
};

export default UserManagement;
