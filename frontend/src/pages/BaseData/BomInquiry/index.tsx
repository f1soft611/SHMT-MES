import React from 'react';
import { Box, Stack } from '@mui/material';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import PageHeader from '../../../components/common/PageHeader/PageHeader';
import { useBomInquiry } from './hooks/useBomInquiry';
import BomSearchPanel from './components/BomSearchPanel';
import BomSearchResultGrid from './components/BomSearchResultGrid';
import BomTreePanel from './components/BomTreePanel';

const BomInquiryPage: React.FC = () => {
  const {
    search,
    searchResults,
    searchTotalCount,
    searchLoading,
    paginationModel,
    onPaginationModelChange,
    selectItem,
    treeNodes,
    treeLoading,
  } = useBomInquiry();

  return (
    <ProtectedRoute requiredPermission="read">
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="" crumbs={[{ label: '기준정보' }, { label: 'BOM 조회' }]} />

        <BomSearchPanel onSearch={search} loading={searchLoading} />

        <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <BomSearchResultGrid
              rows={searchResults}
              loading={searchLoading}
              rowCount={searchTotalCount}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              onSelect={selectItem}
            />
          </Box>
          <Box sx={{ flex: 2, minHeight: 0, overflow: 'auto' }}>
            <Box sx={{ flex: 2, minHeight: 0 }}>
              <BomTreePanel nodes={treeNodes} loading={treeLoading} />
            </Box>
          </Box>
        </Stack>
      </Box>
    </ProtectedRoute>
  );
};

export default BomInquiryPage;
