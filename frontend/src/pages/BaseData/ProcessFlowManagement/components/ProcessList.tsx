// components/ProcessList.tsx
import React, {useEffect, useState} from "react";
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import processService from "../../../../services/processService";
import {Process} from "../../../../types/process";

interface Props {
    onSelectionChange: (ids: GridRowId[]) => void;
}

export default function ProcessList({onSelectionChange}:Props) {
    const [rows, setRows] = useState<Process[]>([]);

    const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await processService.getProcessList(0, 9999);
                const list = res?.result?.resultList ?? [];
                setRows(list);
            } catch (err) {
                console.error("공정 조회 실패:", err);
            }
        };

        fetchData();
    }, []);

    const columns: GridColDef[] = [
        {
            field: 'processCode',
            headerName: '공정 코드',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'processName',
            headerName: '공정 명',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'bigo',
            headerName: '비고',
            flex: 1,
            headerAlign: 'center',
        },
    ];

    return (
        <>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row:Process) => row.processId || ''}
                checkboxSelection
                onRowSelectionModelChange={(model) => {
                    let selectedIds: GridRowId[] = [];

                    // 1) v7에서 배열로 들어오는 경우 (기본)
                    if (Array.isArray(model)) {
                        selectedIds = model as GridRowId[];
                    }
                    // 2) include/exclude 객체로 들어오는 경우
                    else if (model && typeof model === 'object' && 'type' in model) {
                        const m = model as any;

                        // type === 'row' 인 경우: ids 자체가 선택 목록
                        if (m.type === 'row') {
                            const rawIds = Array.isArray(m.ids)
                                ? m.ids
                                : Array.from(m.ids ?? []);
                            selectedIds = rawIds as GridRowId[];
                        }

                        // type === 'exclude' 인 경우: "전체 - 제외 목록"
                        if (m.type === 'exclude') {
                            const excluded = new Set<GridRowId>(
                                Array.isArray(m.ids) ? m.ids : Array.from(m.ids ?? [])
                            );
                            selectedIds = rows
                            .map((r) => r.processId as GridRowId)
                            .filter((id) => !excluded.has(id));
                        }
                    }

                    // 부모로 올리기 (혹은 여기서 콘솔)
                    onSelectionChange?.(selectedIds);
                }}
                autoHeight
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            />
        </>

    );
}
