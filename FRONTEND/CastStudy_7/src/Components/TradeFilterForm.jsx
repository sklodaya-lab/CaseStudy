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
  TextField,
  Chip
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getSecurities, getTraders } from '../services/tradeBlotterService';

// Custom MenuProps to ensure a smooth, max-height dropdown that slides down cleanly
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP, // Shows max 5 items, then scrolls smoothly
      width: 260,
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
  },
};

export default function TradeFilterForm({ onFilterChange, onReset }) {
  const [securities, setSecurities] = useState([]);
  const [traders, setTraders] = useState([]);

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

  // Multi-select change handler for Securities
  const handleSecurityChange = (event) => {
    const { value } = event.target;
    const selected = typeof value === 'string' ? value.split(',') : value;
    setSecurityIds(selected);

    onFilterChange({
      securityIds: selected,
      traderIds,
      fromDate,
      toDate,
    });
  };

  // Multi-select change handler for Traders
  const handleTraderChange = (event) => {
    const { value } = event.target;
    const rawArray = typeof value === 'string' ? value.split(',') : value;
    const numericArray = rawArray.map((val) => Number(val)).filter((val) => !isNaN(val));
    setTraderIds(numericArray);

    onFilterChange({
      securityIds,
      traderIds: numericArray,
      fromDate,
      toDate,
    });
  };

  // Date handlers
  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    onFilterChange({ securityIds, traderIds, fromDate: val, toDate });
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    onFilterChange({ securityIds, traderIds, fromDate, toDate: val });
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
        p: 2.5, 
        mb: 3, 
        backgroundColor: '#ffffff', 
        borderRadius: 2, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
      }}
    >
      <Box sx={{ mb: 1.5, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
        FILTER BLOTTER
      </Box>

      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        
        {/* Securities Multi-Select Dropdown */}
        <FormControl sx={{ minWidth: 240, flex: 1 }}>
          <InputLabel id="security-label">Securities</InputLabel>
          <Select
            labelId="security-label"
            id="security-select"
            multiple
            value={securityIds}
            onChange={handleSecurityChange}
            input={<OutlinedInput label="Securities" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const item = securities.find((s) => s.securityId === val);
                  return (
                    <Chip 
                      key={val} 
                      label={item?.securityName || val} 
                      size="small" 
                      sx={{ height: 24, fontSize: '0.75rem' }} 
                    />
                  );
                })}
              </Box>
            )}
          >
            {securities.map((sec) => (
              <MenuItem key={sec.securityId} value={sec.securityId} sx={{ py: 1 }}>
                <Checkbox checked={securityIds.includes(sec.securityId)} size="small" />
                <ListItemText primary={sec.securityName || sec.securityId} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Traders Multi-Select Dropdown */}
        <FormControl sx={{ minWidth: 240, flex: 1 }}>
          <InputLabel id="trader-label">Traders</InputLabel>
          <Select
            labelId="trader-label"
            id="trader-select"
            multiple
            value={traderIds}
            onChange={handleTraderChange}
            input={<OutlinedInput label="Traders" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const item = traders.find((t) => Number(t.traderId) === Number(val));
                  return (
                    <Chip 
                      key={val} 
                      label={item?.traderName || val} 
                      size="small" 
                      sx={{ height: 24, fontSize: '0.75rem' }} 
                    />
                  );
                })}
              </Box>
            )}
          >
            {traders.map((trader) => (
              <MenuItem key={trader.traderId} value={trader.traderId} sx={{ py: 1 }}>
                <Checkbox checked={traderIds.includes(Number(trader.traderId))} size="small" />
                <ListItemText primary={trader.traderName} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* From Date */}
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={handleFromDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />

        {/* To Date */}
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={handleToDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />

        {/* Reset Button */}
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