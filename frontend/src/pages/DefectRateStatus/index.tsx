import React from 'react';
import { Box, Typography } from '@mui/material';
import DefectRateSearchFilter from './components/DefectRateSearchFilter';
import ProdDefectRateList from './components/ProdDefectRateList';
import { useDefectRate } from './hooks/useDefectRate';

export default function DefectRateStatus() {
  const dr = useDefectRate();

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
          <Typography variant="h5">불량율 현황</Typography>
        </Box>
      </Box>

      <DefectRateSearchFilter
        loading={dr.loading}
        workplaces={dr.workplaces}
        equipments={dr.equipments}
        defectTypes={dr.defectTypes}
        search={dr.search}
        onChange={dr.onChange}
        onSearch={dr.onSearch}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ProdDefectRateList
          rows={dr.rows}
          loading={dr.loading}
          rowCount={dr.rowCount}
          paginationModel={dr.paginationModel}
          onPaginationChange={dr.onPaginationChange}
        />
      </Box>
    </Box>
  );
}
