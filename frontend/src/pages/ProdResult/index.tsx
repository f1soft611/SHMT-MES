import React from 'react';
import { useLocation } from 'react-router-dom';
import {Box, Typography, Grid} from '@mui/material';
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";
import {useProductionResult} from "./hooks/useProductionResult";
import {ProdPlanRow} from "../../types/productionOrder";
import ProdResultOrderList from "./components/ProdResultOrderList";
import ProdResultList from "./components/ProdResultList";

const ProductionResult = () => {

    const location = useLocation();
    const rowData = location.state?.rowData as ProdPlanRow | null; // 생산지시에서 넘어올때 사용하는 params

    const rs = useProductionResult(rowData);

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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="h5">생산실적 관리</Typography>
                </Box>
            </Box>


            {/* 검색 영역 */}
            <ProdResultSearchFilter
                workplaces={rs.workplaces}
                search={rs.search}
                onChange={rs.handleSearchChange}
                onSearch={rs.handleSearch}
                loading={rs.loading}
            />

            <Grid container direction="column" spacing={1}>
                <Grid size={{xs: 12,}}>
                    <ProdResultOrderList
                        rows={rs.rows}
                        loading={rs.loading}
                        totalCount={rs.rowCount}
                        paginationModel={rs.pagination}
                        onPaginationChange={rs.onPaginationChange}
                        onRowClick={rs.handleRowClick} />

                    <ProdResultList
                        parentRow={rs.selectedRow} />
                </Grid>
            </Grid>

        </Box>
    )
}

export default ProductionResult;