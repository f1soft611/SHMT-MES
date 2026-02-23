import React from "react";
import {
    Box, Button, Grid, Typography,
    FormControl, InputLabel, MenuItem,
    Paper, Select, Stack, TextField } from "@mui/material";
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {usePermissions} from "../../../contexts/PermissionContext";
import { useProcessFlow } from "./hooks/useProcessFlow";
import ProcessFlowList from "./components/ProcessFlowList";
import ProcessFlowDialog from "./components/ProcessFlowDialog";
import ProcessFlowDetailDialog from "./components/ProcessFlowDetailDialog";

const ProcessFlowManagement: React.FC = () => {

    const {hasWritePermission} = usePermissions();
    const canWrite = hasWritePermission('/base/processflow');

    const pf = useProcessFlow();

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
                    <Typography variant="h5">공정 흐름 관리</Typography>
                </Box>
            </Box>

            {/* 검색 영역 */}
            <Paper sx={{p: 2, mb: 2}}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{minWidth: 120}}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            value={pf.inputValues.searchCnd}
                            label="검색 조건"
                            onChange={(e) => pf.handleInputChange('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">작업장 이름</MenuItem>
                            <MenuItem value="1">공정흐름 명</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        value={pf.inputValues.searchWrd}
                        onChange={(e) => pf.handleInputChange('searchWrd', e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && pf.handleSearch()}
                        sx={{flex: 1}}
                        placeholder="검색어를 입력하세요"
                    />

                    <Button
                        variant="contained"
                        startIcon={<SearchIcon/>}
                        onClick={pf.handleSearch}
                    >
                        검색
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={pf.handleOpenCreateDialog}
                        disabled={!canWrite}
                    >
                        공정 흐름 등록
                    </Button>

                </Stack>
            </Paper>

            <Grid container spacing={2} columns={12}>
                <Grid size={{xs: 12, md: 12}}>
                    {/* 공정 흐름 목록 */}
                    <ProcessFlowList
                        rows={pf.rows}
                        rowCount={pf.rowCount}
                        paginationModel={pf.paginationModel}
                        setPaginationModel={pf.setPaginationModel}
                        onEdit={pf.handleOpenEditDialog}
                        onDelete={pf.handleDelete}
                        onDetailOpen={pf.handleOpenDetailDialog} />
                </Grid>
            </Grid>

            {/*메인 공정흐름 등록 창*/}
            <ProcessFlowDialog
                open={pf.openDialog}
                dialogMode={pf.dialogMode}
                methods={pf.methods}
                workplaces={pf.workplaces}
                onClose={pf.closeMainDialog}
                onSubmit={pf.buildSubmitHandler(pf.handleSave)} />

            <ProcessFlowDetailDialog
                open={pf.openDetailDialog}
                selectedFlow={pf.selectedFlowDetail}
                initialTab={pf.detailTab}
                onClose={pf.handleCloseDetailDialog}
                itemLoading={pf.itemLoading}
                onSave={pf.handleDetailSave} />
        </Box>
    )
}

export default ProcessFlowManagement;