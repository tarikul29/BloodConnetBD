import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, freq: 'daily' },
    { path: '/donors', priority: 0.9, freq: 'daily' },
    { path: '/requests', priority: 0.9, freq: 'hourly' },
    { path: '/request-blood', priority: 0.8, freq: 'monthly' },
    { path: '/register', priority: 0.8, freq: 'monthly' },
    { path: '/login', priority: 0.3, freq: 'yearly' },
  ];
  return pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}