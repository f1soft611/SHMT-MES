import {DataGrid, GridColDef, GridRowId, GridRowSelectionModel} from "@mui/x-data-grid";
import {Button, Paper, Stack, Box, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Radio} from "@mui/material";
import {
    Add as AddIcon,
    Save as SaveIcon,
    // Edit as EditIcon,
    Delete as DeleteIcon,
    // People as PeopleIcon,
    Search as SearchIcon,
    // Build as BuildIcon,
} from '@mui/icons-material';
import React, {useEffect, useState} from "react";
import {Process} from "../../../../types/process";

import { useProcessFlowDetailContext } from "../hooks/useProcessFlowDetailContext";
import {ProcessFlowProcess} from "../../../../types/processFlow";
import {useProcessFlowDetail} from "../hooks/useProcessFlowDetail"

export default function ProcessFlowProcessTab() {

    const {
        processFlow,
        processRows,        // 전체 공정 목록
        flowProcessRows,    // 흐름에 속한 공정 목록
        setFlowProcessRows, // 흐름 공정 setter
    } = useProcessFlowDetailContext();

    const {
        inputValues,
        handleInputChange,
        handleSearch,
        filteredRows: filteredProcessRows,
    } = useProcessFlowDetail(processRows, {
        fields: {
            "0": (row) => row.processCode,
            "1": (row) => row.processName,
        }
    });

    const [leftSelected, setLeftSelected] = useState<GridRowId[]>([]);
    const [rightSelected, setRightSelected] = useState<GridRowId[]>([]);

    const [lastProcessId, setLastProcessId] = useState<string | null>(null);

    const columns: GridColDef[] = [
        { field: 'processCode', headerName: '공정 코드', flex: 1, headerAlign: 'center' },
        { field: 'processName', headerName: '공정 이름', flex: 1, headerAlign: 'center' },
        { field: 'equipmentIntegrationYn', headerName: '설비연동', width: 80, headerAlign: 'center', align:'center' },
    ];

    const rightColumns: GridColDef[] = [
        { field: 'flowProcessCode', headerName: '공정 코드', flex: 1, headerAlign: 'center' },
        { field: 'flowProcessName', headerName: '공정 이름', flex: 1, headerAlign: 'center' },
        {
            field: 'seq',
            headerName: '순서',
            width: 80,
            headerAlign: 'center',
            renderCell: (params) => (
                <TextField
                    size="small"
                    value={params.row.seq ?? ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        const rid = params.row.flowRowId;

                        setFlowProcessRows(prev =>
                            prev.map(p =>
                                p.flowRowId === rid ? { ...p, seq: value } : p
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


    const handleMoveRight = () => {
        if (leftSelected.length === 0 || !processFlow) return;

        const newRows: ProcessFlowProcess[] = processRows
        .filter(p => leftSelected.includes(p.processCode)) // processCode 기준 선택
        .map(p => ({
            flowRowId: crypto.randomUUID(),        // ★ 유일키 (중복 허용)
            flowProcessId: null,

            seq: "",
            processFlowCode: processFlow.processFlowCode ?? "",
            processFlowId: processFlow.processFlowId ?? "",
            lastFlag: "N",

            flowProcessCode: p.processCode,
            flowProcessName: p.processName,
            processSeq: String(p.sortOrder ?? ""),
        }));

        setFlowProcessRows(prev => [...prev, ...newRows]);
        setLeftSelected([]);
    };


    const handleRemoveRight  = () => {
        if (rightSelected.length === 0) return;
        setFlowProcessRows(prev =>
            prev.filter(p => !rightSelected.includes(p.flowProcessId ?? p.flowRowId))
        );
    }

    // ★ flowProcessRows가 변경될 때 lastFlag=Y 인 행을 찾아 lastProcessId로 세팅
    useEffect(() => {
        const target = flowProcessRows.find(p => p.lastFlag === "Y");
        if (target) {
            setLastProcessId(target.flowProcessId ?? null);
        }
    }, [flowProcessRows]);

    useEffect(() => {
        setLeftSelected([]);
        setRightSelected([]);
    }, [flowProcessRows]);


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
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={filteredProcessRows}
                        columns={columns}
                        getRowId={(row:Process) => row.processCode}
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
                            onClick={handleMoveRight}
                            disabled={leftSelected.length === 0}
                            aria-label="move selected right"
                        >
                            &gt;
                        </Button>
                        <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={handleRemoveRight}
                            disabled={rightSelected.length === 0}
                            aria-label="move selected left"
                        >
                            &lt;
                        </Button>
                    </Box>
                </Grid>
                <Grid size={{ xs:5.5  }}>
                    <DataGrid
                        rows={flowProcessRows}
                        columns={rightColumns}
                        getRowId={(row) => row.flowProcessId ?? row.flowRowId}
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
                        }}
                    />
                </Grid>
            </Grid>
        </>
    )
}