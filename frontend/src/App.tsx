import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';

import URL from './constants/url';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/common/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import CommonCodeManagement from './pages/BaseData/CommonCodeManagement/CommonCodeManagement';
import WorkplaceManagement from './pages/BaseData/WorkplaceManagement';
import ProcessManagement from './pages/BaseData/ProcessManagement/ProcessManagement';
import EquipmentManagement from './pages/BaseData/EquipmentManagement';
import ItemManagement from './pages/BaseData/ItemManagement/ItemManagement';
import ProductionPlan from './pages/ProductionPlan/ProductionPlan';
import ProductionOrderList from './pages/ProductionOrder/ProductionOrderList';
import ProductionResultList from './pages/ProductionResult/ProductionResultList';
import ProductionResultForm from './pages/ProductionResult/ProductionResultForm';
import SchedulerManagement from './pages/Scheduler/SchedulerManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MenuManagement from './pages/Admin/MenuManagement';
import PermissionManagement from './pages/Admin/PermissionManagement';
import UserManagement from './pages/Admin/UserManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
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
                          element={<ProductionOrderList />}
                        />
                        <Route
                          path={URL.PRODUCTION_RESULTS}
                          element={<ProductionResultList />}
                        />
                        <Route
                          path={`${URL.PRODUCTION_RESULTS}/new`}
                          element={<ProductionResultForm />}
                        />
                        <Route
                          path={`${URL.PRODUCTION_RESULTS}/:id/edit`}
                          element={<ProductionResultForm />}
                        />
                        {/* <Route
                          path={URL.INTERFACE}
                          element={<InterfaceMonitor />}
                        /> */}
                        <Route
                          path={URL.SCHEDULER}
                          element={<SchedulerManagement />}
                        />
                        <Route path={URL.ADMIN} element={<AdminDashboard />} />
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
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
