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
        node["amenity"="hospital"](around:2500,${lat},${lng});
        way["amenity"="hospital"](around:2500,${lat},${lng});
        relation["amenity"="hospital"](around:2500,${lat},${lng});
        node["amenity"="clinic"](around:2500,${lat},${lng});
        way["amenity"="clinic"](around:2500,${lat},${lng});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error('Overpass API failed');
    }

    const data = await response.json();

    const hospitals = data.elements
      .map((el: any) => {
        const name =
          el.tags?.name ||
          el.tags?.['name:bn'] ||
          el.tags?.['name:en'] ||
          el.tags?.['official_name'] ||
          null;

        const hLat = el.lat || el.center?.lat;
        const hLon = el.lon || el.center?.lon;

        if (!name || !hLat || !hLon) return null;

        return { name, lat: hLat, lon: hLon };
      })
      .filter(Boolean);

    // ডুপ্লিকেট বাদ দেওয়া
    const unique = hospitals.filter(
      (h: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.name === h.name)
    );

    return NextResponse.json(unique.slice(0, 12));
  } catch (error) {
    console.error('Nearby hospitals error:', error);
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}