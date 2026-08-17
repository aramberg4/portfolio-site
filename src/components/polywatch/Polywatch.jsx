import React, { useState } from 'react';
import { useAlgos } from '../../hooks/usePolywatch';
import { EXPERIMENT_START } from './format';
import EquityChart from './EquityChart';
import StandingsTower from './StandingsTower';
import FillTicker from './FillTicker';
import AlgoDetail from './AlgoDetail';
import DeltaStrip from './DeltaStrip';

const Polywatch = () => {
  const { algos, error, loading } = useAlgos();
  const [selectedId, setSelectedId] = useState(null);
  // Default the drill-down to the current leader (API sorts by return desc)
  const selected = algos.find((a) => a.id === selectedId) || algos[0] || null;
  const day = Math.max(1, Math.ceil((Date.now() / 1000 - EXPERIMENT_START) / 86400));

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 text-gray-300">
      <div className="mb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold text-white">Polywatch Paper Trading</h1>
          <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
            Day {day} · live · updates 60s
          </span>
        </div>
        <p className="mt-2 text-gray-400 max-w-3xl">
          Seven algorithms paper-trade Polymarket in real time, each following a different
          hypothesis about the whales, insiders, and smart money my monitor classifies —
          plus one that simply mirrors the all-time profit leaderboard's top 10. Same $10K
          bankroll — different convictions. Everyman copies everything and serves as the
          benchmark.{' '}
          <a href="/polywatch-monitor.html" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            About the monitor behind the feed →
          </a>
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-300">
          Could not reach the polywatch API. It may be restarting — try again shortly.
        </div>
      )}
      {loading && <div className="text-gray-500">Loading…</div>}

      {algos.length > 0 && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4 mb-4">
          <EquityChart algos={algos} />
          <StandingsTower algos={algos} selectedId={selected?.id} onSelect={setSelectedId} />
        </div>
      )}
      {algos.length > 0 && <DeltaStrip algos={algos} />}
      <FillTicker algos={algos} />
      <AlgoDetail algo={selected} />
      </div>
    </div>
  );
};

export default Polywatch;
