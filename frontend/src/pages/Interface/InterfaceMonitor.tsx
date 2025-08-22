import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@tanstack/react-query';
import { interfaceLogService } from '../../services/interfaceLogService';
import { InterfaceLog } from '../../types';
import InterfaceLogDetailModal from '../../components/Interface/InterfaceLogDetailModal';

const InterfaceMonitor: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLogNo, setSelectedLogNo] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  const {
    data: interfaceLogDetail,
  } = useQuery({
    queryKey: ['interfaceLogDetail', selectedLogNo],
    queryFn: () => interfaceLogService.getInterfaceLogDetail(selectedLogNo!),
    enabled: !!selectedLogNo && detailModalOpen,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    setPage(0);
  };

  const handleDetailClick = (logNo: number) => {
    setSelectedLogNo(logNo);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedLogNo(null);
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

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '-';
    if (dateTimeStr.length === 14) {
      // YYYYMMDDHHMMSS 형식
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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        인터페이스 로그 모니터
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              placeholder="검색어를 입력하세요"
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
              sx={{ width: 300 }}
            />
            <Box>
              <Chip
                icon={<RefreshIcon />}
                label="새로고침"
                onClick={() => refetch()}
                color="primary"
                variant="outlined"
                clickable
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

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

      {interfaceLogsData && !isLoading && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    로그번호
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    인터페이스명
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    시작시간
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    종료시간
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    결과상태
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold' }}>
                    상세보기
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interfaceLogsData.content.map((log: InterfaceLog) => (
                  <TableRow key={log.logNo} hover>
                    <TableCell align="center">{log.logNo}</TableCell>
                    <TableCell align="center">{log.interfaceName}</TableCell>
                    <TableCell align="center">
                      {formatDateTime(log.startTime)}
                    </TableCell>
                    <TableCell align="center">
                      {formatDateTime(log.endTime)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={log.resultStatus}
                        color={getStatusColor(log.resultStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleDetailClick(log.logNo)}
                      >
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {interfaceLogsData.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={interfaceLogsData.totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </Paper>
      )}

      {/* Detail Modal */}
      <InterfaceLogDetailModal
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        interfaceLog={interfaceLogDetail}
      />
    </Box>
  );
};

export default InterfaceMonitor;
