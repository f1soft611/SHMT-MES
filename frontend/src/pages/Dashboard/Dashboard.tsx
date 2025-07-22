import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Dashboard: React.FC = () => (
  <Box>
    <Typography variant="h5" sx={{ mb: 3 }}>
      대시보드
    </Typography>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              생산지시 현황
            </Typography>
            <Typography variant="body1">전체 지시: 0건</Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              생산지시 관리
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} component="div">
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              생산실적 현황
            </Typography>
            <Typography variant="body1">전체 실적: 0건</Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              생산실적 관리
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default Dashboard;
