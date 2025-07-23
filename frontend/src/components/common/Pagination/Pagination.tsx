import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const PageButtonsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'wrap',
});

const PageButton = styled(Button)(({ theme }) => ({
  minWidth: 32,
  height: 32,
  padding: 0,
  margin: '0 2px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const InfoContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start',
});

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  // Calculate display range
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show up to 7 page buttons
    const sidePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(0, currentPage - sidePages);
    let endPage = Math.min(totalPages - 1, currentPage + sidePages);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < maxVisiblePages - 1) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationContainer>
      <InfoContainer>
        <Typography variant="body2" color="text.secondary">
          총 {totalElements.toLocaleString()}건 중 {startItem.toLocaleString()}-{endItem.toLocaleString()}건 표시
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>페이지당 항목수</InputLabel>
          <Select
            value={pageSize}
            label="페이지당 항목수"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}건
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </InfoContainer>

      <PageButtonsContainer>
        {/* First Page */}
        <IconButton
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          size="small"
          title="첫 페이지"
        >
          <FirstPageIcon />
        </IconButton>

        {/* Previous Page */}
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          size="small"
          title="이전 페이지"
        >
          <NavigateBeforeIcon />
        </IconButton>

        {/* Show ellipsis if there are pages before the visible range */}
        {pageNumbers[0] > 0 && (
          <>
            <PageButton
              variant="outlined"
              onClick={() => onPageChange(0)}
            >
              1
            </PageButton>
            {pageNumbers[0] > 1 && (
              <Typography variant="body2" sx={{ px: 1 }}>
                ...
              </Typography>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <PageButton
            key={pageNum}
            variant={pageNum === currentPage ? 'contained' : 'outlined'}
            onClick={() => onPageChange(pageNum)}
            color={pageNum === currentPage ? 'primary' : 'inherit'}
          >
            {pageNum + 1}
          </PageButton>
        ))}

        {/* Show ellipsis if there are pages after the visible range */}
        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
              <Typography variant="body2" sx={{ px: 1 }}>
                ...
              </Typography>
            )}
            <PageButton
              variant="outlined"
              onClick={() => onPageChange(totalPages - 1)}
            >
              {totalPages}
            </PageButton>
          </>
        )}

        {/* Next Page */}
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          title="다음 페이지"
        >
          <NavigateNextIcon />
        </IconButton>

        {/* Last Page */}
        <IconButton
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          title="마지막 페이지"
        >
          <LastPageIcon />
        </IconButton>
      </PageButtonsContainer>
    </PaginationContainer>
  );
};

export default Pagination;