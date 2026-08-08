import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

export default function PnLPieChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  // Format currency for tooltips
  const valueFormatter = (item) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(item.value || 0);

  // Map data for Realized P&L (filtering out zero or negative values for clean pie layout)
  const realizedSeries = data
    .filter((item) => Number(item.realizedPnL) > 0)
    .map((item, index) => ({
      id: item.securityId || index,
      value: Number(item.realizedPnL),
      label: item.securityId,
    }));

  // Map data for MTM Unrealized P&L (filtering out zero or negative values)
  const unrealizedSeries = data
    .filter((item) => Number(item.mtmUnrealizedPnL) > 0)
    .map((item, index) => ({
      id: item.securityId || index,
      value: Number(item.mtmUnrealizedPnL),
      label: item.securityId,
    }));

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        P&L Contribution by Security (Positive Gains)
      </Typography>

      <Grid container spacing={3}>
        {/* Realized P&L Pie */}
        <Grid item xs={12} md={6} size="grow">
          <Box textAlign="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="600" color="primary">
              Realized P&L Distribution
            </Typography>
          </Box>
          {realizedSeries.length > 0 ? (
            <PieChart
              series={[
                {
                  data: realizedSeries,
                  innerRadius: 40, // Donut style
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  valueFormatter,
                },
              ]}
              height={300}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={8}>
              No positive realized gains to display.
            </Typography>
          )}
        </Grid>

        {/* Unrealized (MTM) P&L Pie */}
        <Grid item xs={12} md={6} size={6}>
          <Box textAlign="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="600" color="secondary">
              Unrealized (MTM) P&L Distribution
            </Typography>
          </Box>
          {unrealizedSeries.length > 0 ? (
            <PieChart
              series={[
                {
                  data: unrealizedSeries,
                  innerRadius: 40, // Donut style
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  valueFormatter,
                },
              ]}
              height={300}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={8}>
              No positive unrealized gains to display.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}