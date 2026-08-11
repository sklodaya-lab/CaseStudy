import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export default function Navbar() {
    const navigate = useNavigate()
  const navItems = [
    { label: 'Trade Blotter', path: '/tradeblotter' },
    { label: 'P&L Summary', path: '/pnl' },
    {
        label: 'Real-time', path: '/real'
    }
  ];

  return (
    <AppBar position="sticky" elevation={6} sx={{ cursor: 'pointer', backgroundColor: '#269e9e', borderBottom: '1px solid #269e9e' }}>
      <Container maxWidth="false">
        <Toolbar disableGutters sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Logo / Brand Name */}
          <Box onClick={() => navigate('/')} display="flex" alignItems="center" gap={1.5}>
            <ShowChartIcon sx={{ color: '#3a05fa', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#380576', letterSpacing: '-0.5px' }}>
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
                  color: isActive ? '#ffffff' : '#011009',
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