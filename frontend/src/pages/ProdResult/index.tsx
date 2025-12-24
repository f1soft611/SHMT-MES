import React from 'react';
import { useLocation } from 'react-router-dom';
import {Box, Typography, Grid} from '@mui/material';
import ProdResultSearchFilter from "./components/ProdResultSearchFilter";
import {useProductionResult} from "./hooks/useProductionResult";
import ProdResultTable from "./components/ProdResultTable";

const ProductionResult: React.FC = () => {

    const location = useLocation();
    const rowData = location.state?.rowData?? null; // 생산지시에서 넘어올때 사용하는 params

    const rs = useProductionResult(rowData);

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

            <Grid container spacing={0} columns={12}>
                <Grid size={{xs: 12,}}>
                    <ProdResultTable
                        rows={rs.rows} />

                    {/* 생산지시 목록 */}
                    {/*<ProdResultList*/}
                    {/*    rows={rs.rows}*/}
                    {/*    loading={rs.loading}*/}
                    {/*    onRowClick={rs.handleResultSelect}*/}

                    {/*    paginationModel={rs.paginationModel}*/}
                    {/*    rowCount={rs.rowCount}*/}
                    {/*    onPaginationModelChange={rs.setPaginationModel}*/}
                    {/*/>*/}
                </Grid>
            </Grid>

        </Box>
    )
}

export default ProductionResult;