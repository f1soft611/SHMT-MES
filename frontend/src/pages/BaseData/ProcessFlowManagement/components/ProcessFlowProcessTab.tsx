import {DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import {
    Button, Stack, Box,
    FormControl, InputLabel,
    Select, MenuItem,
    TextField, Grid, Radio, Chip
} from "@mui/material";
import {
    Search as SearchIcon,
} from '@mui/icons-material';
import {Process} from "../../../../types/process";
import { useProcessFlowDetailContext } from "../hooks/detail/useProcessFlowDetailContext";
import {useDetailProcessTab} from "../hooks/detail/useDetailProcessTab";


export default function ProcessFlowProcessTab() {

    const {
        processFlow,
        processRows,        // 전체 공정 목록
        flowProcessRows,    // 흐름에 속한 공정 목록
        setFlowProcessRows, // 흐름 공정 setter
        processPage, setProcessPage,
        processPageSize, setProcessPageSize
    } = useProcessFlowDetailContext();

    const {
        filteredRows,
        inputValues,
        handleInputChange,
        handleSearch,

        leftSelected, setLeftSelected,
        rightSelected, setRightSelected,

        lastProcessId,
        setLastProcessId,

        addProcess,
        removeProcess,

        updateProcessRow,
        selectLastProcess,

    } = useDetailProcessTab(processFlow, processRows, flowProcessRows, setFlowProcessRows);

    const columns: GridColDef[] = [
        { field: 'processCode', headerName: '공정 코드', flex: 1, headerAlign: 'center', align: 'center', },
        { field: 'processName', headerName: '공정 이름', flex: 1, headerAlign: 'center', align: 'center', },
        {
            field: 'equipmentIntegrationYn',
            headerName: '설비연동',
            width: 80,
            headerAlign: 'center',
            align:'center',
            renderCell:(params) => (
                <Chip
                    label={params.value === 'Y' ? '연동' : '미연동'}
                    color={params.value === 'Y' ? 'primary' : 'default'}
                    size="small"
                />
            ),
        },
    ];

    const rightColumns: GridColDef[] = [
        { field: 'flowProcessCode', headerName: '공정 코드', flex: 1, headerAlign: 'center', align: 'center', },
        { field: 'flowProcessName', headerName: '공정 이름', flex: 1, headerAlign: 'center', align: 'center', },
        {
            field: 'equipmentFlag',
            headerName: '설비연동',
            width: 80,
            headerAlign: 'center',
            align:'center',
            renderCell:(params) => (
                <Chip
                    label={params.value === 'Y' ? '연동' : '미연동'}
                    color={params.value === 'Y' ? 'primary' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'seq',
            headerName: '순서',
            width: 80,
            headerAlign: 'center',
            align: 'center',
            editable: true,
            renderCell: (params) => (
                <TextField
                    size="small"
                    value={params.row.seq ?? ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        const rid = params.row.flowProcessId ?? params.row.flowRowId;

                        setFlowProcessRows(prev =>
                            prev.map(p =>
                                (p.flowProcessId ?? p.flowRowId) === rid ? { ...p, seq: value } : p
                            )
                        );
                    }}
                />
            ),
        },
        {
            field: 'lastFlag',
            headerName: '마지막',
            width: 80,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const rid = params.row.flowProcessId ?? params.row.flowRowId;
                return (
                    <Radio
                        name="lastProcess"
                        checked={params.row.lastFlag === "Y"}
                        onChange={() => {
                            setLastProcessId(rid);
                            // ★ 모든 lastFlag 초기화 + 선택된 것만 Y
                            setFlowProcessRows(prev =>
                                prev.map(p =>
                                    (p.flowProcessId ?? p.flowRowId) === rid
                                        ? { ...p, lastFlag: "Y" }
                                        : { ...p, lastFlag: "N" }
                                )
                            );
                        }}
                    />
                );
            },
        }
    ];



    return(
        <>
            {/* 검색 영역 */}
            <Box sx={{mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            value={inputValues.searchCnd}
                            label="검색 조건"
                            onChange={(e) => handleInputChange('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">공정 코드</MenuItem>
                            <MenuItem value="1">공정 이름</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        sx={{ flex: 1 }}
                        placeholder="검색어를 입력하세요"
                        value={inputValues.searchWrd}
                        onChange={(e)=>handleInputChange("searchWrd", e.target.value)}
                        onKeyDown={(e)=>e.key==="Enter" && handleSearch()}
                    />
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        sx={{ minWidth: 150 }}
                    >
                        검색
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={1} direction="row">
                <Grid size={{ xs:5.0  }} sx={{ overflow: "hidden" }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        rowHeight={35}
                        columnHeaderHeight={40}
                        getRowId={(row:Process) => row.processCode}

                        pagination
                        paginationModel={{
                            page: processPage,
                            pageSize: processPageSize,
                        }}
                        onPaginationModelChange={(model) => {
                            setProcessPage(model.page);
                            setProcessPageSize(model.pageSize);
                        }}
                        pageSizeOptions={[10, 20, 50]}

                        checkboxSelection
                        disableRowSelectionExcludeModel
                        // ★ selectionModel은 include 방식으로만 설정 가능
                        rowSelectionModel={{
                            type: 'include',
                            ids: new Set(leftSelected),
                        }}
                        onRowSelectionModelChange={(model) => {
                            setLeftSelected(Array.from(model.ids));
                        }}
                        autoHeight={false}
                        sx={{
                            height: 450,
                            "& .MuiDataGrid-cell": {
                                padding: "0 2px",     // 셀 패딩 축소
                            },
                        }}
                    />
                </Grid>
                <Grid size={{ xs:1  }}>
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1, // 버튼 간격
                        }}
                    >
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={addProcess}
                            disabled={leftSelected.length === 0}
                            aria-label="move selected right"
                        >
                            &gt;
                        </Button>
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={removeProcess}
                            disabled={rightSelected.length === 0}
                            aria-label="move selected left"
                        >
                            &lt;
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs:6  }}>
                    <DataGrid
                        rows={flowProcessRows}
                        columns={rightColumns}
                        rowHeight={35}
                        columnHeaderHeight={40}
                        getRowId={(row) => row.flowProcessId ?? row.flowRowId}
                        editMode="cell"
                        processRowUpdate={updateProcessRow}
                        checkboxSelection
                        disableRowSelectionOnClick
                        disableRowSelectionExcludeModel
                        onRowSelectionModelChange={(model) => {
                            const anyModel = model as { ids: Set<GridRowId> };
                            setRightSelected(Array.from(anyModel.ids ?? []))
                        }}
                        autoHeight={false}
                        sx={{
                            height: 450,
                            "& .MuiDataGrid-cell": {
                                padding: "0 2px",     // 셀 패딩 축소
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </>
    )
}