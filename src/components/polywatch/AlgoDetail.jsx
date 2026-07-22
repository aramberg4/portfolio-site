import React from 'react';
import { useAlgoDetail } from '../../hooks/usePolywatch';
import { fmtUsd, fmtSignedUsd, fmtPct, fmtPrice, pnlClass } from './format';

const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : '—');

const ageDays = (openedAt) => {
  const days = (Date.now() / 1000 - openedAt) / 86400;
  return days < 1 ? `${Math.round(days * 24)}h` : `${Math.round(days)}d`;
};

const EXIT_LABELS = {
  resolution: 'Resolved',
  take_profit: 'Take profit',
  stop_loss: 'Stop loss',
  mirror: 'Mirrored exit',
};

const Stat = ({ label, value, className = 'text-white' }) => (
  <div className="rounded-lg bg-gray-900/60 px-3 py-2">
    <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
    <div className={`text-sm font-semibold ${className}`}>{value}</div>
  </div>
);

const Table = ({ headers, children, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b border-gray-700">
          {headers.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700/60">
        {React.Children.count(children) > 0 ? children : (
          <tr><td colSpan={headers.length} className="py-4 text-gray-600">{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const AlgoDetail = ({ algo }) => {
  const { openPositions, closedPositions, loading } = useAlgoDetail(algo?.id ?? null);
  if (!algo) return null;

  const settled = closedPositions;
  const best = settled.reduce((m, p) => (m == null || p.realizedPnl > m.realizedPnl ? p : m), null);
  const worst = settled.reduce((m, p) => (m == null || p.realizedPnl < m.realizedPnl ? p : m), null);

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 mb-8">
      <h2 className="text-xl font-bold text-white">{algo.name}</h2>
      <p className="mt-1 text-sm text-gray-400 max-w-3xl">{algo.description}</p>
      {algo.config?.roster?.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Mirroring: {algo.config.roster.map((r) => r.name).join(', ')}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <Stat label="Equity" value={fmtUsd(algo.equity)} />
        <Stat label="Return" value={fmtPct(algo.returnPct)} className={pnlClass(algo.returnPct)} />
        <Stat label="Unrealized PnL" value={fmtSignedUsd(algo.unrealizedPnl)} className={pnlClass(algo.unrealizedPnl)} />
        <Stat label="Max drawdown" value={fmtPct(-algo.maxDrawdown)} className="text-gray-300" />
        <Stat
          label="Best / worst trade"
          value={settled.length === 0 ? '—'
            : `${fmtSignedUsd(best.realizedPnl)} / ${fmtSignedUsd(worst.realizedPnl)}`}
          className="text-gray-300"
        />
      </div>

      <h3 className="mt-6 mb-2 font-semibold text-white">Open positions ({openPositions.length})</h3>
      <Table
        headers={['Market', 'Outcome', 'Entry', 'Mark', 'Unrealized', 'Age']}
        empty={loading ? 'Loading…' : 'No open positions'}
      >
        {openPositions.map((p) => {
          const mark = p.lastMark ?? p.avgEntryPrice;
          const upnl = p.shares * (mark - p.avgEntryPrice);
          return (
            <tr key={p.id} className="text-gray-300">
              <td className="py-2 pr-4 max-w-xs truncate">{p.marketTitle || p.marketSlug}</td>
              <td className="py-2 pr-4">{p.outcome}</td>
              <td className="py-2 pr-4">{fmtPrice(p.avgEntryPrice)}</td>
              <td className="py-2 pr-4">{p.lastMark == null ? '—' : fmtPrice(p.lastMark)}</td>
              <td className={`py-2 pr-4 ${pnlClass(upnl)}`}>{fmtSignedUsd(upnl)}</td>
              <td className="py-2 pr-4 text-gray-500">{ageDays(p.openedAt)}</td>
            </tr>
          );
        })}
      </Table>

      <h3 className="mt-6 mb-2 font-semibold text-white">Closed trades ({settled.length})</h3>
      <Table
        headers={['Market', 'Outcome', 'Entry → Exit', 'PnL', 'Exit', 'Source']}
        empty={loading ? 'Loading…' : 'Nothing settled yet'}
      >
        {settled.map((p) => (
          <tr key={p.id} className="text-gray-300">
            <td className="py-2 pr-4 max-w-xs truncate">{p.marketTitle || p.marketSlug}</td>
            <td className="py-2 pr-4">{p.outcome}</td>
            <td className="py-2 pr-4">{fmtPrice(p.avgEntryPrice)} → {fmtPrice(p.exitPrice)}</td>
            <td className={`py-2 pr-4 ${pnlClass(p.realizedPnl)}`}>{fmtSignedUsd(p.realizedPnl)}</td>
            <td className="py-2 pr-4 text-gray-500">{EXIT_LABELS[p.exitReason] || p.exitReason}</td>
            <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{shortWallet(p.sourceWallet)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default AlgoDetail;
