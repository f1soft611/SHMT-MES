# 프론트엔드 개발 가이드 (Frontend Development Guide)

## 목차
- [프로젝트 개요](#프로젝트-개요)
- [개발 환경 설정](#개발-환경-설정)
- [아키텍처 및 패턴](#아키텍처-및-패턴)
- [코드 패턴 및 규칙](#코드-패턴-및-규칙)
- [새 기능 개발 가이드](#새-기능-개발-가이드)
- [컴포넌트 작성 가이드](#컴포넌트-작성-가이드)
- [상태 관리](#상태-관리)
- [API 연동](#api-연동)
- [스타일링](#스타일링)
- [테스트 작성](#테스트-작성)
- [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 기술 스택
- **Framework**: React 18.x
- **Language**: TypeScript 4.x
- **Build Tool**: Create React App (Webpack)
- **UI Library**: Material-UI (MUI) 5.x
- **HTTP Client**: Axios
- **State Management**: React Context API + Hooks
- **Routing**: React Router 6.x
- **Date Handling**: date-fns
- **Form Validation**: 자체 구현

### 프로젝트 구조
```
frontend/
├── public/                          # 정적 파일
│   ├── index.html                   # HTML 템플릿
│   ├── manifest.json                # PWA 매니페스트
│   └── favicon.png                  # 파비콘
├── src/
│   ├── index.tsx                    # 애플리케이션 진입점
│   ├── App.tsx                      # 루트 컴포넌트
│   ├── App.css                      # 전역 스타일
│   ├── components/                  # 재사용 컴포넌트
│   │   ├── common/                  # 공통 컴포넌트
│   │   │   ├── Layout/              # 레이아웃 컴포넌트
│   │   │   ├── Sidebar/             # 사이드바
│   │   │   ├── Pagination/          # 페이지네이션
│   │   │   ├── SearchFilters/       # 검색 필터
│   │   │   ├── SkeletonUI/          # 스켈레톤 로딩
│   │   │   └── ProtectedRoute/      # 권한 라우트
│   │   ├── Interface/               # 인터페이스 컴포넌트
│   │   ├── Scheduler/               # 스케줄러 컴포넌트
│   │   └── auth/                    # 인증 컴포넌트
│   ├── pages/                       # 페이지 컴포넌트
│   │   ├── Login/                   # 로그인 페이지
│   │   ├── Dashboard/               # 대시보드
│   │   ├── BaseData/                # 기준정보
│   │   │   ├── ItemManagement/      # 품목 관리
│   │   │   ├── ProcessManagement/   # 공정 관리
│   │   │   ├── WorkplaceManagement/ # 작업장 관리
│   │   │   └── CommonCodeManagement/# 공통코드 관리
│   │   ├── ProductionOrder/         # 생산 지시
│   │   ├── ProductionPlan/          # 생산 계획
│   │   ├── ProductionResult/        # 생산 실적
│   │   ├── Interface/               # 인터페이스 모니터
│   │   ├── Scheduler/               # 스케줄러 관리
│   │   └── Admin/                   # 관리자 페이지
│   ├── services/                    # API 서비스
│   │   ├── api.ts                   # 기본 API 클라이언트
│   │   ├── authService.ts           # 인증 서비스
│   │   ├── itemService.ts           # 품목 API
│   │   ├── commonCodeService.ts     # 공통코드 API
│   │   ├── schedulerService.ts      # 스케줄러 API
│   │   └── admin/                   # 관리자 API
│   ├── hooks/                       # 커스텀 훅
│   │   ├── useAuth.ts               # 인증 훅
│   │   ├── useUrlState.ts           # URL 상태 관리 훅
│   │   └── usePermissions.ts        # 권한 관리 훅
│   ├── contexts/                    # Context 제공자
│   │   ├── AuthContext.tsx          # 인증 컨텍스트
│   │   └── PermissionContext.tsx    # 권한 컨텍스트
│   ├── types/                       # TypeScript 타입 정의
│   │   ├── index.ts                 # 공통 타입
│   │   ├── item.ts                  # 품목 타입
│   │   ├── commonCode.ts            # 공통코드 타입
│   │   └── auth.ts                  # 인증 타입
│   ├── constants/                   # 상수 정의
│   │   ├── url.js                   # URL 상수
│   │   └── constants.ts             # 기타 상수
│   ├── util/                        # 유틸리티 함수
│   │   ├── axios.ts                 # Axios 설정
│   │   └── formatters.ts            # 포맷팅 유틸
│   └── styles/                      # 스타일 파일
├── env.development                  # 개발 환경 변수
├── env.production                   # 운영 환경 변수
├── package.json                     # 의존성 관리
└── tsconfig.json                    # TypeScript 설정
```

---

## 개발 환경 설정

### 1. 필수 소프트웨어 설치
```bash
# Node.js 14 이상 설치 확인
node -v

# npm 확인
npm -v
```

### 2. 프로젝트 설치 및 실행
```bash
# 프로젝트 클론
git clone [repository-url]
cd SHMT-MES/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

### 3. 환경 변수 설정
```bash
# env.development
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ENV=development

# env.production
REACT_APP_API_BASE_URL=https://api.production.com
REACT_APP_ENV=production
```

### 4. 브라우저 접속
- 개발 서버: `http://localhost:3000`
- 기본 로그인: `admin / 1`

---

## 아키텍처 및 패턴

### 컴포넌트 계층 구조
```
[Pages]                  ← 페이지 레벨 컴포넌트 (라우팅)
    ↓
[Feature Components]     ← 기능별 컴포넌트
    ↓
[Common Components]      ← 재사용 공통 컴포넌트
    ↓
[UI Library (MUI)]       ← Material-UI 컴포넌트
```

### 데이터 흐름
```
[User Action]
    ↓
[Component Event Handler]
    ↓
[Service Layer (API Call)]
    ↓
[Backend API]
    ↓
[Response Processing]
    ↓
[State Update (useState)]
    ↓
[Component Re-render]
```

### 폴더 구조 규칙
```
src/
├── components/              # 재사용 컴포넌트
│   ├── common/              # 전역 공통
│   │   └── Button/
│   │       ├── index.tsx    # 컴포넌트 파일
│   │       └── styles.css   # 스타일 (옵션)
│   └── [domain]/            # 도메인별
├── pages/                   # 페이지 컴포넌트
│   └── [PageName]/
│       ├── index.tsx        # 메인 페이지
│       ├── components/      # 페이지 전용 컴포넌트
│       └── styles/          # 페이지 전용 스타일
├── services/                # API 서비스
│   └── [domain]Service.ts
├── types/                   # 타입 정의
│   └── [domain].ts
└── hooks/                   # 커스텀 훅
    └── use[Feature].ts
```

### 명명 규칙

#### 파일 명명
- **컴포넌트**: PascalCase (예: `ProductionOrderList.tsx`)
- **서비스**: camelCase (예: `productionOrderService.ts`)
- **타입**: camelCase (예: `productionOrder.ts`)
- **훅**: camelCase with 'use' prefix (예: `useProductionOrder.ts`)
- **스타일**: 컴포넌트명과 동일 (예: `ProductionOrderList.css`)

#### 컴포넌트 명명
```typescript
// 페이지 컴포넌트
const ProductionOrderListPage: React.FC = () => { }

// 기능 컴포넌트
const ProductionOrderTable: React.FC = () => { }

// 공통 컴포넌트
const CustomButton: React.FC = () => { }
```

#### 변수 및 함수 명명
```typescript
// 변수: camelCase
const productionOrder = { };
const isLoading = false;

// 함수: camelCase
const handleClick = () => { };
const fetchData = async () => { };

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://...';
const MAX_RETRY_COUNT = 3;

// 타입/인터페이스: PascalCase
interface ProductionOrder { }
type StatusType = 'PENDING' | 'COMPLETED';
```

---

## 코드 패턴 및 규칙

### 1. 페이지 컴포넌트 작성 패턴

```typescript
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// 서비스 import
import { productionOrderService } from '../../services/productionOrderService';

// 타입 import
import { ProductionOrder } from '../../types';

// 공통 컴포넌트 import
import SearchFiltersComponent, { SearchFilters } from '../../components/common/SearchFilters/SearchFilters';
import SkeletonTable from '../../components/common/SkeletonUI/SkeletonTable';

// 커스텀 훅 import
import { useUrlState } from '../../hooks/useUrlState';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * 생산 지시 목록 페이지
 */
const ProductionOrderListPage: React.FC = () => {
  // ========== State 관리 ==========
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  });

  // ========== Custom Hooks ==========
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/production/orders');
  
  const [urlState, setUrlState] = useUrlState({
    page: 0,
    searchKeyword: '',
  });

  // ========== Effects ==========
  useEffect(() => {
    fetchData();
  }, [urlState.page, urlState.searchKeyword]);

  // ========== API 호출 함수 ==========
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.getProductionOrderList(
        urlState.page,
        pagination.pageSize,
        {
          searchKeyword: urlState.searchKeyword,
        }
      );

      if (response.resultCode === 200) {
        setData(response.result.resultList || []);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.result.resultCnt || 0,
          currentPage: urlState.page,
        }));
      }
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== Event Handlers ==========
  const handleSearch = (filters: SearchFilters) => {
    setUrlState({
      ...urlState,
      page: 0,
      searchKeyword: filters.searchKeyword || '',
    });
  };

  const handlePageChange = (newPage: number) => {
    setUrlState({ ...urlState, page: newPage });
  };

  const handleCreate = () => {
    // 등록 로직
  };

  const handleEdit = (item: ProductionOrder) => {
    // 수정 로직
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await productionOrderService.deleteProductionOrder(id);
      alert('삭제되었습니다.');
      fetchData();
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  // ========== Render ==========
  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">생산 지시 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={!canWrite}
        >
          등록
        </Button>
      </Box>

      {/* 검색 필터 */}
      <SearchFiltersComponent
        onSearch={handleSearch}
        initialFilters={{
          searchKeyword: urlState.searchKeyword,
        }}
      />

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 데이터 테이블 */}
      {loading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : (
        <Box>
          {/* 테이블 내용 */}
          {data.map((item) => (
            <Box key={item.id}>
              {/* 아이템 렌더링 */}
            </Box>
          ))}
        </Box>
      )}

      {/* 페이지네이션 */}
      {/* Pagination Component */}
    </Box>
  );
};

export default ProductionOrderListPage;
```

### 2. 서비스 계층 작성 패턴

```typescript
// services/productionOrderService.ts

import apiClient from './api';
import { ProductionOrder, ProductionOrderSearchParams } from '../types';

/**
 * 생산 지시 API 서비스
 */
export const productionOrderService = {
  /**
   * 생산 지시 목록 조회
   * @param page 페이지 번호 (0부터 시작)
   * @param pageSize 페이지 크기
   * @param params 검색 파라미터
   */
  getProductionOrderList: async (
    page: number = 0,
    pageSize: number = 20,
    params?: ProductionOrderSearchParams
  ) => {
    const requestParams = {
      pageIndex: page + 1, // 백엔드는 1부터 시작
      pageUnit: pageSize,
      ...params,
    };

    const response = await apiClient.get('/api/production-orders', {
      params: requestParams,
    });
    return response.data;
  },

  /**
   * 생산 지시 상세 조회
   * @param id 생산 지시 ID
   */
  getProductionOrder: async (id: string) => {
    const response = await apiClient.get(`/api/production-orders/${id}`);
    return response.data;
  },

  /**
   * 생산 지시 등록
   * @param data 생산 지시 데이터
   */
  createProductionOrder: async (data: ProductionOrder) => {
    const response = await apiClient.post('/api/production-orders', data);
    return response.data;
  },

  /**
   * 생산 지시 수정
   * @param id 생산 지시 ID
   * @param data 수정할 데이터
   */
  updateProductionOrder: async (id: string, data: Partial<ProductionOrder>) => {
    const response = await apiClient.put(`/api/production-orders/${id}`, data);
    return response.data;
  },

  /**
   * 생산 지시 삭제
   * @param id 생산 지시 ID
   */
  deleteProductionOrder: async (id: string) => {
    const response = await apiClient.delete(`/api/production-orders/${id}`);
    return response.data;
  },
};

export default productionOrderService;
```

### 3. 타입 정의 패턴

```typescript
// types/productionOrder.ts

/**
 * 생산 지시 타입
 */
export interface ProductionOrder {
  id: string;
  orderNo: string;
  itemId: string;
  itemName?: string;
  orderQuantity: number;
  scheduledDate: string;
  status: ProductionOrderStatus;
  workplaceId: string;
  workplaceName?: string;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

/**
 * 생산 지시 상태
 */
export type ProductionOrderStatus = 
  | 'PENDING'    // 대기
  | 'IN_PROGRESS' // 진행중
  | 'COMPLETED'   // 완료
  | 'CANCELLED';  // 취소

/**
 * 생산 지시 검색 파라미터
 */
export interface ProductionOrderSearchParams {
  searchKeyword?: string;
  status?: ProductionOrderStatus;
  startDate?: string;
  endDate?: string;
  workplaceId?: string;
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  result: T;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  resultList: T[];
  resultCnt: number;
  paginationInfo?: {
    currentPageNo: number;
    totalPageCount: number;
    recordCountPerPage: number;
  };
}
```

### 4. 커스텀 훅 작성 패턴

```typescript
// hooks/useProductionOrder.ts

import { useState, useCallback } from 'react';
import { productionOrderService } from '../services/productionOrderService';
import { ProductionOrder, ProductionOrderSearchParams } from '../types';

/**
 * 생산 지시 관리 커스텀 훅
 */
export const useProductionOrder = () => {
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 생산 지시 목록 조회
   */
  const fetchList = useCallback(async (
    page: number,
    pageSize: number,
    params?: ProductionOrderSearchParams
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.getProductionOrderList(
        page,
        pageSize,
        params
      );

      if (response.resultCode === 200) {
        setData(response.result.resultList || []);
        return response.result;
      } else {
        throw new Error(response.resultMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 생산 지시 등록
   */
  const create = useCallback(async (data: ProductionOrder) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.createProductionOrder(data);

      if (response.resultCode === 200) {
        return response.result;
      } else {
        throw new Error(response.resultMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || '등록에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 생산 지시 수정
   */
  const update = useCallback(async (id: string, data: Partial<ProductionOrder>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.updateProductionOrder(id, data);

      if (response.resultCode === 200) {
        return response.result;
      } else {
        throw new Error(response.resultMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || '수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 생산 지시 삭제
   */
  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productionOrderService.deleteProductionOrder(id);

      if (response.resultCode === 200) {
        return response.result;
      } else {
        throw new Error(response.resultMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || '삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchList,
    create,
    update,
    remove,
  };
};
```

---

## 새 기능 개발 가이드

### Step 1: 타입 정의
```typescript
// src/types/newFeature.ts
export interface NewFeature {
  id: string;
  name: string;
  // ... 필드 정의
}
```

### Step 2: 서비스 작성
```typescript
// src/services/newFeatureService.ts
import apiClient from './api';

export const newFeatureService = {
  getList: async () => { },
  create: async (data: NewFeature) => { },
  update: async (id: string, data: NewFeature) => { },
  delete: async (id: string) => { },
};
```

### Step 3: 페이지 컴포넌트 작성
```typescript
// src/pages/NewFeature/index.tsx
import React from 'react';

const NewFeaturePage: React.FC = () => {
  // State, Hooks, Handlers
  return <div>New Feature Page</div>;
};

export default NewFeaturePage;
```

### Step 4: 라우트 추가
```typescript
// src/App.tsx
import NewFeaturePage from './pages/NewFeature';

// Route 추가
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### Step 5: 메뉴 추가
```typescript
// constants/url.js
export const URL_NEW_FEATURE = '/new-feature';

// Sidebar 컴포넌트에 메뉴 추가
```

---

## 컴포넌트 작성 가이드

### 재사용 가능한 공통 컴포넌트

```typescript
// components/common/CustomButton/index.tsx

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
}));

/**
 * 커스텀 버튼 컴포넌트
 */
const CustomButton: React.FC<CustomButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
    >
      {loading ? '처리중...' : children}
    </StyledButton>
  );
};

export default CustomButton;
```

### Material-UI 스타일링

```typescript
import { styled } from '@mui/material/styles';
import { Box, Card } from '@mui/material';

// Styled Component
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

// sx prop 사용
<Box
  sx={{
    p: 2,
    mb: 2,
    display: 'flex',
    justifyContent: 'space-between',
  }}
>
  Content
</Box>
```

---

## 상태 관리

### 1. useState 사용
```typescript
const [data, setData] = useState<ProductionOrder[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 2. Context API 사용
```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 3. 권한 관리
```typescript
import { usePermissions } from '../../contexts/PermissionContext';

const MyComponent = () => {
  const { hasWritePermission } = usePermissions();
  const canWrite = hasWritePermission('/base-data/items');

  return (
    <Button disabled={!canWrite}>
      등록
    </Button>
  );
};
```

---

## API 연동

### Axios 설정
```typescript
// util/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (토큰 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 - 로그인 페이지로 이동
      localStorage.removeItem('jToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API 호출 패턴
```typescript
// 기본 GET 요청
const fetchData = async () => {
  try {
    const response = await apiClient.get('/api/endpoint');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// POST 요청
const createData = async (data: any) => {
  try {
    const response = await apiClient.post('/api/endpoint', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT 요청
const updateData = async (id: string, data: any) => {
  const response = await apiClient.put(`/api/endpoint/${id}`, data);
  return response.data;
};

// DELETE 요청
const deleteData = async (id: string) => {
  const response = await apiClient.delete(`/api/endpoint/${id}`);
  return response.data;
};
```

---

## 스타일링

### Material-UI 테마 커스터마이징
```typescript
// App.tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* App Content */}
    </ThemeProvider>
  );
}
```

### 반응형 디자인
```typescript
import { useMediaQuery, useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        flexDirection: isMobile ? 'column' : 'row',
        padding: isTablet ? 2 : 3,
      }}
    >
      Content
    </Box>
  );
};
```

---

## 테스트 작성

### 컴포넌트 테스트
```typescript
// ProductionOrderList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductionOrderList from './ProductionOrderList';
import { productionOrderService } from '../../services/productionOrderService';

jest.mock('../../services/productionOrderService');

describe('ProductionOrderList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render production orders', async () => {
    const mockData = [
      { id: '1', orderNo: '2025-001', itemName: 'Product A' },
    ];

    (productionOrderService.getProductionOrderList as jest.Mock).mockResolvedValue({
      resultCode: 200,
      result: { resultList: mockData, resultCnt: 1 },
    });

    render(<ProductionOrderList />);

    await waitFor(() => {
      expect(screen.getByText('2025-001')).toBeInTheDocument();
    });
  });

  it('should handle create button click', async () => {
    const user = userEvent.setup();
    render(<ProductionOrderList />);

    const createButton = screen.getByRole('button', { name: /등록/i });
    await user.click(createButton);

    // Dialog가 열렸는지 확인
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

---

## 트러블슈팅

### 자주 발생하는 문제

#### 1. CORS 에러
**해결**: 백엔드에서 CORS 설정 확인

```typescript
// 프론트엔드에서 프록시 설정 (package.json)
{
  "proxy": "http://localhost:8080"
}
```

#### 2. TypeScript 타입 에러
```typescript
// any 사용 최소화
const data: ProductionOrder[] = []; // ✅
const data: any = []; // ❌

// 타입 단언 사용
const data = response.data as ProductionOrder[];
```

#### 3. 무한 리렌더링
```typescript
// useEffect 의존성 배열 확인
useEffect(() => {
  fetchData();
}, []); // ✅ 빈 배열: 한 번만 실행

useEffect(() => {
  fetchData();
}); // ❌ 의존성 없음: 매 렌더링마다 실행
```

#### 4. 메모리 누수
```typescript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const data = await api.getData();
    if (isMounted) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    isMounted = false; // 컴포넌트 언마운트 시 플래그 변경
  };
}, []);
```

---

## 추가 리소스

### 공식 문서
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)

### 관련 문서
- [백엔드 개발 가이드](./BACKEND_DEVELOPMENT_GUIDE.md)
- [통합 개발 워크플로우](./DEVELOPMENT_WORKFLOW.md)
- [권한별 읽기쓰기 가이드](./권한별_읽기쓰기_가이드.md)

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-07  
**작성자**: GitHub Copilot
