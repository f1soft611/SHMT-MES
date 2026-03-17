import React from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface ProdPlanResultSearchFilterProps {
  showSearchFields: boolean;
  onToggle: () => void;
  yearMonth: string;
  onYearMonthChange: (value: string) => void;
  onSearch: () => void;
}

const ProdPlanResultSearchFilter: React.FC<ProdPlanResultSearchFilterProps> = ({
  showSearchFields,
  onToggle,
  yearMonth,
  onYearMonthChange,
  onSearch,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: showSearchFields ? 1.5 : 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
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
        <Tooltip title={showSearchFields ? '조회조건 숨기기' : '조회조건 보기'}>
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{
              p: 0.5,
              bgcolor: showSearchFields ? 'primary.main' : 'grey.100',
              color: showSearchFields ? 'white' : 'text.secondary',
              '&:hover': {
                bgcolor: showSearchFields ? 'primary.dark' : 'grey.200',
              },
            }}
          >
            {showSearchFields ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showSearchFields}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            '& .MuiTextField-root': {
              minWidth: 140,
            },
            '& .MuiInputBase-root': {
              height: 32,
              fontSize: '0.8rem',
            },
            '& .MuiInputLabel-root': {
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
          <TextField
            label="조회 연월"
            type="month"
            size="small"
            value={yearMonth}
            onChange={(e) => onYearMonthChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
          >
            조회
          </Button>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default ProdPlanResultSearchFilter;
