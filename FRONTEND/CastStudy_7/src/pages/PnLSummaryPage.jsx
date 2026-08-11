import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, CircularProgress, Alert,
  Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Button, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as signalR from '@microsoft/signalr';

import { getPnLSummary } from '../services/api';
import PnLSummaryCards from '../components/PnLSummaryCards';
import PnLTable from '../components/PnLTable';
import PnLSummaryChart from '../components/PnLSummaryChart';
import PnLPieChart from '../Components/PnLPieChart';
import { getSecurities } from '../services/tradeBlotterService';

// const HARDCODED_SECURITIES = [
//   { id: 'BD01', name: 'Government of India 7.26% GS 2033' },
//   { id: 'BD02', name: 'HDFC Ltd 8.10% NCD 2028' },
//   { id: 'BD03', name: 'Tata Capital 7.85% NCD 2029' },
//   { id: 'EQ01', name: 'Bluechip Bank Ltd' },
//   { id: 'EQ02', name: 'Prime Energy Corp' },
//   { id: 'EQ03', name: 'TechNova Systems Ltd' },
//   { id: 'EQ04', name: 'Consumer Foods Ltd' },
//   { id: 'EQ05', name: 'Metro Pharma Ltd' },
//   { id: 'ET01', name: 'Nifty 50 ETF' },
//   { id: 'ET02', name: 'Gold ETF' },
//   { id: 'ET03', name: 'Banking Sector ETF' },
// ];

export default function PnLSummaryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [securitiesList, setSecuritiesList] = useState([]);
  const [securitiesLoading, setSecuritiesLoading] = useState(true);

  // Filter states
  const [asOfDate, setAsOfDate] = useState(null);
  const [securityId, setSecurityId] = useState([]);

  // WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false);
  const [priceFlashMap, setPriceFlashMap] = useState({});
  const wsRef = useRef(null);

  // Fetch API Handler
  const handleFetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const formattedDate = asOfDate && asOfDate.isValid() ? asOfDate.format('YYYY-MM-DD') : null;

    try {
      const res = await getPnLSummary({
        asOfDate: formattedDate,
        securityId: securityId.length > 0 ? securityId : null,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [asOfDate, securityId]);


  useEffect(() => {
    getSecurities()
      .then((res) => {
        console.log(res)
        // Safely ensure we always set a valid array
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.$values)
              ? res.$values
              : [];

        setSecuritiesList(list);
        setSecuritiesLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load securities list:', err);
        setSecuritiesList([]);
        setSecuritiesLoading(false);
      });
  }, []);
  // Handle WebSocket Connection for Live Price Updates
  useEffect(() => {

    // Only establish connection when data is loaded
    if (!data || data.length === 0) return;

    // 1. Build SignalR Hub Connection using HTTPS URL (SignalR handles WS upgrade)
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7189/hubs/pnl', {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // 2. Attach SignalR Event Listener matching backend SendAsync("ReceivePriceUpdate", ...)
    connection.on('ReceivePriceUpdate', (update) => {
      try {
        // Backend Payload: { securityId: "EQ02", price: 495.20 }
        const { securityId: updatedId, price: newPrice } = update || {};

        if (!updatedId || newPrice === undefined) return;

        setData((prevData) => {
          if (!prevData) return prevData;

          return prevData.map((item) => {
            if (item.securityId !== updatedId) return item;

            const oldPrice = Number(item.closingPrice) || 0;
            const updatedPrice = Number(newPrice);

            // Frontend Recalculation
            const wac = Number(item.weightedAverageCost) || 0;
            const netPos = Number(item.netPosition) || 0;
            const realizedPnL = Number(item.realizedPnL) || 0;

            const newUnrealized = (updatedPrice - wac) * netPos;
            const newTotal = realizedPnL + newUnrealized;

            // Trigger Visual Flash Direction
            const flashClass = updatedPrice > oldPrice ? 'flash-up' : updatedPrice < oldPrice ? 'flash-down' : '';
            setPriceFlashMap((prev) => ({ ...prev, [updatedId]: flashClass }));

            // Reset flash animation
            setTimeout(() => {
              setPriceFlashMap((prev) => ({ ...prev, [updatedId]: '' }));
            }, 1200);

            return {
              ...item,
              closingPrice: updatedPrice,
              mtmUnrealizedPnL: newUnrealized,
              totalPnL: newTotal,
            };
          });
        });
      } catch (err) {
        console.error('Error handling live price update:', err);
      }
    });

    // 3. Connection State Event Handlers
    connection.onreconnecting(() => setWsConnected(false));
    connection.onreconnected(() => setWsConnected(true));
    connection.onclose(() => setWsConnected(false));

    // 4. Start Connection
    connection
      .start()
      .then(() => setWsConnected(true))
      .catch((err) => {
        console.error('SignalR Connection Error:', err);
        setWsConnected(false);
      });

    // 5. Cleanup on Unmount
    return () => {
      connection.stop();
    };
  }, [data?.length]);

  const handleResetFilters = () => {
    setAsOfDate(null);
    setSecurityId([]);
    setData(null);
    setError(null);
    if (wsRef.current) wsRef.current.close();
  };

  const handleRowClick = (selectedSecurityId) => {
    const formattedDate = asOfDate && asOfDate.isValid() ? asOfDate.format('YYYY-MM-DD') : '';
    const query = formattedDate ? `?asOfDate=${formattedDate}` : '';
    navigate(`/pnl/timeseries/${selectedSecurityId}${query}`);
  };

  // KPI Calculations (Automatically recalculates live as state updates)
  const safeData = data || [];
  const totalPnL = safeData.reduce((acc, curr) => acc + curr.totalPnL, 0);
  const totalRealized = safeData.reduce((acc, curr) => acc + curr.realizedPnL, 0);
  const totalUnrealized = safeData.reduce((acc, curr) => acc + curr.mtmUnrealizedPnL, 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Portfolio P&L Summary
          </Typography>

          {/* Live WS Status Indicator */}
          {data && (
            <Chip
              icon={wsConnected ? <WifiIcon /> : <WifiOffIcon />}
              label={wsConnected ? 'LIVE FEED ACTIVE' : 'DISCONNECTED'}
              color={wsConnected ? 'success' : 'default'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Filter Toolbar */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 4, backgroundColor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <DatePicker
                label="As Of Date (Optional)"
                value={asOfDate}
                onChange={(newValue) => setAsOfDate(newValue)}
                format="YYYY-MM-DD"
                slotProps={{ textField: { size: 'small', fullWidth: true, placeholder: 'YYYY-MM-DD' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={4} size='grow'>
              <FormControl size="small" fullWidth disabled={securitiesLoading}>
                <InputLabel id="security-select-label">
                  {securitiesLoading ? 'Loading Securities...' : 'Security (Optional)'}
                </InputLabel>
                <Select
                  labelId="security-select-label"
                  multiple
                  value={Array.isArray(securityId) ? securityId : []}
                  label={securitiesLoading ? 'Loading Securities...' : 'Security (Optional)'}
                  onChange={(e) => {
                    const { target: { value } } = e;
                    setSecurityId(typeof value === 'string' ? value.split(',') : value);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((val) => (
                        <Chip key={val} label={val} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Array.isArray(securitiesList) && securitiesList.map((item) => (
                    <MenuItem key={item.securityId} value={item.securityId}>
                      {item.securityId} - {item.securityName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={5} display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={handleFetchData}
                startIcon={<SearchIcon />}
                disableElevation
                sx={{
                  backgroundColor: '#3a05fa',
                  '&:hover': { backgroundColor: '#2b03be' },
                }}
              >
                Fetch Data
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* View States */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : data === null ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', backgroundColor: 'action.hover' }}>
            <Typography variant="h6" color="text.secondary">
              Select your filters above and click <strong>Fetch Data</strong> to view live portfolio performance.
            </Typography>
          </Paper>
        ) : (
          <>
            <PnLSummaryCards
              totalPnL={totalPnL}
              totalRealized={totalRealized}
              totalUnrealized={totalUnrealized}
            />
            <PnLSummaryChart data={data} />
            <PnLPieChart data={data} />
            <PnLTable data={data} onRowClick={handleRowClick} priceFlashMap={priceFlashMap} />
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
}