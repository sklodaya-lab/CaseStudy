import React from 'react';
import { Paper, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

export default function PnLTimeSeriesChart({ data = [] }) {
  if (!data || data.length === 0) return null;
console.log(data)
  const xAxisData = data.map((item) => item.valuationDate);
  const totalPnLData = data.map((item) => Number(item.totalPnL) || 0);
  const closingPriceData = data.map((item) => Number(item.closingPrice) || 0);
  const UnrealisedPnLData = data.map((item) => Number(item.mtmUnrealizedPnL) || 0);
  const wacData = data.map((item) => Number(item.weightedAverageCost) || 0)

  const valueFormatter = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Historical P&L Performance
      </Typography>

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
            color: '#16a34a',
            valueFormatter,
          },
          {
            data: UnrealisedPnLData,
            label: 'Unrealised PnL',
            color: '#eb8825',
            valueFormatter,
          },
        ]}
        height={350}
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
            color: '#eb8825',
            valueFormatter,
          },
          {
            data: wacData,
            label: ' Weighted Average Cost',
            color: '#16a34a',
            valueFormatter,
          },
        ]}
        height={350}
        margin={{ top: 20, bottom: 40, left: 80, right: 20 }}
      />
    </Paper>
  );
}