import React, { useState } from 'react';
import { Button, Paper, Stack, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface BomSearchPanelProps {
  onSearch: (keyword: string) => void;
  loading: boolean;
}

const BomSearchPanel: React.FC<BomSearchPanelProps> = ({ onSearch, loading }) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    if (!keyword.trim()) {
      return;
    }
    onSearch(keyword.trim());
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          label="품목코드 / 품번 / 품목명"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flex: 1, minWidth: 240 }}
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
