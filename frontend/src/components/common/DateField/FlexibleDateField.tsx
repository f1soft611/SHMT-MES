import React, { useMemo, useRef, useState } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const buildIsoDate = (year: number, month: number, day: number): string => {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const isIsoDateString = (value: string): boolean => {
  const match = value.match(ISO_DATE_REGEX);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const toIsoDateIfCompact = (value: string): string => {
  const trimmed = value.trim();

  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.substring(0, 4)}-${trimmed.substring(4, 6)}-${trimmed.substring(6, 8)}`;
  }

  return trimmed;
};

const getBaseDate = (
  baseDate?: string | Date,
): { year: number; month: number } => {
  if (baseDate instanceof Date) {
    return {
      year: baseDate.getFullYear(),
      month: baseDate.getMonth() + 1,
    };
  }

  const normalized = baseDate ? toIsoDateIfCompact(baseDate) : '';
  const match = normalized.match(ISO_DATE_REGEX);

  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
    };
  }

  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
};

export const parseFlexibleDateInput = (
  rawValue: string,
  baseDate?: string | Date,
): string | null => {
  const normalized = toIsoDateIfCompact(rawValue);
  if (!normalized) {
    return null;
  }

  if (isIsoDateString(normalized)) {
    return normalized;
  }

  const compact = normalized.replace(/-/g, '');
  const base = getBaseDate(baseDate);

  if (/^\d{6}$/.test(compact)) {
    const year = 2000 + Number(compact.substring(0, 2));
    const month = Number(compact.substring(2, 4));
    const day = Number(compact.substring(4, 6));
    const candidate = buildIsoDate(year, month, day);

    if (isIsoDateString(candidate)) {
      return candidate;
    }
  }

  if (/^\d{4}$/.test(compact)) {
    const month = Number(compact.substring(0, 2));
    const day = Number(compact.substring(2, 4));
    const candidate = buildIsoDate(base.year, month, day);

    if (isIsoDateString(candidate)) {
      return candidate;
    }
  }

  if (/^\d{1,2}$/.test(compact)) {
    const day = Number(compact);
    const candidate = buildIsoDate(base.year, base.month, day);

    if (isIsoDateString(candidate)) {
      return candidate;
    }
  }

  const monthDayMatch = normalized.match(/^(\d{1,2})-(\d{1,2})$/);
  if (monthDayMatch) {
    const month = Number(monthDayMatch[1]);
    const day = Number(monthDayMatch[2]);
    const candidate = buildIsoDate(base.year, month, day);

    if (isIsoDateString(candidate)) {
      return candidate;
    }
  }

  return null;
};

export const normalizeFlexibleDateInput = (
  rawValue: string,
  baseDate?: string | Date,
): string => {
  const parsed = parseFlexibleDateInput(rawValue, baseDate);
  if (parsed) {
    return parsed;
  }

  const cleaned = rawValue.trim().replace(/[^\d-]/g, '');
  return cleaned.slice(0, 10);
};

interface FlexibleDateFieldProps extends Omit<
  TextFieldProps,
  'value' | 'onChange' | 'type'
> {
  value: string;
  onChange: (nextValue: string) => void;
  baseDate?: string | Date;
  onCommit?: (nextValue: string) => void;
}

const FlexibleDateField: React.FC<FlexibleDateFieldProps> = ({
  value,
  onChange,
  baseDate,
  onCommit,
  InputProps,
  onBlur,
  onKeyDown,
  placeholder = 'YYYY-MM-DD / YYMMDD / MMDD / DD',
  ...rest
}) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const parsedValue = useMemo(() => {
    if (!value) {
      return null;
    }

    const parsed = parseFlexibleDateInput(value, baseDate);
    return parsed ? dayjs(parsed) : null;
  }, [baseDate, value]);

  const commitNormalized = () => {
    const normalized = normalizeFlexibleDateInput(value, baseDate);

    if (normalized !== value) {
      onChange(normalized);
    }

    if (isIsoDateString(normalized)) {
      onCommit?.(normalized);
    }
  };

  return (
    <>
      <TextField
        {...rest}
        type="text"
        value={value}
        placeholder={placeholder}
        inputMode="numeric"
        ref={(element) => {
          anchorRef.current = element;
        }}
        onChange={(event) => {
          const nextValue = event.target.value
            .replace(/[^\d-]/g, '')
            .slice(0, 10);
          onChange(nextValue);
        }}
        onBlur={(event) => {
          commitNormalized();
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitNormalized();
          }
          onKeyDown?.(event);
        }}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <>
              {InputProps?.endAdornment}
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setOpenCalendar(true)}>
                  <CalendarMonthIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            </>
          ),
        }}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <DatePicker
          open={openCalendar}
          onClose={() => setOpenCalendar(false)}
          value={parsedValue}
          onChange={(dateValue) => {
            if (!dateValue) {
              onChange('');
              setOpenCalendar(false);
              return;
            }

            const nextValue = dayjs(dateValue).format('YYYY-MM-DD');
            onChange(nextValue);
            onCommit?.(nextValue);
            setOpenCalendar(false);
          }}
          enableAccessibleFieldDOMStructure={false}
          slotProps={{
            actionBar: {
              actions: ['today'],
            },
            popper: {
              anchorEl: anchorRef.current,
            },
            textField: {
              sx: { display: 'none' },
            },
          }}
        />
      </LocalizationProvider>
    </>
  );
};

export default FlexibleDateField;
