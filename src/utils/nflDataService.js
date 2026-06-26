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

export class NFLDataService {
  static async getTargetShareData(teamId, week) {
    try {
      const response = await fetch('/nfl-data.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Static data indicates failure');
      }

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
        notice: result.notice,
        dataType: result.dataType,
        weekRange: `Week ${week}`,
        availableWeeks: result.availableWeeks || [1, 2, 3]
      };
    } catch (error) {
      console.error('Error fetching target share data:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        source: 'error'
      };
    }
  }

  // Available weeks come straight from the static data file.
  static async getAvailableWeeks() {
    try {
      const response = await fetch('/nfl-data.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const weeks = (result.availableWeeks && result.availableWeeks.length > 0)
        ? result.availableWeeks
        : [1, 2, 3];

      return weeks.map(week => ({
        value: week,
        label: `Week ${week}`
      }));
    } catch (error) {
      console.error('Error fetching available weeks:', error);
      return [1, 2, 3].map(week => ({ value: week, label: `Week ${week}` }));
    }
  }

  // Format data for Chart.js pie chart
  static formatForPieChart(targetShareData, team) {
    if (!targetShareData || targetShareData.length === 0) {
      return null;
    }

    const labels = targetShareData.map(player => {
      if (player.position === 'OTHER') {
        return `Other players - ${player.targets} targets`;
      }
      return `${player.name} (${player.position}) - ${player.targets} targets`;
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