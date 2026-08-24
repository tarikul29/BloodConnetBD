import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
    }

    const query = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:3000,${lat},${lng});
  way["amenity"="hospital"](around:3000,${lat},${lng});
  relation["amenity"="hospital"](around:3000,${lat},${lng});
  node["amenity"="clinic"](around:3000,${lat},${lng});
  way["amenity"="clinic"](around:3000,${lat},${lng});
);
out center;
`;

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
    ];

    let data = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'BloodConnectBD/1.0 (https://blood-connet-bd.vercel.app)',
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
          console.error(`Overpass ${endpoint} status:`, response.status);
          continue;
        }

        data = await response.json();
        break;
      } catch (err) {
        console.error(`Failed with ${endpoint}:`, err);
        continue;
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
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

        return {
          name: String(name).trim(),
          lat: hLat,
          lon: hLon,
        };
      })
      .filter(Boolean);

    // ডুপ্লিকেট বাদ
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