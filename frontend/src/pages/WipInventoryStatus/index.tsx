import React from 'react';
import { Box, Typography } from '@mui/material';
import WipInventoryStatusList from './components/WipInventoryStatusList';
import WipInventoryStatusSearchFilter from './components/WipInventoryStatusSearchFilter';
import { useWipInventoryStatus } from './hooks/useWipInventoryStatus';

export default function WipInventoryStatus() {
  const {
    search, handleSearchChange, handleSearch,
    rows, rowCount, loading,
    paginationModel, handlePaginationModelChange,
    processOptions,
  } = useWipInventoryStatus();

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

      <WipInventoryStatusSearchFilter
        searchDate={search.searchDate}
        workCode={search.workCode}
        searchKeyword={search.searchKeyword}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        processOptions={processOptions}
      />

      <WipInventoryStatusList
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
      />
    </Box>
  );
}
