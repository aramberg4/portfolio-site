export const fmtUsd = (n) =>
  `$${Math.round(n).toLocaleString('en-US')}`;

export const fmtSignedUsd = (n) =>
  `${n >= 0 ? '+' : '−'}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

export const fmtPct = (n) =>
  `${n >= 0 ? '+' : '−'}${Math.abs(n * 100).toFixed(1)}%`;

export const fmtPts = (n) =>
  `${n >= 0 ? '+' : '−'}${Math.abs(n * 100).toFixed(1)} pt`;

export const pnlClass = (n) => (n >= 0 ? 'text-emerald-400' : 'text-red-400');

export const fmtPrice = (p) => `${Math.round(p * 100)}¢`;

// v1 go-live (Jul 16 2026 UTC) — drives the "Day N" counter.
export const EXPERIMENT_START = Date.UTC(2026, 6, 16) / 1000;

// v2 scoped reset (classified-tier ingestion): new T0 for Insider Echo /
// Sharp Follow, regime seam for everyone else — drawn on the equity chart.
export const EXPERIMENT_V2 = Date.UTC(2026, 6, 22, 0, 37, 37) / 1000;

// v3 (Aug 17 2026): day-33 risk overhaul — per-event exposure caps, Insider
// Echo/Sharp Follow exit stacks + 30d time-stop, Inverse Losers favorite-fade
// guard. Existing >30d positions bulk-exit on the first poll after deploy,
// so curves show a seam here — drawn on the equity chart.
export const EXPERIMENT_V3 = Date.UTC(2026, 7, 17, 23, 14, 56) / 1000;

// One stable color per algo (Everyman is the gray benchmark).
// Validated 2026-07-21 with the dataviz six-checks validator on the
// gray-900 (#111827) surface — passes lightness band, chroma floor,
// CVD separation (deutan/protan/tritan), normal-vision floor, and
// contrast, in adjacency order blue→amber→emerald→violet→pink→cyan.
// Do not swap hues without re-validating.
export const ALGO_COLORS = {
  'sharp-follow': { bg: '#3B82F6', border: '#2563EB' },
  'crowd-surge': { bg: '#D97706', border: '#B45309' },
  'fade-the-fish': { bg: '#059669', border: '#047857' },
  'insider-echo': { bg: '#8B5CF6', border: '#7C3AED' },
  'kitchen-sink': { bg: '#EC4899', border: '#DB2777' },
  'top-10-mirror': { bg: '#0891B2', border: '#0E7490' },
  everyman: { bg: '#9CA3AF', border: '#6B7280' },
};
