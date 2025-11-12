import React, {useState} from "react";
import { useProcessFlow } from "./useProcessFlow";
import Typography from "@mui/material/Typography";
import {
    Alert, Box, Button,
    FormControl, InputLabel, MenuItem,
    Paper, Select, Snackbar, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    Add as AddIcon,
    Save as SaveIcon,
    // Edit as EditIcon,
    Delete as DeleteIcon,
    // People as PeopleIcon,
    Search as SearchIcon,
    // Build as BuildIcon,
} from '@mui/icons-material';
import {usePermissions} from "../../../contexts/PermissionContext";
import {
    ProcessFlowDialog,
    ProcessFlowList,
    ProcessList,
    ItemList
} from "./components";

const ProcessFlowManagement: React.FC = () => {

    const { hasWritePermission } = usePermissions();
    const canWrite = hasWritePermission('/base/processflow');

    const {
        // 목록
        rows,
        handleSelectFlow,
        processRows,
        itemRows,

        // 입력 & 검색
        inputValues,
        handleInputChange,
        setInputValues,
        searchParams,
        setSearchParams,
        handleSearch,

        // 페이지네이션
        paginationModel,
        setPaginationModel,

        // dialog
        openDialog,
        openDetailDialog,
        dialogMode,
        handleOpenCreateDialog,
        handleOpenEditDialog,
        handleCloseDialog,

        // form
        processFlowControl,
        handleProcessFlowSubmit,
        resetProcessFlowForm,
        processFlowErrors,

        // CRUD
        fetchProcessFlows,
        handleSave,
        handleDelete,

        // Snackbar
        snackbar,
        showSnackbar,
        handleCloseSnackbar,
    } = useProcessFlow();

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
                    <Typography variant="h5">공정 흐름 관리</Typography>
                </Box>
            </Box>

            {/* 검색 영역 */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            value={inputValues.searchCnd}
                            label="검색 조건"
                            onChange={(e) => handleInputChange('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">작업장 코드</MenuItem>
                            <MenuItem value="1">작업장명</MenuItem>
                            <MenuItem value="2">위치</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        value={inputValues.searchWrd}
                        onChange={(e) => handleInputChange('searchWrd', e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ flex: 1 }}
                        placeholder="검색어를 입력하세요"
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>상태</InputLabel>
                        <Select
                            value={inputValues.status}
                            label="상태"
                            onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                            <MenuItem value="">전체</MenuItem>
                            <MenuItem value="ACTIVE">활성</MenuItem>
                            <MenuItem value="INACTIVE">비활성</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                    >
                        검색
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                        disabled={!canWrite}
                    >
                        공정 흐름 등록
                    </Button>
                    
                </Stack>
            </Paper>

            <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {/* 공정 흐름 목록 */}
                    <ProcessFlowList
                        rows={rows}
                        paginationModel={paginationModel}
                        setPaginationModel={setPaginationModel}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDelete}
                        onSelect={handleSelectFlow}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Grid container spacing={2} direction="column">
                        <Grid size={{ xs:12 }}>
                            <ProcessList rows={processRows} />
                        </Grid>
                        <Grid size={{ xs:12 }}>
                            <ItemList rows={itemRows} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* 공정 흐름 등록/수정 다이얼로그 */}
            <ProcessFlowDialog
                open={openDialog}
                dialogMode={dialogMode}
                onClose={handleCloseDialog}
                onSave={handleSave}
                control={processFlowControl}
                errors={processFlowErrors}
                handleSubmit={handleProcessFlowSubmit}
            />

            {/* 스낵바 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ProcessFlowManagement;