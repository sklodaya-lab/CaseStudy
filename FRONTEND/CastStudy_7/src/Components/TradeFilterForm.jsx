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

// Custom MenuProps to ensure a smooth, max-height dropdown that slides down cleanly
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

export default function TradeFilterForm({ onFilterChange, onReset }) {
  const [securities, setSecurities] = useState([]);
  const [traders, setTraders] = useState([]);
  const [assetClassOptions, setAssetClassOptions] = useState([]);

  const [assetClasses, setAssetClasses] = useState([]);
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
        const secs = secData || [];
        setSecurities(secs);
        setTraders(traderData || []);

        // Extract distinct, non-empty Asset Classes from the securities metadata
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

  // Cascading Dependent Filter: Compute available securities based on selected assetClasses
  const filteredSecurities = useMemo(() => {
    if (!assetClasses || assetClasses.length === 0) {
      return securities; // Show all if no Asset Class filter is active
    }
    return securities.filter((sec) => assetClasses.includes(sec.assetClass));
  }, [securities, assetClasses]);

  // Multi-select change handler for Asset Classes with auto-cleanup for invalid securities
  const handleAssetClassChange = (event) => {
    const { value } = event.target;
    const selectedAssetClasses = typeof value === 'string' ? value.split(',') : value;
    setAssetClasses(selectedAssetClasses);

    // Auto-prune any selected security that isn't part of the active asset classes
    const validSecurityIds = securityIds.filter((secId) => {
      const sec = securities.find((s) => s.securityId === secId);
      return (
        !sec ||
        selectedAssetClasses.length === 0 ||
        selectedAssetClasses.includes(sec.assetClass)
      );
    });

    setSecurityIds(validSecurityIds);

    onFilterChange({
      assetClasses: selectedAssetClasses,
      securityIds: validSecurityIds,
      traderIds,
      fromDate,
      toDate,
    });
  };

  // Multi-select change handler for Securities
  const handleSecurityChange = (event) => {
    const { value } = event.target;
    const selected = typeof value === 'string' ? value.split(',') : value;
    setSecurityIds(selected);

    onFilterChange({
      assetClasses,
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
      assetClasses,
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
    onFilterChange({ assetClasses, securityIds, traderIds, fromDate: val, toDate });
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    onFilterChange({ assetClasses, securityIds, traderIds, fromDate, toDate: val });
  };

  const handleReset = () => {
    setAssetClasses([]);
    setSecurityIds([]);
    setTraderIds([]);
    setFromDate('');
    setToDate('');

    onReset({
      assetClasses: [],
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
        
        {/* Asset Class Multi-Select Dropdown */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="asset-class-label">Asset Classes</InputLabel>
          <Select
            labelId="asset-class-label"
            id="asset-class-select"
            multiple
            value={assetClasses}
            onChange={handleAssetClassChange}
            input={<OutlinedInput label="Asset Classes" />}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small" 
                    sx={{ height: 24, fontSize: '0.75rem' }} 
                  />
                ))}
              </Box>
            )}
          >
            {assetClassOptions.map((ac) => (
              <MenuItem key={ac} value={ac} sx={{ py: 1 }}>
                <Checkbox checked={assetClasses.includes(ac)} size="small" />
                <ListItemText primary={ac} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Securities Multi-Select Dropdown (Renders filteredSecurities) */}
        <FormControl sx={{ minWidth: 220, flex: 1 }}>
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
            {filteredSecurities.map((sec) => (
              <MenuItem key={sec.securityId} value={sec.securityId} sx={{ py: 1 }}>
                <Checkbox checked={securityIds.includes(sec.securityId)} size="small" />
                <ListItemText primary={sec.securityName || sec.securityId} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Traders Multi-Select Dropdown */}
        <FormControl sx={{ minWidth: 220, flex: 1 }}>
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
          sx={{ width: 150 }}
        />

        {/* To Date */}
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={handleToDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
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