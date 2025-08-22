import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

interface ArrayDataTableProps {
  data: any[];
  title: string;
}

const ArrayDataTable: React.FC<ArrayDataTableProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom color="primary">
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          데이터가 없습니다.
        </Typography>
      </Box>
    );
  }

  // Extract headers from the first object's keys
  const headers = Object.keys(data[0]);

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        {title} (배열 - {data.length}개 항목)
      </Typography>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 400, 
          border: '1px solid #ddd',
          borderRadius: 1,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #ddd'
                }}
              >
                #
              </TableCell>
              {headers.map((header) => (
                <TableCell 
                  key={header}
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    fontWeight: 'bold',
                    borderBottom: '2px solid #ddd'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: '#fafafa' 
                  },
                  '&:hover': {
                    backgroundColor: '#f0f8ff'
                  }
                }}
              >
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  {index + 1}
                </TableCell>
                {headers.map((header) => (
                  <TableCell 
                    key={header}
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem'
                    }}
                    title={renderCellValue(row[header])} // Show full value on hover
                  >
                    {renderCellValue(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ArrayDataTable;