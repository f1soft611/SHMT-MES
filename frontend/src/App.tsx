import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import Layout from './components/common/Layout/Layout';
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
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/production-orders"
                element={<ProductionOrderList />}
              />
              <Route
                path="/production-results"
                element={<ProductionResultList />}
              />
              <Route
                path="/production-results/new"
                element={<ProductionResultForm />}
              />
              <Route
                path="/production-results/:id/edit"
                element={<ProductionResultForm />}
              />
              <Route path="/interface" element={<InterfaceMonitor />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
