import React from 'react';
import { fmtPct, fmtPts, pnlClass, ALGO_COLORS } from './format';

const DeltaStrip = ({ algos }) => {
  const everyman = algos.find((a) => a.id === 'everyman');
  if (!everyman) return null;
  const rest = algos.filter((a) => a.id !== 'everyman');
  const maxAbs = Math.max(...rest.map((a) => Math.abs(a.returnPct - everyman.returnPct)), 0.0001);

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 mb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Edge vs the control</h2>
        <span className="text-xs text-gray-500">0 = Everyman ({fmtPct(everyman.returnPct)} raw)</span>
      </div>
      <p className="mt-1 mb-4 text-xs text-gray-500 max-w-2xl">
        Everyman copies every classified trade — it is the feed. Each bar shows what an
        algo's selectivity added or destroyed, in return points. Since the Jul 21 v2 reset,
        Insider Echo and Sharp Follow also size differently, so their bars bundle entry + sizing.
      </p>
      {rest.map((algo) => {
        const delta = algo.returnPct - everyman.returnPct;
        const width = (Math.abs(delta) / maxAbs) * 46; // % of track, max 46 so bars never touch the edge
        const color = ALGO_COLORS[algo.id] || ALGO_COLORS.everyman;
        return (
          <div key={algo.id} className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center gap-3 py-1">
            <span className="flex items-center justify-end gap-2 text-sm text-gray-300">
              <span className="truncate">{algo.name}</span>
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
            </span>
            <span className="relative h-4">
              <span className="absolute left-1/2 -top-1 -bottom-1 w-px bg-gray-500" />
              <span
                className="absolute top-0.5 h-3 rounded-sm"
                style={{
                  backgroundColor: color.bg,
                  ...(delta >= 0
                    ? { left: '50%', width: `${width}%` }
                    : { right: '50%', width: `${width}%` }),
                }}
              />
            </span>
            <span className={`font-mono text-xs ${pnlClass(delta)}`}>{fmtPts(delta)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DeltaStrip;
