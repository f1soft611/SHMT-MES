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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Computer as ComputerIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import {
  LoginHistory,
  LoginHistorySearchParams,
  loginHistoryService,
} from '../../services/admin/loginHistoryService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { useToast } from '../../components/common/Feedback/ToastProvider';
import { Divider } from '@mui/material';

const LoginHistoryManagement: React.FC = () => {
  const [loginHistories, setLoginHistories] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<LoginHistory | null>(
    null
  );

  const { showToast } = useToast();

  // 검색 조건
  const [searchParams, setSearchParams] = useState<LoginHistorySearchParams>({
    searchStartDt: '',
    searchEndDt: '',
    searchUserId: '',
    searchUserName: '',
    searchLoginResult: '',
  });

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  // 로그인 이력 목록 조회
  const fetchLoginHistories = async () => {
    setLoading(true);
    try {
      const response = await loginHistoryService.getLoginHistoryList({
        ...searchParams,
        pageIndex: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });

      console.log('로그인 이력 조회 응답:', response);
      setLoginHistories(response.loginHistoryList || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '로그인 이력 조회에 실패했습니다.';
      setError(errorMessage);
      showToast({ message: errorMessage, severity: 'error' });
      console.error('로그인 이력 조회 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize]);

  // 검색 처리
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchLoginHistories();
  };

  // 검색 조건 초기화
  const handleReset = () => {
    setSearchParams({
      searchStartDt: '',
      searchEndDt: '',
      searchUserId: '',
      searchUserName: '',
      searchLoginResult: '',
    });
    setPaginationModel({ page: 0, pageSize: 10 });
  };

  // 상세 조회
  const handleViewDetail = async (loginHistoryId: number) => {
    try {
      const history = await loginHistoryService.getLoginHistoryDetail(
        loginHistoryId
      );
      setSelectedHistory(history);
      setDetailOpen(true);
    } catch (err) {
      showToast({
        message: '로그인 이력 상세 조회에 실패했습니다.',
        severity: 'error',
      });
    }
  };

  // 테이블 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'loginHistoryId',
      headerName: '이력ID',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'userId',
      headerName: '사용자ID',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'userName',
      headerName: '사용자명',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'loginDt',
      headerName: '로그인 일시',
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'loginType',
      headerName: '로그인 타입',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value === 'JWT' ? <VpnKeyIcon /> : <ComputerIcon />}
          label={params.value}
          size="small"
          color={params.value === 'JWT' ? 'primary' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'loginResult',
      headerName: '로그인 결과',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value === 'Y' ? <CheckCircleIcon /> : <CancelIcon />}
          label={params.value === 'Y' ? '성공' : '실패'}
          size="small"
          color={params.value === 'Y' ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'loginIp',
      headerName: '로그인 IP',
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'sessionTime',
      headerName: '세션시간(분)',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleViewDetail(params.row.loginHistoryId)}
          color="primary"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission="read">
      <Box sx={{ width: '100%', height: '100%' }}>
        <PageHeader
          title=""
          crumbs={[{ label: '시스템 관리' }, { label: '로그인 이력 관리' }]}
        />

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

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
                label="시작 일자"
                size="small"
                type="date"
                value={searchParams.searchStartDt}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    searchStartDt: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
                label="종료 일자"
                size="small"
                type="date"
                value={searchParams.searchEndDt}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    searchEndDt: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
                label="사용자 ID"
                size="small"
                value={searchParams.searchUserId}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    searchUserId: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <TextField
                fullWidth
                label="사용자명"
                size="small"
                value={searchParams.searchUserName}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    searchUserName: e.target.value,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>로그인 결과</InputLabel>
                <Select
                  value={searchParams.searchLoginResult}
                  label="로그인 결과"
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      searchLoginResult: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">성공</MenuItem>
                  <MenuItem value="N">실패</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleReset}>
              초기화
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              검색
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ height: 'calc(100vh - 380px)', width: '100%' }}>
          <DataTable
            rows={loginHistories}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.loginHistoryId}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={totalCount}
          />
        </Paper>

        {/* 상세 다이얼로그 */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>로그인 이력 상세</DialogTitle>
          <Divider />
          <DialogContent>
            {selectedHistory && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      이력 ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedHistory.loginHistoryId}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      사용자 ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedHistory.userId}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      사용자명
                    </Typography>
                    <Typography variant="body1">
                      {selectedHistory.userName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      로그인 일시
                    </Typography>
                    <Typography variant="body1">
                      {selectedHistory.loginDt}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      로그인 타입
                    </Typography>
                    <Chip
                      icon={
                        selectedHistory.loginType === 'JWT' ? (
                          <VpnKeyIcon />
                        ) : (
                          <ComputerIcon />
                        )
                      }
                      label={selectedHistory.loginType}
                      size="small"
                      color={
                        selectedHistory.loginType === 'JWT'
                          ? 'primary'
                          : 'default'
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      로그인 결과
                    </Typography>
                    <Chip
                      icon={
                        selectedHistory.loginResult === 'Y' ? (
                          <CheckCircleIcon />
                        ) : (
                          <CancelIcon />
                        )
                      }
                      label={
                        selectedHistory.loginResult === 'Y' ? '성공' : '실패'
                      }
                      size="small"
                      color={
                        selectedHistory.loginResult === 'Y'
                          ? 'success'
                          : 'error'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      로그인 IP
                    </Typography>
                    <Typography variant="body1">
                      {selectedHistory.loginIp}
                    </Typography>
                  </Grid>
                  {selectedHistory.failReason && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        실패 사유
                      </Typography>
                      <Typography variant="body1" color="error">
                        {selectedHistory.failReason}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      사용자 에이전트
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {selectedHistory.userAgent}
                    </Typography>
                  </Grid>
                  {selectedHistory.logoutDt && (
                    <>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          로그아웃 일시
                        </Typography>
                        <Typography variant="body1">
                          {selectedHistory.logoutDt}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          세션 유지 시간
                        </Typography>
                        <Typography variant="body1">
                          {selectedHistory.sessionTime}분
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
};

export default LoginHistoryManagement;
