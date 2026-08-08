import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { getTradeBlotterAnalytics } from '../services/tradeBlotterService';

const TradeAnalytics = ({ filters }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTradeBlotterAnalytics(filters);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load trade analytics:', err);
        setError('Failed to load exposure metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [filters]);

  const formatNumber = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCompact = (val) => {
    const num = Number(val) || 0;
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} k`;
    return String(num);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2, width: '100%' }}>{error}</Alert>;
  }

  if (!analytics) return null;

  const buyVolume = Number(analytics.buyNotionalVolume ?? analytics.BuyNotionalVolume ?? 0);
  const sellVolume = Number(analytics.sellNotionalVolume ?? analytics.SellNotionalVolume ?? 0);
  const totalVolume = Number(analytics.totalNotionalVolume ?? analytics.TotalNotionalVolume ?? 0);
  const totalCount = Number(analytics.totalTradeCount ?? analytics.TotalTradeCount ?? 0);

  const netExposure = buyVolume - sellVolume;
  const isNetLong = netExposure >= 0;

  const pieData = [
    { id: 0, value: buyVolume, label: 'Buy Volume', color: '#2e7d32' },
    { id: 1, value: sellVolume, label: 'Sell Volume', color: '#c62828' }
  ];

  const rawBreakdown = analytics.traderBreakdown || analytics.TraderBreakdown || [];
  const sortedBreakdown = [...rawBreakdown].sort((a, b) => {
    const volA = Number(a.totalVolume ?? a.TotalVolume ?? 0);
    const volB = Number(b.totalVolume ?? b.TotalVolume ?? 0);
    return volB - volA;
  });

  const traderNames = sortedBreakdown.map((item) => String(item.traderName ?? item.TraderName ?? 'Unknown'));
  const traderVolumes = sortedBreakdown.map((item) => Number(item.totalVolume ?? item.TotalVolume ?? 0));

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* SECTION 1: TOP KPI METRIC CARDS (Flexbox Row) */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 3, flexWrap: 'wrap', width: '100%' }}>
        {/* Total Market Exposure */}
        <Paper sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #1976d2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>
              TOTAL GROSS EXPOSURE
            </Typography>
            <AccountBalanceWalletIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {formatNumber(totalVolume)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Across {totalCount} executed trades
          </Typography>
        </Paper>

        {/* Buy Volume */}
        <Paper sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #2e7d32' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>
              BUY NOTIONAL VOLUME
            </Typography>
            <ShoppingCartIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>
            {formatNumber(buyVolume)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Capital Allocated
          </Typography>
        </Paper>

        {/* Sell Volume */}
        <Paper sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '5px solid #c62828' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>
              SELL NOTIONAL VOLUME
            </Typography>
            <SellIcon sx={{ color: '#c62828', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#c62828' }}>
            {formatNumber(sellVolume)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Capital Liquidated
          </Typography>
        </Paper>

        {/* Net Market Exposure */}
        <Paper sx={{ flex: '1 1 220px', p: 2.5, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: `5px solid ${isNetLong ? '#0284c7' : '#d97706'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>
              NET MARKET EXPOSURE
            </Typography>
            <CompareArrowsIcon sx={{ color: isNetLong ? '#0284c7' : '#d97706', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isNetLong ? '#0284c7' : '#d97706' }}>
            {formatNumber(Math.abs(netExposure))}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip 
              label={isNetLong ? 'NET LONG' : 'NET SHORT'} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '10px', 
                fontWeight: 800,
                bgcolor: isNetLong ? '#e0f2fe' : '#fef3c7',
                color: isNetLong ? '#0369a1' : '#b45309'
              }} 
            />
          </Box>
        </Paper>
      </Box>

      {/* SECTION 2: FULL WIDTH CHARTS (Flexbox Row) */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' }, width: '100%' }}>
        {/* Donut Chart Box */}
        <Paper sx={{ flex: '1 1 40%', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', minWidth: 300 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Exposure Split (Buy vs Sell)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Volume allocation ratio
          </Typography>

          <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 60,
                  outerRadius: 95,
                  paddingAngle: 4,
                  cornerRadius: 6,
                  valueFormatter: (item) => formatNumber(item.value),
                },
              ]}
              height={280}
            />
          </Box>
        </Paper>

        {/* Bar Chart Box */}
        <Paper sx={{ flex: '1 1 60%', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', minWidth: 320 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Trader Volume Leaderboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total volume executed per trader
          </Typography>

          <Box sx={{ width: '100%', height: 300 }}>
            {traderNames.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: traderNames,
                  },
                ]}
                yAxis={[
                  {
                    scaleType: 'linear',
                    valueFormatter: (v) => formatCompact(v),
                  },
                ]}
                series={[
                  {
                    data: traderVolumes,
                    color: '#2563eb',
                    label: 'Total Volume',
                    valueFormatter: (v) => formatNumber(v),
                  },
                ]}
                height={280}
              />
            ) : (
              <Typography color="text.secondary" sx={{ py: 4 }}>
                No trader data found.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TradeAnalytics;