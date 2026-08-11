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
  Typography,
  CircularProgress
} from '@mui/material';

const TradeTable = ({ trades = [], loading = false,isDescending = true, onToggleSort}) => {
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
        <TableHead sx={{ backgroundColor: '#ffffff' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>TRADE ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>ASSET CLASS</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>SECURITY</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>TRADER</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>SIDE</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>QUANTITY</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>PRICE</TableCell>
            <TableCell sx={{ fontWeight: 700 }} onClick={onToggleSort} 
              sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}>TRADE DATE {isDescending ? '⬇️' : '⬆️'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.map((t) => {
            const rawSide = t.side || t.tradeSide || t.type || t.buySell || (t.quantity < 0 ? 'SELL' : 'BUY');
            const side = String(rawSide).toUpperCase();
            const isBuy = side === 'BUY' || side === 'B';

            // Resolve Asset Class property (handles both camelCase and PascalCase DTO output)
            const assetClass = t.assetClass || t.AssetClass || '-';

            return (
              <TableRow key={t.tradeId || t.id} hover>
                <TableCell>#{t.tradeId || t.id}</TableCell>

                {/* Asset Class Chip Column */}
                <TableCell>
                  <Chip
                    label={assetClass}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      height: 22,
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </TableCell>

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