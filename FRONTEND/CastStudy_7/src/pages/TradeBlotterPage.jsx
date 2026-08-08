import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import TradeFilterForm from '../components/TradeFilterForm';
import TradeTable from '../components/TradeTable';
import Pagination from '../components/Pagination';
import { getTradeBlotter } from '../services/tradeBlotterService';

const TradeBlotterPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    securityIds: [],
    traderIds: [],
    fromDate: '',
    toDate: '',
  });

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        securityIds: activeFilters.securityIds || [],
        traderIds: activeFilters.traderIds || [],
        fromDate: activeFilters.fromDate || null,
        toDate: activeFilters.toDate || null,
      };

      const response = await getTradeBlotter(params);

      if (response && (response.items || response.Items)) {
        const items = response.items || response.Items || [];
        const total = response.totalRecords ?? response.TotalRecords ?? 0;
        const calculatedPages = Math.ceil(total / pageSize) || 1;

        setTrades(items);
        setTotalRecords(total);
        setTotalPages(calculatedPages);
      } else {
        setTrades([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch trade blotter data:', err);
      setError('Failed to load trade data. Check API URL.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeFilters]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterReset = (resetFilters) => {
    setActiveFilters(resetFilters || {
      securityIds: [],
      traderIds: [],
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
  };

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
          Trade Blotter
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TradeFilterForm 
          onFilterChange={handleFilterChange} 
          onReset={handleFilterReset} 
        />

        <TradeTable 
          trades={trades} 
          loading={loading} 
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </Container>
    </Box>
  );
};

export default TradeBlotterPage;