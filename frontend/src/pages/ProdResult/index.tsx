import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";
import ProdResultOrderList from "./components/ProdResultOrderList";
import ProdResultList from "./components/ProdResultList";
import { useProdResultStore, useProdResultStoreInit } from "./store/useProdResultStore";
import { ProdPlanRow } from "../../types/productionOrder";

const ProductionResult = () => {
    useProdResultStoreInit();

    const location = useLocation();
    const rowData = location.state?.rowData as ProdPlanRow | null;

    useEffect(() => {
        useProdResultStore.getState().initFromNavigation(rowData);
    }, [rowData]);

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
                    <Typography variant="h5">생산실적 관리</Typography>
                </Box>
            </Box>

            <ProdResultSearchFilter />

            <Grid container direction="column" spacing={1}>
                <Grid size={{ xs: 12 }}>
                    <ProdResultOrderList />
                    <ProdResultList />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductionResult;
