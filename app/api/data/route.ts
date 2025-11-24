import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone') || 'IN';

    // Calculate date range for yearly data (last 365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Format dates as ISO strings (YYYY-MM-DDTHH:mm:ss.sssZ)
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    // Use the past-range endpoint for historical data
    // Note: This requires a paid API token with access to historical data
    const url = `${process.env.ELECTRICITY_MAPS_BASE_URL}/carbon-intensity/past-range?zone=${zone}&start=${start}&end=${end}`;

    try {
        const res = await fetch(url, {
            headers: {
                'auth-token': process.env.ELECTRICITY_MAPS_API_TOKEN || '',
            },
        });

        if (!res.ok) {
            // If past-range fails (e.g., free tier), fall back to recent history
            console.warn(`Failed to fetch yearly data: ${res.status}. Falling back to recent history.`);
            const fallbackUrl = `${process.env.ELECTRICITY_MAPS_BASE_URL}/power-breakdown/history?zone=${zone}`;
            const fallbackRes = await fetch(fallbackUrl, {
                headers: {
                    'auth-token': process.env.ELECTRICITY_MAPS_API_TOKEN || '',
                },
            });

            if (!fallbackRes.ok) {
                return NextResponse.json({ error: 'Failed to fetch data' }, { status: fallbackRes.status });
            }

            const fallbackData = await fallbackRes.json();
            return NextResponse.json(fallbackData);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}