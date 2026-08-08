import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getPnLSummary } from '../services/api';
import PnLSummaryCards from '../components/PnLSummaryCards';
import PnLTable from '../components/PnLTable';

const HARDCODED_SECURITIES = [
  { id: 'BD01', name: 'Government of India 7.26% GS 2033' },
  { id: 'BD02', name: 'HDFC Ltd 8.10% NCD 2028' },
  { id: 'BD03', name: 'Tata Capital 7.85% NCD 2029' },
  { id: 'EQ01', name: 'Bluechip Bank Ltd' },
  { id: 'EQ02', name: 'Prime Energy Corp' },
  { id: 'EQ03', name: 'TechNova Systems Ltd' },
  { id: 'EQ04', name: 'Consumer Foods Ltd' },
  { id: 'EQ05', name: 'Metro Pharma Ltd' },
  { id: 'ET01', name: 'Nifty 50 ETF' },
  { id: 'ET02', name: 'Gold ETF' },
  { id: 'ET03', name: 'Banking Sector ETF' },
];

export default function PnLSummaryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [asOfDate, setAsOfDate] = useState(null);
  const [securityId, setSecurityId] = useState('');

  // Fetch wrapper
  const fetchData = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPnLSummary(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load without filters
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleApplyFilters = () => {
    // Converts Dayjs object directly to 'YYYY-MM-DD' string format
    const formattedDate = asOfDate && asOfDate.isValid() 
      ? asOfDate.format('YYYY-MM-DD') 
      : null;

    fetchData({
      asOfDate: formattedDate,
      securityId: securityId || null,
    });
  };

  const handleResetFilters = () => {
    setAsOfDate(null);
    setSecurityId('');
    fetchData();
  };

  // KPI Calculations
  const totalPnL = data.reduce((acc, curr) => acc + curr.totalPnL, 0);
  const totalRealized = data.reduce((acc, curr) => acc + curr.realizedPnL, 0);
  const totalUnrealized = data.reduce((acc, curr) => acc + curr.mtmUnrealizedPnL, 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Portfolio P&L Summary
        </Typography>

        {/* Filter Controls Bar */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 4, backgroundColor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            {/* Date Picker with explicit display format */}
            <Grid item xs={12} sm={4} md={3}>
              <DatePicker
                label="As Of Date (Optional)"
                value={asOfDate}
                onChange={(newValue) => setAsOfDate(newValue)}
                format="YYYY-MM-DD"
                slotProps={{ 
                  textField: { 
                    size: 'small', 
                    fullWidth: true,
                    placeholder: 'YYYY-MM-DD'
                  } 
                }}
              />
            </Grid>

            {/* Security Dropdown */}
            <Grid item xs={12} sm={4} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="security-select-label">Security (Optional)</InputLabel>
                <Select
                  labelId="security-select-label"
                  value={securityId}
                  label="Security (Optional)"
                  onChange={(e) => setSecurityId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Securities</em>
                  </MenuItem>
                  {HARDCODED_SECURITIES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.id} - {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sm={4} md={5} display="flex" gap={1}>
              <Button variant="contained" onClick={handleApplyFilters} disableElevation>
                Apply Filters
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleResetFilters}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Data / Loading / Error states */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            <PnLSummaryCards
              totalPnL={totalPnL}
              totalRealized={totalRealized}
              totalUnrealized={totalUnrealized}
            />
            <PnLTable data={data} />
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
}