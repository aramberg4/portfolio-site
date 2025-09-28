import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import NFLDataService from '../utils/nflDataService';
import { nflTeams, getTeamById } from '../utils/nflTeams';
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const NFLTargetShare = () => {
  const [selectedTeam, setSelectedTeam] = useState('KC'); // Default to Chiefs
  const [selectedWeek, setSelectedWeek] = useState(1); // Default to week 1 (first available week)
  const [targetShareData, setTargetShareData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  // const [dataSource, setDataSource] = useState('loading'); // 'api', 'mock', 'error', 'loading' - unused
  const [season, setSeason] = useState(null); // Track which season's data we're showing
  const [dataNotice, setDataNotice] = useState(null); // Track any important notices about the data
  const [availableWeeks, setAvailableWeeks] = useState([]); // Store available weeks from API

  // Helper function to get team primary color
  const getTeamColor = (teamId) => {
    const teamColors = {
      'KC': '#E31837',   // Chiefs red
      'BUF': '#00338D',  // Bills blue
      'LAR': '#003594',  // Rams blue
      'TB': '#D50A0A',   // Bucs red
      'DAL': '#003594',  // Cowboys blue
      'GB': '#203731',   // Packers green
      'SF': '#AA0000',   // 49ers red
      'MIA': '#008E97',  // Dolphins teal
      'MIN': '#4F2683',  // Vikings purple
      'CHI': '#0B162A',  // Bears navy
      'NE': '#002244',   // Patriots navy
      'NYJ': '#125740',  // Jets green
      'LV': '#000000',   // Raiders black
      'LAC': '#0080C6',  // Chargers blue
      'DEN': '#FB4F14',  // Broncos orange
      'PIT': '#FFB612',  // Steelers gold
      'CLE': '#311D00',  // Browns brown
      'CIN': '#FB4F14',  // Bengals orange
      'BAL': '#241773',  // Ravens purple
      'TEN': '#0C2340',  // Titans navy
      'IND': '#002C5F',  // Colts blue
      'HOU': '#03202F',  // Texans navy
      'JAX': '#101820',  // Jaguars black
      'WAS': '#5A1414',  // Commanders burgundy
      'NYG': '#0B2265',  // Giants blue
      'PHI': '#004C54',  // Eagles green
      'SEA': '#002244',  // Seahawks navy
      'ARI': '#97233F',  // Cardinals red
      'ATL': '#A71930',  // Falcons red
      'CAR': '#0085CA',  // Panthers blue
      'NO': '#101820',   // Saints black
      'DET': '#0076B6'   // Lions blue
    };
    return teamColors[teamId] || '#4A5568'; // Default gray
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#E5E7EB',
        borderColor: '#4B5563',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      },
      title: {
        display: true,
        text: `${getTeamById(selectedTeam)?.name || 'Team'} Target Share`,
        color: '#F9FAFB',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  // Load available weeks on component mount
  useEffect(() => {
    const loadAvailableWeeks = async () => {
      try {
        const weeks = await NFLDataService.getAvailableWeeks();
        setAvailableWeeks(weeks);

        // Set selected week to the first available week
        if (weeks.length > 0) {
          setSelectedWeek(weeks[0].value);
        }
      } catch (error) {
        console.error('Failed to load available weeks:', error);
        // Fallback to weeks 1-3
        const fallbackWeeks = [1, 2, 3].map(week => ({
          value: week,
          label: `Week ${week}`
        }));
        setAvailableWeeks(fallbackWeeks);
        setSelectedWeek(1);
      }
    };

    loadAvailableWeeks();
  }, []);

  // Load data when team or week changes
  useEffect(() => {
    loadTargetShareData();
  }, [selectedTeam, selectedWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTargetShareData = async () => {
    setLoading(true);
    setError(null);
    // setDataSource('loading'); // unused

    try {
      const result = await NFLDataService.getTargetShareData(selectedTeam, selectedWeek);

      if (result.success) {
        setTargetShareData(result.data);
        const formattedData = NFLDataService.formatForPieChart(result.data, result.team);
        setChartData(formattedData);
        // setDataSource(result.source || 'api'); // unused
        setSeason(result.season);

        // Update available weeks if provided by API
        if (result.availableWeeks && result.availableWeeks.length > 0) {
          const weeks = result.availableWeeks.map(week => ({
            value: week,
            label: `Week ${week}`
          }));
          setAvailableWeeks(weeks);
        }

        // Show warning if using mock data
        if (result.source === 'mock' && result.warning) {
          console.warn(result.warning);
          setDataNotice(result.warning);
        }

        // Show notice about data availability
        if (result.notice) {
          console.warn('Data Notice:', result.notice);
          setDataNotice(result.notice);
        }
      } else {
        setError(result.error || 'Failed to load data');
        // setDataSource('error'); // unused

        // Update available weeks if provided even on error
        if (result.availableWeeks && result.availableWeeks.length > 0) {
          const weeks = result.availableWeeks.map(week => ({
            value: week,
            label: `Week ${week}`
          }));
          setAvailableWeeks(weeks);
        }

        // Show notice about data limitations
        if (result.notice) {
          setDataNotice(result.notice);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      // setDataSource('error'); // unused
      console.error('Error loading target share data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
    setTeamDropdownOpen(false);
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
    setWeekDropdownOpen(false);
  };

  const selectedTeamData = getTeamById(selectedTeam);

  return (
    <div className="min-h-screen bg-gray-900 py-16 pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-green-900/10"></div>

      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            <span role="img" aria-label="football">🏈</span> NFL Target Share Analyzer
          </h1>

          {/* Season Indicator */}
          {season && (
            <div className="mb-6">
              <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-lg">
                {season} Season Data
              </span>
            </div>
          )}

          {/* Data Notice */}
          {dataNotice && (
            <div className="mb-6 max-w-3xl mx-auto">
              <div className="px-6 py-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl shadow-sm">
                <p className="text-sm font-medium">
                  <span role="img" aria-label="calendar">📅</span> {dataNotice}
                </p>
              </div>
            </div>
          )}

          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-400 mx-auto mb-8"></div>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Interactive visualization of wide receiver target distribution by team and week.
            Perfect for fantasy football analysis and NFL insights.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          {/* Team Selector */}
          <div className="relative" style={{ zIndex: 999999 }}>
            <button
              onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
              className="flex items-center gap-3 px-8 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-200 min-w-[280px] justify-between shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                {selectedTeamData && (
                  <img
                    src={selectedTeamData.logo}
                    alt={selectedTeamData.name}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium">
                  {selectedTeamData?.name || 'Select Team'}
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${teamDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {teamDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                style={{ zIndex: 999999 }}>
                {nflTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamChange(team.id)}
                    className="flex items-center gap-3 w-full px-6 py-4 text-left hover:bg-gray-700 text-gray-100 hover:text-white transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <img src={team.logo} alt={team.name} className="w-6 h-6" />
                    <span className="text-gray-100 hover:text-white font-medium">{team.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Week Selector */}
          <div className="relative" style={{ zIndex: 999999 }}>
            <button
              onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
              className="flex items-center gap-3 px-8 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-200 min-w-[180px] justify-between shadow-lg hover:shadow-xl"
            >
              <span className="font-medium">Week {selectedWeek}</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${weekDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {weekDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                style={{ zIndex: 999999 }}>
                {availableWeeks.map((week) => (
                  <button
                    key={week.value}
                    onClick={() => handleWeekChange(week.value)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-700 text-gray-100 hover:text-white transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span className="text-gray-100 hover:text-white font-medium">{week.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadTargetShareData}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-xl font-medium hover:from-blue-600 hover:to-green-500 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-lg hover:shadow-xl"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-xl p-10 shadow-2xl border border-gray-700">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="text-red-400 text-lg mb-4"><span role="img" aria-label="warning">⚠️</span> {error}</div>
              <button
                onClick={loadTargetShareData}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Chart */}
              <div className="lg:col-span-2">
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Target Share Distribution</h3>
                  <div className="h-96 relative">
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              <div className="lg:col-span-1">
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 h-full">
                  <h3 className="text-xl font-bold text-white mb-6">Target Breakdown</h3>
                  <div className="space-y-4">
                  {targetShareData?.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-600 rounded-xl hover:bg-gray-500 transition-all duration-200 border border-gray-500 hover:border-gray-400 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        {/* Player Photo */}
                        <div className="relative">
                          {player.photo && player.photo.includes('espncdn.com') ? (
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-8 h-8 rounded-full border border-gray-400 object-cover"
                              onError={(e) => {
                                // Fallback to team-colored avatar with initials
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-gray-400"
                            style={{
                              backgroundColor: getTeamColor(selectedTeam),
                              color: 'white',
                              display: player.photo && player.photo.includes('espncdn.com') ? 'none' : 'flex'
                            }}
                          >
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {/* Position Badge */}
                          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full font-medium text-xs leading-none">
                            {player.position}
                          </div>
                        </div>

                        {/* Color Indicator */}
                        <div
                          className="w-3 h-3 rounded-full border border-gray-400"
                          style={{
                            backgroundColor: chartData.datasets[0].backgroundColor[index]
                          }}
                        ></div>

                        {/* Player Info */}
                        <div>
                          <div className="text-white font-medium text-sm">{player.name}</div>
                          {player.number && (
                            <div className="text-gray-400 text-xs">#{player.number}</div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{player.targetShare}%</div>
                        <div className="text-gray-400 text-xs">{player.targets} targets</div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>

                {/* Legend
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-3 text-sm">Position Colors</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">Wide Receivers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Tight Ends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-300">Running Backs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-300">Others</span>
                    </div>
                  </div>
                </div> */}

                {/* Data Source Indicator */}
                {/* {dataSource !== 'loading' && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 text-xs">
                      {dataSource === 'api' && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-medium">Live NFL Data (2024 Season)</span>
                        </>
                      )}
                      {dataSource === 'cache' && (
                        <>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-400 font-medium">Live NFL Data (Cached)</span>
                        </>
                      )}
                      {dataSource === 'mock' && (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-400 font-medium">Mock Data (API Unavailable)</span>
                        </>
                      )}
                      {dataSource === 'fallback' && (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-orange-400 font-medium">Fallback Data</span>
                        </>
                      )}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center">
          <div className="bg-gray-800 rounded-lg p-6 inline-block">
            <p className="text-gray-300 text-sm">
              <span role="img" aria-label="refresh">🔄</span> Data updates every Tuesday morning during NFL season<br />
              <span role="img" aria-label="chart">📊</span> Showing target share percentages for wide receivers, tight ends, and running backs<br />
              <span role="img" aria-label="lightning">⚡</span> Built with React, Chart.js, and live NFL data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFLTargetShare;