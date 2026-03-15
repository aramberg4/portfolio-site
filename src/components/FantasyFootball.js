import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement,
  PointElement, Tooltip, Legend, Title, Filler
);

// Consistent team colors by teamId
const TEAM_COLORS = {
  1: { bg: '#3B82F6', border: '#2563EB', label: 'blue' },
  2: { bg: '#10B981', border: '#059669', label: 'emerald' },
  3: { bg: '#F59E0B', border: '#D97706', label: 'amber' },
  4: { bg: '#EF4444', border: '#DC2626', label: 'red' },
  5: { bg: '#8B5CF6', border: '#7C3AED', label: 'violet' },
  6: { bg: '#EC4899', border: '#DB2777', label: 'pink' },
  7: { bg: '#06B6D4', border: '#0891B2', label: 'cyan' },
  8: { bg: '#F97316', border: '#EA580C', label: 'orange' },
  9: { bg: '#14B8A6', border: '#0D9488', label: 'teal' },
  10: { bg: '#6366F1', border: '#4F46E5', label: 'indigo' },
};

function processData(raw) {
  if (!raw?.seasonData) return null;

  const seasons = raw.availableSeasons || [];
  const manualSeasons = raw.manualSeasons || {};
  const allSeasons = [...new Set([...Object.keys(manualSeasons).map(Number), ...seasons])].sort();

  // Build per-team history keyed by teamId
  const teamHistories = {};

  allSeasons.forEach(year => {
    const teams = raw.seasonData[year] || manualSeasons[year] || [];
    teams.forEach(t => {
      if (!teamHistories[t.teamId]) {
        teamHistories[t.teamId] = {
          teamId: t.teamId,
          ownerName: t.ownerName,
          currentName: t.teamName,
          seasons: {},
        };
      }
      teamHistories[t.teamId].seasons[year] = t;
      // Update current name to latest
      teamHistories[t.teamId].currentName = t.teamName;
      teamHistories[t.teamId].ownerName = t.ownerName;
    });
  });

  // Compute aggregate stats per team
  const teamStats = Object.values(teamHistories).map(th => {
    const seasonEntries = Object.values(th.seasons);
    const numSeasons = seasonEntries.length;

    const totalPF = seasonEntries.reduce((s, t) => s + t.pointsFor, 0);
    const totalPA = seasonEntries.reduce((s, t) => s + t.pointsAgainst, 0);
    const totalWins = seasonEntries.reduce((s, t) => s + t.wins, 0);
    const totalLosses = seasonEntries.reduce((s, t) => s + t.losses, 0);
    const playoffAppearances = seasonEntries.filter(t => t.madePlayoffs).length;
    const championships = seasonEntries.filter(t => t.finalStanding === 1).length;
    const runnerUps = seasonEntries.filter(t => t.finalStanding === 2).length;

    // Highest scorer: team with most PF in a season
    // We'll calculate this after we have all teams
    const avgFinalStanding = seasonEntries.reduce((s, t) => s + (t.finalStanding || 10), 0) / numSeasons;
    const avgRegSeasonRank = seasonEntries.reduce((s, t) => s + (t.regularSeasonRank || 10), 0) / numSeasons;
    const bestSeasonPF = Math.max(...seasonEntries.map(t => t.pointsFor));

    return {
      ...th,
      numSeasons,
      totalPF: Math.round(totalPF * 100) / 100,
      totalPA: Math.round(totalPA * 100) / 100,
      avgPF: Math.round((totalPF / numSeasons) * 100) / 100,
      avgPA: Math.round((totalPA / numSeasons) * 100) / 100,
      totalWins,
      totalLosses,
      winPct: Math.round((totalWins / (totalWins + totalLosses)) * 1000) / 10,
      playoffAppearances,
      championships,
      runnerUps,
      avgFinalStanding: Math.round(avgFinalStanding * 100) / 100,
      avgRegSeasonRank: Math.round(avgRegSeasonRank * 100) / 100,
      bestSeasonPF,
    };
  });

  // Calculate highest scorer seasons
  allSeasons.forEach(year => {
    const teams = raw.seasonData[year] || manualSeasons[year] || [];
    if (teams.length === 0) return;
    const maxPF = Math.max(...teams.map(t => t.pointsFor));
    const highScorerTeamId = teams.find(t => t.pointsFor === maxPF)?.teamId;
    const stat = teamStats.find(s => s.teamId === highScorerTeamId);
    if (stat) {
      stat.highestScorerSeasons = (stat.highestScorerSeasons || 0) + 1;
    }
  });

  // Ensure all teams have the field
  teamStats.forEach(s => {
    if (!s.highestScorerSeasons) s.highestScorerSeasons = 0;
  });

  // Compute composite scores
  // Normalize each metric to 0-100 scale
  const normalize = (values) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return values.map(() => 50);
    return values.map(v => ((v - min) / (max - min)) * 100);
  };

  // For "lower is better" metrics (like avg standing)
  const normalizeInverse = (values) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return values.map(() => 50);
    return values.map(v => ((max - v) / (max - min)) * 100);
  };

  const champNorm = normalize(teamStats.map(t => t.championships));
  const playoffNorm = normalize(teamStats.map(t => t.playoffAppearances));
  const finalStandNorm = normalizeInverse(teamStats.map(t => t.avgFinalStanding));
  const winPctNorm = normalize(teamStats.map(t => t.winPct));

  const avgPFNorm = normalize(teamStats.map(t => t.avgPF));
  const highScorerNorm = normalize(teamStats.map(t => t.highestScorerSeasons));
  const bestPFNorm = normalize(teamStats.map(t => t.bestSeasonPF));
  const regSeasonNorm = normalizeInverse(teamStats.map(t => t.avgRegSeasonRank));
  const avgPANorm = normalize(teamStats.map(t => t.avgPA)); // higher PA = harder schedule

  teamStats.forEach((t, i) => {
    t.successScore = Math.round(
      champNorm[i] * 0.40 +
      playoffNorm[i] * 0.25 +
      finalStandNorm[i] * 0.20 +
      winPctNorm[i] * 0.15
    );

    t.talentScore = Math.round(
      avgPFNorm[i] * 0.35 +
      highScorerNorm[i] * 0.25 +
      bestPFNorm[i] * 0.15 +
      regSeasonNorm[i] * 0.15 +
      avgPANorm[i] * 0.10
    );
  });

  return { teamStats, allSeasons };
}

// Heatmap: green (best) → yellow → orange → red (worst)
// pct = 0 (worst) to 1 (best)
function heatColor(pct) {
  const clamped = Math.max(0, Math.min(1, pct));
  if (clamped >= 0.75) {
    // green to yellow-green
    const t = (clamped - 0.75) / 0.25;
    return `rgb(${Math.round(74 + (163 - 74) * (1 - t))}, ${Math.round(222 - (222 - 230) * (1 - t))}, ${Math.round(128 + (74 - 128) * (1 - t))})`;
  } else if (clamped >= 0.5) {
    // yellow-green to yellow
    const t = (clamped - 0.5) / 0.25;
    return `rgb(${Math.round(234 + (163 - 234) * t)}, ${Math.round(179 + (230 - 179) * t)}, ${Math.round(8 + (74 - 8) * t)})`;
  } else if (clamped >= 0.25) {
    // orange to yellow
    const t = (clamped - 0.25) / 0.25;
    return `rgb(${Math.round(249 + (234 - 249) * t)}, ${Math.round(115 + (179 - 115) * t)}, ${Math.round(22 + (8 - 22) * t)})`;
  } else {
    // red to orange
    const t = clamped / 0.25;
    return `rgb(${Math.round(239 + (249 - 239) * t)}, ${Math.round(68 + (115 - 68) * t)}, ${Math.round(68 + (22 - 68) * t)})`;
  }
}

function getColumnPct(value, allValues, invert = false) {
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  if (max === min) return 0.5;
  const pct = (value - min) / (max - min);
  return invert ? 1 - pct : pct;
}

const FantasyFootball = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortCol, setSortCol] = useState('successScore');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' or 'desc'

  const handleSort = useCallback((col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }, [sortCol]);

  useEffect(() => {
    fetch('/fantasy-football-data.json')
      .then(res => res.json())
      .then(raw => {
        const processed = processData(raw);
        setData(processed);
        if (processed?.teamStats?.length > 0) {
          setSelectedTeam(processed.teamStats[0].teamId);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const sortedBySuccess = useMemo(() => {
    if (!data) return [];
    return [...data.teamStats].sort((a, b) => b.successScore - a.successScore);
  }, [data]);

  const sortedByTalent = useMemo(() => {
    if (!data) return [];
    return [...data.teamStats].sort((a, b) => b.talentScore - a.talentScore);
  }, [data]);

  const selectedTeamData = useMemo(() => {
    if (!data || !selectedTeam) return null;
    return data.teamStats.find(t => t.teamId === selectedTeam);
  }, [data, selectedTeam]);

  const chartData = useMemo(() => {
    if (!selectedTeamData || !data) return null;

    const seasons = data.allSeasons;
    const pfData = seasons.map(y => selectedTeamData.seasons[y]?.pointsFor || 0);
    const finalRank = seasons.map(y => selectedTeamData.seasons[y]?.finalStanding || null);
    const regRank = seasons.map(y => selectedTeamData.seasons[y]?.regularSeasonRank || null);
    const color = TEAM_COLORS[selectedTeamData.teamId] || TEAM_COLORS[1];

    return {
      labels: seasons.map(String),
      datasets: [
        {
          type: 'bar',
          label: 'Points For',
          data: pfData,
          backgroundColor: color.bg + 'CC',
          borderColor: color.border,
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: 'Final Standing',
          data: finalRank,
          borderColor: '#F59E0B',
          backgroundColor: '#F59E0B33',
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#F59E0B',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          yAxisID: 'y1',
          order: 1,
        },
        {
          type: 'line',
          label: 'Regular Season Rank',
          data: regRank,
          borderColor: '#A78BFA',
          backgroundColor: '#A78BFA33',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 5,
          pointBackgroundColor: '#A78BFA',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          yAxisID: 'y1',
          order: 0,
        },
      ],
    };
  }, [selectedTeamData, data]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E5E7EB',
          font: { size: 13 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#E5E7EB',
        borderColor: '#4B5563',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          afterBody: function(context) {
            const yearIndex = context[0].dataIndex;
            if (!data || !selectedTeamData) return '';
            const year = data.allSeasons[yearIndex];
            const season = selectedTeamData.seasons[year];
            if (!season) return '';
            const lines = [];
            lines.push(`Record: ${season.wins}-${season.losses}`);
            lines.push(`Points Against: ${season.pointsAgainst.toLocaleString()}`);
            lines.push(`Playoffs: ${season.madePlayoffs ? 'Yes' : 'No'}`);
            lines.push(`Team: ${season.teamName}`);
            return lines;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF', font: { size: 13 } },
        grid: { color: '#374151' },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Points For', color: '#9CA3AF' },
        ticks: { color: '#9CA3AF', stepSize: 100 },
        grid: { color: '#374151' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        reverse: true,
        min: 1,
        max: 10,
        title: { display: true, text: 'Ranking (1 = Best)', color: '#9CA3AF' },
        ticks: { color: '#9CA3AF', stepSize: 1 },
        grid: { drawOnChartArea: false },
      },
    },
  }), [data, selectedTeamData]);

  const handleTeamSelect = useCallback((teamId) => {
    setSelectedTeam(teamId);
    setTeamDropdownOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">Failed to load data: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16 pt-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-green-900/10"></div>

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Exeter Day Studs
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">
            {data.allSeasons[0]}–{data.allSeasons[data.allSeasons.length - 1]} &middot; {data.teamStats.length} Teams &middot; {data.allSeasons.length} Seasons
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem', marginBottom: '2rem', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          {[
            { key: 'overview', label: 'Overview', dot: '#3b82f6', activeBg: 'rgba(59,130,246,0.15)', activeText: '#60a5fa', activeBorder: 'rgba(59,130,246,0.4)' },
            { key: 'charts', label: 'Team Charts', dot: '#10b981', activeBg: 'rgba(16,185,129,0.15)', activeText: '#34d399', activeBorder: 'rgba(16,185,129,0.4)' },
            { key: 'success', label: 'Most Successful', dot: '#f59e0b', activeBg: 'rgba(245,158,11,0.15)', activeText: '#fbbf24', activeBorder: 'rgba(245,158,11,0.4)' },
            { key: 'talent', label: 'Most Talented', dot: '#8b5cf6', activeBg: 'rgba(139,92,246,0.15)', activeText: '#a78bfa', activeBorder: 'rgba(139,92,246,0.4)' },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="rounded-lg font-semibold text-base transition-all duration-200"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: isActive ? tab.activeBg : 'transparent',
                  color: isActive ? tab.activeText : '#9ca3af',
                  border: isActive ? `1px solid ${tab.activeBorder}` : '1px solid transparent',
                  borderRadius: '0.5rem',
                }}
              >
                <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: tab.dot }}></span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">All-Time Standings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-750 border-b border-gray-700">
                      {[
                        { key: 'ownerName', label: 'Owner', align: 'left' },
                        { key: 'totalWins', label: 'Record', align: 'center' },
                        { key: 'winPct', label: 'Win%', align: 'center' },
                        { key: 'avgPF', label: 'Avg PF', align: 'center' },
                        { key: 'avgPA', label: 'Avg PA', align: 'center' },
                        { key: 'playoffAppearances', label: 'Playoffs', align: 'center' },
                        { key: 'championships', label: 'Titles', align: 'center' },
                        { key: 'highestScorerSeasons', label: 'Top Scorer', align: 'center' },
                        { key: 'avgFinalStanding', label: 'Avg Finish', align: 'center' },
                        { key: 'successScore', label: 'Success', align: 'center' },
                        { key: 'talentScore', label: 'Talent', align: 'center' },
                      ].map((col, i) => (
                        <th
                          key={col.id || col.label}
                          className={`text-${col.align} text-gray-400 font-medium px-3 py-3 cursor-pointer hover:text-white transition-colors select-none ${col.align === 'left' ? 'px-4' : ''}`}
                          onClick={() => handleSort(col.key)}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {sortCol === col.key && (
                              <span className="text-blue-400 text-xs">{sortDir === 'desc' ? '▼' : '▲'}</span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sorted = [...data.teamStats].sort((a, b) => {
                        let aVal = a[sortCol];
                        let bVal = b[sortCol];
                        if (typeof aVal === 'string') {
                          aVal = aVal.toLowerCase();
                          bVal = bVal.toLowerCase();
                          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                        }
                        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
                      });
                      const allWinPct = sorted.map(t => t.winPct);
                      const allAvgPF = sorted.map(t => t.avgPF);
                      const allAvgPA = sorted.map(t => t.avgPA);
                      const allPlayoffs = sorted.map(t => t.playoffAppearances);
                      const allChamps = sorted.map(t => t.championships);
                      const allTopScorer = sorted.map(t => t.highestScorerSeasons);
                      const allAvgFinish = sorted.map(t => t.avgFinalStanding);
                      const allSuccess = sorted.map(t => t.successScore);
                      const allTalent = sorted.map(t => t.talentScore);

                      return sorted.map((team, idx) => {
                        const color = TEAM_COLORS[team.teamId];
                        return (
                          <tr
                            key={team.teamId}
                            className={`border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                              selectedTeam === team.teamId ? 'bg-gray-700/70' : ''
                            }`}
                            onClick={() => { setSelectedTeam(team.teamId); setActiveTab('charts'); }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color.bg }}></div>
                                <div>
                                  <div className="text-white font-medium">{team.ownerName}</div>
                                  <div className="text-gray-500 text-xs truncate max-w-[180px]">{team.currentName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-3 py-3" style={{ color: heatColor(getColumnPct(team.winPct, allWinPct)) }}>
                              {team.totalWins}-{team.totalLosses}
                            </td>
                            <td className="text-center px-3 py-3" style={{ color: heatColor(getColumnPct(team.winPct, allWinPct)) }}>
                              {team.winPct}%
                            </td>
                            <td className="text-center px-3 py-3" style={{ color: heatColor(getColumnPct(team.avgPF, allAvgPF)) }}>
                              {team.avgPF.toLocaleString()}
                            </td>
                            <td className="text-center px-3 py-3" style={{ color: heatColor(getColumnPct(team.avgPA, allAvgPA, true)) }}>
                              {team.avgPA.toLocaleString()}
                            </td>
                            <td className="text-center px-3 py-3 font-medium" style={{ color: heatColor(getColumnPct(team.playoffAppearances, allPlayoffs)) }}>
                              {team.playoffAppearances}/{team.numSeasons}
                            </td>
                            <td className="text-center px-3 py-3 font-bold" style={{ color: heatColor(getColumnPct(team.championships, allChamps)) }}>
                              {team.championships}
                            </td>
                            <td className="text-center px-3 py-3 font-medium" style={{ color: heatColor(getColumnPct(team.highestScorerSeasons, allTopScorer)) }}>
                              {team.highestScorerSeasons}
                            </td>
                            <td className="text-center px-3 py-3" style={{ color: heatColor(getColumnPct(team.avgFinalStanding, allAvgFinish, true)) }}>
                              {team.avgFinalStanding}
                            </td>
                            <td className="text-center px-3 py-3 font-bold" style={{ color: heatColor(getColumnPct(team.successScore, allSuccess)) }}>
                              {team.successScore}
                            </td>
                            <td className="text-center px-3 py-3 font-bold" style={{ color: heatColor(getColumnPct(team.talentScore, allTalent)) }}>
                              {team.talentScore}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Team Selector */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', zIndex: 50, width: 320 }}>
                <button
                  onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '0.75rem 1.25rem', gap: '0.75rem',
                    backgroundColor: '#1f2937', color: '#fff', borderRadius: '0.75rem',
                    border: '1px solid #374151', cursor: 'pointer', fontSize: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selectedTeamData && (
                      <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: TEAM_COLORS[selectedTeamData.teamId]?.bg }}></div>
                    )}
                    <span style={{ fontWeight: 500 }}>{selectedTeamData?.ownerName || 'Select Team'}</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#9ca3af' }} />
                </button>

                {teamDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                    backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: 320, overflowY: 'auto', zIndex: 50,
                  }}>
                    {data.teamStats.map((team, i) => (
                      <button
                        key={team.teamId}
                        onClick={() => handleTeamSelect(team.teamId)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          width: '100%', padding: '0.75rem 1.25rem', textAlign: 'left',
                          backgroundColor: 'transparent', color: '#e5e7eb', border: 'none',
                          cursor: 'pointer', fontSize: '0.875rem',
                          borderTop: i > 0 ? '1px solid #2d3748' : 'none',
                          borderRadius: i === 0 ? '0.75rem 0.75rem 0 0' : i === data.teamStats.length - 1 ? '0 0 0.75rem 0.75rem' : 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: TEAM_COLORS[team.teamId]?.bg, flexShrink: 0 }}></div>
                        <span style={{ fontWeight: 500, flex: 1 }}>{team.ownerName}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{team.totalWins}-{team.totalLosses}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chart */}
            {chartData && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-1 text-center">
                  {selectedTeamData?.ownerName} — Season Performance
                </h3>
                <p className="text-gray-500 text-xs text-center mb-6">
                  Click a row in the Overview tab or use the dropdown to switch teams
                </p>
                <div style={{ height: 600 }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Season Detail Cards */}
            {selectedTeamData && (
              <div className="space-y-2">
                {data.allSeasons.map(year => {
                  const s = selectedTeamData.seasons[year];
                  if (!s) return null;
                  const color = TEAM_COLORS[selectedTeamData.teamId];
                  return (
                    <div key={year} className="rounded-lg" style={{
                      backgroundColor: '#1f2937', border: '1px solid #374151',
                      display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', gap: '1.5rem',
                    }}>
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, width: 40, flexShrink: 0 }}>{year}</div>
                      <div className="font-bold text-white" style={{ fontSize: '1.125rem', width: 60, flexShrink: 0 }}>{s.wins}-{s.losses}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem', width: 80, flexShrink: 0 }}>{s.pointsFor.toLocaleString()} PF</div>
                      <div style={{ width: 70, flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4,
                          backgroundColor: s.madePlayoffs ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
                          color: s.madePlayoffs ? '#4ade80' : '#6b7280',
                        }}>
                          {s.madePlayoffs ? 'Playoffs' : 'Missed'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 80, flexShrink: 0 }}>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Finish:</span>
                        <span className="font-bold" style={{
                          fontSize: '0.875rem',
                          color: s.finalStanding === 1 ? '#facc15' : s.finalStanding <= 3 ? '#4ade80' : '#9ca3af',
                        }}>
                          {ordinal(s.finalStanding)}
                        </span>
                      </div>
                      <div style={{ flex: 1, height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          width: `${((10 - s.finalStanding + 1) / 10) * 100}%`,
                          backgroundColor: color.bg,
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Most Successful Tab */}
        {activeTab === 'success' && (
          <RankedCards
            title="Success Rankings"
            teams={sortedBySuccess}
            scoreKey="successScore"
            metrics={[
              { label: 'Championships', key: 'championships', weight: '40%' },
              { label: 'Playoff Apps', key: 'playoffAppearances', weight: '25%', format: (v, t) => `${v}/${t.numSeasons}` },
              { label: 'Avg Finish', key: 'avgFinalStanding', weight: '20%', format: v => ordinal(Math.round(v)) },
              { label: 'Win %', key: 'winPct', weight: '15%', format: v => `${v}%` },
            ]}
          />
        )}

        {/* Most Talented Tab */}
        {activeTab === 'talent' && (
          <RankedCards
            title="Talent Rankings"
            teams={sortedByTalent}
            scoreKey="talentScore"
            metrics={[
              { label: 'Avg PF', key: 'avgPF', weight: '35%', format: v => v.toLocaleString() },
              { label: 'Top Scorer', key: 'highestScorerSeasons', weight: '25%', format: v => `${v}x` },
              { label: 'Best Season', key: 'bestSeasonPF', weight: '15%', format: v => v.toLocaleString() },
              { label: 'Avg Reg Rank', key: 'avgRegSeasonRank', weight: '15%', format: v => ordinal(Math.round(v)) },
              { label: 'Avg PA', key: 'avgPA', weight: '10%', format: v => v.toLocaleString() },
            ]}
          />
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Data from ESPN Fantasy Football API &middot; Seasons {data.allSeasons[0]}-{data.allSeasons[data.allSeasons.length - 1]}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

function RankedCards({ title, teams, scoreKey, metrics }) {
  const maxScore = Math.max(...teams.map(t => t[scoreKey]));

  return (
    <div className="space-y-4">
      {teams.map((team, idx) => {
        const color = TEAM_COLORS[team.teamId];
        const score = team[scoreKey];
        const isFirst = idx === 0;

        return (
          <div
            key={team.teamId}
            className="rounded-xl overflow-hidden shadow-lg"
            style={{
              backgroundColor: '#1f2937',
              border: isFirst ? `2px solid ${color.bg}` : '1px solid #374151',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '1.25rem 1.5rem', gap: '1.5rem' }}>
              {/* Rank */}
              <div
                className="rounded-full font-bold flex-shrink-0"
                style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem',
                  backgroundColor: idx === 0 ? '#eab308' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : '#374151',
                  color: idx <= 1 ? '#111827' : idx === 2 ? '#fff' : '#9ca3af',
                }}
              >
                {idx + 1}
              </div>

              {/* Color dot + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 160, flexShrink: 0 }}>
                <div className="rounded-full" style={{ width: 12, height: 12, backgroundColor: color.bg }}></div>
                <div>
                  <div className="text-white font-bold" style={{ fontSize: isFirst ? '1.125rem' : '1rem' }}>{team.ownerName}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{team.totalWins}-{team.totalLosses}</div>
                </div>
              </div>

              {/* Metrics laid out horizontally */}
              <div style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
                {metrics.map(metric => {
                  const val = team[metric.key];
                  const formatted = metric.format ? metric.format(val, team) : val;
                  return (
                    <div
                      key={metric.key}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: isFirst ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <div style={{ color: '#6b7280', fontSize: '0.7rem', marginBottom: 2 }}>{metric.label} ({metric.weight})</div>
                      <div className="font-bold" style={{ color: '#e5e7eb', fontSize: '1rem' }}>{formatted}</div>
                    </div>
                  );
                })}
              </div>

              {/* Score bar + number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, width: 140 }}>
                <div style={{ flex: 1, height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
                    backgroundColor: color.bg,
                  }}></div>
                </div>
                <span className="font-bold" style={{ color: isFirst ? '#fff' : '#9ca3af', fontSize: '1.125rem', width: 32, textAlign: 'right' }}>
                  {score}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ordinal(n) {
  if (!n) return '-';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default FantasyFootball;
