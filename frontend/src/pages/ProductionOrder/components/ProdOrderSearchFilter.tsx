import React from 'react';
import {
    Button, FormControl, InputLabel, MenuItem,
    Paper, Stack, Typography
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import {Workplace} from "../../../types/workplace";

interface Props {
    workplaces: Workplace[];
    search: {
        workplace: string;
        dateFrom: string;
        dateTo: string;
    };
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
}

const ProdOrderSearchFilter = ({ workplaces, search, onChange, onSearch }: Props) => {
    return(
        <>
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
                            value={search.workplace}
                            label="작업장"
                            onChange={(e) => onChange('workplace', e.target.value)}
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

                    <TextField
                        label="시작일"
                        type="date"
                        value={search.dateFrom}
                        onChange={(e) => onChange('dateFrom', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="종료일"
                        type="date"
                        value={search.dateTo}
                        onChange={(e) => onChange('dateTo', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon/>}
                        onClick={onSearch}
                    >
                        검색
                    </Button>
                </Stack>
            </Paper>
        </>
    )
}

export default ProdOrderSearchFilter