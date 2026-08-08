import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import {Routes, Route, Navigate} from 'react-router-dom'
import PnLSummaryPage from './pages/PnLSummaryPage';
import PnLTimeSeriesPage from './pages/PnLTimeSeriesPage';
import TradeBlotterPage from './pages/TradeBlotterPage'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/pnl" replace />} />
        <Route path='/pnl' element={<PnLSummaryPage/>}/>
        <Route path="/pnl/timeseries/:securityId" element={<PnLTimeSeriesPage/>} />
        <Route path="/tradeblotter" element={<TradeBlotterPage />} />
      </Routes>
    </>
  )
}

export default App
