import React  from 'react';
import {Box, Grid, Typography} from '@mui/material';
import ProdOrderSearchFilter from "./components/ProdOrderSearchFilter";
import {useProductionOrder} from "./hooks/useProductionOrder";
import ProdPlanList from "./components/ProdPlanList";
import ProdOrderDialog from "./components/ProdOrderDialog";
import {usePermissions} from "../../contexts/PermissionContext";

const ProdOrder: React.FC = () => {

    const prodOrder = useProductionOrder();

    const {hasWritePermission} = usePermissions();
    const canWrite = hasWritePermission('/prod/order2');

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
                    <Typography variant="h5">생산지시 관리_newV</Typography>
                </Box>
            </Box>

            {/* 검색 영역 */}
            <ProdOrderSearchFilter
                workplaces={prodOrder.workplaces}
                search={prodOrder.search}
                onChange={prodOrder.handleSearchChange}
                onSearch={prodOrder.handleSearch} />

            <ProdPlanList
                rows={prodOrder.planRows}
                loading={prodOrder.planLoading}
                onRowClick={prodOrder.handlePlanSelect}

                paginationModel={prodOrder.paginationModel}
                totalCount={prodOrder.totalCount}
                onPaginationChange={prodOrder.handlePaginationChange} />


            <ProdOrderDialog
                open={prodOrder.open}
                plan={prodOrder.selectedPlan}
                rows={prodOrder.localRows}
                onClose={prodOrder.closeDialog}
                onSubmit={prodOrder.submit}
                onDelete={prodOrder.deleteOrder}
                onAddRow={prodOrder.handleAddRow}
                onRemoveRow={prodOrder.handleRemoveRow}
                onProcessRowUpdate={prodOrder.handleProcessRowUpdate}
                canWrite={canWrite}
            />
        </Box>
    )
}

export default ProdOrder;