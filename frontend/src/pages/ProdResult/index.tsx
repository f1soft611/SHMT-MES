import React from 'react';
import {Box, Typography, Grid} from '@mui/material';
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";
import ProdResultList from "./components/ProdResultList";
import {useProductionResult} from "./hooks/useProductionResult";

const ProductionResult: React.FC = () => {

    const rs = useProductionResult();

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
                    <Typography variant="h5">생산실적 관리_newV</Typography>
                </Box>
            </Box>


            {/* 검색 영역 */}
            <ProdResultSearchFilter
                workplaces={rs.workplaces}
                search={rs.search}
                onChange={rs.handleSearchChange}
                onSearch={rs.handleSearch}
            />

            <Grid container spacing={2} columns={12}>
                <Grid size={{xs: 12, md: 12}}>
                    {/* 생산지시 목록 */}
                    <ProdResultList
                        rows={rs.rows}
                        loading={rs.loading}

                        paginationModel={rs.paginationModel}
                        rowCount={rs.rowCount}
                        onPaginationModelChange={rs.setPaginationModel}
                    />
                </Grid>
            </Grid>

        </Box>
    )
}

export default ProductionResult;