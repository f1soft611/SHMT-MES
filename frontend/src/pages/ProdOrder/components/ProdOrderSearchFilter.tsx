import {useRef, useState} from "react";
import {
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    CalendarToday as CalendarTodayIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import {EquipmentInfo} from "../../../types/equipment";
import {ProdPlanSearchParams} from "../../../types/productionOrder";
import {Workplace} from "../../../types/workplace";

interface Props {
    loading: boolean;
    workplaces: Workplace[];
    equipments: EquipmentInfo[];
    search: ProdPlanSearchParams;
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
}

type DateFieldName = "dateFrom" | "dateTo" | "prodFrom" | "prodTo";

const ProdOrderSearchFilter = ({ loading, workplaces, equipments, search, onChange, onSearch }: Props) => {
    const [openCalendarField, setOpenCalendarField] = useState<DateFieldName | null>(null);
    const anchorRefs = useRef<Record<DateFieldName, HTMLDivElement | null>>({
        dateFrom: null,
        dateTo: null,
        prodFrom: null,
        prodTo: null,
    });

    function toIsoDate(year: number, month: number, day: number) {
        const candidate = dayjs(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            "YYYY-MM-DD",
            true,
        );

        return candidate.isValid() ? candidate.format("YYYY-MM-DD") : "";
    }

    function normalizeDateInput(value: string) {
        const trimmed = value.trim();
        const digits = trimmed.replace(/[^0-9]/g, "");
        const today = dayjs();

        if (!digits) {
            return "";
        }

        if (trimmed.includes("-") && trimmed.length === 10) {
            const dashed = dayjs(trimmed, "YYYY-MM-DD", true);
            return dashed.isValid() ? dashed.format("YYYY-MM-DD") : "";
        }

        if (digits.length <= 2) {
            return toIsoDate(today.year(), today.month() + 1, Number(digits));
        }

        if (digits.length === 4) {
            return toIsoDate(today.year(), Number(digits.slice(0, 2)), Number(digits.slice(2, 4)));
        }

        if (digits.length === 8) {
            return toIsoDate(
                Number(digits.slice(0, 4)),
                Number(digits.slice(4, 6)),
                Number(digits.slice(6, 8)),
            );
        }

        return "";
    }

    function commitDateField(fieldName: DateFieldName, value: string, shouldSearch = false) {
        const normalized = normalizeDateInput(value);

        if (!normalized) {
            return;
        }

        onChange(fieldName, normalized);

        if (shouldSearch) {
            onSearch();
        }
    }

    function renderDateField(fieldName: DateFieldName, label: string) {
        return (
            <>
                <TextField
                    sx={{ width: 140 }}
                    ref={(element) => {
                        anchorRefs.current[fieldName] = element;
                    }}
                    label={label}
                    placeholder="YYYY-MM-DD"
                    value={search[fieldName] ?? ""}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            commitDateField(fieldName, search[fieldName] ?? "", true);
                        }
                    }}
                    onBlur={() => commitDateField(fieldName, search[fieldName] ?? "")}
                    onChange={(e) => {
                        const nextValue = e.target.value.replace(/[^0-9-]/g, "").slice(0, 10);
                        onChange(fieldName, nextValue);
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" sx={{ ml: 0 }}>
                                <IconButton
                                    sx={{ p: 0 }}
                                    size="small"
                                    onClick={() => setOpenCalendarField(fieldName)}
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
                        open={openCalendarField === fieldName}
                        onClose={() => setOpenCalendarField(null)}
                        value={search[fieldName] ? dayjs(search[fieldName]) : null}
                        onChange={(value) => {
                            if (!value) return;
                            onChange(fieldName, dayjs(value).format("YYYY-MM-DD"));
                            onSearch();
                            setOpenCalendarField(null);
                        }}
                        enableAccessibleFieldDOMStructure={false}
                        slotProps={{
                            actionBar: {
                                actions: ["today"],
                            },
                            popper: {
                                anchorEl: anchorRefs.current[fieldName],
                            },
                            textField: {
                                sx: { display: "none" },
                            },
                        }}
                    />
                </LocalizationProvider>
            </>
        );
    }

    return (
        <>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 600,
                        fontSize: "1rem",
                    }}
                >
                    <FilterListIcon color="primary" />검색 필터
                </Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        "& .MuiFormControl-root, & .MuiTextField-root": {
                            minWidth: 110,
                        },
                        "& .MuiInputBase-root": {
                            height: 32,
                            fontSize: "0.8rem",
                        },
                        "& .MuiInputLabel-root": {
                            fontSize: "0.8rem",
                        },
                        "& .MuiMenuItem-root": {
                            fontSize: "0.8rem",
                        },
                        "& .MuiButton-root": {
                            height: 32,
                            minWidth: 80,
                            fontSize: "0.8rem",
                            padding: "0 10px",
                        },
                    }}
                >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>작업장</InputLabel>
                        <Select
                            value={search.workplace ?? ""}
                            label="작업장"
                            onChange={(e) => {
                                onChange("workplace", e.target.value);
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        "& .MuiMenuItem-root": {
                                            fontSize: 13,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">전체</MenuItem>
                            {workplaces.map((wp) => (
                                <MenuItem key={wp.workplaceCode} value={wp.workplaceCode}>
                                    {wp.workplaceName} ({wp.workplaceCode})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>설비</InputLabel>
                        <Select
                            value={search.equipment ?? ""}
                            label="설비"
                            onChange={(e) => onChange("equipment", e.target.value)}
                            disabled={!search.workplace}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        "& .MuiMenuItem-root": {
                                            fontSize: 13,
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">전체</MenuItem>
                            {equipments.map((eq) => (
                                <MenuItem key={eq.equipSysCd} value={eq.equipSysCd}>
                                    {eq.equipmentName} ({eq.equipSysCd})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {renderDateField("dateFrom", "계획 생성일 시작")}
                    {renderDateField("dateTo", "계획 생성일 종료")}
                    {renderDateField("prodFrom", "생산 시작일 시작")}
                    {renderDateField("prodTo", "생산 시작일 종료")}

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>지시상태</InputLabel>
                        <Select
                            value={search.orderFlag}
                            label="지시상태"
                            onChange={(e) => onChange("orderFlag", e.target.value)}
                        >
                            <MenuItem value="" sx={{ fontSize: 13 }}>전체</MenuItem>
                            <MenuItem value="ORDERED" sx={{ fontSize: 13 }}>지시 완료</MenuItem>
                            <MenuItem value="PLANNED" sx={{ fontSize: 13 }}>계획 상태</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        onClick={onSearch}
                        disabled={loading}
                    >
                        검색
                    </Button>
                </Stack>
            </Paper>
        </>
    );
};

export default ProdOrderSearchFilter;
