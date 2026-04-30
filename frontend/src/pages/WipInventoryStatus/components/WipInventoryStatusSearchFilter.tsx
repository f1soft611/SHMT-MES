import React, { useRef, useState } from "react";
import {
  Box,
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/ko";

const filterFieldStyles = {
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
} as const;

const WipInventoryStatusSearchFilter = () => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const dateFieldRef = useRef<HTMLDivElement | null>(null);

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
      return toIsoDate(
        today.year(),
        Number(digits.slice(0, 2)),
        Number(digits.slice(2, 4)),
      );
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

  function commitDateField(value: string) {
    const normalized = normalizeDateInput(value);

    if (!normalized) {
      return;
    }

    setSearchDate(normalized);
  }

  return (
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
        <FilterListIcon color="primary" />
        검색 필터
      </Typography>

      <Box sx={filterFieldStyles}>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* 검색 필터 UI 요소들을 여기에 추가 */}
          <TextField
            sx={{ width: 140 }}
            ref={(element) => {
              dateFieldRef.current = element;
            }}
            label="기준일"
            placeholder="YYYY-MM-DD"
            value={searchDate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitDateField(searchDate);
              }
            }}
            onBlur={() => commitDateField(searchDate)}
            onChange={(e) => {
              setSearchDate(
                e.target.value.replace(/[^0-9-]/g, "").slice(0, 10),
              );
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0 }}>
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
              value={searchDate ? dayjs(searchDate) : null}
              onChange={(value) => {
                if (!value) {
                  setSearchDate("");
                  setOpenCalendar(false);
                  return;
                }

                setSearchDate(dayjs(value).format("YYYY-MM-DD"));
                setOpenCalendar(false);
              }}
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                actionBar: {
                  actions: ["today"],
                },
                popper: {
                  anchorEl: dateFieldRef.current,
                },
                textField: {
                  sx: { display: "none" },
                },
              }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>공정</InputLabel>
            <Select label="공정">
              <MenuItem value="">전체</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            sx={{ minWidth: 280 }}
            label="통합검색"
            placeholder="품목명 / 품목코드"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
          >
            검색
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default WipInventoryStatusSearchFilter;
