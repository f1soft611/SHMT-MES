import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const InterfaceMonitor: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        인터페이스 모니터
      </Typography>
      <Typography variant="body1">
        여기에 ERP/MES 인터페이스 현황이 표시됩니다.
      </Typography>
    </Box>
  );
};

export default InterfaceMonitor;
