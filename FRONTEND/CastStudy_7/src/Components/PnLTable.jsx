import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Typography
} from '@mui/material';

export default function PnLTable({ data = [], onRowClick }) {
  const formatNumber = (val) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: 'action.hover' }}>
          <TableRow>
            <TableCell><strong>Security</strong></TableCell>
            <TableCell><strong>Class</strong></TableCell>
            <TableCell align="right"><strong>Net Pos</strong></TableCell>
            <TableCell align="right"><strong>Avg Cost</strong></TableCell>
            <TableCell align="right"><strong>Close Price</strong></TableCell>
            <TableCell align="right"><strong>Realized P&L</strong></TableCell>
            <TableCell align="right"><strong>Unrealized P&L</strong></TableCell>
            <TableCell align="right"><strong>Total P&L</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.securityId}
              hover
              onClick={() => onRowClick && onRowClick(row.securityId)}
              sx={{ cursor: 'pointer' }} // Visual hint for clickability
            >
              <TableCell>
                <Typography variant="body2" fontWeight="bold">{row.securityName}</Typography>
                <Typography variant="caption" color="text.secondary">{row.securityId}</Typography>
              </TableCell>
              <TableCell>
                <Chip label={row.assetClass} size="small" color="primary" variant="outlined" />
              </TableCell>
              <TableCell align="right">{row.netPosition}</TableCell>
              <TableCell align="right">{formatNumber(row.weightedAverageCost)}</TableCell>
              <TableCell align="right">{formatNumber(row.closingPrice)}</TableCell>
              <TableCell align="right" sx={{ color: row.realizedPnL >= 0 ? 'success.main' : 'error.main' }}>
                {formatNumber(row.realizedPnL)}
              </TableCell>
              <TableCell align="right" sx={{ color: row.mtmUnrealizedPnL >= 0 ? 'success.main' : 'error.main' }}>
                {formatNumber(row.mtmUnrealizedPnL)}
              </TableCell>
              <TableCell align="right" sx={{ color: row.totalPnL >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                {formatNumber(row.totalPnL)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}