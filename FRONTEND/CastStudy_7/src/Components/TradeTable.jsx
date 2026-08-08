import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

const TradeTable = ({ trades = [], loading = false }) => {
  if (loading) {
    return (
      <Paper elevation={1} sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading trade blotter data...
        </Typography>
      </Paper>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No trades found matching selected filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>TRADE ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>SECURITY</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>TRADER</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>SIDE</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>QUANTITY</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>PRICE</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>TRADE DATE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.map((t) => {
            const rawSide = t.side || t.tradeSide || t.type || t.buySell || (t.quantity < 0 ? 'SELL' : 'BUY');
            const side = String(rawSide).toUpperCase();
            const isBuy = side === 'BUY' || side === 'B';

            return (
              <TableRow key={t.tradeId || t.id} hover>
                <TableCell>#{t.tradeId || t.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t.securityName || t.securityId || '-'}
                </TableCell>
                <TableCell>{t.traderName || t.traderId || '-'}</TableCell>
                
                {/* Side Badge Chip */}
                <TableCell align="center">
                  <Chip
                    label={isBuy ? 'BUY' : 'SELL'}
                    color={isBuy ? 'success' : 'error'}
                    size="small"
                    variant="soft"
                    sx={{
                      fontWeight: 700,
                      minWidth: 60,
                      backgroundColor: isBuy ? '#dcfce7' : '#fee2e2',
                      color: isBuy ? '#15803d' : '#b91c1c',
                    }}
                  />
                </TableCell>

                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {Math.abs(t.quantity)?.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {Number(t.price || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {t.tradeDate ? new Date(t.tradeDate).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TradeTable;