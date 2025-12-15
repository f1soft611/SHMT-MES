import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProductionResultList: React.FC = () => {
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
          <Typography variant="h5">생산실적목록</Typography>
        </Box>
      </Box>

      <Typography variant="body1">
        여기에 생산실적 목록이 표시됩니다.
      </Typography>
    </Box>
  );
};

export default ProductionResultList;
