import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Search as SearchIcon } from '@mui/icons-material';
import { User, userService } from '../../../services/admin/userService';

interface UserSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  title?: string;
}

/**
 * 사용자 선택 다이얼로그
 * 사용자 관리에 등록된 사용자를 조회하고 선택할 수 있는 다이얼로그
 */
const UserSelectionDialog: React.FC<UserSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  title = '사용자 선택',
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // 검색 입력 필드용 상태
  const [inputValues, setInputValues] = useState({
    searchCnd: '2', // 기본값: 사용자명
    searchWrd: '',
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '2',
    searchWrd: '',
  });

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({
        pageIndex: paginationModel.page + 1,
        searchCnd: searchParams.searchCnd,
        searchWrd: searchParams.searchWrd,
      });

      if (response?.resultList) {
        setUsers(response.resultList);
        setTotalCount(response.paginationInfo?.totalRecordCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchParams, paginationModel]);

  const handleSearch = () => {
    setSearchParams({ ...inputValues });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleInputChange = (field: string, value: string) => {
    setInputValues({
      ...inputValues,
      [field]: value,
    });
  };

  const handleSelect = () => {
    if (selectedUser) {
      onSelect(selectedUser);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setInputValues({
      searchCnd: '2',
      searchWrd: '',
    });
    setSearchParams({
      searchCnd: '2',
      searchWrd: '',
    });
    setPaginationModel({ page: 0, pageSize: 10 });
    onClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'mberId',
      headerName: '사용자 ID',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'mberNm',
      headerName: '사용자명',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'email',
      headerName: '이메일',
      flex: 1.5,
      headerAlign: 'center',
    },
    {
      field: 'moblphonNo',
      headerName: '휴대전화',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        {/* 검색 영역 */}
        <Box sx={{ mt: 1, mb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>검색 조건</InputLabel>
              <Select
                value={inputValues.searchCnd}
                label="검색 조건"
                onChange={(e) => handleInputChange('searchCnd', e.target.value)}
              >
                <MenuItem value="1">사용자 ID</MenuItem>
                <MenuItem value="2">사용자명</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              fullWidth
              value={inputValues.searchWrd}
              onChange={(e) => handleInputChange('searchWrd', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요"
            />

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{
                minWidth: 100,
                height: 40,
                flexShrink: 0,
              }}
            >
              검색
            </Button>
          </Stack>
        </Box>

        {/* 사용자 목록 */}
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.uniqId}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            rowCount={totalCount}
            paginationMode="server"
            onRowClick={(params) => setSelectedUser(params.row)}
            sx={{
              // border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
                cursor: 'pointer',
              },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={!selectedUser}
        >
          선택
        </Button>
        <Button onClick={handleClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSelectionDialog;
