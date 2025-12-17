import React  from 'react';
import {Box, Grid, Typography} from '@mui/material';
import ProdPlanList from "./components/ProdPlanList";
import ProdOrderList from "./components/ProdOrderList";
import ProdOrderSearchFilter from "./components/ProdOrderSearchFilter";
import {useProductionOrder} from "./hooks/useProductionOrder";


const ProductionOrder: React.FC = () => {

    const prodOrder = useProductionOrder();

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
                    <Typography variant="h5">생산지시 관리</Typography>
                </Box>
            </Box>

            {/* 검색 영역 */}
            <ProdOrderSearchFilter
                workplaces={prodOrder.workplaces}
                search={prodOrder.search}
                onChange={prodOrder.handleSearchChange}
                onSearch={prodOrder.handleSearch}
            />


            {/* 위 DataGrid -> 생산계획관리*/}
            <Grid size={{xs: 12}}>
                <ProdPlanList
                    rows={prodOrder.planRows}
                    loading={prodOrder.planLoading}
                    onRowClick={prodOrder.handlePlanSelect}

                    paginationModel={prodOrder.paginationModel}
                    totalCount={prodOrder.totalCount}
                    onPaginationChange={prodOrder.handlePaginationChange}
                />
            </Grid>

            {/* 아래 DataGrid -> 생산계획별 생산지시 */}
            <Grid size={{xs: 12}} sx={{mt: 2}}>
                <ProdOrderList
                    rows={prodOrder.localRows}
                    setRows={prodOrder.setLocalRows}
                    loading={prodOrder.orderLoading}
                    selectedPlan={prodOrder.selectedPlan}
                    onAddRow={prodOrder.handleAddRow}
                    onSave={prodOrder.handleSaveOrders}
                    onEdit={prodOrder.handleSaveOrders}
                />
            </Grid>
        </Box>
    );
};

export default ProductionOrder;
