import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProductionResultForm: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        생산실적 등록/수정
      </Typography>
      <Typography variant="body1">
        여기에 생산실적 등록/수정 폼이 표시됩니다.
      </Typography>
    </Box>
  );
};

export default ProductionResultForm;
