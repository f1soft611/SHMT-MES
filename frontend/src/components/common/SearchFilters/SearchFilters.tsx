import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { format } from 'date-fns';

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

interface SearchFiltersComponentProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
}

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'stretch',
    '& button': {
      flex: 1,
    },
  },
}));

const SearchFiltersComponent: React.FC<SearchFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  loading = false,
}) => {
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  // Get today's date for default values
  const today = format(new Date(), 'yyyy-MM-dd');
  const oneMonthAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  return (
    <FilterContainer elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        검색 조건
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        {/* Date Range */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
          <TextField
            label="시작일"
            type="date"
            size="small"
            fullWidth
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: today,
            }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
          <TextField
            label="종료일"
            type="date"
            size="small"
            fullWidth
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: filters.dateFrom || undefined,
              max: today,
            }}
          />
        </Grid>

        {/* Keyword Search */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }} component="div">
          <TextField
            label="검색어"
            size="small"
            fullWidth
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="생산지시번호, 제품명 등"
            InputProps={{
              endAdornment: filters.keyword && (
                <Button
                  size="small"
                  onClick={() => handleFilterChange('keyword', '')}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              ),
            }}
          />
        </Grid>

        {/* Action Buttons */}
        <Grid size={{ xs: 12, md: 2 }} component="div">
          <ButtonContainer>
            <Button
              variant="outlined"
              size="small"
              onClick={onReset}
              disabled={loading}
              startIcon={<ClearIcon />}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
            >
              검색
            </Button>
          </ButtonContainer>
        </Grid>
      </Grid>

      {/* Quick Date Range Buttons */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          빠른 선택:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              onFiltersChange({
                ...filters,
                dateFrom: today,
                dateTo: today,
              });
            }}
          >
            오늘
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
              onFiltersChange({
                ...filters,
                dateFrom: yesterday,
                dateTo: yesterday,
              });
            }}
          >
            어제
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
              onFiltersChange({
                ...filters,
                dateFrom: sevenDaysAgo,
                dateTo: today,
              });
            }}
          >
            최근 7일
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              onFiltersChange({
                ...filters,
                dateFrom: oneMonthAgo,
                dateTo: today,
              });
            }}
          >
            최근 30일
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              onFiltersChange({
                ...filters,
                dateFrom: undefined,
                dateTo: undefined,
              });
            }}
          >
            전체 기간
          </Button>
        </Box>
      </Box>
    </FilterContainer>
  );
};

export default SearchFiltersComponent;