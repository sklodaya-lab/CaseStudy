import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Checkbox,
  ListItemText,
  TextField
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getSecurities, getTraders } from '../services/tradeBlotterService';

export default function TradeFilterForm({ onFilterChange, onReset }) {
  const [securities, setSecurities] = useState([]);
  const [traders, setTraders] = useState([]);

  // Form State using arrays for multi-select
  const [securityIds, setSecurityIds] = useState([]);
  const [traderIds, setTraderIds] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch metadata dropdowns on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const secData = await getSecurities();
        const traderData = await getTraders();
        setSecurities(secData || []);
        setTraders(traderData || []);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdownData();
  }, []);

  // Multi-select change handler for Securities (Strings e.g. "eq01")
  const handleSecurityChange = (event) => {
    const { value } = event.target;
    setSecurityIds(typeof value === 'string' ? value.split(',') : value);
  };

  // Multi-select change handler for Traders (Numbers e.g. 1, 2)
  const handleTraderChange = (event) => {
    const { value } = event.target;
    const rawArray = typeof value === 'string' ? value.split(',') : value;
    // Cast strings back to numbers so they match numeric traderId from API
    const numericArray = rawArray.map((val) => Number(val)).filter((val) => !isNaN(val));
    setTraderIds(numericArray);
  };

  const handleApply = () => {
    onFilterChange({
      securityIds,
      traderIds,
      fromDate,
      toDate,
    });
  };

  const handleReset = () => {
    setSecurityIds([]);
    setTraderIds([]);
    setFromDate('');
    setToDate('');
    
    onReset({
      securityIds: [],
      traderIds: [],
      fromDate: '',
      toDate: '',
    });
  };

  return (
    <Box 
      sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: '#ffffff', 
        borderRadius: 2, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}
    >
      <Box sx={{ mb: 2, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
        FILTER BLOTTER
      </Box>

      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        
        {/* Security Multi-Select */}
        <FormControl sx={{ minWidth: 220, flex: 1 }}>
          <InputLabel id="security-label">Security</InputLabel>
          <Select
            labelId="security-label"
            id="security-select"
            multiple
            value={securityIds}
            onChange={handleSecurityChange}
            input={<OutlinedInput label="Security" />}
            renderValue={(selected) => 
              securities
                .filter((s) => selected.includes(s.securityId))
                .map((s) => s.securityName || s.securityId)
                .join(', ')
            }
          >
            {securities.map((sec) => (
              <MenuItem key={sec.securityId} value={sec.securityId}>
                <Checkbox checked={securityIds.includes(sec.securityId)} />
                <ListItemText primary={sec.securityName || sec.securityId} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Trader Multi-Select */}
        <FormControl sx={{ minWidth: 220, flex: 1 }}>
          <InputLabel id="trader-label">Trader</InputLabel>
          <Select
            labelId="trader-label"
            id="trader-select"
            multiple
            value={traderIds}
            onChange={handleTraderChange}
            input={<OutlinedInput label="Trader" />}
            renderValue={(selected) =>
              traders
                .filter((t) => selected.includes(Number(t.traderId)))
                .map((t) => t.traderName)
                .join(', ')
            }
          >
            {traders.map((trader) => (
              <MenuItem key={trader.traderId} value={trader.traderId}>
                <Checkbox checked={traderIds.includes(Number(trader.traderId))} />
                <ListItemText primary={trader.traderName} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Inputs */}
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />

        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />

        {/* Action Buttons */}
        <Button
          variant="contained"
          startIcon={<FilterAltIcon />}
          onClick={handleApply}
          sx={{ height: 56, px: 3, fontWeight: 700 }}
        >
          APPLY
        </Button>

        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{ height: 56, px: 3, color: '#334155', borderColor: '#cbd5e1' }}
        >
          RESET
        </Button>

      </Box>
    </Box>
  );
}