import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { styled } from '@mui/material/styles';
import {
  ProductionProgressCard,
  ProductionProgressList,
} from './components/ProductionProgress';
import { ProcessStepper } from './components/ProcessStepper';
import { KPICards } from './components/KPICards';
import { WorkplaceChart } from './components/WorkplaceChart';
import AlertList from './components/AlertList';
import dashboardService from '../../services/dashboardService';
import {
  ProductionProgress,
  ProcessProgress,
  DashboardKPI,
  WorkplaceProgress,
  DashboardAlert,
} from '../../types/dashboard';

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const Dashboard: React.FC = () => {
  // State 관리
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [kpiLoading, setKpiLoading] = useState<boolean>(false);
  const [activeProgressList, setActiveProgressList] = useState<
    ProductionProgress[]
  >([]);
  const [selectedProgress, setSelectedProgress] =
    useState<ProductionProgress | null>(null);
  const [processList, setProcessList] = useState<ProcessProgress[]>([]);
  const [processLoading, setProcessLoading] = useState<boolean>(false);
  const [workplaceList, setWorkplaceList] = useState<WorkplaceProgress[]>([]);
  const [workplaceLoading, setWorkplaceLoading] = useState<boolean>(false);
  const [alertList, setAlertList] = useState<DashboardAlert[]>([]);
  const [alertLoading, setAlertLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 금일 KPI 통계 조회
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        setKpiLoading(true);
        const response = await dashboardService.getTodayKPI();
        setKpi(response.kpi);
      } catch (err: any) {
        console.error('KPI 통계 조회 실패:', err);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKPI();
  }, []);

  // 작업장별 생산 현황 조회
  useEffect(() => {
    const fetchWorkplaceProgress = async () => {
      try {
        setWorkplaceLoading(true);
        const response =
          await dashboardService.getProductionProgressByWorkplace();
        setWorkplaceList(response.resultList || []);
      } catch (err: any) {
        console.error('작업장별 생산 현황 조회 실패:', err);
      } finally {
        setWorkplaceLoading(false);
      }
    };

    fetchWorkplaceProgress();
  }, []);

  // 실시간 알림/이슈 목록 조회
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertLoading(true);
        const response = await dashboardService.getRecentAlerts();
        setAlertList(response.resultList || []);
      } catch (err: any) {
        console.error('실시간 알림 조회 실패:', err);
      } finally {
        setAlertLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // 진행 중인 생산계획 조회 (TOP 10)
  useEffect(() => {
    const fetchActiveProgress = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getActiveProductionList();
        const progressList = response.resultList || [];
        setActiveProgressList(progressList);

        // 초기 세팅: 첫 번째 계획 자동 선택
        if (progressList.length > 0 && !selectedProgress) {
          setSelectedProgress(progressList[0]);
        }
      } catch (err: any) {
        console.error('진행 중인 생산계획 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProgress();
  }, []);

  // 리스트에서 생산계획 선택 핸들러
  const handleSelectProgress = (progress: ProductionProgress) => {
    setSelectedProgress(progress);
  };

  // 선택된 생산계획의 공정별 진행 현황 조회
  useEffect(() => {
    if (!selectedProgress) {
      setProcessList([]);
      return;
    }

    const fetchProcessProgress = async () => {
      try {
        setProcessLoading(true);
        const response = await dashboardService.getProcessProgressList(
          selectedProgress.planDate,
          selectedProgress.planSeq
        );
        setProcessList(response.resultList || []);
      } catch (err: any) {
        console.error('공정별 진행 현황 조회 실패:', err);
        setProcessList([]);
      } finally {
        setProcessLoading(false);
      }
    };

    fetchProcessProgress();
  }, [selectedProgress]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          생산 관리 대시보드
        </Typography>
      </Box>

      {/* 1. 📊 KPI 통계 카드 */}
      <Box sx={{ mb: 3 }}>
        <KPICards kpi={kpi} loading={kpiLoading} />
      </Box>

      {/* 2. 🚨 실시간 알림/이슈 */}
      <Box sx={{ mb: 3 }}>
        <AlertList alerts={alertList} loading={alertLoading} />
      </Box>

      {/* 3. TOP 10 진행 중인 생산계획 + 상세 정보 */}
      <Grid container spacing={3}>
        {/* 왼쪽: 진행 중인 생산계획 리스트 */}
        <Grid size={{ xs: 12, md: 5 }} component="div">
          <Card sx={{ height: '100%', minHeight: '600px' }}>
            <CardContent>
              <CardHeader>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🔥 진행 중인 생산계획 (TOP 10)
                </Typography>
                <Chip
                  label={`${activeProgressList.length}건`}
                  size="small"
                  color="primary"
                />
              </CardHeader>

              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                  }}
                >
                  <Typography color="text.secondary">로딩 중...</Typography>
                </Box>
              ) : activeProgressList.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                  }}
                >
                  <Typography color="text.secondary">
                    진행 중인 생산계획이 없습니다
                  </Typography>
                </Box>
              ) : (
                <ProductionProgressList
                  progressList={activeProgressList}
                  loading={false}
                  compact={true}
                  title=""
                  onSelectItem={handleSelectProgress}
                  selectedItem={selectedProgress}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 오른쪽: 선택된 계획의 상세 정보 */}
        <Grid size={{ xs: 12, md: 7 }} component="div">
          {selectedProgress ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 계획 대비 실적 */}
              <Card>
                <CardContent>
                  <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📊 계획 대비 실적
                    </Typography>
                  </CardHeader>
                  <ProductionProgressCard
                    progress={selectedProgress}
                    loading={false}
                    error={error}
                    compact={false}
                  />
                </CardContent>
              </Card>

              {/* 공정별 진행 현황 */}
              <Card>
                <CardContent>
                  <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🔧 공정별 진행 현황
                    </Typography>
                    {processList.length > 0 && (
                      <Chip
                        label={`${processList.length}개 공정`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </CardHeader>
                  <ProcessStepper
                    processList={processList}
                    loading={processLoading}
                  />
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Card sx={{ height: '100%', minHeight: '600px' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '560px',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    생산계획을 선택하세요
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    왼쪽 목록에서 생산계획을 클릭하면 상세 정보를 확인할 수
                    있습니다
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 4. 🏭 작업장별 생산 현황 */}
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <CardHeader>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🏭 작업장별 생산 현황
              </Typography>
              {workplaceList.length > 0 && (
                <Chip
                  label={`${workplaceList.length}개 작업장`}
                  size="small"
                  color="secondary"
                />
              )}
            </CardHeader>

            <WorkplaceChart
              workplaceList={workplaceList}
              loading={workplaceLoading}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
