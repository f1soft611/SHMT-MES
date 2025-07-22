import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

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

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: '8px 0',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 4,
  },
}));

const DataCountBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 16,
}));

const ProgressBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 4,
});

const WelcomeBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 24,
  padding: 16,
  backgroundColor: theme.palette.primary.main,
  borderRadius: 12,
  color: 'white',
}));

// 현재 시간 기준 목 데이터 - 반도체 테스트 프로브 제조업체
const mockData = {
  productionOrders: [
    {
      id: 'PO001',
      orderNo: 'PRB-2025-0722-001',
      itemName: 'WRNP 150-175-640',
      quantity: 5000,
      status: '진행중',
      progress: 85,
      dueDate: '2025-07-23',
      customer: 'Samsung Electronics',
      createdAt: '2025-07-22 05:30',
      operator: 'socra710',
    },
    {
      id: 'PO002',
      orderNo: 'PRB-2025-0722-002',
      itemName: 'VRNP 200-250-800',
      quantity: 3000,
      status: '대기',
      progress: 0,
      dueDate: '2025-07-24',
      customer: 'SK Hynix',
      createdAt: '2025-07-22 04:15',
      operator: 'socra710',
    },
    {
      id: 'PO003',
      orderNo: 'PRB-2025-0721-003',
      itemName: 'CRNP 120-150-600',
      quantity: 2500,
      status: '완료',
      progress: 100,
      dueDate: '2025-07-22',
      customer: 'TSMC',
      createdAt: '2025-07-21 16:20',
      operator: 'kim_probe',
    },
    {
      id: 'PO004',
      orderNo: 'PRB-2025-0722-004',
      itemName: 'WRNP 100-125-500',
      quantity: 4000,
      status: '진행중',
      progress: 35,
      dueDate: '2025-07-25',
      customer: 'MediaTek',
      createdAt: '2025-07-22 03:45',
      operator: 'lee_wire',
    },
    {
      id: 'PO005',
      orderNo: 'PRB-2025-0720-005',
      itemName: 'VRNP 300-350-1000',
      quantity: 1500,
      status: '진행중',
      progress: 95,
      dueDate: '2025-07-22',
      customer: 'Qualcomm',
      createdAt: '2025-07-20 14:30',
      operator: 'park_test',
    },
  ],
  productionResults: [
    {
      id: 'PR001',
      orderNo: 'PRB-2025-0722-001',
      itemName: 'WRNP 150-175-640',
      producedQty: 4250,
      targetQty: 5000,
      defectQty: 45,
      efficiency: 99.0,
      operator: 'socra710',
      facility: '와이어에칭기 #01',
      completedAt: '2025-07-22 06:00',
      shift: '야간',
    },
    {
      id: 'PR002',
      orderNo: 'PRB-2025-0721-003',
      itemName: 'CRNP 120-150-600',
      producedQty: 2500,
      targetQty: 2500,
      defectQty: 12,
      efficiency: 99.5,
      operator: 'kim_probe',
      facility: '프로브성형기 #02',
      completedAt: '2025-07-21 23:45',
      shift: '야간',
    },
    {
      id: 'PR003',
      orderNo: 'PRB-2025-0720-005',
      itemName: 'VRNP 300-350-1000',
      producedQty: 1425,
      targetQty: 1500,
      defectQty: 8,
      efficiency: 99.4,
      operator: 'park_test',
      facility: '와이어에칭기 #02',
      completedAt: '2025-07-22 05:15',
      shift: '야간',
    },
    {
      id: 'PR004',
      orderNo: 'PRB-2025-0719-006',
      itemName: 'WRNP 80-100-400',
      producedQty: 3500,
      targetQty: 3500,
      defectQty: 28,
      efficiency: 99.2,
      operator: 'choi_etch',
      facility: '와이어에칭기 #03',
      completedAt: '2025-07-21 18:30',
      shift: '주간',
    },
    {
      id: 'PR005',
      orderNo: 'PRB-2025-0718-007',
      itemName: 'CRNP 90-110-450',
      producedQty: 2200,
      targetQty: 2200,
      defectQty: 15,
      efficiency: 99.3,
      operator: 'jung_form',
      facility: '프로브성형기 #01',
      completedAt: '2025-07-20 22:15',
      shift: '야간',
    },
  ],
};

const Dashboard: React.FC = () => {
  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  });

  const handleMoreClick = (section: string) => {
    console.log(`${section} 더보기 클릭`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'success';
      case '진행중':
        return 'primary';
      case '대기':
        return 'warning';
      case '지연':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 99) return 'success';
    if (efficiency >= 95) return 'primary';
    if (efficiency >= 90) return 'warning';
    return 'error';
  };

  const getShiftColor = (shift: string) => {
    return shift === '야간' ? 'secondary' : 'primary';
  };

  return (
    <Box>
      {/* 환영 메시지 */}
      {/* <WelcomeBox>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          {'socra710'[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            안녕하세요, socra710님!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {currentTime} | 프로브 제조 관리 시스템
          </Typography>
        </Box>
      </WelcomeBox> */}

      <Typography variant="h4" sx={{ mb: 2 }}>
        생산 관리 대시보드
      </Typography>

      <Grid container spacing={3}>
        {/* 생산지시 현황 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  프로브 생산지시 현황
                </Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('생산지시')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  금일 지시:
                </Typography>
                <Chip
                  label={`${
                    mockData.productionOrders.filter((o) =>
                      o.createdAt.includes('2025-07-22')
                    ).length
                  }건`}
                  size="small"
                  color="primary"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  전체:
                </Typography>
                <Chip
                  label={`${mockData.productionOrders.length}건`}
                  size="small"
                  color="secondary"
                />
              </DataCountBox>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                최근 생산지시 (담당: socra710)
              </Typography>
              <List dense>
                {mockData.productionOrders.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {item.orderNo}
                              </Typography>
                              <Chip
                                label={item.status}
                                size="small"
                                color={getStatusColor(item.status) as any}
                                variant="outlined"
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.dueDate}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.itemName} | {item.customer} | 수량:{' '}
                              {item.quantity.toLocaleString()}개
                            </Typography>
                            <ProgressBox>
                              <LinearProgress
                                variant="determinate"
                                value={item.progress}
                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                color={
                                  item.progress === 100 ? 'success' : 'primary'
                                }
                              />
                              <Typography
                                variant="caption"
                                sx={{ minWidth: 35 }}
                              >
                                {item.progress}%
                              </Typography>
                            </ProgressBox>
                          </Box>
                        }
                      />
                    </StyledListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleMoreClick('생산지시 관리')}
              >
                생산지시 관리
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 생산실적 현황 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  프로브 생산실적 현황
                </Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('생산실적')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  금일 실적:
                </Typography>
                <Chip
                  label={`${
                    mockData.productionResults.filter((r) =>
                      r.completedAt.includes('2025-07-22')
                    ).length
                  }건`}
                  size="small"
                  color="primary"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  전체:
                </Typography>
                <Chip
                  label={`${mockData.productionResults.length}건`}
                  size="small"
                  color="secondary"
                />
              </DataCountBox>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                최근 생산실적 (야간 근무)
              </Typography>
              <List dense>
                {mockData.productionResults.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {item.orderNo}
                              </Typography>
                              <Chip
                                label={`${item.efficiency}%`}
                                size="small"
                                color={
                                  getEfficiencyColor(item.efficiency) as any
                                }
                                variant="outlined"
                              />
                              <Chip
                                label={item.shift}
                                size="small"
                                color={getShiftColor(item.shift) as any}
                                variant="filled"
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.completedAt.split(' ')[1]}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.itemName} | {item.operator} |{' '}
                              {item.facility}
                            </Typography>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mt={0.5}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                생산: {item.producedQty.toLocaleString()}/
                                {item.targetQty.toLocaleString()}개
                              </Typography>
                              <Typography variant="caption" color="error.main">
                                불량: {item.defectQty}개
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </StyledListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleMoreClick('생산실적 관리')}
              >
                생산실적 관리
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 품질 현황 */}
        {/* <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  프로브 품질 현황
                </Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('품질관리')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  금일 검사:
                </Typography>
                <Chip label="18건" size="small" color="primary" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  야간 검사:
                </Typography>
                <Chip label="8건" size="small" color="secondary" />
              </DataCountBox>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    99.2%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    합격률
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="error.main"
                    sx={{ fontWeight: 700 }}
                  >
                    108
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    불량건수
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={{ fontWeight: 700 }}
                  >
                    3
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    재검사
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                주요 불량 유형: 치수불량(65%), 표면불량(25%), 접촉불량(10%)
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleMoreClick('품질관리')}
              >
                품질관리
              </Button>
            </CardContent>
          </Card>
        </Grid> */}

        {/* 설비 현황 */}
        {/* <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  프로브 제조설비 현황
                </Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('설비관리')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  전체 설비:
                </Typography>
                <Chip label="15대" size="small" color="primary" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  클린룸:
                </Typography>
                <Chip label="3개소" size="small" color="secondary" />
              </DataCountBox>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    11
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    가동중
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={{ fontWeight: 700 }}
                  >
                    2
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    점검중
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="error.main"
                    sx={{ fontWeight: 700 }}
                  >
                    2
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    정지
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  설비 가동률 (야간 기준)
                </Typography>
                <ProgressBox>
                  <LinearProgress
                    variant="determinate"
                    value={82}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    color="success"
                  />
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 35, fontWeight: 600 }}
                  >
                    82%
                  </Typography>
                </ProgressBox>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                점검 예정: 와이어에칭기 #03 (07:00), 광학검사기 #02 (08:30)
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleMoreClick('설비관리')}
              >
                설비관리
              </Button>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
