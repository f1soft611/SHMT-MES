import React from 'react';
import { Box, TextField, Button, Stack } from '@mui/material';

const DefectRateSearchFilter = () => {
    return (
        <Box>
            <Stack direction="row" spacing={2}>
                <TextField
                    size="small"
                    label="시작일"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    size="small"
                    label="종료일"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    size="small"
                    label="품목"
                />

                <Button variant="contained">
                    조회
                </Button>
            </Stack>
        </Box>
    );
};

export default DefectRateSearchFilter;