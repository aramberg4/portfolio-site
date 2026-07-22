import { useState, useEffect } from 'react';
import { fetchAlgos, fetchEquity, fetchPositions, fetchFills } from '../utils/polywatchApi';

const POLL_MS = 60_000;

/** Poll a fetcher on an interval; re-run when deps change. */
function usePolled(fetcher, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await fetcher();
        if (alive) setState({ data, error: null, loading: false });
      } catch (error) {
        if (alive) setState((s) => ({ ...s, error, loading: false }));
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useAlgos() {
  const { data, error, loading } = usePolled(() => fetchAlgos(), []);
  return { algos: data || [], error, loading };
}

export function useAlgoDetail(algoId) {
  const { data, error, loading } = usePolled(async () => {
    if (!algoId) return { open: [], closed: [] };
    const [open, closed] = await Promise.all([
      fetchPositions(algoId, 'open'),
      fetchPositions(algoId, 'closed'),
    ]);
    return { open, closed };
  }, [algoId]);
  return {
    openPositions: data?.open || [],
    closedPositions: data?.closed || [],
    error,
    loading,
  };
}

export function useEquitySeries(algoIds, days) {
  const key = algoIds.join(',');
  const { data, loading } = usePolled(async () => {
    const entries = await Promise.all(
      algoIds.map(async (id) => [id, await fetchEquity(id, days)]),
    );
    return Object.fromEntries(entries);
  }, [key, days]);
  return { series: data || {}, loading };
}

export function useRecentFills(algoIds) {
  const key = algoIds.join(',');
  const { data } = usePolled(async () => {
    if (algoIds.length === 0) return [];
    const lists = await Promise.all(algoIds.map((id) => fetchFills(id, 5)));
    return lists.flat().sort((a, b) => b.ts - a.ts).slice(0, 12);
  }, [key]);
  return { fills: data || [] };
}
