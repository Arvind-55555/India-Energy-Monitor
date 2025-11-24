import { format, startOfMonth, startOfYear, parseISO } from 'date-fns';

// Official Electricity Maps Colors
export const TECH_COLORS: Record<string, string> = {
    solar: '#f4c320',      // Yellow
    wind: '#80b8ce',       // Light Blue
    hydro: '#4976a9',      // Dark Blue
    nuclear: '#6aa84f',    // Green
    biomass: '#166a57',    // Dark Green
    geothermal: '#9e1d1d', // Red
    coal: '#ac8c35',       // Brown
    gas: '#b4b4b4',        // Grey
    oil: '#856857',        // Dark Brown
    unknown: '#cccccc',    // Light Grey
    battery_discharge: '#f0f0f0'
};

export const RENEWABLE_KEYS = ['solar', 'wind', 'geothermal', 'hydro', 'biomass'];
export const CARBON_FREE_KEYS = [...RENEWABLE_KEYS, 'nuclear'];

// --- MOCK DATA GENERATOR (For 5 Year / 365 Days simulation) ---
export const generateMockHistory = (range: '1Y' | '5Y') => {
    const points = range === '1Y' ? 365 : 60; // Days vs Months
    const data = [];
    const now = new Date();

    for (let i = points; i >= 0; i--) {
        const date = new Date(now);
        if (range === '1Y') date.setDate(date.getDate() - i);
        else date.setMonth(date.getMonth() - i);

        // Simulate Seasonality (India: High Coal, Summer Solar peaks)
        const month = date.getMonth();
        const isMonsoon = month >= 5 && month <= 8; // June-Sept

        // Randomize base load
        const coal = 120000 + Math.random() * 20000;
        // Solar peaks in summer, drops in monsoon
        const solar = isMonsoon ? 15000 : 35000 + Math.random() * 5000;
        const wind = isMonsoon ? 25000 : 10000 + Math.random() * 5000;
        const hydro = isMonsoon ? 20000 : 8000;
        const nuclear = 5000;
        const gas = 5000 + Math.random() * 2000;
        const unknown = 2000;

        const total = coal + solar + wind + hydro + nuclear + gas + unknown;

        // Calculate Intensity (Weighted average)
        // Coal ~820g, Gas ~490g, Others ~0-20g
        const totalEmissions = (coal * 820) + (gas * 490) + (unknown * 700);
        const intensity = Math.round(totalEmissions / total);

        data.push({
            datetime: date.toISOString(),
            carbonIntensity: intensity,
            powerProductionBreakdown: { coal, solar, wind, hydro, nuclear, gas, unknown }
        });
    }
    return data;
};

// --- DATA AGGREGATION ---
export const processData = (rawData: any[], range: '1Y' | '5Y') => {
    if (!rawData || rawData.length === 0) return null;

    const processed = rawData.map(point => {
        const mix = point.powerProductionBreakdown || {};
        let total = 0, renewable = 0, lowCarbon = 0;

        Object.keys(mix).forEach(key => {
            const val = mix[key];
            if (typeof val === 'number') {
                total += val;
                if (RENEWABLE_KEYS.includes(key)) renewable += val;
                if (CARBON_FREE_KEYS.includes(key)) lowCarbon += val;
            }
        });

        return {
            datetime: point.datetime,
            // Handle missing intensity by defaulting to 0 or calculating fallback
            carbonIntensity: point.carbonIntensity || 0,
            total,
            renewablePct: total ? (renewable / total) * 100 : 0,
            carbonFreePct: total ? (lowCarbon / total) * 100 : 0,
            ...mix
        };
    });

    const latest = processed[processed.length - 1];
    const avgIntensity = Math.round(processed.reduce((a, b) => a + b.carbonIntensity, 0) / processed.length);

    return { chartData: processed, latest, avgIntensity };
};