import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import replay from './backtest-replay.json';
import whatif from './backtest-whatif.json';
import { ALGO_COLORS, fmtUsd, fmtPct } from './format';

const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Both artifacts are generated from the same snapshot, so they share a window.
const everyman = replay.algos.find((a) => a.algoId === 'everyman');
const empty = replay.algos.filter((a) => a.summary.entries === 0);
const WHATIF_COLOR = { 'whatif-insider': 'insider-echo', 'whatif-smart_money': 'sharp-follow' };

const BacktestPanel = () => {
  const [showCaveats, setShowCaveats] = useState(false);
  if (!everyman) return null;

  const datasets = [
    {
      label: 'Everyman (replay)',
      data: everyman.equityCurve.map((p) => ({ x: p.ts, y: p.equity })),
      borderColor: ALGO_COLORS.everyman.border,
      backgroundColor: ALGO_COLORS.everyman.bg,
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      tension: 0.2,
    },
    ...whatif.algos.map((a) => {
      const color = ALGO_COLORS[WHATIF_COLOR[a.algoId]] || ALGO_COLORS.everyman;
      return {
        label: a.name,
        data: a.equityCurve.map((p) => ({ x: p.ts, y: p.equity })),
        borderColor: color.border,
        backgroundColor: color.bg,
        borderDash: [2, 3],
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.2,
      };
    }),
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    parsing: false,
    plugins: {
      legend: { labels: { color: '#D1D5DB', boxWidth: 12 } },
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

  const ret = (a) => fmtPct(a.summary.finalEquity / replay.params.startingCash - 1);
  const rec = (a) => `${a.summary.entries} entries, ${a.summary.wins}W–${a.summary.losses}L, ${ret(a)}`;
  const wiInsider = whatif.algos.find((a) => a.algoId === 'whatif-insider');
  const wiSmart = whatif.algos.find((a) => a.algoId === 'whatif-smart_money');
  const allCaveats = [
    ...replay.caveats.map((c) => `Replay: ${c}`),
    ...whatif.caveats.map((c) => `What-if: ${c}`),
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
        Before v2 of the live race, the engine replayed the prior 60 days of recorded trades.
        The gray dashed line is the official control replay — {everyman.name} copying every
        whale-tier signal ({rec(everyman)}, with {everyman.summary.openPositions} positions
        still open at cost). The dotted lines are <span className="text-gray-300">what-ifs</span>:
        strategies that copy every $500+ trade from wallets classified insider or smart money,
        at the sizing rules v2 now runs live.
      </p>

      <div className="relative h-56 min-w-0">
        <Line data={{ datasets }} options={options} />
      </div>

      <p className="mt-4 text-xs text-gray-400 max-w-3xl">
        <span className="text-gray-300 font-semibold">Why v2 exists:</span>{' '}
        at the $10K whale threshold, {empty.map((a) => a.name).join(' and ')} backtested to
        zero entries — across sixty days, not one insider-labeled buy was big enough to be
        seen. Insiders trade small. Lower the floor to $500 and the picture flips:
        insider-only would have done {wiInsider ? rec(wiInsider) : '—'}; smart-money-only{' '}
        {wiSmart ? rec(wiSmart) : '—'}. Those what-ifs are hindsight-flattered — wallets are
        classified partly <em>because</em> those trades won — which is exactly why v2 now
        tests them honestly, live, in the race above.
      </p>

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
