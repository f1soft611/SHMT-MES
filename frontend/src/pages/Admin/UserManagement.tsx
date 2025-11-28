import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
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
  Chip,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  User,
  UserFormData,
  UserSearchParams,
  userService,
} from '../../services/admin/userService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import ConfirmDialog from '../../components/common/Feedback/ConfirmDialog';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    targetId?: string;
  }>({ open: false });
  const { showToast } = useToast();

  // 검색 상태 (입력값과 실제 적용값 분리)
  const [inputValues, setInputValues] = useState({
    searchCnd: '2',
    searchWrd: '',
  });

  // 실제 API 호출에 사용되는 검색 파라미터
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageIndex: 1,
    searchCnd: '2',
    searchWrd: '',
  });

  const [pagination, setPagination] = useState({
    currentPageNo: 1,
    totalRecordCount: 0,
    recordCountPerPage: 10,
    pageSize: 10,
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
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
    mberSttus: '',
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
      const message = err.message || '사용자 목록을 불러오는데 실패했습니다.';
      setError(message);
      showToast({ message, severity: 'error' });
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

  // 초기 로드만 수행 (처음 마운트 시에만)
  useEffect(() => {
    if (isInitialLoad) {
      loadUsers();
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    field: keyof typeof inputValues,
    value: string
  ) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    // 검색 버튼 클릭 시에만 실제 검색 수행
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    const newSearchParams = {
      pageIndex: 1,
      searchCnd: inputValues.searchCnd,
      searchWrd: inputValues.searchWrd,
    };
    setSearchParams(newSearchParams);

    // 검색 파라미터가 변경되었으므로 즉시 조회
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userService.getUsers(newSearchParams);

        setUsers(result.resultList || []);
        setPagination(result.paginationInfo);

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
    })();
  };

  const handlePageChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    const newSearchParams = {
      ...searchParams,
      pageIndex: newModel.page + 1,
    };
    setSearchParams(newSearchParams);

    // 페이지 변경 시 즉시 조회
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userService.getUsers(newSearchParams);

        setUsers(result.resultList || []);
        setPagination(result.paginationInfo);

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
    })();
  };

  const handleAdd = async () => {
    setEditingUser(null);

    // 코드 데이터가 없으면 로드
    if (codeData.mberSttus_result.length === 0) {
      await loadFormData();
    }

    // 기본 상태값 설정 (첫 번째 상태 코드 또는 빈 문자열)
    const defaultStatus =
      codeData.mberSttus_result.length > 0
        ? codeData.mberSttus_result[1].code
        : '';

    // 기본 그룹 설정 (첫 번째 그룹 코드 또는 빈 문자열)
    const defaultGroup =
      codeData.groupId_result.length > 0 ? codeData.groupId_result[1].code : '';

    setFormData({
      mberId: '',
      mberNm: '',
      password: '',
      passwordHint: '',
      passwordCnsr: '',
      mberSttus: defaultStatus,
      sexdstnCode: '',
      adres: '',
      detailAdres: '',
      areaNo: '',
      middleTelno: '',
      endTelno: '',
      moblphonNo: '',
      mberFxnum: '',
      ihidnum: '',
      groupId: defaultGroup,
      email: '',
    });

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
        showToast({ message: '사용자가 수정되었습니다.', severity: 'success' });
      } else {
        // 등록
        await userService.createUser(formData);
        showToast({ message: '사용자가 추가되었습니다.', severity: 'success' });
      }

      setOpen(false);
      // 저장 후 현재 검색 조건으로 다시 조회
      await loadUsers();
    } catch (err: any) {
      const message = err.message || '사용자 저장에 실패했습니다.';
      setError(message);
      showToast({ message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uniqId: string) => {
    try {
      setLoading(true);
      await userService.deleteUser(uniqId);
      showToast({ message: '사용자가 삭제되었습니다.', severity: 'success' });
      // 삭제 후 현재 검색 조건으로 다시 조회
      await loadUsers();
    } catch (err: any) {
      const message = err.message || '사용자 삭제에 실패했습니다.';
      setError(message);
      showToast({ message, severity: 'error' });
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

  const columns: GridColDef[] = [
    {
      field: 'mberId',
      headerName: '사용자ID',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'mberNm',
      headerName: '사용자명',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'mberSttus',
      headerName: '상태',
      flex: 0.8,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={params.value === 'A' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'groupId',
      headerName: '그룹',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (value) => getGroupLabel(value || ''),
    },
    {
      field: 'sbscrbDe',
      headerName: '가입일',
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="수정">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(params.row)}
                  disabled={loading}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="삭제">
              <span>
                <IconButton
                  size="small"
                  onClick={() =>
                    setConfirmDelete({
                      open: true,
                      targetId: params.row.uniqId,
                    })
                  }
                  disabled={loading}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="write">
      <Box>
        <PageHeader
          title=""
          crumbs={[{ label: '시스템 관리' }, { label: '사용자 관리' }]}
        />

        {/* 검색 영역 */}
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
                {searchConditions.map((condition) => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="검색어를 입력하세요"
              value={inputValues.searchWrd}
              sx={{ flex: 1, minWidth: 240 }}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              검색
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={loading}
            >
              사용자 추가
            </Button>
          </Stack>
        </Paper>

        {/* 사용자 목록 */}
        <DataTable
          rows={users}
          columns={columns}
          getRowId={(row) => row.uniqId}
          loading={loading}
          error={error}
          rowCount={pagination.totalRecordCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePageChange}
          pageSizeOptions={[5, 10, 25, 50]}
          onRefresh={loadUsers}
        />

        {/* 삭제 확인 다이얼로그 */}
        <ConfirmDialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false })}
          title="사용자 삭제"
          message="선택한 사용자를 삭제하시겠습니까?"
          confirmText="삭제"
          onConfirm={async () => {
            if (confirmDelete.targetId) {
              await handleDelete(confirmDelete.targetId);
            }
            setConfirmDelete({ open: false });
          }}
        />

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
          <DialogContent dividers>
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
                      label="비밀번호 힌트"
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
                  <FormControl fullWidth required>
                    <InputLabel>사용자 상태</InputLabel>
                    <Select
                      label="사용자 상태"
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
                  <FormControl fullWidth required>
                    <InputLabel>사용자 그룹</InputLabel>
                    <Select
                      label="사용자 그룹"
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
              disabled={
                loading ||
                !formData.mberId ||
                !formData.mberNm ||
                !formData.groupId
              }
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
