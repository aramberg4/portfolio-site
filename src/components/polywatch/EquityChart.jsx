import React, { useState } from 'react';
import {
  Chart as ChartJS, LinearScale, CategoryScale, LineController, LineElement,
  PointElement, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEquitySeries } from '../../hooks/usePolywatch';
import { ALGO_COLORS, EXPERIMENT_V2, fmtUsd } from './format';

ChartJS.register(LinearScale, CategoryScale, LineController, LineElement, PointElement, Tooltip, Legend);

// Dashed amber seam at the v2 reset — new T0 for Insider Echo / Sharp Follow,
// regime seam for everyone else. Index arrives via options.plugins.v2Seam.
const v2SeamPlugin = {
  id: 'v2Seam',
  afterDraw(chart, _args, opts) {
    if (opts.index == null || opts.index < 0) return;
    const x = chart.scales.x.getPixelForValue(opts.index);
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.strokeStyle = '#FBBF24';
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FBBF24';
    ctx.font = '9px sans-serif';
    const label = 'v2 reset';
    const flip = x + 4 + ctx.measureText(label).width > chart.chartArea.right;
    ctx.textAlign = flip ? 'right' : 'left';
    ctx.fillText(label, flip ? x - 4 : x + 4, top + 9);
    ctx.restore();
  },
};

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: 'All', days: 365 },
];

const EquityChart = ({ algos }) => {
  const [days, setDays] = useState(30);
  const algoIds = algos.map((a) => a.id);
  const { series, loading } = useEquitySeries(algoIds, days);

  // Union of timestamps across algos, as labels. Snapshots are only written
  // hourly (plus on fills), so append a live "now" point from the 60s-polled
  // algo summaries — otherwise the curve's right edge can lag live equity by
  // up to an hour while the standings show the current number.
  const snapTs = [...new Set(Object.values(series).flat().map((s) => s.ts))].sort((a, b) => a - b);
  const nowTs = Math.floor(Date.now() / 1000);
  const allTs = snapTs.length > 0 ? [...new Set([...snapTs, nowTs])].sort((a, b) => a - b) : snapTs;
  const labels = allTs.map((ts) =>
    new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  );

  const datasets = algos.map((algo) => {
    const color = ALGO_COLORS[algo.id] || ALGO_COLORS.everyman;
    const byTs = new Map((series[algo.id] || []).map((s) => [s.ts, s.equity]));
    if (snapTs.length > 0 && typeof algo.equity === 'number') byTs.set(nowTs, algo.equity);
    // Carry the last known equity forward across gaps so lines stay continuous
    let last = null;
    const data = allTs.map((ts) => {
      if (byTs.has(ts)) last = byTs.get(ts);
      return last;
    });
    return {
      label: algo.name,
      data,
      borderColor: color.border,
      backgroundColor: color.bg,
      borderDash: algo.id === 'everyman' ? [6, 4] : undefined,
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      spanGaps: true,
      tension: 0.2,
    };
  });

  // First snapshot at or after the v2 reset (−1 = seam outside this range)
  const v2Index = allTs.findIndex((ts) => ts >= EXPERIMENT_V2);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#D1D5DB', boxWidth: 12 } },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmtUsd(ctx.parsed.y)}` },
      },
      v2Seam: { index: v2Index },
    },
    scales: {
      x: { ticks: { color: '#6B7280', maxTicksLimit: 8 }, grid: { color: '#1F2937' } },
      y: {
        ticks: { color: '#6B7280', callback: (v) => fmtUsd(v) },
        grid: { color: '#1F2937' },
      },
    },
  };

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">Equity curves</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setDays(r.days)}
              className={`px-2.5 py-1 rounded text-xs font-medium
                ${days === r.days ? 'bg-gray-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-gray-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-72 lg:h-[420px]">
        {loading && allTs.length === 0
          ? <div className="h-full flex items-center justify-center text-gray-600">Loading…</div>
          : <Line data={{ labels, datasets }} options={options} plugins={[v2SeamPlugin]} />}
      </div>
    </div>
  );
};

export default EquityChart;
