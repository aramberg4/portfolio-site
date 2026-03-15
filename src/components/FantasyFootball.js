import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  CategoryScale, LinearScale, BarElement, LineElement,
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

const FantasyFootball = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
        ticks: { color: '#9CA3AF' },
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

  const mostSuccessful = sortedBySuccess[0];
  const mostTalented = sortedByTalent[0];

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
        <div className="flex justify-center mb-8 gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'charts', label: 'Team Charts' },
            { key: 'success', label: 'Most Successful' },
            { key: 'talent', label: 'Most Talented' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Record</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Win%</th>
                      <th className="text-right text-gray-400 font-medium px-3 py-3">Avg PF</th>
                      <th className="text-right text-gray-400 font-medium px-3 py-3">Avg PA</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Playoffs</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Titles</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Top Scorer</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Avg Finish</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Success</th>
                      <th className="text-center text-gray-400 font-medium px-3 py-3">Talent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.teamStats].sort((a, b) => b.successScore - a.successScore).map((team, idx) => {
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
                          <td className="text-center text-gray-300 px-3 py-3">{team.totalWins}-{team.totalLosses}</td>
                          <td className="text-center text-gray-300 px-3 py-3">{team.winPct}%</td>
                          <td className="text-right text-gray-300 px-3 py-3">{team.avgPF.toLocaleString()}</td>
                          <td className="text-right text-gray-300 px-3 py-3">{team.avgPA.toLocaleString()}</td>
                          <td className="text-center px-3 py-3">
                            <span className={`font-medium ${team.playoffAppearances >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                              {team.playoffAppearances}/{team.numSeasons}
                            </span>
                          </td>
                          <td className="text-center px-3 py-3">
                            {team.championships > 0 ? (
                              <span className="text-yellow-400 font-bold">{team.championships}</span>
                            ) : (
                              <span className="text-gray-600">0</span>
                            )}
                          </td>
                          <td className="text-center px-3 py-3">
                            {team.highestScorerSeasons > 0 ? (
                              <span className="text-blue-400 font-medium">{team.highestScorerSeasons}</span>
                            ) : (
                              <span className="text-gray-600">0</span>
                            )}
                          </td>
                          <td className="text-center text-gray-300 px-3 py-3">{team.avgFinalStanding}</td>
                          <td className="text-center px-3 py-3">
                            <ScoreBadge score={team.successScore} />
                          </td>
                          <td className="text-center px-3 py-3">
                            <ScoreBadge score={team.talentScore} variant="talent" />
                          </td>
                        </tr>
                      );
                    })}
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
            <div className="flex justify-center">
              <div className="relative" style={{ zIndex: 50 }}>
                <button
                  onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                  className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 hover:border-blue-500 transition-all min-w-[280px] justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    {selectedTeamData && (
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: TEAM_COLORS[selectedTeamData.teamId]?.bg }}></div>
                    )}
                    <span className="font-medium">{selectedTeamData?.ownerName || 'Select Team'}</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {teamDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                    {data.teamStats.map(team => (
                      <button
                        key={team.teamId}
                        onClick={() => handleTeamSelect(team.teamId)}
                        className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-gray-700 text-gray-100 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS[team.teamId]?.bg }}></div>
                        <span className="font-medium">{team.ownerName}</span>
                        <span className="text-gray-500 text-xs ml-auto">{team.totalWins}-{team.totalLosses}</span>
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
                <div className="h-[400px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Season Detail Cards */}
            {selectedTeamData && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {data.allSeasons.map(year => {
                  const s = selectedTeamData.seasons[year];
                  if (!s) return null;
                  const color = TEAM_COLORS[selectedTeamData.teamId];
                  return (
                    <div key={year} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-xs font-medium mb-2">{year}</div>
                      <div className="text-white font-bold text-lg">{s.wins}-{s.losses}</div>
                      <div className="text-gray-400 text-xs mt-1">{s.pointsFor.toLocaleString()} PF</div>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${s.madePlayoffs ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                          {s.madePlayoffs ? 'Playoffs' : 'Missed'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-500">Finish:</span>
                        <span className={`text-xs font-bold ${s.finalStanding === 1 ? 'text-yellow-400' : s.finalStanding <= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                          {ordinal(s.finalStanding)}
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-gray-700">
                        <div className="h-1 rounded-full" style={{
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
          <div className="space-y-6">
            <VerdictCard
              title="Most Successful Team"
              team={mostSuccessful}
              score={mostSuccessful?.successScore}
              color={TEAM_COLORS[mostSuccessful?.teamId]}
              breakdown={[
                { label: 'Championships', value: mostSuccessful?.championships, weight: '40%' },
                { label: 'Playoff Appearances', value: `${mostSuccessful?.playoffAppearances}/${mostSuccessful?.numSeasons}`, weight: '25%' },
                { label: 'Avg Final Standing', value: ordinal(Math.round(mostSuccessful?.avgFinalStanding)), weight: '20%' },
                { label: 'Win %', value: `${mostSuccessful?.winPct}%`, weight: '15%' },
              ]}
            />

            <RankingList
              title="Success Rankings"
              teams={sortedBySuccess}
              scoreKey="successScore"
              variant="success"
            />
          </div>
        )}

        {/* Most Talented Tab */}
        {activeTab === 'talent' && (
          <div className="space-y-6">
            <VerdictCard
              title="Most Talented Team"
              team={mostTalented}
              score={mostTalented?.talentScore}
              color={TEAM_COLORS[mostTalented?.teamId]}
              breakdown={[
                { label: 'Avg Points For', value: mostTalented?.avgPF.toLocaleString(), weight: '35%' },
                { label: 'Highest Scorer Seasons', value: mostTalented?.highestScorerSeasons, weight: '25%' },
                { label: 'Best Season PF', value: mostTalented?.bestSeasonPF.toLocaleString(), weight: '15%' },
                { label: 'Avg Reg Season Rank', value: ordinal(Math.round(mostTalented?.avgRegSeasonRank)), weight: '15%' },
                { label: 'Avg Points Against', value: mostTalented?.avgPA.toLocaleString(), weight: '10%' },
              ]}
            />

            <RankingList
              title="Talent Rankings"
              teams={sortedByTalent}
              scoreKey="talentScore"
              variant="talent"
            />
          </div>
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

function ScoreBadge({ score, variant = 'success' }) {
  let colorClass = 'bg-gray-700 text-gray-400';
  if (score >= 75) colorClass = variant === 'success' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400';
  else if (score >= 50) colorClass = variant === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-cyan-900/50 text-cyan-400';
  else if (score >= 25) colorClass = 'bg-gray-700 text-gray-300';

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
      {score}
    </span>
  );
}

function VerdictCard({ title, team, score, color, breakdown }) {
  if (!team) return null;
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Trophy / Score */}
        <div className="flex-shrink-0 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4"
            style={{ borderColor: color?.bg, color: color?.bg, backgroundColor: color?.bg + '15' }}>
            {score}
          </div>
          <div className="text-gray-500 text-xs mt-2">Composite Score</div>
        </div>

        {/* Details */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color?.bg }}></div>
            <span className="text-xl text-white font-medium">{team.ownerName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {breakdown.map(item => (
              <div key={item.label} className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-gray-500 text-xs">{item.label} ({item.weight})</div>
                <div className="text-white font-bold text-lg">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingList({ title, teams, scoreKey, variant }) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-gray-700/50">
        {teams.map((team, idx) => {
          const color = TEAM_COLORS[team.teamId];
          const score = team[scoreKey];
          return (
            <div key={team.teamId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-700/30 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx === 0 ? 'bg-yellow-500 text-gray-900' :
                idx === 1 ? 'bg-gray-400 text-gray-900' :
                idx === 2 ? 'bg-amber-700 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {idx + 1}
              </div>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color.bg }}></div>
              <div className="flex-1">
                <div className="text-white font-medium">{team.ownerName}</div>
                <div className="text-gray-500 text-xs">{team.totalWins}-{team.totalLosses} &middot; {team.championships} title{team.championships !== 1 ? 's' : ''} &middot; {team.playoffAppearances} playoff{team.playoffAppearances !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 rounded-full bg-gray-700">
                  <div className="h-2 rounded-full transition-all" style={{
                    width: `${score}%`,
                    backgroundColor: color.bg,
                  }}></div>
                </div>
                <ScoreBadge score={score} variant={variant} />
              </div>
            </div>
          );
        })}
      </div>
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
