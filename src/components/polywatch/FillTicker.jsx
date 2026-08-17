import React from 'react';
import { useRecentFills } from '../../hooks/usePolywatch';
import { fmtUsd, fmtPrice } from './format';

const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : null);

const SIDE_CLASS = { buy: 'text-emerald-400', sell: 'text-red-400', resolve: 'text-gray-400' };

const provenance = (f) => {
  if (f.side === 'resolve') return 'resolution';
  if (f.reason && f.side === 'sell') return f.reason.replace('_', ' ');
  const who = shortWallet(f.sourceWallet);
  return who ? `copying ${who}${f.sourceClassification ? ` (${f.sourceClassification.replace('_', ' ')})` : ''}` : null;
};

const FillTicker = ({ algos }) => {
  const { fills } = useRecentFills(algos.map((a) => a.id));
  const nameById = Object.fromEntries(algos.map((a) => [a.id, a.name]));
  if (fills.length === 0) return null;

  // The track holds the fill list twice; the animation translates it by -50%,
  // so the second copy slides in exactly where the first began — a seamless
  // loop. Both copies must stay identical for the width math to hold.
  const entries = (copy) => fills.map((f) => (
    <span key={`${copy}-${f.id}`} className="mr-7">
      <span className="text-gray-600">
        {new Date(f.ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </span>{' '}
      <span className="text-gray-200 font-semibold">{nameById[f.algoId] || f.algoId}</span>{' '}
      <span className={SIDE_CLASS[f.side] || 'text-gray-400'}>{f.side.toUpperCase()}</span>
      {f.outcome ? ` ${f.outcome}` : ''}
      {f.marketTitle ? ` “${f.marketTitle}”` : ''}
      {' @ '}{fmtPrice(f.price)} · {fmtUsd(f.usdc)}
      {provenance(f) ? <span className="text-gray-600"> · {provenance(f)}</span> : null}
    </span>
  ));

  return (
    <div className="fill-ticker mb-8 rounded-lg border border-gray-700 bg-gray-950/60 px-4 py-2 overflow-hidden font-mono text-xs text-gray-400">
      <div
        className="fill-ticker-track whitespace-nowrap"
        style={{ animationDuration: `${fills.length * 7}s` }}
      >
        {entries('a')}
        {entries('b')}
      </div>
    </div>
  );
};

export default FillTicker;
