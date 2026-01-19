import React  from 'react';
import { useLocation } from 'react-router-dom';
import {Box, Typography, Grid} from '@mui/material';
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";

const ProductionResult = () => {

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
                    <Typography variant="h5">생산실적 관리</Typography>
                </Box>
            </Box>

            <ProdResultSearchFilter
                workplaces={[]}
                search={{
                    workplace: '',
                    equipment: '',
                    dateFrom: '',
                    dateTo: '',
                    keyword: ''
                }}
                onChange={function (name: string, value: string): void {
                    throw new Error('Function not implemented.');
                }}
                onSearch={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        </Box>
    );
}

export default ProductionResult;