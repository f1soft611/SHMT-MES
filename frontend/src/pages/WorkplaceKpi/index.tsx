import React from 'react';
import { Box, Typography } from '@mui/material';
import { QueryStats as KpiIcon } from '@mui/icons-material';
import { useWorkplaceKpi } from './hooks/useWorkplaceKpi';
import WorkplaceKpiSearchFilter from './components/WorkplaceKpiSearchFilter';
import WorkplaceKpiGrid from './components/WorkplaceKpiGrid';
import WorkplaceKpiCharts from './components/WorkplaceKpiCharts';

export default function WorkplaceKpi() {
  const {
    workplaces,
    search,
    rows,
    rowCount,
    summaryRows,
    loading,
    uploading,
    paginationModel,
    onChange,
    onSearch,
    onFileUpload,
    onPaginationChange,
  } = useWorkplaceKpi();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 150px)',
        minHeight: 640,
      }}
    >
      {/* 페이지 타이틀 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <KpiIcon color="primary" />
        <Typography variant="h5" fontWeight={600}>
          작업장별 KPI 집계
        </Typography>
      </Box>

      {/* 검색 필터 */}
      <WorkplaceKpiSearchFilter
        loading={loading}
        uploading={uploading}
        workplaces={workplaces}
        search={search}
        onChange={onChange}
        onSearch={onSearch}
        onFileUpload={onFileUpload}
      />

      {/* 본문: 좌측 그리드 58% / 우측 차트 42% */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        {/* 로우 데이터 그리드 */}
        <Box sx={{ flex: 7, minHeight: 0 }}>
          <WorkplaceKpiGrid
            rows={rows}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationChange={onPaginationChange}
          />
        </Box>

        {/* 차트 영역 */}
        <Box sx={{ flex: 5, minHeight: 0, overflowY: 'auto' }}>
          <WorkplaceKpiCharts summaryRows={summaryRows} />
        </Box>
      </Box>
    </Box>
  );
}
