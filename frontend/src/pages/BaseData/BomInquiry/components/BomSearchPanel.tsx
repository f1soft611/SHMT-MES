import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';

export interface BomSearchCondition {
  searchCnd: string;
  searchWrd: string;
}

interface BomSearchPanelProps {
  onSearch: (condition: BomSearchCondition) => void;
  loading: boolean;
}

const BomSearchPanel: React.FC<BomSearchPanelProps> = ({ onSearch, loading }) => {
  const [searchCnd, setSearchCnd] = useState('1');
  const [searchWrd, setSearchWrd] = useState('');

  const handleSearch = () => {
    onSearch({ searchCnd, searchWrd: searchWrd.trim() });
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
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>검색 조건</InputLabel>
          <Select
            value={searchCnd}
            label="검색조건"
            onChange={(e) => setSearchCnd(e.target.value)}
          >
            <MenuItem value="1">품목코드</MenuItem>
            <MenuItem value="2">품목명</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchWrd}
          onChange={(e) => setSearchWrd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
        >
          검색
        </Button>
      </Stack>
    </Paper>
  );
};

export default BomSearchPanel;
