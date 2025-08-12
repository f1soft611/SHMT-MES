import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { InterfaceLog } from '../../types';

interface InterfaceLogDetailModalProps {
  open: boolean;
  onClose: () => void;
  interfaceLog?: InterfaceLog;
}

const InterfaceLogDetailModal: React.FC<InterfaceLogDetailModalProps> = ({
  open,
  onClose,
  interfaceLog,
}) => {
  const formatDateTime = (dateTimeStr?: string) => {
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

  const formatJsonData = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return jsonString;
    }
  };

  if (!interfaceLog) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">인터페이스 로그 상세 정보</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 기본 정보 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  로그번호:
                </Typography>
                <Typography variant="body2">{interfaceLog.logNo}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  인터페이스명:
                </Typography>
                <Typography variant="body2">{interfaceLog.interfaceName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  시작시간:
                </Typography>
                <Typography variant="body2">{formatDateTime(interfaceLog.startTime)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  종료시간:
                </Typography>
                <Typography variant="body2">{formatDateTime(interfaceLog.endTime)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                  결과상태:
                </Typography>
                <Chip
                  label={interfaceLog.resultStatus}
                  color={getStatusColor(interfaceLog.resultStatus) as any}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 성공한 경우: 요청/응답 데이터 표시 */}
          {interfaceLog.resultStatus === 'SUCCESS' && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {interfaceLog.requestData && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    요청 데이터 (JSON)
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      padding: 2,
                      borderRadius: 1,
                      border: '1px solid #ddd',
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
                      {formatJsonData(interfaceLog.requestData)}
                    </pre>
                  </Box>
                </Box>
              )}

              {interfaceLog.responseData && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    응답 데이터 (JSON)
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      padding: 2,
                      borderRadius: 1,
                      border: '1px solid #ddd',
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
                      {formatJsonData(interfaceLog.responseData)}
                    </pre>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* 실패한 경우: 에러 메시지 표시 */}
          {interfaceLog.resultStatus === 'FAILED' && (
            <Box>
              <Typography variant="h6" gutterBottom color="error">
                오류 정보
              </Typography>
              <Alert severity="error">
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {interfaceLog.errorMessage || '오류 메시지가 없습니다.'}
                </Typography>
              </Alert>
              
              {/* 실패한 경우에도 요청 데이터가 있다면 표시 */}
              {interfaceLog.requestData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    요청 데이터
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      padding: 2,
                      borderRadius: 1,
                      border: '1px solid #ddd',
                      maxHeight: 300,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
                      {formatJsonData(interfaceLog.requestData)}
                    </pre>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* PENDING 상태인 경우 */}
          {interfaceLog.resultStatus === 'PENDING' && (
            <Box>
              <Alert severity="info">
                <Typography variant="body2">
                  인터페이스가 처리 중입니다. 잠시 후 다시 확인해 주세요.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterfaceLogDetailModal;