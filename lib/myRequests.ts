// অনুরোধকারীর ডিভাইসে নিজের অনুরোধের গোপন টোকেন রাখা হয়
const KEY = 'bc_my_requests';

function read(): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function saveMyRequest(id: string, token: string) {
  try {
    const all = read();
    all[id] = token;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export function getMyRequestToken(id: string): string | null {
  return read()[id] ?? null;
}