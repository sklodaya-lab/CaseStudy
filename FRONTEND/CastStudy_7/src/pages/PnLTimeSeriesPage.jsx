import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert, Button,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getPnLTimeSeries } from '../services/api';
import PnLTimeSeriesChart from '../Components/PnLTimeSeriesChart';

export default function PnLTimeSeriesPage() {
  const { securityId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const asOfDate = searchParams.get('asOfDate') || '';

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!securityId) return;

    setLoading(true);
    setError(null);

    getPnLTimeSeries({ securityId, asOfDate })
      .then((res) => {
        setTimeSeriesData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch time series data');
        setLoading(false);
      });
  }, [securityId, asOfDate]);

  const formatNumber = (val) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Summary
      </Button>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Time Series History
        </Typography>
        <Chip label={`Security: ${securityId}`} color="primary" variant="outlined" />
        {asOfDate && <Chip label={`As Of: ${asOfDate}`} color="secondary" variant="outlined" />}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
        <PnLTimeSeriesChart data={timeSeriesData} />

        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell><strong>Valuation Date</strong></TableCell>
                <TableCell><strong>Security ID</strong></TableCell>
                <TableCell align="right"><strong>Net Position</strong></TableCell>
                <TableCell align="right"><strong>Weighted Avg Cost</strong></TableCell>
                <TableCell align="right"><strong>Closing Price</strong></TableCell>
                <TableCell align="right"><strong>Realized P&L</strong></TableCell>
                <TableCell align="right"><strong>Unrealized P&L</strong></TableCell>
                <TableCell align="right"><strong>Total P&L</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSeriesData.map((row, index) => (
                <TableRow key={row.valuationDate || index} hover>
                  <TableCell>{row.valuationDate}</TableCell>
                  <TableCell>{row.securityId}</TableCell>
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
        </>
      )}
    </Container>
  );
}