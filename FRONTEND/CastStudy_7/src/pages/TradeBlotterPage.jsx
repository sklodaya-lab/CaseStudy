import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Alert, Box, Tabs, Tab } from '@mui/material';
import TradeFilterForm from '../components/TradeFilterForm';
import TradeTable from '../components/TradeTable';
import Pagination from '../components/Pagination';
import TradeAnalytics from '../components/TradeAnalytics';
import { getTradeBlotter } from '../services/tradeBlotterService';

const TradeBlotterPage = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Blotter Table, 1 = Analytics

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Shared Filter state
  const [activeFilters, setActiveFilters] = useState({
    securityIds: [],
    traderIds: [],
    fromDate: '',
    toDate: '',
  });

  const fetchTrades = useCallback(async () => {
    // Only fetch table data when the Blotter Table tab is active
    if (activeTab !== 0) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        pageNumber: currentPage || 1,
        pageSize: pageSize || 10,
        securityIds: activeFilters.securityIds || [],
        traderIds: activeFilters.traderIds || [],
        fromDate: activeFilters.fromDate || null,
        toDate: activeFilters.toDate || null,
      };

      const response = await getTradeBlotter(params);

      if (response && (response.items || response.Items)) {
        const items = response.items || response.Items || [];
        const total = response.totalRecords ?? response.TotalRecords ?? 0;
        const calculatedPages = Math.ceil(total / (pageSize || 10)) || 1;

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
      setError('Failed to load trade data. Please check network connection.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeFilters, activeTab]);

  // Re-fetch trades whenever page, filters, OR tab changes
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Handle live filter change (instant search)
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset back to Page 1 when filters change
  };

  // Handle filter reset
  const handleFilterReset = (resetFilters) => {
    const emptyFilters = resetFilters || {
      securityIds: [],
      traderIds: [],
      fromDate: '',
      toDate: '',
    };
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f4f6f8', 
        minHeight: '100vh', 
        py: 3, 
        px: { xs: 2, sm: 4, md: 5 }, 
        width: '100%', 
        boxSizing: 'border-box' 
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
        Trade Blotter
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Form (Triggers instant changes on both Table and Analytics) */}
      <TradeFilterForm 
        onFilterChange={handleFilterChange} 
        onReset={handleFilterReset} 
      />

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 3, width: '100%' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Trade Blotter Table" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Analytics & Exposure" sx={{ fontWeight: 600, textTransform: 'none' }} />
        </Tabs>
      </Box>

      {/* Tab Panel 0: Table View */}
      {activeTab === 0 && (
        <Box sx={{ width: '100%' }}>
          <TradeTable trades={trades} loading={loading} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </Box>
      )}

      {/* Tab Panel 1: Analytics View */}
      {activeTab === 1 && (
        <Box sx={{ width: '100%' }}>
          <TradeAnalytics filters={activeFilters} />
        </Box>
      )}
    </Box>
  );
};

export default TradeBlotterPage;