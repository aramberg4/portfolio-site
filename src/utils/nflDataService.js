// NFL Data Service for fetching and processing target share data
import { nflTeams, getTeamById } from './nflTeams';


// Expanded NFL Team color schemes (4-6 authentic colors per team)
const teamColorSchemes = {
  'KC': ['#E31837', '#FFB81C', '#FFFFFF', '#000000'], // Chiefs Red, Gold, White, Black
  'BUF': ['#00338D', '#C60C30', '#FFFFFF', '#A5ACAF'], // Bills Blue, Red, White, Silver
  'LAR': ['#003594', '#FFA300', '#FFD100', '#FFFFFF', '#002244'], // Rams Blue, Gold, Yellow, White, Navy
  'TB': ['#D50A0A', '#FF7900', '#34302B', '#000000', '#A5ACAF'], // Bucs Red, Orange, Pewter, Black, Silver
  'DAL': ['#003594', '#041E42', '#869397', '#FFFFFF', '#000000'], // Cowboys Blue, Navy, Silver, White, Black
  'GB': ['#203731', '#FFB612', '#FFFFFF', '#000000'], // Packers Green, Gold, White, Black
  'SF': ['#AA0000', '#B3995D', '#FFFFFF', '#000000'], // 49ers Red, Gold, White, Black
  'MIA': ['#008E97', '#FC4C02', '#005778', '#FFFFFF'], // Dolphins Aqua, Orange, Navy, White
  'MIN': ['#4F2683', '#FFC62F', '#FFFFFF', '#000000'], // Vikings Purple, Gold, White, Black
  'CHI': ['#0B162A', '#C83803', '#FFFFFF', '#A5ACAF'], // Bears Navy, Orange, White, Silver
  'CIN': ['#FB4F14', '#000000', '#FFFFFF', '#A5ACAF'], // Bengals Orange, Black, White, Silver
  'NE': ['#002244', '#C60C30', '#B0B7BC', '#FFFFFF'], // Patriots Navy, Red, Silver, White
  'NYJ': ['#125740', '#000000', '#FFFFFF', '#A5ACAF'], // Jets Green, Black, White, Silver
  'LV': ['#000000', '#A5ACAF', '#FFFFFF', '#C4CED4'], // Raiders Black, Silver, White, Light Silver
  'LAC': ['#0080C6', '#FFC20E', '#FFFFFF', '#002A5E'], // Chargers Blue, Gold, White, Navy
  'DEN': ['#FB4F14', '#002244', '#FFFFFF', '#A5ACAF'], // Broncos Orange, Navy, White, Silver
  'PIT': ['#FFB612', '#101820', '#FFFFFF', '#A5ACAF'], // Steelers Gold, Black, White, Silver
  'CLE': ['#311D00', '#FF3C00', '#FFFFFF', '#A5ACAF'], // Browns Brown, Orange, White, Silver
  'BAL': ['#241773', '#000000', '#9E7C0C', '#FFFFFF'], // Ravens Purple, Black, Gold, White
  'TEN': ['#0C2340', '#4B92DB', '#C8102E', '#FFFFFF', '#A5ACAF'], // Titans Navy, Blue, Red, White, Silver
  'IND': ['#002C5F', '#A2AAAD', '#FFFFFF', '#000000'], // Colts Blue, Silver, White, Black
  'HOU': ['#03202F', '#A71930', '#FFFFFF', '#869397'], // Texans Navy, Red, White, Silver
  'JAX': ['#101820', '#D7A22A', '#9F792C', '#FFFFFF'], // Jaguars Black, Gold, Teal, White
  'WAS': ['#5A1414', '#FFB612', '#FFFFFF', '#000000'], // Commanders Burgundy, Gold, White, Black
  'NYG': ['#0B2265', '#A71930', '#A5ACAF', '#FFFFFF'], // Giants Blue, Red, Gray, White
  'PHI': ['#004C54', '#A5ACAF', '#ACC0C6', '#000000', '#FFFFFF'], // Eagles Green, Silver, Gray, Black, White
  'SEA': ['#002244', '#69BE28', '#A5ACAF', '#FFFFFF'], // Seahawks Navy, Green, Silver, White
  'ARI': ['#97233F', '#000000', '#FFB612', '#FFFFFF'], // Cardinals Red, Black, Yellow, White
  'ATL': ['#A71930', '#000000', '#A5ACAF', '#FFFFFF'], // Falcons Red, Black, Silver, White
  'CAR': ['#0085CA', '#101820', '#BFC0BF', '#FFFFFF'], // Panthers Blue, Black, Silver, White
  'NO': ['#101820', '#D3BC8D', '#FFFFFF', '#A5ACAF'], // Saints Black, Gold, White, Silver
  'DET': ['#0076B6', '#B0B7BC', '#FFFFFF', '#000000'] // Lions Blue, Silver, White, Black
};

// Get team-specific colors with minimal fallback shades
export const getPlayerColor = (_position, index, teamId) => {
  const teamColors = teamColorSchemes[teamId] || ['#4A5568', '#6B7280', '#9CA3AF']; // Default grays

  // Minimal fallback colors: only use when team colors are exhausted
  const fallbackColors = ['#F3F4F6', '#9CA3AF', '#6B7280', '#4B5563'];

  // Combine team colors with minimal fallbacks
  const allColors = [...teamColors, ...fallbackColors];

  return allColors[index] || '#6B7280'; // Default gray if index exceeds available colors
};

// Static data fetching from build-time generated files

// Main data fetching service
export class NFLDataService {
  static async getTargetShareData(teamId, week) {
    try {
      console.log(`Fetching NFL data for ${teamId} week ${week}...`);

      // In production, use static data file generated at build time
      if (import.meta.env.PROD || !import.meta.env.VITE_NFL_API_URL) {
        const response = await fetch('/nfl-data.json');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Static data indicates failure');
        }

        // Get team data from static file for specific week
        const weekData = result.weeks[week];
        if (!weekData) {
          throw new Error(`No data available for week ${week}`);
        }

        const teamData = weekData[teamId.toUpperCase()];
        if (!teamData) {
          throw new Error(`No data available for team ${teamId} in week ${week}`);
        }

        return {
          success: true,
          data: teamData,
          team: getTeamById(teamId),
          week: week,
          season: result.season,
          lastUpdated: result.lastUpdated,
          source: result.source || 'static',
          notice: `${result.notice} - Week ${week} individual data`,
          dataType: result.dataType,
          weekRange: `Week ${week}`,
          availableWeeks: result.availableWeeks || [1, 2, 3]
        };
      }

      // Development mode - try API first
      const apiUrl = import.meta.env.VITE_NFL_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/target-share/${teamId}/${week}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      return {
        success: true,
        data: result.data,
        team: getTeamById(teamId),
        week: week,
        season: result.season,
        lastUpdated: result.lastUpdated,
        source: result.source || 'api',
        notice: result.notice,
        dataType: result.dataType,
        weekRange: result.weekRange,
        availableWeeks: result.availableWeeks
      };
    } catch (error) {
      console.error('Error fetching target share data:', error);

      // No fallback - real data only

      return {
        success: false,
        error: error.message,
        data: [],
        source: 'error'
      };
    }
  }

  static async getAllTeamsTargetShare(week) {
    try {
      console.log(`Fetching all teams data for week ${week}...`);

      const apiUrl = import.meta.env.VITE_NFL_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/target-share/all/${week}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch all teams data');
      }

      return {
        success: true,
        data: result.data,
        week: week,
        season: result.season,
        lastUpdated: result.lastUpdated,
        source: 'api'
      };
    } catch (error) {
      console.error('Error fetching all teams data:', error);

      // Fallback to individual team requests
      console.log('Falling back to individual team requests...');
      try {
        const promises = nflTeams.map(team =>
          this.getTargetShareData(team.id, week)
        );

        const results = await Promise.all(promises);

        return {
          success: true,
          data: results.filter(result => result.success),
          week: week,
          lastUpdated: new Date().toISOString(),
          source: 'fallback'
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message,
          data: [],
          source: 'error'
        };
      }
    }
  }

  // Helper method to get current NFL week
  static async getCurrentWeek() {
    try {
      const apiUrl = import.meta.env.VITE_NFL_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/current-week`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.week) {
        return result.week;
      } else {
        throw new Error('Invalid API response for current week');
      }
    } catch (error) {
      console.error('Error fetching current week from API:', error);

      // Fallback to calculation
      const now = new Date();
      const seasonStart = new Date('2024-09-05'); // Approximate 2024 season start
      const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));

      // Clamp between 1 and 18
      return Math.max(1, Math.min(18, weeksSinceStart + 1));
    }
  }

  // Helper method to get available weeks with real data
  static async getAvailableWeeks() {
    try {
      // Get 2025 season data to see which weeks have real data
      const apiUrl = import.meta.env.VITE_NFL_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/current-week?season=2025`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.available_weeks) {
        // Convert to dropdown format
        return result.available_weeks.map(week => ({
          value: week,
          label: `Week ${week}`
        }));
      } else {
        throw new Error('Invalid API response for available weeks');
      }
    } catch (error) {
      console.error('Error fetching available weeks from API:', error);

      // Fallback to individual weeks 1-3 for 2025 season
      return [1, 2, 3].map(week => ({
        value: week,
        label: `Week ${week}`
      }));
    }
  }

  // Generate weeks array for dropdown
  static getWeeksArray() {
    return Array.from({ length: 18 }, (_, i) => ({
      value: i + 1,
      label: `Week ${i + 1}`
    }));
  }

  // Format data for Chart.js pie chart
  static formatForPieChart(targetShareData, team) {
    if (!targetShareData || targetShareData.length === 0) {
      return null;
    }

    const labels = targetShareData.map(player => {
      const position = player.position === 'OTHER' ? '' : ` (${player.position})`;
      return `${player.name}${position} - ${player.targets} targets`;
    });

    const data = targetShareData.map(player => parseFloat(player.targetShare));

    const backgroundColor = targetShareData.map((player, index) => {
      return getPlayerColor(player.position, index, team?.id);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Target Share %',
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8
        }
      ]
    };
  }
}

export default NFLDataService;