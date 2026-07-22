const API_BASE = import.meta.env.VITE_POLYWATCH_API || 'https://api.austinramberg.com';

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`polywatch API ${res.status} on ${path}`);
  return res.json();
}

export const fetchAlgos = () => get('/api/algos');
export const fetchEquity = (id, days = 30) => get(`/api/algos/${id}/equity?days=${days}`);
export const fetchPositions = (id, status = 'open') => get(`/api/algos/${id}/positions?status=${status}`);
export const fetchFills = (id, limit = 100) => get(`/api/algos/${id}/fills?limit=${limit}`);
