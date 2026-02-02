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
import {useFetchEquipments} from "../../../hooks/useFetchEquipments";

interface Props {
    workplaces: Workplace[];
    search: {
        workplace: string;
        equipment: string;
        dateFrom: string;
        dateTo: string;
        keyword: string; // 통합검색
    };
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
    loading: boolean;
}

const ProdResultSearchFilter = ({ workplaces, search, onChange, onSearch, loading }: Props) => {

    const { equipments } = useFetchEquipments(search.workplace);

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

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>설비</InputLabel>
                        <Select
                            value={search.equipment}
                            label="설비"
                            onChange={(e) => onChange('equipment', e.target.value)}
                        >
                            <MenuItem value="">전체</MenuItem>
                            {equipments.map(eq => (
                                <MenuItem key={eq.equipSysCd} value={eq.equipSysCd}>
                                    {eq.equipmentName} ({eq.equipSysCd})
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
                    <TextField
                        label="통합검색"
                        placeholder="품목명 / 품목코드"
                        value={search.keyword}
                        onChange={(e) => onChange('keyword', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                        InputLabelProps={{ shrink: true }}
                    />
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
        </>
    )
}

export default ProdResultSearchFilter;