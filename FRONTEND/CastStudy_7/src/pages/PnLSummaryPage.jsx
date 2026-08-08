import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, CircularProgress, Alert, Chip,
  Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getPnLSummary } from '../services/api';
import PnLSummaryCards from '../components/PnLSummaryCards';
import PnLTable from '../components/PnLTable';
import PnLSummaryChart from '../Components/PnLSummaryChart';
import PnLPieChart from '../Components/PnLPieChart';


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
  const navigate = useNavigate();
  const [data, setData] = useState(null); // Initial null state (no data loaded)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [asOfDate, setAsOfDate] = useState(null);
  const [securityId, setSecurityId] = useState([]);

  // Fetch API explicitly called only via user interaction
  const handleFetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const formattedDate = asOfDate && asOfDate.isValid() ? asOfDate.format('YYYY-MM-DD') : null;

    try {
      const res = await getPnLSummary({
        asOfDate: formattedDate,
        securityId: securityId || null,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [asOfDate, securityId]);

  const handleResetFilters = () => {
    setAsOfDate(null);
    setSecurityId([]);
    setData(null);
    setError(null);
  };

  // Click row handler -> Navigates to detail view
  const handleRowClick = (selectedSecurityId) => {
    const formattedDate = asOfDate && asOfDate.isValid() ? asOfDate.format('YYYY-MM-DD') : '';
    const query = formattedDate ? `?asOfDate=${formattedDate}` : '';
    navigate(`/pnl/timeseries/${selectedSecurityId}${query}`);
    selectedSecurityId.preventDefault();
  };

  // KPI Calculations (Safely fallback to empty array if data is null)
  const safeData = data || [];
  const totalPnL = safeData.reduce((acc, curr) => acc + curr.totalPnL, 0);
  const totalRealized = safeData.reduce((acc, curr) => acc + curr.realizedPnL, 0);
  const totalUnrealized = safeData.reduce((acc, curr) => acc + curr.mtmUnrealizedPnL, 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Portfolio P&L Summary
        </Typography>

        {/* Filter Controls Bar */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 4, backgroundColor: 'background.paper' }}>
          <Grid container spacing={2} >
            {/* Date Picker */}
            <Grid item xs={12} sm={4} md={3} >
              <DatePicker
                label="As Of Date (Optional)"
                value={asOfDate}
                onChange={(newValue) => setAsOfDate(newValue)}
                format="YYYY-MM-DD"
                slotProps={{ textField: { size: 'small', fullWidth: true, placeholder: 'YYYY-MM-DD' } }}
              />
            </Grid>

            {/* Security Dropdown */}
            <Grid item xs={12} sm={4} md={3} size="grow">
              <FormControl size="small" fullWidth>
                <InputLabel id="security-select-label">Security (Optional)</InputLabel>
                <Select
                  labelId="security-select-label"
                  multiple
                  value={securityId} // Should be an array in state: useState([])
                  label="Security (Optional)"
                  onChange={(e) => {
                    const { target: { value } } = e;
                    // Handles MUI's edge case where selection comes as string or array
                    setSecurityId(typeof value === 'string' ? value.split(',') : value);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
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
              <Button
                variant="contained"
                onClick={handleFetchData}
                startIcon={<SearchIcon />}
                sx={{
                  backgroundColor: '#3a05fa',
                  '&:hover': {
                    backgroundColor: '#2b03be', // Slightly darker shade for hover effect
                  },
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

        {/* Display Logic Based on App State */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : data === null ? (
          // Placeholder state before user clicks "Fetch Data"
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', backgroundColor: 'action.hover' }}>
            <Typography variant="h6" color="text.secondary">
              Select your filters above and click <strong>Fetch Data</strong> to view portfolio performance.
            </Typography>
          </Paper>
        ) : (
          <>

            <PnLSummaryCards
              totalPnL={totalPnL}
              totalRealized={totalRealized}
              totalUnrealized={totalUnrealized}
            />
            <PnLPieChart data={data} />
            <PnLSummaryChart data={data} />
            <PnLTable data={data} onRowClick={handleRowClick} />
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
}