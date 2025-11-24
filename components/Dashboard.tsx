'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { processData, generateMockHistory, TECH_COLORS } from '@/utils/energyHelpers';
import { format, parseISO } from 'date-fns';

export default function Dashboard() {
    const [isMounted, setIsMounted] = useState(false);
    const [range, setRange] = useState<'1Y' | '5Y'>('1Y');
    const [data, setData] = useState<any>(null);
    const [useMock, setUseMock] = useState(true); // Toggle for Real API vs Mock

    useEffect(() => {
        setIsMounted(true);
        fetchData(range);
    }, [range, useMock]);

    const fetchData = async (selectedRange: '1Y' | '5Y') => {
        // NOTE: Real API for 5 Years requires Paid Subscription (/past-range endpoint)
        // We default to Mock Data to ensure you see the Visualization logic working.

        if (useMock) {
            const mockRaw = generateMockHistory(selectedRange);
            setData(processData(mockRaw, selectedRange));
        } else {
            // Real API Logic (Requires valid token for historical data)
            // This is just a placeholder for the fetch structure
            try {
                // const res = await fetch(`/api/data?range=${selectedRange}`); ...
                console.log("Fetch logic would go here");
            } catch (e) { console.error(e); }
        }
    };

    if (!isMounted) return null;
    if (!data) return <div className="p-10 text-white">Loading...</div>;

    // Format Date Logic
    const formatDate = (str: string) => {
        const date = parseISO(str);
        return range === '5Y' ? format(date, 'yyyy') : format(date, 'MMM d');
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl text-xs">
                    <p className="font-bold text-gray-200 mb-2">{format(parseISO(label), 'PP')}</p>
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="text-gray-300">
                                {Math.round(entry.value).toLocaleString()} {entry.name === 'Carbon Intensity' ? 'gCO₂' : 'MW'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#111827] text-gray-100 p-4 md:p-8 font-sans">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">India (IN) Energy Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Historical Carbon Intensity & Generation Mix
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-gray-800 p-1 rounded-lg border border-gray-700">
                    <button
                        onClick={() => setRange('1Y')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === '1Y' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Past 365 Days
                    </button>
                    <button
                        onClick={() => setRange('5Y')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === '5Y' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Past 5 Years
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Avg Carbon Intensity" value={data.avgIntensity} unit="gCO₂eq/kWh" color="text-white" />
                <StatCard title="Current Renewable %" value={data.latest.renewablePct.toFixed(1)} unit="%" color="text-green-400" />
                <StatCard title="Current Low Carbon %" value={data.latest.carbonFreePct.toFixed(1)} unit="%" sub="(Incl. Nuclear)" color="text-blue-400" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8">

                {/* 1. Carbon Intensity Chart */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-200">Carbon Intensity History</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span className="text-xs text-gray-400">Intensity (gCO₂eq/kWh)</span>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="datetime"
                                    tickFormatter={formatDate}
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6B7280', strokeWidth: 1 }} />
                                <Area
                                    type="monotone"
                                    dataKey="carbonIntensity"
                                    stroke="#f97316"
                                    fillOpacity={1}
                                    fill="url(#colorIntensity)"
                                    strokeWidth={2}
                                    name="Carbon Intensity"
                                    connectNulls={true} // FIXES MISSING DATA GAPS
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Electricity Mix Chart */}
                <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-200">Electricity Generation Mix</h2>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="datetime"
                                    tickFormatter={formatDate}
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                                {/* Render Bars: Cleanest Sources on TOP */}
                                {['coal', 'gas', 'unknown', 'hydro', 'nuclear', 'wind', 'solar'].map((tech) => (
                                    <Bar
                                        key={tech}
                                        dataKey={tech}
                                        stackId="a"
                                        fill={TECH_COLORS[tech] || '#666'}
                                        name={tech.charAt(0).toUpperCase() + tech.slice(1)}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <div className="mt-8 text-center border-t border-gray-800 pt-8">
                <p className="text-gray-500 text-sm">
                    Data Mode: {useMock ? <span className="text-yellow-500 font-bold">MOCK DATA (Simulation)</span> : 'Live API'} <br />
                    Note: "Past 5 Years" requires Electricity Maps Enterprise Plan. Mock data used for demonstration.
                </p>
            </div>
        </div>
    );
}

// Simple Sub-component for Stats
function StatCard({ title, value, unit, sub, color }: any) {
    return (
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
            <div className="flex items-end mt-2">
                <span className={`text-4xl font-bold ${color}`}>{value}</span>
                <span className={`ml-2 mb-1 text-sm ${color}`}>{unit}</span>
            </div>
            {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
    );
}