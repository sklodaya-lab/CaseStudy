import React from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

export default function PnLSummaryChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  // Extract security IDs for the X-Axis
  const xAxisData = data.map((item) => item.securityId);

  // Extract numerical series data
  const realizedData = data.map((item) => Number(item.realizedPnL) || 0);
  const unrealizedData = data.map((item) => Number(item.mtmUnrealizedPnL) || 0);

  // Currency formatter for tooltips
  const valueFormatter = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        P&L Breakdown by Security
      </Typography>

      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: xAxisData,
            label: 'Security ID',
          },
        ]}
        series={[
          {
            data: realizedData,
            label: 'Realized P&L',
            color: '#0284c7',
            valueFormatter,
          },
          {
            data: unrealizedData,
            label: 'Unrealized (MTM) P&L',
            color: '#8b5cf6',
            valueFormatter,
          },
        ]}
        height={350}
        margin={{ top: 20, bottom: 40, left: 70, right: 20 }}
      />
    </Paper>
  );
}