import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Slider, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

export default function PnLTimeSeriesChart({ data = [] }) {
  // 1. State to hold the current start and end indices for our data window
  const [dataRange, setDataRange] = useState([0, 0]);

  // 2. Update the slider max bounds whenever new data comes in
  useEffect(() => {
    if (data && data.length > 0) {
      // Default view: zoom in on the last 30 data points (or all if less than 30)
      const startIdx = Math.max(0, data.length - 30);
      setDataRange([startIdx, data.length - 1]);
    }
  }, [data]);

  if (!data || data.length === 0) return null;

  const handleSliderChange = (event, newValue) => {
    setDataRange(newValue);
  };

  const handleResetZoom = () => {
    setDataRange([0, data.length - 1]);
  };

  // 3. Slice the original data based on the slider's indices
  const visibleData = data.slice(dataRange[0], dataRange[1] + 1);

  // 4. Map the newly sliced data instead of the whole array
  const xAxisData = visibleData.map((item) => item.valuationDate);
  const totalPnLData = visibleData.map((item) => Number(item.totalPnL) || 0);
  const closingPriceData = visibleData.map((item) => Number(item.closingPrice) || 0);
  const UnrealisedPnLData = visibleData.map((item) => Number(item.mtmUnrealizedPnL) || 0);
  const wacData = visibleData.map((item) => Number(item.weightedAverageCost) || 0);

  const valueFormatter = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  // Formatter for the slider tooltip to show dates instead of raw numbers
  const sliderValueText = (value) => {
    return data[value]?.valuationDate || '';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Historical P&L Performance
        </Typography>
        <Button variant="outlined" size="small" onClick={handleResetZoom} sx={{color:'#269e9e', borderColor: '#269e9e'}}>
          View All Data
        </Button>
      </Box>

      

      {/* --- Charts --- */}
      <LineChart
        xAxis={[
          {
            scaleType: 'point',
            data: xAxisData,
            label: 'Valuation Date',
          },
        ]}
        series={[
          {
            data: totalPnLData,
            label: 'Total P&L',
            color: '#09ffad',
            valueFormatter,
          },
          {
            data: UnrealisedPnLData,
            label: 'Unrealised PnL',
            color: '#269e9e',
            valueFormatter,
          },
        ]}
        height={300} // Slightly reduced height to make room for slider
        margin={{ top: 20, bottom: 40, left: 80, right: 20 }}
      />
      
      <LineChart
        xAxis={[
          {
            scaleType: 'point',
            data: xAxisData,
            label: 'Valuation Date',
          },
        ]}
        series={[
          {
            data: closingPriceData,
            label: 'Closing Price',
            color: '#269e9e',
            valueFormatter,
          },
          {
            data: wacData,
            label: 'Weighted Average Cost',
            color: '#09ffad',
            valueFormatter,
          },
        ]}
        height={300}
        margin={{ top: 20, bottom: 40, left: 80, right: 20 }}
      />

      {/* --- Slider Control Section --- */}
      <Box sx={{ px: 4, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Zoom / Scroll Dates: {data[dataRange[0]]?.valuationDate} to {data[dataRange[1]]?.valuationDate}
        </Typography>
        <Slider
          value={dataRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={sliderValueText}
          min={0}
          max={data.length - 1}
          disableSwap // Prevents the left and right thumbs from crossing over each other
          sx={{
            color: '#269e9e',
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#333',
            },
          }}
        />
      </Box>
    </Paper>
  );
}