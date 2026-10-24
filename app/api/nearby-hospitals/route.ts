import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

async function queryOverpass(endpoint: string, query: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'BloodConnectBD/1.0 (https://blood-connet-bd.vercel.app)',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`${endpoint} responded with ${response.status}`);
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();

    if (lat == null || lng == null) {
      return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
    }

    const query = `
[out:json][timeout:10];
(
  node["amenity"="hospital"](around:3000,${lat},${lng});
  way["amenity"="hospital"](around:3000,${lat},${lng});
  relation["amenity"="hospital"](around:3000,${lat},${lng});
  node["amenity"="clinic"](around:3000,${lat},${lng});
  way["amenity"="clinic"](around:3000,${lat},${lng});
);
out center;
`;

    let data: any;
    try {
      // সবগুলো সার্ভারকে একসাথে ডাকা হচ্ছে, যেটা আগে সফল হয় সেটার উত্তর নেওয়া হবে
      data = await Promise.any(ENDPOINTS.map((e) => queryOverpass(e, query)));
    } catch (err) {
      const reasons = err instanceof AggregateError ? err.errors.map(String) : [String(err)];
      console.error('All Overpass servers failed:', reasons);
      return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 502 });
    }

    const hospitals = (data.elements || [])
      .map((el: any) => {
        const name =
          el.tags?.name ||
          el.tags?.['name:bn'] ||
          el.tags?.['name:en'] ||
          el.tags?.official_name ||
          null;

        const hLat = el.lat || el.center?.lat;
        const hLon = el.lon || el.center?.lon;

        if (!name || !hLat || !hLon) return null;

        return { name: String(name).trim(), lat: hLat, lon: hLon };
      })
      .filter(Boolean);

    const unique = hospitals.filter(
      (h: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.name === h.name)
    );

    return NextResponse.json(unique.slice(0, 15));
  } catch (error) {
    console.error('Nearby hospitals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}