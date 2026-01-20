import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';

import URL from './constants/url';
import { AuthProvider } from './contexts/AuthContext';
import { syncServerTime } from './utils/dateUtils';

import Layout from './components/common/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import ToastProvider from './components/common/Feedback/ToastProvider';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import CommonCodeManagement from './pages/BaseData/CommonCodeManagement';
import WorkplaceManagement from './pages/BaseData/WorkplaceManagement';
import ProcessManagement from './pages/BaseData/ProcessManagement';
import EquipmentManagement from './pages/BaseData/EquipmentManagement';
import ItemManagement from './pages/BaseData/ItemManagement';
import ProductionPlan from './pages/ProductionPlan';
import ProductionOrder from './pages/ProductionOrder';
import ProdOrder from './pages/ProdOrder';
import ProductionResult from './pages/ProdResult';
import SchedulerManagement from './pages/Scheduler';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MenuManagement from './pages/Admin/MenuManagement';
import PermissionManagement from './pages/Admin/PermissionManagement';
import UserManagement from './pages/Admin/UserManagement';
import LoginHistoryManagement from './pages/Admin/LoginHistoryManagement';
import ProcessFlowManagement from './pages/BaseData/ProcessFlowManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  // 서버 시간 동기화 초기화
  useEffect(() => {
    // 앱 시작 시 서버 시간 동기화
    syncServerTime();

    // 1시간마다 재동기화 (선택적)
    const interval = setInterval(() => {
      syncServerTime();
    }, 3600000); // 3600000ms = 1시간

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* 로그인 페이지 (보호되지 않은 경로) */}
                <Route path={URL.LOGIN} element={<Login />} />

                {/* 보호된 경로들 (로그인 필요) */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path={URL.MAIN} element={<Dashboard />} />
                          {/* <Route path={URL.BASE_DATA} element={<BaseData />} /> */}
                          <Route
                            path={URL.COMMON_CODE_MANAGEMENT}
                            element={<CommonCodeManagement />}
                          />
                          <Route
                            path={URL.WORKPLACE_MANAGEMENT}
                            element={<WorkplaceManagement />}
                          />
                          <Route
                            path={URL.PROCESS_FLOW_MANAGEMENT}
                            element={<ProcessFlowManagement />}
                          />
                          <Route
                            path={URL.PROCESS_MANAGEMENT}
                            element={<ProcessManagement />}
                          />
                          <Route
                            path={URL.EQUIPMENT_MANAGEMENT}
                            element={<EquipmentManagement />}
                          />
                          <Route
                            path={URL.ITEM_MANAGEMENT}
                            element={<ItemManagement />}
                          />
                          <Route
                            path={URL.PRODUCTION_PLAN}
                            element={<ProductionPlan />}
                          />
                          <Route
                            path={URL.PRODUCTION_ORDERS}
                            element={<ProductionOrder />}
                          />
                          <Route
                            path={URL.PRODUCTION_ORDERS2}
                            element={<ProdOrder />}
                          />
                          <Route
                            path={URL.PRODUCTION_RESULTS}
                            element={<ProductionResult />}
                          />
                          {/* <Route
                          path={URL.INTERFACE}
                          element={<InterfaceMonitor />}
                        /> */}
                          <Route
                            path={URL.SCHEDULER}
                            element={<SchedulerManagement />}
                          />
                          <Route
                            path={URL.ADMIN}
                            element={<AdminDashboard />}
                          />
                          <Route
                            path={URL.ADMIN_PERMISSIONS}
                            element={<PermissionManagement />}
                          />
                          <Route
                            path={URL.ADMIN_MENUS}
                            element={<MenuManagement />}
                          />
                          <Route
                            path={URL.ADMIN_USERS}
                            element={<UserManagement />}
                          />
                          <Route
                            path={URL.ADMIN_LOGIN_HISTORY}
                            element={<LoginHistoryManagement />}
                          />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
