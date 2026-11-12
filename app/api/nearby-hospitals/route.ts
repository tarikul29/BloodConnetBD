import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    // ৫ কিমি এর মধ্যে হাসপাতাল ও ক্লিনিক
    const url = `https://api.geoapify.com/v2/places?categories=healthcare.hospital,healthcare.clinic_or_praxis&filter=circle:${lng},${lat},6000&bias=proximity:${lng},${lat}&limit=15&apiKey=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error('Geoapify error:', res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();

    const hospitals = (data.features || [])
      .map((item: any) => {
        const name = item.properties?.name || item.properties?.address_line1;
        const hLat = item.properties?.lat;
        const hLon = item.properties?.lon;

        if (!name || !hLat || !hLon) return null;

        return {
          name: String(name).trim(),
          lat: Number(hLat),
          lon: Number(hLon),
        };
      })
      .filter(Boolean);

    // ডুপ্লিকেট বাদ
    const unique = hospitals.filter(
      (h: any, i: number, arr: any[]) =>
        i === arr.findIndex((t) => t.name === h.name)
    );

    return NextResponse.json(unique);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}