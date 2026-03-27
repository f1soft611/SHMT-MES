import {useRef, useState} from "react";
import {
    Button, FormControl, InputLabel, MenuItem,
    Paper, Stack, Typography, Select, TextField, IconButton, InputAdornment
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import {Workplace} from "../../../types/workplace";
import {ProdPlanSearchParams} from "../../../types/productionOrder";
import {EquipmentInfo} from "../../../types/equipment";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import 'dayjs/locale/ko';

interface Props {
    loading: boolean;
    workplaces: Workplace[];
    equipments: EquipmentInfo[];
    search: ProdPlanSearchParams;
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
}

const ProdOrderSearchFilter = ({ loading, workplaces, equipments, search, onChange, onSearch }: Props) => {
    // const [date, setDate] = useState("");
    const [openCalendar, setOpenCalendar] = useState(false);
    const anchorRef = useRef<HTMLDivElement | null>(null);

    function formatDateOnEnter(value: string) {
        const prefix = new Date().getFullYear().toString().slice(0, 2);

        if (value.length === 6) {
            const yyyy = prefix + value.slice(0, 2);
            const mm = value.slice(2, 4);
            const dd = value.slice(4, 6);
            return `${yyyy}-${mm}-${dd}`;
        }

        if (value.length === 8) {
            return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
        }

        return value;
    }

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
                            value={search.workplace ?? ''}
                            label="작업장"
                            onChange={(e) => {
                                onChange('workplace', e.target.value);
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

                    <TextField
                        sx={{ width: 140 }}
                        ref={anchorRef}
                        label="계획 시작일"
                        placeholder="YYYY-MM-DD"
                        value={search.dateFrom}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const formatted = formatDateOnEnter(search.dateFrom);
                                onChange("dateFrom", formatted);
                            }
                        }}
                        onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                            onChange('dateFrom', v);
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" sx={{ ml: 0}}>
                                    <IconButton
                                        sx={{ p: 0 }}
                                        size="small"
                                        onClick={() => setOpenCalendar(true)}
                                    >
                                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                        <DatePicker
                            open={openCalendar}
                            onClose={() => setOpenCalendar(false)}
                            value={search.dateFrom ? dayjs(search.dateFrom, "YYYYMMDD") : null}
                            onChange={(value) => {
                                if (!value) return;
                                const formatted = dayjs(value).format("YYYY-MM-DD");
                                onChange("dateFrom", formatted);
                            }}
                            enableAccessibleFieldDOMStructure={false}
                            slotProps={{
                                actionBar: {
                                    actions: ['today']
                                },
                                popper: {
                                    anchorEl: anchorRef.current
                                },
                                textField: {
                                    sx: { display: "none" }
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        label="계획 종료일"
                        type="date"
                        value={search.dateTo}
                        onChange={(e) => onChange('dateTo', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="생산 시작일"
                        type="date"
                        value={search.prodFrom}
                        onChange={(e) => onChange('prodFrom', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="생산 종료일"
                        type="date"
                        value={search.prodTo}
                        onChange={(e) => onChange('prodTo', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>지시상태</InputLabel>
                        <Select
                            value={search.orderFlag}
                            label="지시상태"
                            onChange={(e) => onChange('orderFlag', e.target.value)}
                        >
                            <MenuItem value="" sx={{ fontSize: 13 }}>전체</MenuItem>
                            <MenuItem value="ORDERED" sx={{ fontSize: 13 }} >지시 완료</MenuItem>
                            <MenuItem value="PLANNED" sx={{ fontSize: 13 }}>계획 상태</MenuItem>
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
        </>
    )
}

export default ProdOrderSearchFilter;