import React from 'react';
import {Box, Typography} from '@mui/material';
import ProdOrderSearchFilter from "./components/ProdOrderSearchFilter";
import ProdPlanList from "./components/ProdPlanList";
import ProdOrderDialog from "./components/ProdOrderDialog";
import {useProdOrderStoreInit} from "./store/useProdOrderStore";

const ProdOrder = () => {

    useProdOrderStoreInit();

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
                    <Typography variant="h5">생산지시 관리</Typography>
                </Box>
            </Box>

            <ProdOrderSearchFilter />
            <ProdPlanList />
            <ProdOrderDialog />
        </Box>
    )
}

export default ProdOrder;
