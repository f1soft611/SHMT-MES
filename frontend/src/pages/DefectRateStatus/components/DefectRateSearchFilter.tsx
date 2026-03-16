import React from 'react';
import {
    Paper,
    Button,
    Stack,
    Typography, InputLabel, Select, MenuItem, FormControl,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import {Workplace} from "../../../types/workplace";
import {EquipmentInfo} from "../../../types/equipment";
import {ProductionDefectRateSearchParams} from "../../../types/productionDefectRate";

interface Props {
    loading: boolean;
    workplaces: Workplace[];
    equipments: EquipmentInfo[];
    search: ProductionDefectRateSearchParams;
    onChange: (name: keyof ProductionDefectRateSearchParams, value: string) => void;
    onSearch: () => void;
}

const DefectRateSearchFilter = ({ loading, workplaces, equipments, search, onChange, onSearch }: Props) => {

    return (
        <Paper sx={{p: 2, mb: 2}}>
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 600,
                    fontSize: '1rem',
                }}
            >
                <FilterListIcon color="primary" />검색 필터
            </Typography>
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                    '& .MuiFormControl-root, & .MuiTextField-root': {
                        minWidth: 110,
                    },
                    '& .MuiInputBase-root': {
                        height: 32,
                        fontSize: '0.8rem',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.8rem',
                    },
                    '& .MuiMenuItem-root': {
                        fontSize: '0.8rem',
                    },
                    '& .MuiButton-root': {
                        height: 32,
                        minWidth: 80,
                        fontSize: '0.8rem',
                        padding: '0 10px',
                    }
                }}
            >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>작업장</InputLabel>
                    <Select
                        // value={search.workplace ?? ''}
                        label="작업장"
                        onChange={(e) => {
                            // onChange('workplace', e.target.value);
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        fontSize: 13,
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="">
                            전체
                        </MenuItem>
                        {workplaces.map(wp => (
                            <MenuItem key={wp.workplaceCode} value={wp.workplaceCode}>
                                {wp.workplaceName} ({wp.workplaceCode})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>설비</InputLabel>
                    <Select
                        value={search.equipment ?? ''}
                        label="설비"
                        onChange={(e) => onChange('equipment', e.target.value)}
                        disabled={!search.workplace}   // 작업장 선택 전 비활성화
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        fontSize: 13,
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="">전체</MenuItem>
                        {equipments.map(eq => (
                            <MenuItem key={eq.equipSysCd} value={eq.equipSysCd}>
                                {eq.equipmentName} ({eq.equipSysCd })
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SearchIcon/>}
                    onClick={onSearch}
                    disabled={loading}
                >
                    검색
                </Button>
            </Stack>
        </Paper>
    );
};

export default DefectRateSearchFilter;