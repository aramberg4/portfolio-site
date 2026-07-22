import React from 'react';
import { fmtPct, pnlClass, ALGO_COLORS } from './format';

const StandingsTower = ({ algos, selectedId, onSelect }) => {
  const leader = algos[0];
  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden self-start">
      <div className="px-4 py-2.5 border-b border-gray-700 font-mono text-[10px] uppercase tracking-widest text-gray-500">
        Standings · gap to leader
      </div>
      {algos.map((algo, i) => {
        const color = ALGO_COLORS[algo.id] || ALGO_COLORS.everyman;
        const isSel = algo.id === selectedId;
        const gap = (leader.returnPct - algo.returnPct) * 100;
        return (
          <button
            key={algo.id}
            type="button"
            onClick={() => onSelect(algo.id)}
            className={`w-full grid grid-cols-[1.25rem_4px_1fr_auto] items-center gap-2.5 px-3 py-2 text-left
              border-b border-gray-700/50 last:border-b-0 transition
              ${isSel ? 'bg-gray-700/60' : 'hover:bg-gray-700/30'}`}
          >
            <span className="font-mono text-sm text-gray-500 text-right">{i + 1}</span>
            <span className="h-7 rounded-sm" style={{ backgroundColor: color.bg }} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white truncate">
                {algo.name}
                {algo.id === 'everyman' && (
                  <span className="ml-2 align-middle text-[9px] uppercase tracking-wide text-gray-500 border border-gray-600 rounded px-1 py-px">
                    benchmark
                  </span>
                )}
              </span>
              <span className="block font-mono text-[10px] text-gray-500">
                {i === 0 ? 'LEADER' : `−${gap.toFixed(1)} pt`}
              </span>
            </span>
            <span className={`font-mono text-sm ${pnlClass(algo.returnPct)}`}>{fmtPct(algo.returnPct)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StandingsTower;
