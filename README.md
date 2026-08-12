# Vantage Trading Desk - Core Middle-Layer & Calculation Engine API

An enterprise-grade ASP.NET Core Web API middle-layer designed for real-time Position Management, Weighted Average Cost (WAC) tracking, and Profit & Loss (PnL) calculations across multi-asset trading desks (Equities, ETFs, and Fixed Income Bonds).

---

## 🏛 Architecture Overview

The backend is built following **Clean Architecture** principles, enforcing a strict separation of concerns across Domain Engine, Core Business Logic, Data Access, and API Controllers:

```text
VantageTradingDesk/
├── Core/               # Financial Calculation Engine & Simulator
├── DataAccess/         # Repositories & DbContext Abstractions
├── Models/             # Domain Entities, Interfaces & DTOs
└── WebAPI/             # Controllers, SignalR Hubs & Background Services

```

### Core Components & Engineering Highlights

* **Thread-Safe In-Memory Cache (`PnLStateCache`):**
Utilizes a thread-safe `ConcurrentDictionary` paired with per-security `SemaphoreSlim(1, 1)` async locks. This guarantees zero race conditions during parallel trade evaluations while preventing **Cache Stampedes** across concurrent requests.
* **In-Memory WAC & PnL Engine (`PnLCalculatorEngine`):**
Performs real-time Weighted Average Cost accounting on `BUY` trades and accrues exact `Realized PnL` on `SELL` executions without floating-point rounding errors.
* **Market Data Simulation Service (`MarketDataSimulationService`):**
An ASP.NET Core `BackgroundService` that uses **Geometric Brownian Motion (GBM)** via Box-Muller transforms to simulate continuous tick-by-tick price fluctuations for active inventory.
* **SignalR WebSocket Server (`PnLHub`):**
Pushes low-latency, lightweight price tick updates over persistent WebSockets (`wss://`) for real-time Mark-to-Market (MTM) recalculations.

---

## 🚀 Key Features & Capabilities

1. **Incremental Daily PnL Tracking:**
* **Weighted Average Cost (WAC):** $WAC_t = \frac{(Qty_{prev} \times WAC_{prev}) + (Qty_{buy} \times Price_{buy})}{Qty_{prev} + Qty_{buy}}$
* **Realized PnL:** $\text{Realized PnL} += (Price_{sell} - WAC_{prev}) \times Qty_{sell}$
* **MTM Unrealized PnL:** $\text{Unrealized PnL} = (Price_{close} - WAC) \times NetQty$


2. **Sequential Time-Series Cash Flow Ledger:**
Retrieves pre-calculated daily position snapshots from memory in $O(1)$ time to serve historical timeline views.
3. **Advanced Trade Blotter Engine:**
Supports server-side pagination, multi-criteria filtering (date ranges, security lists, trader lists, asset classes), and CSV export streaming.

---

## 🛠 Technology Stack

* **Framework:** .NET 8.0 Web API
* **Language:** C# 12
* **Real-Time Communication:** ASP.NET Core SignalR
* **Concurrency Primitives:** `ConcurrentDictionary`, `SemaphoreSlim`
* **API Documentation:** Swagger / OpenAPI

---

## 🔌 API Endpoint Specifications

### 1. PnL & Position Analytics

* **`GET /api/v1/pnl/summary`**
* **Query Parameters:** `asOfDate` *(optional, DateOnly)*, `securityId` *(optional list, string)*
* **Description:** Returns net position, WAC, closing price, Realized PnL, MTM Unrealized PnL, and Total PnL for target security or full desk inventory.


* **`GET /api/v1/pnl/timeseries`**
* **Query Parameters:** `securityId` *(required, string)*, `asOfDate` *(optional, DateOnly)*
* **Description:** Instantly extracts sequential daily historical PnL and position states directly from cache.



### 2. Trade Blotter Operations

* **`GET /api/v1/tradeblotter`**
* **Query Parameters:** `pageNumber`, `pageSize`, `fromDate`, `toDate`, `securityIds`, `traderIds`, `assetClasses`
* **Description:** Retrieves paginated trade execution records with server-side sorting and filtering.


* **`GET /api/v1/tradeblotter/analytics`**
* **Description:** Computes aggregated notional volume, buy/sell ratios, trader breakdowns, and asset class distributions.


* **`GET /api/v1/tradeblotter/export`**
* **Description:** Generates a downloadable CSV stream of filtered trade blotter executions.



---

## ⚡ WebSockets (SignalR) Specification

* **Hub Endpoint:** `https://localhost:7189/hubs/pnl`
* **Transport:** WebSockets (`wss://`)
* **Outbound Broadcast Event:** `"ReceivePriceUpdate"`
* **Payload Schema:**
```json
{
  "securityId": "EQ01",
  "price": 549.17,
  "priceChange": -2.03,
  "timestamp": "2026-08-12T08:12:19Z"
}

```



---

## ⚙️ Configuration & Setup

### Prerequisites

* **.NET 8.0 SDK** or later installed.

### Build and Run

1. **Restore dependencies:**
```bash
dotnet restore

```


2. **Build the Solution:**
```bash
dotnet build --configuration Release

```


3. **Run the API:**
```bash
dotnet run --project VantageTradingDesk.WebAPI

```


4. **Access Swagger Documentation:**
Navigate to `https://localhost:7189/swagger` in your browser.

---

## 🧪 Unit Testing

Run unit tests for repository query abstractions, domain calculation math, and cache concurrency:

```bash
dotnet test

```

Here is the updated **`README.md`** section for your React frontend, formatted in the exact same enterprise architectural style as your backend specification.

---

## 🎨 Frontend Architecture Specification

An enterprise-grade, single-page application (SPA) built with **React 18**, **Material UI (MUI v5/v6)**, and **MUI X Charts**. Designed as an active decision-support dashboard for trading desks, it features real-time Mark-to-Market (MTM) calculations, low-latency WebSocket price feeds via SignalR, and dynamic visual order highlights.

```text
VantageTradingDesk.Client/
├── src/
│   ├── components/        # Reusable UI widgets (Charts, Tables, Cards, Navbar)
│   ├── pages/             # Dashboard Views (PnL Summary, Time-Series Detail, Blotter)
│   ├── services/          # API Services & SignalR Hub Handlers
│   └── styles/            # Global Styles & CSS Price-Flash Animations

```

---

## 🚀 Key Frontend Features & Workflow Capabilities

1. **Real-Time Client-Side MTM Calculation Engine:**
When a live price tick arrives over SignalR, the client instantly recalculates $MTM\_UnrealizedPnL = (Price_{live} - WAC) \times NetPosition$ and updates $TotalPnL$ in-memory without triggering network refetches.
2. **Visual Price Action Indicators:**
Table rows feature sub-second CSS transition flashes—**Green** for price upticks and **Red** for downticks—giving traders instant visual context on moving inventory.
3. **Interactive Data Visualization:**
* **Grouped Bar Charts:** Compare Realized vs. Unrealized P&L across held securities.
* **Side-by-Side Donut Charts:** Breakdown relative market share for profitable positions.
* **Dual Line Time-Series Charts:** Zoomable date range sliders for tracking historical price vs. WAC divergence.


4. **Trader-Centric UX & Financial Ledger Controls:**
* **Flexible Sort Ordering:** One-click toggle to flip table chronologies between **Oldest $\rightarrow$ Newest** and **Newest $\rightarrow$ Oldest** (default view places the latest valuation at Row #1).
* **Multi-Select Filters & Autocomplete:** Dynamic security dropdowns that map directly to backend reference master data.



---

## 🛠 Frontend Technology Stack

* **Core Framework:** React 18 (Vite Bundler)
* **UI Components:** Material UI (MUI v5/v6) & MUI System
* **Data Visualization:** `@mui/x-charts` (LineChart, BarChart, PieChart)
* **Real-Time Websocket Client:** `@microsoft/signalr`
* **Routing & State:** React Router v6
* **Date Utilities:** Day.js with `@mui/x-date-pickers`

---

## 📱 Page & Component Architecture

### 1. Persistent Navigation (`Navbar.jsx`)

* **Sticky Slate Header:** Houses brand navigation (`TradingDesk`) with interactive scaling, route links for **Trade Blotter** and **P&L Summary**, and active page state highlighting.

### 2. Portfolio P&L Summary Page (`PnLSummaryPage.jsx`)

* **`PnLSummaryCards.jsx`:** Flexible 3-card layout for aggregate Total, Realized, and MTM Unrealized P&L with color-coded positive/negative indicators.
* **`PnLTable.jsx`:** Interactive data grid rendering live security rows, position sizes, cost basis, and custom price-flash animations (`.flash-up` / `.flash-down`).
* **`PnLPieChart.jsx`:** Dual donut chart layout separating positive Realized vs. Unrealized distributions.

### 3. Historical Time-Series Detail Page (`PnLTimeSeriesPage.jsx`)

* **`PnLTimeSeriesChart.jsx`:** Dual `LineChart` setup featuring an interactive range slider to scroll and zoom across historical valuation dates.
* **Ledger View:** Reversible table displaying sequential daily position snapshots, WAC tracking, and historical closing prices.

---

## ⚙️ Frontend Setup & Integration

### Prerequisites

* **Node.js** (v18.0.0 or later)
* **npm** or **yarn**

### Build and Run

1. **Install Dependencies:**
```bash
npm install

```


2. **Configure Backend Endpoint:**
Verify your SignalR hub and API URLs match your local backend server port in `src/pages/PnLSummaryPage.jsx`:
```javascript
const SIGNALR_HUB_URL = 'https://localhost:7189/hubs/pnl';

```


3. **Run Development Server:**
```bash
npm run dev

```


4. **Production Build:**
```bash
npm run build

```
