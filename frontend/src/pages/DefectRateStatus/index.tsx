import React from 'react';
import {Box, Typography} from '@mui/material';
import DefectRateSearchFilter from "./components/DefectRateSearchFilter";
import ProdDefectRateList from "./components/ProdDefectRateList";
import {useDefectRate} from "./hooks/useDefectRate";

export default function DefectRateStatus() {

    const dr = useDefectRate();

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
                    <Typography variant="h5">불량율 현황</Typography>
                </Box>
            </Box>

            <DefectRateSearchFilter
                loading={dr.loading}
                workplaces={dr.workplaces}
                equipments={dr.equipments}
                search={dr.search}
                onChange={dr.onChange}
                onSearch={dr.onSearch}

            />

            <ProdDefectRateList
                rows={dr.rows}
                loading={dr.loading}
                rowCount={dr.rowCount}
                paginationModel={dr.paginationModel}
                onPaginationChange={dr.onPaginationChange}
            />
        </Box>
    );
}