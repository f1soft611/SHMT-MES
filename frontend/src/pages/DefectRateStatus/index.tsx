import React from 'react';
import {Box, Typography} from '@mui/material';
import DefectRateSearchFilter from "./components/DefectRateSearchFilter";

export default function DefectRateStatus() {
    return(
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
                    <Typography variant="h5">불량율 현황</Typography>
                </Box>
            </Box>

            <DefectRateSearchFilter />
        </Box>
    );
}