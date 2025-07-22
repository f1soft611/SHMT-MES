import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProductionOrderList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        생산지시 목록
      </Typography>
      <Typography variant="body1">
        여기에 생산지시 목록이 표시됩니다.
      </Typography>
    </Box>
  );
};

export default ProductionOrderList;
