import React, {useState} from "react";
import { useProcessFlow } from "./hooks/useProcessFlow";
import Typography from "@mui/material/Typography";
import {
    Alert, Box, Button,
    FormControl, InputLabel, MenuItem,
    Paper, Select, Snackbar, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {usePermissions} from "../../../contexts/PermissionContext";
import {
    ProcessFlowDialog,
    ProcessFlowList,
    ProcessFlowDetailDialog,
} from "./components";
import { SnackbarProvider } from "./SnackbarContext";

const ProcessFlowManagement: React.FC = () => {

    const {hasWritePermission} = usePermissions();
    const canWrite = hasWritePermission('/base/processflow');

    const {
        // 목록
        rows,
        selectedFlow,

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
        dialogMode,
        openDetailDialog,
        handleOpenDetailDialog,
        handleCloseDetailDialog,
        handleOpenCreateDialog,
        handleOpenEditDialog,
        handleCloseDialog,
        detailTab,

        // CRUD
        fetchProcessFlows,
        handleSave,
        handleDelete,
        handleDetailSave,
    } = useProcessFlow();

    // Snackbar 상태
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <SnackbarProvider showSnackbar={showSnackbar}>
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
                                value={inputValues.searchCnd}
                                label="검색 조건"
                                onChange={(e) => handleInputChange('searchCnd', e.target.value)}
                            >
                                <MenuItem value="0">작업장 이름</MenuItem>
                                <MenuItem value="1">공정흐름 명</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            value={inputValues.searchWrd}
                            onChange={(e) => handleInputChange('searchWrd', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            sx={{flex: 1}}
                            placeholder="검색어를 입력하세요"
                        />

                        <Button
                            variant="contained"
                            startIcon={<SearchIcon/>}
                            onClick={handleSearch}
                        >
                            검색
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon/>}
                            onClick={handleOpenCreateDialog}
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
                            rows={rows}
                            paginationModel={paginationModel}
                            setPaginationModel={setPaginationModel}
                            onEdit={handleOpenEditDialog}
                            onDelete={handleDelete}
                            onDetailOpen={handleOpenDetailDialog}
                        />
                    </Grid>
                </Grid>

                <ProcessFlowDialog
                    open={openDialog}
                    dialogMode={dialogMode}
                    initialData={selectedFlow}        // create → null / edit → row 데이터
                    onClose={handleCloseDialog}
                    onSubmit={handleSave}             // 저장(create/update) 처리
                />

                <ProcessFlowDetailDialog
                    open={openDetailDialog}
                    onClose={handleCloseDetailDialog}
                    selectedFlow={selectedFlow}
                    onSave={handleDetailSave}
                    initialTab={detailTab}
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
        </SnackbarProvider>

    )
}

export default ProcessFlowManagement;