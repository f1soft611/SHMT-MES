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
import { useProcessList } from "../hooks/detail/useProcessList";


export default function ProcessFlowProcessTab() {

    //  공정흐름 기준
    const {
        processFlow,
        flowProcessRows,    // 흐름에 속한 공정 목록
        setFlowProcessRows, // 흐름 공정 setter
        getSavePayload
    } = useProcessFlowDetailContext();

    // 좌측 전체 공정 (서버 페이징 + 검색)
    const {
        rows: processRows,
        totalCount,
        page,
        pageSize,
        handlePaginationChange,

        searchDraft,
        updateSearchDraft,
        handleSearchProcess,

        selected: leftSelected,
        setSelected: setLeftSelected,
    } = useProcessList();

    // 우측 등록 공정
    const {
        rightSelected,
        setRightSelected,
        addProcess,
        removeProcess,
        updateProcessRow,
        selectLastProcess,
    } = useDetailProcessTab({
        flowProcessRows,
        setFlowProcessRows,
    });

    // 왼쪽 전체 공정목록
    const leftColumns: GridColDef[] = [
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

    // 오른쪽 해당 공정 흐름에 등록된 공정 목록
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
                        onChange={() => selectLastProcess(rid)}
                    />
                );
            },
        }
    ];

    /** 좌 → 우 추가 */
    const handleAdd = () => {
        if (!processFlow) return;

        addProcess(
            leftSelected,
            processRows,
            processFlow.processFlowId!,
            processFlow.processFlowCode!
        );

        setLeftSelected([]);
    };


    return(
        <>
            {/* 검색 영역 */}
            <Box sx={{mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>검색 조건</InputLabel>
                        <Select
                            value={searchDraft.searchCnd}
                            label="검색 조건"
                            onChange={(e) => updateSearchDraft('searchCnd', e.target.value)}
                        >
                            <MenuItem value="0">공정 코드</MenuItem>
                            <MenuItem value="1">공정 이름</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        sx={{ flex: 1 }}
                        placeholder="검색어를 입력하세요"
                        value={searchDraft.searchWrd}
                        onChange={(e)=>updateSearchDraft("searchWrd", e.target.value)}
                        onKeyDown={(e)=>e.key==="Enter" && handleSearchProcess()}
                    />
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearchProcess}
                        sx={{ minWidth: 150 }}
                    >
                        검색
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={1} direction="row">
                <Grid size={{ xs:5.0  }} sx={{ overflow: "hidden" }}>
                    <DataGrid
                        rows={processRows}
                        columns={leftColumns}
                        getRowId={(row:Process) => row.processCode}

                        pagination
                        paginationMode="server"
                        rowCount={totalCount}
                        paginationModel={{ page, pageSize }}
                        onPaginationModelChange={handlePaginationChange}
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
                        rowHeight={35}
                        columnHeaderHeight={40}
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
                            onClick={handleAdd}
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
                        rowHeight={35}
                        columnHeaderHeight={40}
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