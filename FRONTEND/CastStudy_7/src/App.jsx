import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import {Routes, Route} from 'react-router-dom'
import PnLSummaryPage from './pages/PnLSummaryPage';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<PnLSummaryPage/>}/>
      </Routes>
    </>
  )
}

export default App
