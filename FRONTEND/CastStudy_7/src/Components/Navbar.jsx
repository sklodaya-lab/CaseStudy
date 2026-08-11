import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export default function Navbar() {
  const navItems = [
    { label: 'Trade Blotter', path: '/tradeblotter' },
    { label: 'P&L Summary', path: '/pnl' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: '#b5d4f4', borderBottom: '1px solid #1e293b' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Logo / Brand Name */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <ShowChartIcon sx={{ color: '#3a05fa', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff', letterSpacing: '-0.5px' }}>
              TradingDesk
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box display="flex" gap={1}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#1e293b' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}