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
import { styled } from '@mui/material/styles';

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const MoreButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '4px 8px',
  fontSize: '0.875rem',
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

// 목 데이터 - 반도체 테스트 프로브 제조업체에 맞게 수정
const mockData = {
  commonCode: [
    {
      id: 'CC001',
      name: '프로브타입코드',
      description: 'Cantilever, Vertical, Cobra',
      createdAt: '2025-07-22',
    },
    {
      id: 'CC002',
      name: '재질코드',
      description: 'Tungsten, BeCu, Paliney7',
      createdAt: '2025-07-21',
    },
    {
      id: 'CC003',
      name: '품질등급코드',
      description: 'A급, B급, C급, 재작업',
      createdAt: '2025-07-20',
    },
    {
      id: 'CC004',
      name: '검사항목코드',
      description: '전기적특성, 기계적특성, 외관검사',
      createdAt: '2025-07-19',
    },
    {
      id: 'CC005',
      name: '불량유형코드',
      description: '치수불량, 표면불량, 접촉불량',
      createdAt: '2025-07-18',
    },
  ],
  prDept: [
    {
      id: 'PD001',
      name: '와이어에칭부서',
      description: '프로브 와이어 에칭 공정',
      createdAt: '2025-07-22',
    },
    {
      id: 'PD002',
      name: '조립부서',
      description: '프로브 카드 조립 공정',
      createdAt: '2025-07-21',
    },
    {
      id: 'PD003',
      name: '검사부서',
      description: '최종 품질 검사 및 테스트',
      createdAt: '2025-07-20',
    },
    {
      id: 'PD004',
      name: '패키징부서',
      description: '제품 포장 및 출하 준비',
      createdAt: '2025-07-19',
    },
    {
      id: 'PD005',
      name: '연구개발부서',
      description: '신제품 개발 및 공정 개선',
      createdAt: '2025-07-18',
    },
  ],
  items: [
    {
      id: 'IT001',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire: 150μm, Pitch: 175μm, Length: 640μm',
      createdAt: '2025-07-22',
    },
    {
      id: 'IT002',
      name: 'WRNP 100-125-500',
      category: 'Cantilever Type',
      spec: 'Wire: 100μm, Pitch: 125μm, Length: 500μm',
      createdAt: '2025-07-21',
    },
    {
      id: 'IT003',
      name: 'VRNP 200-250-800',
      category: 'Vertical Type',
      spec: 'Wire: 200μm, Pitch: 250μm, Length: 800μm',
      createdAt: '2025-07-20',
    },
    {
      id: 'IT004',
      name: 'CRNP 120-150-600',
      category: 'Cobra Type',
      spec: 'Wire: 120μm, Pitch: 150μm, Length: 600μm',
      createdAt: '2025-07-19',
    },
    {
      id: 'IT005',
      name: 'WRNP 80-100-400',
      category: 'Cantilever Type',
      spec: 'Wire: 80μm, Pitch: 100μm, Length: 400μm',
      createdAt: '2025-07-18',
    },
    {
      id: 'IT006',
      name: 'VRNP 300-350-1000',
      category: 'Vertical Type',
      spec: 'Wire: 300μm, Pitch: 350μm, Length: 1000μm',
      createdAt: '2025-07-17',
    },
    {
      id: 'IT007',
      name: 'CRNP 90-110-450',
      category: 'Cobra Type',
      spec: 'Wire: 90μm, Pitch: 110μm, Length: 450μm',
      createdAt: '2025-07-16',
    },
    {
      id: 'IT008',
      name: 'WRNP 250-300-900',
      category: 'Cantilever Type',
      spec: 'Wire: 250μm, Pitch: 300μm, Length: 900μm',
      createdAt: '2025-07-15',
    },
  ],
  processes: [
    {
      id: 'PR001',
      itemName: 'WRNP 150-175-640',
      processName: '와이어준비 → 에칭 → 형성 → 검사 → 패키징',
      sequence: 'Wire Preparation → Etching → Forming → Inspection → Packaging',
      createdAt: '2025-07-22',
    },
    {
      id: 'PR002',
      itemName: 'VRNP 200-250-800',
      processName: '와이어준비 → 에칭 → 수직형성 → 검사 → 패키징',
      sequence:
        'Wire Preparation → Etching → Vertical Forming → Inspection → Packaging',
      createdAt: '2025-07-22',
    },
    {
      id: 'PR003',
      itemName: 'CRNP 120-150-600',
      processName: '와이어준비 → 에칭 → 코브라형성 → 검사 → 패키징',
      sequence:
        'Wire Preparation → Etching → Cobra Forming → Inspection → Packaging',
      createdAt: '2025-07-21',
    },
    {
      id: 'PR004',
      itemName: 'WRNP 100-125-500',
      processName: '와이어준비 → 에칭 → 형성 → 전기테스트 → 패키징',
      sequence:
        'Wire Preparation → Etching → Forming → Electrical Test → Packaging',
      createdAt: '2025-07-20',
    },
    {
      id: 'PR005',
      itemName: 'WRNP 80-100-400',
      processName: '와이어준비 → 미세에칭 → 형성 → 정밀검사 → 패키징',
      sequence:
        'Wire Preparation → Fine Etching → Forming → Precision Inspection → Packaging',
      createdAt: '2025-07-19',
    },
  ],
  facilities: [
    {
      id: 'FC001',
      name: '와이어에칭기 #01',
      type: 'Wire Etching Equipment',
      location: 'A동 클린룸 1층',
      status: '가동중',
      createdAt: '2025-07-22',
    },
    {
      id: 'FC002',
      name: '와이어에칭기 #02',
      type: 'Wire Etching Equipment',
      location: 'A동 클린룸 1층',
      status: '점검중',
      createdAt: '2025-07-21',
    },
    {
      id: 'FC003',
      name: '프로브성형기 #01',
      type: 'Probe Forming Equipment',
      location: 'B동 클린룸 2층',
      status: '가동중',
      createdAt: '2025-07-20',
    },
    {
      id: 'FC004',
      name: '전기특성검사기 #01',
      type: 'Electrical Test Equipment',
      location: 'C동 검사실',
      status: '가동중',
      createdAt: '2025-07-19',
    },
    {
      id: 'FC005',
      name: '광학검사기 #01',
      type: 'Optical Inspection Equipment',
      location: 'C동 검사실',
      status: '정지',
      createdAt: '2025-07-18',
    },
    {
      id: 'FC006',
      name: '클린부스 #01',
      type: 'Clean Booth',
      location: 'D동 패키징실',
      status: '가동중',
      createdAt: '2025-07-17',
    },
  ],
};

const BaseData: React.FC = () => {
  const handleMoreClick = (section: string) => {
    console.log(`${section} 더보기 클릭`);
    // 여기에 각 섹션별 더보기 로직을 구현하세요
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '가동중':
        return 'success';
      case '점검중':
        return 'warning';
      case '정지':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
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
          <Typography variant="h5">기준정보</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 공통코드 정보 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6">공통코드 정보</Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('공통코드')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography variant="body2" color="text.secondary">
                  전체 데이터:
                </Typography>
                <Chip
                  label={`${mockData.commonCode.length}건`}
                  size="small"
                  color="primary"
                />
              </DataCountBox>
              <List dense>
                {mockData.commonCode.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        }
                      />
                    </StyledListItem>
                    {index < mockData.commonCode.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 생산부서 정보 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6">생산부서 정보</Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('생산부서')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography variant="body2" color="text.secondary">
                  전체 데이터:
                </Typography>
                <Chip
                  label={`${mockData.prDept.length}건`}
                  size="small"
                  color="primary"
                />
              </DataCountBox>
              <List dense>
                {mockData.prDept.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        }
                      />
                    </StyledListItem>
                    {index < mockData.prDept.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 품목 정보 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6">품목 정보</Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('품목')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography variant="body2" color="text.secondary">
                  전체 데이터:
                </Typography>
                <Chip
                  label={`${mockData.items.length}건`}
                  size="small"
                  color="primary"
                />
              </DataCountBox>
              <List dense>
                {mockData.items.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.category} | {item.spec}
                          </Typography>
                        }
                      />
                    </StyledListItem>
                    {index < mockData.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 품목별 공정정보 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6">품목별 공정정보</Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('품목별 공정')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography variant="body2" color="text.secondary">
                  전체 데이터:
                </Typography>
                <Chip
                  label={`${mockData.processes.length}건`}
                  size="small"
                  color="primary"
                />
              </DataCountBox>
              <List dense>
                {mockData.processes.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <StyledListItem>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {item.processName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.itemName}
                          </Typography>
                        }
                      />
                    </StyledListItem>
                    {index < mockData.processes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 사업장 정보 */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card>
            <CardContent>
              <CardHeader>
                <Typography variant="h6">사업장 정보</Typography>
                <MoreButton
                  variant="text"
                  onClick={() => handleMoreClick('사업장')}
                  endIcon={<span>›</span>}
                >
                  더보기
                </MoreButton>
              </CardHeader>
              <DataCountBox>
                <Typography variant="body2" color="text.secondary">
                  전체 데이터:
                </Typography>
                <Chip
                  label={`${mockData.facilities.length}건`}
                  size="small"
                  color="primary"
                />
              </DataCountBox>
              <List dense>
                {mockData.facilities.slice(0, 5).map((item, index) => (
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
                              <Typography variant="body2" fontWeight="medium">
                                {item.name}
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
                              {item.createdAt}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.type} | {item.location}
                          </Typography>
                        }
                      />
                    </StyledListItem>
                    {index < mockData.facilities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BaseData;
