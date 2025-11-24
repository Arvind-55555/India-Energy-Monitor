# India Energy Monitor

> A high-fidelity, real-time visualization of India's electricity grid, featuring flow-tracing animations, carbon intensity tracking, and generation mix analysis.

![Dashboard Preview]([https://arvind-55555.github.io/India-Energy-Monitor/])

## Overview

This project is a web-based dashboard designed to visualize the **Carbon Intensity** and **Electricity Mix** of the Indian Grid (Zone: IN). It mimics professional control room interfaces using a "Glassmorphism" design system.

It solves the problem of abstract energy data by visualizing:
1.  **Grid Physics:** `Generation = Net Load + Exports` (Visualized via animated flow lines).
2.  **Carbon Impact:** Live gauge showing gCO₂eq/kWh.
3.  **Time Travel:** Toggle between Live (24H), Monthly (30D), and Yearly (5Y) trends.

---

## Key Features

*   **Real-Time Power Balance:** Visualizes the flow of energy from Source (Gen) → Grid (Net Load) → Sink (Export).
*   **Carbon Intensity Gauge:** Animated gauge with color-coded alerts (Green/Orange/Red) based on emission levels.
*   **Seasonal Data Engine:** (Mock Mode) Simulates realistic Indian grid patterns:
    *   *Monsoon:* High Wind/Hydro, Low Solar.
    *   *Summer:* Peak Solar, High Demand.
    *   *Night:* Zero Solar, Coal Baseload.
*   **Interactive Charts:**
    *   **Stacked Area Chart:** Historical generation trends.
    *   **Donut Chart:** Live fuel mix breakdown.
*   **Tech Stack:** Tailwind CSS, Chart.js, Lucide Icons.

---

## Quick Start (Demo Mode)

The current version allows for instant testing without a build step.

1.  **Download:** Save the `dashboard-final.html` file to your computer.
2.  **Run:** Double-click the file to open it in Chrome, Firefox, or Edge.
3.  **Interact:** Use the **24H / 30D / 5Y** buttons to see the data visualization engine in action.

---

##  Integration Guide (Next.js / React)

To deploy this as a production web app using Next.js:

### 1. Installation
```bash
npx create-next-app@latest india-energy-dashboard
cd india-energy-dashboard
npm install chart.js react-chartjs-2 lucide-react date-fns clsx tailwind-merge
```

### 2.Environment Setup
Create a .env.local file for your API keys:
```bash
ELECTRICITY_MAPS_API_KEY=your_api_key_here
ELECTRICITY_MAPS_BASE_URL=https://api.electricitymaps.com/v3
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Build and Deploy
```bash
npm run build
npm run start
```

### 5. Access the Dashboard
Open `http://localhost:3000` in your browser to see the dashboard.

## Data Sources & Logic
### 1. Simulation Engine (Current)
In the absence of a paid Enterprise API token, the dashboard uses a heuristic engine to simulate realistic Indian data:
- **Solar:** Modeled using a Bell Curve (Sine wave) peaking at 12:00 PM.
- **Wind/Hydro:** Adjusted based on month index to simulate Monsoon seasonality (June-September).
- **Coal:** Calculated as a balancing variable (Total Demand - Renewables).

### 2. Live API (Production)
To switch to live data, replace the `generateData()` function with an API call to Electricity Maps:

### Endpoint
```bash
https://api.electricitymaps.com/v3/zone/IN/
```
### Response Mapping:
```bash
// Map the API response to the dashboard structure
const totalGen = apiData.powerProductionTotal;
const imports = apiData.powerImportTotal;
const exports = apiData.powerExportTotal;
const netLoad = totalGen + imports - exports;
```
###  References
**Data Baselines:**
- **Grid-India (POSOCO)** - Daily Load Reports.
- **Data.gov.in** - National Power Portal.
