import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { interfaceLogService } from '../../services/interfaceLogService';
import { InterfaceLog } from '../../types';
import Pagination from '../../components/common/Pagination/Pagination';

const InterfaceLogCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  transition: 'box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const LogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const LogInfo = styled(Box)({
  flex: 1,
});

const LogMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    width: '100%',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  minWidth: 80,
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const MoreButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '6px 12px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const DataCountBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 16,
}));

const InterfaceMonitor: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLog, setSelectedLog] = useState<InterfaceLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const {
    data: interfaceLogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['interfaceLogs', page, rowsPerPage, searchKeyword],
    queryFn: () =>
      interfaceLogService.getInterfaceLogs(page, rowsPerPage, searchKeyword),
    staleTime: 5 * 60 * 1000, // 5분
  });

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    setPage(0);
  };

  const handleCardClick = (log: InterfaceLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon fontSize="small" />;
      case 'FAILED':
        return <ErrorIcon fontSize="small" />;
      case 'PENDING':
        return <PendingIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '-';
    if (dateTimeStr.length === 14) {
      const year = dateTimeStr.substr(0, 4);
      const month = dateTimeStr.substr(4, 2);
      const day = dateTimeStr.substr(6, 2);
      const hour = dateTimeStr.substr(8, 2);
      const minute = dateTimeStr.substr(10, 2);
      const second = dateTimeStr.substr(12, 2);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    return dateTimeStr;
  };

  const formatProcessingTime = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}초`;
  };

  const getInterfaceTypeCounts = () => {
    if (!interfaceLogsData?.content) return {};
    
    const counts: { [key: string]: number } = {};
    interfaceLogsData.content.forEach(log => {
      counts[log.interfaceName] = (counts[log.interfaceName] || 0) + 1;
    });
    return counts;
  };

  const getStatusCounts = () => {
    if (!interfaceLogsData?.content) return { SUCCESS: 0, FAILED: 0, PENDING: 0 };
    
    const counts = { SUCCESS: 0, FAILED: 0, PENDING: 0 };
    interfaceLogsData.content.forEach(log => {
      counts[log.resultStatus] = (counts[log.resultStatus] || 0) + 1;
    });
    return counts;
  };

  const interfaceTypes = getInterfaceTypeCounts();
  const statusCounts = getStatusCounts();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        인터페이스 로그 모니터
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  인터페이스 현황
                </Typography>
                <MoreButton
                  variant="text"
                  onClick={() => refetch()}
                  startIcon={<RefreshIcon />}
                >
                  새로고침
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  전체 로그:
                </Typography>
                <Chip
                  label={`${interfaceLogsData?.totalElements || 0}건`}
                  size="small"
                  color="primary"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  성공:
                </Typography>
                <Chip
                  label={`${statusCounts.SUCCESS}건`}
                  size="small"
                  color="success"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  실패:
                </Typography>
                <Chip
                  label={`${statusCounts.FAILED}건`}
                  size="small"
                  color="error"
                />
              </DataCountBox>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(interfaceTypes).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type}: ${count}건`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                검색
              </Typography>
              <TextField
                fullWidth
                placeholder="인터페이스명으로 검색"
                value={searchKeyword}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* Interface Logs */}
      {interfaceLogsData && !isLoading && (
        <Box>
          {interfaceLogsData.content.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    검색 결과가 없습니다.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            interfaceLogsData.content.map((log: InterfaceLog) => (
              <InterfaceLogCard key={log.logNo} onClick={() => handleCardClick(log)}>
                <CardContent>
                  <LogHeader>
                    <LogInfo>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        {getStatusIcon(log.resultStatus)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {log.interfaceName}
                        </Typography>
                        <StatusChip
                          label={log.resultStatus}
                          color={getStatusColor(log.resultStatus) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        로그 번호: #{log.logNo}
                      </Typography>
                      {log.detailMessage && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px'
                          }}
                        >
                          {log.detailMessage}
                        </Typography>
                      )}
                    </LogInfo>
                    <LogMeta>
                      <Typography variant="caption" color="text.secondary">
                        시작: {formatDateTime(log.startTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        종료: {formatDateTime(log.endTime)}
                      </Typography>
                      {log.processingTime !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          처리시간: {formatProcessingTime(log.processingTime)}
                        </Typography>
                      )}
                      {log.recordCount !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          처리건수: {log.recordCount}건
                        </Typography>
                      )}
                    </LogMeta>
                  </LogHeader>
                </CardContent>
              </InterfaceLogCard>
            ))
          )}

          {/* Pagination */}
          <Box mt={3}>
            <Pagination
              currentPage={page}
              totalPages={interfaceLogsData.totalPages}
              onPageChange={handleChangePage}
              pageSize={rowsPerPage}
              onPageSizeChange={handleChangeRowsPerPage}
              totalElements={interfaceLogsData.totalElements}
            />
          </Box>
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedLog && getStatusIcon(selectedLog.resultStatus)}
            인터페이스 로그 상세정보
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    로그 번호
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    #{selectedLog.logNo}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    인터페이스명
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLog.interfaceName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    시작시간
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDateTime(selectedLog.startTime)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    종료시간
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDateTime(selectedLog.endTime)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    결과상태
                  </Typography>
                  <Box mb={2}>
                    <StatusChip
                      label={selectedLog.resultStatus}
                      color={getStatusColor(selectedLog.resultStatus) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }} component="div">
                  <Typography variant="subtitle2" color="text.secondary">
                    처리시간
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatProcessingTime(selectedLog.processingTime)}
                  </Typography>
                </Grid>
                {selectedLog.recordCount !== undefined && (
                  <Grid size={{ xs: 6 }} component="div">
                    <Typography variant="subtitle2" color="text.secondary">
                      처리건수
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.recordCount}건
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              {selectedLog.detailMessage && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    상세 메시지
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        {selectedLog.detailMessage}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {selectedLog.errorMessage && (
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    오류 메시지
                  </Typography>
                  <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="body2" color="error">
                        {selectedLog.errorMessage}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterfaceMonitor;
