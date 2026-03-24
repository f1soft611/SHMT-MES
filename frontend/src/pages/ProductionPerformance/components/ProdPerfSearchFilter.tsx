import { useState } from 'react';
import {
  Paper,
  Button,
  Stack,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Workplace } from '../../../types/workplace';
import { EquipmentInfo } from '../../../types/equipment';
import { ProdPerfSearchParams } from '../../../types/productionPerformance';

interface Props {
  loading: boolean;
  workplaces: Workplace[];
  equipments: EquipmentInfo[];
  search: ProdPerfSearchParams;
  onChange: (name: keyof ProdPerfSearchParams, value: string) => void;
  onSearch: () => void;
}

const ProdPerfSearchFilter = ({
  loading,
  workplaces,
  equipments,
  search,
  onChange,
  onSearch,
}: Props) => {
  const [equipOpen, setEquipOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
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
        <FilterListIcon color="primary" />
        검색 필터
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
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
          },
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
            <MenuItem value="">전체</MenuItem>
            {workplaces.map((wp) => (
              <MenuItem key={wp.workplaceCode} value={wp.workplaceCode}>
                {wp.workplaceName} ({wp.workplaceCode})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip
          title="작업장을 먼저 선택하세요"
          open={tooltipOpen}
          placement="top"
          arrow
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>설비</InputLabel>
            <Select
              open={equipOpen}
              value={search.equipment ?? ''}
              label="설비"
              onChange={(e) => onChange('equipment', e.target.value)}
              onOpen={() => {
                if (!search.workplace) {
                  setTooltipOpen(true);

                  // 1.5초 후 자동 닫기
                  setTimeout(() => setTooltipOpen(false), 1500);
                  return;
                }
                setEquipOpen(true);
              }}
              onClose={() => setEquipOpen(false)}
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
              {equipments.map((eq) => (
                <MenuItem key={eq.equipSysCd} value={eq.equipSysCd}>
                  {eq.equipmentName} ({eq.equipSysCd})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>

        <TextField
          size="small"
          type="date"
          label="작업지시일(From)"
          value={search.dateFrom ?? ''}
          onChange={(e) => onChange('dateFrom', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="작업지시일(To)"
          value={search.dateTo ?? ''}
          onChange={(e) => onChange('dateTo', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="작업완료일(From)"
          value={search.completeFrom ?? ''}
          onChange={(e) => onChange('completeFrom', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="작업완료일(To)"
          value={search.completeTo ?? ''}
          onChange={(e) => onChange('completeTo', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
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
  );
};

export default ProdPerfSearchFilter;
