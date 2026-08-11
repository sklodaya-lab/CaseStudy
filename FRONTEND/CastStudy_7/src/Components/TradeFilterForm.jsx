import React, { useState, useEffect, useMemo } from 'react';
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      width: 260,
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
  },
};

const INITIAL_FILTERS = {
  assetClasses: [],
  securityIds: [],
  traderIds: [],
  fromDate: '',
  toDate: '',
};

export default function TradeFilterForm({ onFilterChange, onReset }) {
  const [securities, setSecurities] = useState([]);
  const [traders, setTraders] = useState([]);
  const [assetClassOptions, setAssetClassOptions] = useState([]);

  // 1. Single consolidated local state
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const secData = await getSecurities();
        const traderData = await getTraders();
        const secs = secData || [];
        setSecurities(secs);
        setTraders(traderData || []);

        const uniqueAssetClasses = [
          ...new Set(
            secs
              .map((item) => item.assetClass)
              .filter((ac) => ac != null && ac.toString().trim() !== '')
          ),
        ].sort();

        setAssetClassOptions(uniqueAssetClasses);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdownData();
  }, []);

  const filteredSecurities = useMemo(() => {
    if (!filters.assetClasses || filters.assetClasses.length === 0) {
      return securities;
    }
    return securities.filter((sec) => filters.assetClasses.includes(sec.assetClass));
  }, [securities, filters.assetClasses]);

  // 2. ONE generic handler for updating local state
  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field === 'traderIds') {
      const rawArray = typeof value === 'string' ? value.split(',') : value;
      value = rawArray.map((v) => Number(v)).filter((v) => !isNaN(v));
    }

    setFilters((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleCommit = () => {
    onFilterChange(filters);
  };

  // 4. Reset handler
  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    onReset(INITIAL_FILTERS);
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
      {/* Header Row: Label on Left, Reset Button on Right */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          FILTER BLOTTER
        </Box>

        <Button
          variant="text"
          size="small"
          startIcon={<RestartAltIcon fontSize="small" />}
          onClick={handleReset}
          sx={{ 
            color: '#64748b', 
            fontWeight: 600, 
            fontSize: '0.75rem',
            '&:hover': { color: '#0f172a', backgroundColor: '#f1f5f9' } 
          }}
        >
          RESET FILTERS
        </Button>
      </Box>

      {/* Filter Inputs Grid Row */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        
        {/* Asset Classes Multi-Select */}
        <FormControl sx={{ minWidth: 180, flex: 1 }}>
          <InputLabel id="asset-class-label">Asset Classes</InputLabel>
          <Select
            labelId="asset-class-label"
            multiple
            value={filters.assetClasses}
            onChange={handleChange('assetClasses')}
            onClose={handleCommit} 
            input={<OutlinedInput label="Asset Classes" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip key={val} label={val} size="small" sx={{ height: 24, fontSize: '0.75rem' }} />
                ))}
              </Box>
            )}
          >
            {assetClassOptions.map((ac) => (
              <MenuItem key={ac} value={ac} sx={{ py: 1 }}>
                <Checkbox checked={filters.assetClasses.includes(ac)} size="small" />
                <ListItemText primary={ac} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Securities Multi-Select */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="security-label">Securities</InputLabel>
          <Select
            labelId="security-label"
            multiple
            value={filters.securityIds}
            onChange={handleChange('securityIds')}
            onClose={handleCommit} 
            input={<OutlinedInput label="Securities" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const item = securities.find((s) => s.securityId === val);
                  return (
                    <Chip key={val} label={item?.securityName || val} size="small" sx={{ height: 24, fontSize: '0.75rem' }} />
                  );
                })}
              </Box>
            )}
          >
            {filteredSecurities.map((sec) => (
              <MenuItem key={sec.securityId} value={sec.securityId} sx={{ py: 1 }}>
                <Checkbox checked={filters.securityIds.includes(sec.securityId)} size="small" />
                <ListItemText primary={sec.securityName || sec.securityId} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Traders Multi-Select */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="trader-label">Traders</InputLabel>
          <Select
            labelId="trader-label"
            multiple
            value={filters.traderIds}
            onChange={handleChange('traderIds')}
            onClose={handleCommit} 
            input={<OutlinedInput label="Traders" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const item = traders.find((t) => Number(t.traderId) === Number(val));
                  return (
                    <Chip key={val} label={item?.traderName || val} size="small" sx={{ height: 24, fontSize: '0.75rem' }} />
                  );
                })}
              </Box>
            )}
          >
            {traders.map((trader) => (
              <MenuItem key={trader.traderId} value={trader.traderId} sx={{ py: 1 }}>
                <Checkbox checked={filters.traderIds.includes(Number(trader.traderId))} size="small" />
                <ListItemText primary={trader.traderName} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Inputs */}
        <TextField
          label="From Date"
          type="date"
          value={filters.fromDate}
          onChange={handleChange('fromDate')}
          onBlur={handleCommit} 
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />

        <TextField
          label="To Date"
          type="date"
          value={filters.toDate}
          onChange={handleChange('toDate')}
          onBlur={handleCommit}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />

      </Box>
    </Box>
  );
}