import React, { useRef } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { Workplace } from '../../../types/workplace';
import { WorkplaceKpiSearchParams } from '../../../types/workplaceKpi';

interface Props {
  loading: boolean;
  uploading: boolean;
  workplaces: Workplace[];
  search: WorkplaceKpiSearchParams;
  onChange: (name: keyof WorkplaceKpiSearchParams, value: string) => void;
  onSearch: () => void;
  onFileUpload: (file: File) => void;
}

const WorkplaceKpiSearchFilter: React.FC<Props> = ({
  loading,
  uploading,
  workplaces,
  search,
  onChange,
  onSearch,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // 같은 파일 재업로드 허용
      e.target.value = '';
    }
  };

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
          '& .MuiFormControl-root, & .MuiTextField-root': { minWidth: 130 },
          '& .MuiInputBase-root': { height: 32, fontSize: '0.8rem' },
          '& .MuiInputLabel-root': { fontSize: '0.8rem' },
          '& .MuiMenuItem-root': { fontSize: '0.8rem' },
          '& .MuiButton-root': {
            height: 32,
            minWidth: 80,
            fontSize: '0.78rem',
          },
        }}
      >
        {/* 작업장 선택 */}
        <FormControl size="small">
          <InputLabel>작업장</InputLabel>
          <Select
            value={search.workcenterCode}
            label="작업장"
            onChange={(e) => onChange('workcenterCode', e.target.value)}
          >
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
            {workplaces.map((w) => (
              <MenuItem key={w.workplaceCode} value={w.workplaceCode}>
                {w.workplaceName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 년월 선택 */}
        <TextField
          label="년월"
          type="month"
          size="small"
          value={
            search.yearMonth.length === 6
              ? `${search.yearMonth.slice(0, 4)}-${search.yearMonth.slice(4, 6)}`
              : search.yearMonth
          }
          onChange={(e) => {
            const val = e.target.value.replace('-', ''); // yyyyMM
            onChange('yearMonth', val);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        {/* 조회 버튼 */}
        <Button
          variant="contained"
          size="small"
          startIcon={<SearchIcon />}
          onClick={onSearch}
          disabled={loading}
        >
          조회
        </Button>

        {/* 업로드 버튼 */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          sx={{ display: 'none' }}
        >
          {uploading ? '업로드 중...' : '엑셀 업로드'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Stack>
    </Paper>
  );
};

export default WorkplaceKpiSearchFilter;
