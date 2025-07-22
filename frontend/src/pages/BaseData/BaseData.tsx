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

// 목 데이터
const mockData = {
  commonCode: [
    {
      id: 'CC001',
      name: '품질등급코드',
      description: 'A급, B급, C급',
      createdAt: '2025-07-22',
    },
    {
      id: 'CC002',
      name: '설비상태코드',
      description: '가동, 정지, 점검',
      createdAt: '2025-07-21',
    },
    {
      id: 'CC003',
      name: '작업상태코드',
      description: '대기, 진행, 완료',
      createdAt: '2025-07-20',
    },
    {
      id: 'CC004',
      name: '불량유형코드',
      description: '외관불량, 치수불량',
      createdAt: '2025-07-19',
    },
    {
      id: 'CC005',
      name: '단위코드',
      description: 'EA, KG, M',
      createdAt: '2025-07-18',
    },
  ],
  prDept: [
    {
      id: 'PR001',
      name: '생산부서 A',
      description: '주요 생산 부서',
      createdAt: '2025-07-22',
    },
    {
      id: 'PR002',
      name: '생산부서 B',
      description: '보조 생산 부서',
      createdAt: '2025-07-21',
    },
    {
      id: 'PR003',
      name: '품질관리부서',
      description: '품질 검사 및 관리',
      createdAt: '2025-07-20',
    },
    {
      id: 'PR004',
      name: '물류부서',
      description: '자재 입출고 및 관리',
      createdAt: '2025-07-19',
    },
    {
      id: 'PR005',
      name: '기술지원부서',
      description: '기술 지원 및 유지보수',
      createdAt: '2025-07-18',
    },
  ],
  items: [
    {
      id: 'IT001',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-22',
    },
    {
      id: 'IT002',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-21',
    },
    {
      id: 'IT003',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-20',
    },
    {
      id: 'IT004',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-19',
    },
    {
      id: 'IT005',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-18',
    },
    {
      id: 'IT006',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-17',
    },
    {
      id: 'IT007',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-16',
    },
    {
      id: 'IT008',
      name: 'WRNP 150-175-640',
      category: 'Cantilever Type',
      spec: 'Wire Etching Probe',
      createdAt: '2025-07-15',
    },
  ],
  processes: [
    {
      id: 'PR001',
      itemName: 'WRNP 150-175-640',
      processName: '사출성형 -> 후가공 -> 품질검사 -> 포장',
      createdAt: '2025-07-22',
    },
    {
      id: 'PR002',
      itemName: 'WRNP 150-175-640',
      processName: '사출성형 -> 품질검사 -> 포장',
      createdAt: '2025-07-22',
    },
    {
      id: 'PR003',
      itemName: 'WRNP 150-175-640',
      processName: '사출성형 -> 후가공 -> 품질검사',
      createdAt: '2025-07-21',
    },
    {
      id: 'PR004',
      itemName: 'WRNP 150-175-640',
      processName: '사출성형 -> 후가공 -> 포장',
      createdAt: '2025-07-20',
    },
    {
      id: 'PR005',
      itemName: 'WRNP 150-175-640',
      processName: '사출성형 -> 품질검사 -> 포장',
      createdAt: '2025-07-19',
    },
  ],
  facilities: [
    {
      id: 'FC001',
      name: '사출기 #01',
      type: '사출성형기',
      location: 'A동 1층',
      status: '가동중',
      createdAt: '2025-07-22',
    },
    {
      id: 'FC002',
      name: '사출기 #02',
      type: '사출성형기',
      location: 'A동 1층',
      status: '점검중',
      createdAt: '2025-07-21',
    },
    {
      id: 'FC003',
      name: '후가공기 #01',
      type: '후가공설비',
      location: 'B동 2층',
      status: '가동중',
      createdAt: '2025-07-20',
    },
    {
      id: 'FC004',
      name: '검사장비 #01',
      type: '품질검사',
      location: 'C동 1층',
      status: '가동중',
      createdAt: '2025-07-19',
    },
    {
      id: 'FC005',
      name: '포장기 #01',
      type: '포장설비',
      location: 'D동 1층',
      status: '정지',
      createdAt: '2025-07-18',
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
      <Typography variant="h4" sx={{ mb: 2 }}>
        기준정보
      </Typography>
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
