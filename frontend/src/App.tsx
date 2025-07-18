import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';

import URL from './constants/url';

import Layout from './components/common/Layout/Layout';
import BaseData from './pages/BaseData/BaseData';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductionOrderList from './pages/ProductionOrder/ProductionOrderList';
import ProductionResultList from './pages/ProductionResult/ProductionResultList';
import ProductionResultForm from './pages/ProductionResult/ProductionResultForm';
import InterfaceMonitor from './pages/Interface/InterfaceMonitor';

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
        <Router>
          <Layout>
            <Routes>
              <Route path={URL.MAIN} element={<Dashboard />} />
              <Route path={URL.BASE_DATA} element={<BaseData />} />
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
              <Route path={URL.INTERFACE} element={<InterfaceMonitor />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
