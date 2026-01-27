import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Item } from '../../../types/item';
import itemService from '../../../services/itemService';
import ItemDetailDialog from './components/ItemDetailDialog';
import DataTable from '../../../components/common/DataTable/DataTable';
import PageHeader from '../../../components/common/PageHeader/PageHeader';
import ConfirmDialog from '../../../components/common/Feedback/ConfirmDialog';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { usePermissions } from '../../../contexts/PermissionContext';

// 천단위 콤마 포맷 함수
const formatNumber = (value: string | number | undefined): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('ko-KR');
};

// 콤마 제거 함수
const removeCommas = (value: string): string => {
  return value.replace(/,/g, '');
};

// 품목 등록 유효성 검사 스키마
const itemSchema: yup.ObjectSchema<Item> = yup.object({
  itemId: yup.string().optional(),
  itemCode: yup
    .string()
    .required('품목 코드는 필수입니다.')
    .matches(
      /^[A-Za-z0-9-_]+$/,
      '품목 코드는 영문, 숫자, 하이픈(-), 언더스코어(_)만 입력 가능합니다.',
    )
    .max(50, '품목 코드는 최대 50자까지 입력 가능합니다.'),
  itemName: yup.string().required('품목명은 필수입니다.'),
  itemType: yup.string().optional(),
  specification: yup.string().optional(),
  unit: yup.string().optional(),
  unitName: yup.string().optional(),
  stockQty: yup.string().optional(),
  safetyStock: yup.string().optional(),
  remark: yup.string().optional(),
  interfaceYn: yup.string().optional(),
  useYn: yup.string().optional(),
  regUserId: yup.string().optional(),
  regDt: yup.string().optional(),
  updUserId: yup.string().optional(),
  updDt: yup.string().optional(),
});

const ItemManagement: React.FC = () => {
  // 권한 체크
  const { hasWritePermission, hasDeletePermission } = usePermissions();
  const canWrite = hasWritePermission('/base/item');
  const canDelete = hasDeletePermission('/base/item');

  // 페이지 로드 시 권한 새로고침
  // useEffect(() => {
  //   const refreshPerms = async () => {
  //     await refreshPermissions();
  //   };
  //   refreshPerms();
  // }, [refreshPermissions]);

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    itemCode?: string;
  }>({ open: false });
  const { showToast } = useToast();

  // react-hook-form 설정
  const {
    control: itemControl,
    handleSubmit: handleItemSubmit,
    reset: resetItemForm,
    formState: { errors: itemErrors },
  } = useForm<Item>({
    resolver: yupResolver(itemSchema),
    defaultValues: {
      itemCode: '',
      itemName: '',
      itemType: 'PRODUCT',
      specification: '',
      unit: '',
      stockQty: '0',
      safetyStock: '0',
      remark: '',
      interfaceYn: 'N',
      useYn: 'Y',
    },
  });

  // 실제 검색에 사용되는 파라미터
  const [searchParams, setSearchParams] = useState({
    searchCnd: '1',
    searchWrd: '',
    itemType: '',
    useYn: 'Y',
  });

  // 입력 필드용 상태 (화면 입력용)
  const [inputValues, setInputValues] = useState({
    searchCnd: '1',
    searchWrd: '',
    itemType: '',
    useYn: 'Y',
  });

  // 품목 목록 조회 (searchParams, paginationModel 의존성으로 자동 실행)
  const fetchItems = useCallback(async () => {
    try {
      const response = await itemService.getItemList(
        paginationModel.page,
        paginationModel.pageSize,
        searchParams,
      );
      if (response.resultCode === 200 && response.result?.resultList) {
        setItems(response.result.resultList);
        setTotalCount(parseInt(response.result.resultCnt || '0'));
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      showToast({
        message: '품목 목록을 불러오는데 실패했습니다.',
        severity: 'error',
      });
    }
  }, [searchParams, paginationModel, showToast]);

  // 컴포넌트 마운트 시와 searchParams 변경 시에만 조회
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // 검색 실행 (입력값을 검색 파라미터로 복사하고 페이지를 0으로 리셋)
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

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    resetItemForm({
      itemCode: '',
      itemName: '',
      itemType: 'PRODUCT',
      specification: '',
      unit: '',
      stockQty: '0',
      safetyStock: '0',
      remark: '',
      interfaceYn: 'N',
      useYn: 'Y',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item: Item) => {
    setDialogMode('edit');
    resetItemForm(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetItemForm();
  };

  const handleSave = async (data: Item) => {
    try {
      // 콤마 제거 후 저장
      const saveData = {
        ...data,
        stockQty: removeCommas(data.stockQty || '0'),
        safetyStock: removeCommas(data.safetyStock || '0'),
      };

      if (dialogMode === 'create') {
        const result = await itemService.createItem(saveData);
        if (result.resultCode === 200) {
          showToast({ message: '품목이 등록되었습니다.', severity: 'success' });
        } else {
          showToast({ message: result.result.message, severity: 'error' });
        }
      } else {
        await itemService.updateItem(saveData.itemCode!, saveData);
        showToast({ message: '품목이 수정되었습니다.', severity: 'success' });
      }
      handleCloseDialog();
      // 저장 후 현재 검색 조건으로 다시 조회
      fetchItems();
    } catch (error) {
      console.error('Failed to save item:', error);
      showToast({ message: '저장에 실패했습니다.', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async (itemCode: string) => {
    try {
      await itemService.deleteItem(itemCode);
      showToast({ message: '품목이 삭제되었습니다.', severity: 'success' });
      // 삭제 후 현재 검색 조건으로 다시 조회
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast({ message: '삭제에 실패했습니다.', severity: 'error' });
    }
  };

  const handleDelete = (itemCode: string) => {
    setConfirmDelete({ open: true, itemCode });
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'PRODUCT':
        return '제품';
      case '1':
        return '상품';
      case 'HALF_PRODUCT':
        return '반제품';
      case '3':
        return '서비스';
      case '6':
        return '원자재';
      default:
        return itemType;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'PRODUCT':
        return 'primary';
      case '1':
        return 'success';
      case 'HALF_PRODUCT':
        return 'info';
      case '3':
        return 'warning';
      case '6':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'itemCode',
      headerName: '품목코드',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1.2,
      headerAlign: 'center',
    },
    {
      field: 'specification',
      headerName: '규격',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'itemType',
      headerName: '품목타입',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={getItemTypeLabel(params.value || 'PRODUCT')}
          color={getItemTypeColor(params.value || 'PRODUCT') as any}
          size="small"
        />
      ),
    },
    {
      field: 'unitName',
      headerName: '단위',
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'stockQty',
      headerName: '재고수량',
      flex: 0.8,
      align: 'right',
      headerAlign: 'center',
      renderCell: (params) => formatNumber(params.value),
    },
    {
      field: 'useYn',
      headerName: '사용여부',
      flex: 0.5,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'Y' ? '사용' : '미사용'}
          color={params.value === 'Y' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'regDt',
      headerName: '등록일',
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '관리',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEditDialog(params.row)}
              disabled={!canWrite}
              title="수정"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.itemCode)}
              disabled={!canDelete}
              title="삭제"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title=""
        crumbs={[{ label: '기준정보' }, { label: '품목 관리' }]}
        actionsRight={
          <Button
            variant="contained"
            color="info"
            startIcon={<RefreshIcon />}
            // onClick={handleRestartClick}
            // disabled={restartMutation.isPending}
          >
            ERP 연동
          </Button>
        }
      />

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
              value={inputValues.searchCnd}
              label="검색조건"
              onChange={(e) => handleInputChange('searchCnd', e.target.value)}
            >
              <MenuItem value="1">품목코드</MenuItem>
              <MenuItem value="2">품목명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="검색어를 입력하세요"
            value={inputValues.searchWrd}
            onChange={(e) => handleInputChange('searchWrd', e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>품목타입</InputLabel>
            <Select
              value={inputValues.itemType}
              label="품목타입"
              onChange={(e) => handleInputChange('itemType', e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="PRODUCT">제품</MenuItem>
              <MenuItem value="1">상품</MenuItem>
              <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
              <MenuItem value="3">서비스</MenuItem>
              <MenuItem value="6">원자재</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>사용여부</InputLabel>
            <Select
              value={inputValues.useYn}
              label="사용여부"
              onChange={(e) => handleInputChange('useYn', e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="Y">사용</MenuItem>
              <MenuItem value="N">미사용</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            검색
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={!canWrite}
          >
            품목 등록
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={2}>
        <DataTable
          rows={items}
          columns={columns}
          rowCount={totalCount}
          loading={false}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          getRowId={(row) => row.itemCode}
          emptyMessage="데이터가 없습니다."
        />
      </Paper>

      {/* 품목 등록/수정 다이얼로그 */}
      <ItemDetailDialog
        open={openDialog}
        dialogMode={dialogMode}
        onClose={handleCloseDialog}
        onSave={handleItemSubmit(handleSave)}
        control={itemControl}
        errors={itemErrors}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        title="품목 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        onConfirm={async () => {
          if (confirmDelete.itemCode) {
            await handleDeleteConfirm(confirmDelete.itemCode);
          }
          setConfirmDelete({ open: false });
        }}
      />
    </Box>
  );
};

export default ItemManagement;
