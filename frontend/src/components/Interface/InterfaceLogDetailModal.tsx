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
  Tabs,
  Tab,
} from '@mui/material';
import { InterfaceLog } from '../../types';
import JsonDataDisplay from './JsonDataDisplay';

interface InterfaceLogDetailModalProps {
  open: boolean;
  onClose: () => void;
  interfaceLog?: InterfaceLog;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

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
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  const renderDataDisplay = (data: string | undefined, title: string) => {
    if (!data) return null;
    return <JsonDataDisplay data={data} title={title} />;
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
            <Box>
              {(interfaceLog.requestData || interfaceLog.responseData) && (
                <Box>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="data tabs">
                    {interfaceLog.requestData && (
                      <Tab label="요청 데이터" id="data-tab-0" aria-controls="data-tabpanel-0" />
                    )}
                    {interfaceLog.responseData && (
                      <Tab 
                        label="응답 데이터" 
                        id={`data-tab-${interfaceLog.requestData ? 1 : 0}`} 
                        aria-controls={`data-tabpanel-${interfaceLog.requestData ? 1 : 0}`} 
                      />
                    )}
                  </Tabs>

                  {interfaceLog.requestData && (
                    <TabPanel value={tabValue} index={0}>
                      {renderDataDisplay(interfaceLog.requestData, '요청 데이터')}
                    </TabPanel>
                  )}

                  {interfaceLog.responseData && (
                    <TabPanel value={tabValue} index={interfaceLog.requestData ? 1 : 0}>
                      {renderDataDisplay(interfaceLog.responseData, '응답 데이터')}
                    </TabPanel>
                  )}
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
                  {renderDataDisplay(interfaceLog.requestData, '요청 데이터')}
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