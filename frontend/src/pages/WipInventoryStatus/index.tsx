import React from 'react';
import { Box, Typography } from '@mui/material';
import WipInventoryStatusList from './components/WipInventoryStatusList';
import WipInventoryStatusSearchFilter from './components/WipInventoryStatusSearchFilter';

export default function WipInventoryStatus() {
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
          <Typography variant="h5">재공 재고 현황</Typography>
        </Box>
      </Box>


      <WipInventoryStatusSearchFilter />
      
      <WipInventoryStatusList />
    </Box>
  );
}