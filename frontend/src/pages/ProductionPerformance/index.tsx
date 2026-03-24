import React from 'react';
import { Box, Typography } from '@mui/material';
import ProdPerfSearchFilter from './components/ProdPerfSearchFilter';
import ProdPerfList from './components/ProdPrefList';
import { useProdPerf } from './hooks/useProdPerf';

export default function ProcessPerformance() {
  const pp = useProdPerf();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 150px)',
        minHeight: 640,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">생산실적현황</Typography>
        </Box>
      </Box>

      <ProdPerfSearchFilter
        loading={pp.loading}
        workplaces={pp.workplaces}
        equipments={pp.equipments}
        search={pp.search}
        onChange={pp.onChange}
        onSearch={pp.onSearch}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ProdPerfList
          rows={pp.rows}
          loading={pp.loading}
          rowCount={pp.rowCount}
          paginationModel={pp.paginationModel}
          onPaginationChange={pp.onPaginationChange}
        />
      </Box>
    </Box>
  );
}
