import React from 'react';
import {Box, Typography, Grid} from '@mui/material';
import ProdOrderList from './components/ProdOrderList';
import ProdResurlList from "./components/ProdResultList";
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";
import {useProductionResult} from "../ProdResult/hooks/useProductionResult";

const ProductionResult: React.FC = () => {
    const rs = useProductionResult();

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

            {/* 검색 영역 */}
            <ProdResultSearchFilter
                search={{
                    workCenter: "",
                    dateFrom: "",
                    dateTo: ""
                }}                     // 빈 객체 전달
                onChange={() => {}}             // 빈 함수 전달
                onSearch={() => {}}             // 빈 함수 전달
            />

            {/* 위 DataGrid -> 생산지시 관리*/}
            <Grid size={{xs: 12}}>
                <ProdOrderList />
            </Grid>

            {/* 아래 DataGrid -> 생산실적 관리 */}
            <Grid size={{xs: 12}} sx={{mt: 2}}>
                <ProdResurlList />
            </Grid>

        </Box>
    )
}

export default ProductionResult;