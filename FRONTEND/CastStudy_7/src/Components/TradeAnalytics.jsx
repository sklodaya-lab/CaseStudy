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

  // 1. TRADER BREAKDOWN LOGIC
  const rawTraderBreakdown = analytics.traderBreakdown || analytics.TraderBreakdown || [];
  const sortedTraderBreakdown = [...rawTraderBreakdown].sort((a, b) => {
    const volA = Number(a.totalVolume ?? a.TotalVolume ?? 0);
    const volB = Number(b.totalVolume ?? b.TotalVolume ?? 0);
    return volB - volA;
  });

  const selectedTraderIds = (filters?.traderIds || []).map(Number);
  const isFilteringTrader = selectedTraderIds.length > 0;

  // 2. ASSET CLASS BREAKDOWN LOGIC
  const rawAssetClassBreakdown = analytics.assetClassBreakdown || analytics.AssetClassBreakdown || [];
  const sortedAssetClassBreakdown = [...rawAssetClassBreakdown].sort((a, b) => {
    const volA = Number(a.totalVolume ?? a.TotalVolume ?? 0);
    const volB = Number(b.totalVolume ?? b.TotalVolume ?? 0);
    return volB - volA;
  });

  const selectedAssetClasses = filters?.assetClasses || [];
  const isFilteringAssetClass = selectedAssetClasses.length > 0;

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* SECTION 1: TOP KPI METRIC CARDS */}
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

      {/* SECTION 2: TOP CHARTS ROW */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: '100%', mb: 3 }}>
        {/* Donut Chart Box */}
        <Paper sx={{ flex: '1 1 450px', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Exposure Split (Buy vs Sell)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Volume allocation ratio
          </Typography>

          <Box sx={{ width: '100%', height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              height={260}
            />
          </Box>
        </Paper>

        {/* Asset Class Volume Chart Box (Updated with colorMap) */}
        {sortedAssetClassBreakdown.length > 0 && (
          <Paper sx={{ flex: '1 1 450px', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Asset Class Breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isFilteringAssetClass 
                    ? 'Highlighting selected asset class(es)' 
                    : 'Total volume by asset class'}
                </Typography>
              </Box>

              {isFilteringAssetClass && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#0284c7', borderRadius: '2px' }} />
                    <Typography variant="caption" fontWeight={700} color="#0284c7">Selected</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#e2e8f0', borderRadius: '2px' }} />
                    <Typography variant="caption" color="text.secondary">Others</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ width: '100%', height: 280 }}>
              <BarChart
                dataset={sortedAssetClassBreakdown.map((item) => ({
                  assetClass: String(item.assetClass ?? item.AssetClass ?? 'Unassigned'),
                  volume: Number(item.totalVolume ?? item.TotalVolume ?? 0),
                }))}
                xAxis={[
                  {
                    scaleType: 'band',
                    dataKey: 'assetClass',
                    categoryGapRatio: 0.4,
                    colorMap: {
                      type: 'ordinal',
                      colors: sortedAssetClassBreakdown.map((item) => {
                        if (!isFilteringAssetClass) return '#0284c7'; // Default Sky Blue

                        const currentClass = String(item.assetClass ?? item.AssetClass);
                        const isSelected = selectedAssetClasses.includes(currentClass);
                        return isSelected ? '#0284c7' : '#e2e8f0'; // Sky Blue vs Dimmed Light Gray
                      }),
                    },
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
                    dataKey: 'volume',
                    label: 'Notional Volume',
                    valueFormatter: (v) => formatNumber(v),
                  },
                ]}
                height={260}
              />
            </Box>
          </Paper>
        )}
      </Box>

      {/* SECTION 3: BOTTOM LEADERBOARD ROW */}
      <Paper sx={{ width: '100%', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Trader Volume Leaderboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isFilteringTrader 
                ? 'Highlighting selected trader(s) against desk peers' 
                : 'Total executed volume per trader'}
            </Typography>
          </Box>

          {/* Legend Indicator when filtering */}
          {isFilteringTrader && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#1e40af', borderRadius: '2px' }} />
                <Typography variant="caption" fontWeight={700} color="#1e40af">Selected Trader</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#e2e8f0', borderRadius: '2px' }} />
                <Typography variant="caption" color="text.secondary">Desk Peers</Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ width: '100%', height: Math.max(240, sortedTraderBreakdown.length * 55) }}>
          {sortedTraderBreakdown.length > 0 ? (
            <BarChart
              layout="horizontal"
              dataset={sortedTraderBreakdown.map((item) => ({
                traderName: String(item.traderName ?? item.TraderName ?? 'Unknown'),
                volume: Number(item.totalVolume ?? item.TotalVolume ?? 0),
                traderId: Number(item.traderId ?? item.TraderId),
              }))}
              margin={{ left: 150, right: 30, top: 10, bottom: 30 }}
              yAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'traderName',
                  categoryGapRatio: 0.35,
                  tickLabelStyle: {
                    fontSize: 12,
                    fontWeight: 600,
                    fill: '#334155',
                  },
                  colorMap: {
                    type: 'ordinal',
                    colors: sortedTraderBreakdown.map((item) => {
                      if (!isFilteringTrader) return '#2563eb'; // Default Primary Blue
                      
                      const tId = Number(item.traderId ?? item.TraderId);
                      const isSelected = selectedTraderIds.includes(tId);
                      return isSelected ? '#1e40af' : '#e2e8f0'; // Dark Blue vs Dimmed Light Gray
                    }),
                  },
                },
              ]}
              xAxis={[
                {
                  scaleType: 'linear',
                  valueFormatter: (v) => formatCompact(v),
                },
              ]}
              series={[
                {
                  dataKey: 'volume',
                  label: 'Executed Volume',
                  valueFormatter: (v) => formatNumber(v),
                },
              ]}
              height={Math.max(240, sortedTraderBreakdown.length * 55)}
            />
          ) : (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No trader data found.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TradeAnalytics;