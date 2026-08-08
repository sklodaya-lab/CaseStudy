import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function PnLSummaryCards({ totalPnL, totalRealized, totalUnrealized }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography color="text.secondary" variant="subtitle2" gutterBottom>TOTAL P&L</Typography>
            <Typography variant="h5" fontWeight="bold" color={totalPnL >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(totalPnL)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography color="text.secondary" variant="subtitle2" gutterBottom>REALIZED P&L</Typography>
            <Typography variant="h5" fontWeight="bold" color={totalRealized >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(totalRealized)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography color="text.secondary" variant="subtitle2" gutterBottom>UNREALIZED (MTM) P&L</Typography>
            <Typography variant="h5" fontWeight="bold" color={totalUnrealized >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(totalUnrealized)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}