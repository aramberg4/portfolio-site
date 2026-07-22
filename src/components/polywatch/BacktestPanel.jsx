import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import replay from './backtest-replay.json';
import { ALGO_COLORS, fmtUsd, fmtPct } from './format';

const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// The replay marks open positions at cost basis (no historical price paths),
// so only algos that actually traded have a meaningful curve.
const traded = replay.algos.filter((a) => a.summary.entries > 0);
const empty = replay.algos.filter((a) => a.summary.entries === 0);

const BacktestPanel = () => {
  const [showCaveats, setShowCaveats] = useState(false);
  if (traded.length === 0) return null;

  const datasets = traded.map((a) => {
    const color = ALGO_COLORS[a.algoId] || ALGO_COLORS.everyman;
    return {
      label: a.name,
      data: a.equityCurve.map((p) => ({ x: p.ts, y: p.equity })),
      borderColor: color.border,
      backgroundColor: color.bg,
      borderDash: [4, 4],
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      tension: 0.2,
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    parsing: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => fmtDate(items[0].parsed.x),
          label: (ctx) => `${ctx.dataset.label}: ${fmtUsd(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: replay.windowStart,
        max: replay.windowEnd,
        ticks: { color: '#6B7280', maxTicksLimit: 8, callback: (v) => fmtDate(v) },
        grid: { color: '#1F2937' },
      },
      y: {
        ticks: { color: '#6B7280', callback: (v) => fmtUsd(v) },
        grid: { color: '#1F2937' },
      },
    },
  };

  const everyman = traded.find((a) => a.algoId === 'everyman') || traded[0];
  const { entries, wins, losses, finalEquity } = everyman.summary;
  const returnPct = finalEquity / replay.params.startingCash - 1;
  const allCaveats = [
    ...replay.caveats,
    ...replay.algos.flatMap((a) => a.caveats.map((c) => `${a.name}: ${c}`)),
  ];

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 mb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">The prequel: a 60-day backtest</h2>
        <span className="font-mono text-xs text-gray-500">
          {fmtDate(replay.windowStart)} – {fmtDate(replay.windowEnd)} · reconstructed
        </span>
      </div>
      <p className="mt-1 mb-4 text-xs text-gray-500 max-w-3xl">
        Before the live race began, the engine replayed the prior 60 days of recorded
        whale trades. {everyman.name} — the copy-everything control — entered {entries} positions
        and went {wins}W–{losses}L, finishing at {fmtUsd(finalEquity)} ({fmtPct(returnPct)}).
        The dashed line marks reconstructed data: open positions ride at cost basis, so the
        curve moves only on fills and resolutions.
      </p>

      <div className="relative h-56 min-w-0">
        <Line data={{ datasets }} options={options} />
      </div>

      {empty.length > 0 && (
        <p className="mt-4 text-xs text-gray-400 max-w-3xl">
          <span className="text-gray-300 font-semibold">
            {empty.map((a) => a.name).join(' and ')} backtested to zero entries
          </span>{' '}
          — across sixty days, not one insider-labeled buy cleared the $10K live threshold.
          Insiders trade small. That finding is why the experiment&apos;s v2 reset lowered the
          classified-trade floor to $500, giving those two hypotheses a real chance in the
          live race above.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowCaveats((s) => !s)}
        className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2"
      >
        {showCaveats ? 'Hide' : 'Show'} methodology caveats ({allCaveats.length})
      </button>
      {showCaveats && (
        <ul className="mt-2 space-y-1 text-xs text-gray-500 list-disc pl-5 max-w-3xl">
          {allCaveats.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}
    </div>
  );
};

export default BacktestPanel;
