import DownloadIcon from '@mui/icons-material/Download'; 
import { Alert, Box, Button, Tab, Tabs, Typography } from '@mui/material'; 
import React, { useCallback, useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import TradeAnalytics from '../components/TradeAnalytics';
import TradeFilterForm from '../components/TradeFilterForm';
import TradeTable from '../components/TradeTable';
import { exportTradeBlotterToCsv, getTradeBlotter } from '../services/tradeBlotterService';


const TradeBlotterPage = () => 
  {
  const [activeTab, setActiveTab] = useState(0); 

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDescending, setIsDescending] = useState(true);

  const [activeFilters, setActiveFilters] = useState({
    assetClasses: [],
    securityIds: [],
    traderIds: [],
    fromDate: '',
    toDate: '',
  });

  const fetchTrades = useCallback(async () => {
    if (activeTab !== 0) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        pageNumber: currentPage || 1,
        pageSize: pageSize || 10,
        isDescending: isDescending,
        assetClasses: activeFilters.assetClasses || [],
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
  }, [currentPage, pageSize,isDescending, activeFilters, activeTab]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterReset = (resetFilters) => {
    const emptyFilters = resetFilters || {
      assetClasses: [],
      securityIds: [],
      traderIds: [],
      fromDate: '',
      toDate: '',
    };
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportTradeBlotterToCsv(activeFilters);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to download CSV export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#ffffff', 
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

      {/* Filter Form */}
      <TradeFilterForm 
        onFilterChange={handleFilterChange} 
        onReset={handleFilterReset} 
      />

      {/* Navigation Tabs Bar with Export Button on the Right */}
      <Box 
        sx={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3, 
          mt: 3, 
          width: '100%' 
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          textColor="primary"
          indicatorColor="#269e9e"
        >
          <Tab label="Trade Blotter Table" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Analytics & Exposure" sx={{ fontWeight: 600, textTransform: 'none' }} />
        </Tabs>

        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
          sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2, mb: 1 , backgroundColor:'#269e9e', color: '#000000'}}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </Box>

      {/* Tab Panel 0: Table View */}
      {activeTab === 0 && (
        <Box sx={{ backgroundColor: '#ffffff', width: '100%' }}>
          <TradeTable trades={trades} loading={loading} isDescending={isDescending} onToggleSort={() => setIsDescending(prev => !prev)} />
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