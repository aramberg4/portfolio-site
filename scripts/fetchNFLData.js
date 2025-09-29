#!/usr/bin/env node

/**
 * Build-time NFL Data Fetcher
 * Scrapes FantasyPros for real 2025 NFL target share data during React build
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FantasyProsScraper {
  constructor() {
    this.baseUrl = 'https://www.fantasypros.com';
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      }, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(15000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  parseTargetData(html, position) {
    // Simple regex-based parsing for build-time scraping
    const tableRegex = /<table[^>]*>(.*?)<\/table>/s;
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;

    const tableMatch = html.match(tableRegex);
    if (!tableMatch) {
      console.log(`No table found for ${position}`);
      return [];
    }

    const players = [];
    const teamMapping = {
      'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
      'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
      'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
      'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
      'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
      'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC',
      'Los Angeles Rams': 'LAR', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
      'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
      'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
      'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
      'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS'
    };

    let rowMatches = [...tableMatch[1].matchAll(rowRegex)];
    rowMatches = rowMatches.slice(1); // Skip header

    for (const rowMatch of rowMatches) {
      const cellMatches = [...rowMatch[1].matchAll(cellRegex)];

      if (cellMatches.length >= 8) {
        try {
          const teamName = this.cleanText(cellMatches[0][1]);
          const teamAbbr = teamMapping[teamName] || teamName;

          // Extract player data based on position
          let playerData = [];
          if (position === 'wr' || position === 'rb') {
            playerData = [
              {
                name: this.cleanText(cellMatches[1][1]),
                targets: parseInt(this.cleanText(cellMatches[2][1])) || 0
              },
              {
                name: this.cleanText(cellMatches[3][1]),
                targets: parseInt(this.cleanText(cellMatches[4][1])) || 0
              },
              {
                name: this.cleanText(cellMatches[5][1]),
                targets: parseInt(this.cleanText(cellMatches[6][1])) || 0
              }
            ];
          } else if (position === 'te' && cellMatches.length >= 6) {
            playerData = [
              {
                name: this.cleanText(cellMatches[1][1]),
                targets: parseInt(this.cleanText(cellMatches[2][1])) || 0
              },
              {
                name: this.cleanText(cellMatches[3][1]),
                targets: parseInt(this.cleanText(cellMatches[4][1])) || 0
              }
            ];
          }

          // Add each player to the list
          for (const player of playerData) {
            if (player.name && player.targets > 0) {
              players.push({
                name: player.name,
                team: teamAbbr,
                position: position.toUpperCase(),
                targets: player.targets,
                season: 2025,
                weeks: '1-3'
              });
            }
          }
        } catch (error) {
          console.log(`Error parsing row: ${error.message}`);
        }
      }
    }

    return players;
  }

  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .trim();
  }

  async scrapePositionData(position) {
    const url = `${this.baseUrl}/nfl/reports/targets-distribution/${position}.php?year=2025&start=1&end=3&show=totals`;

    console.log(`Scraping ${position.toUpperCase()} data from FantasyPros...`);

    try {
      const html = await this.fetchPage(url);
      const players = this.parseTargetData(html, position);
      console.log(`Found ${players.length} ${position.toUpperCase()} players`);
      return players;
    } catch (error) {
      console.error(`Error scraping ${position} data:`, error.message);
      return [];
    }
  }

  async scrapeAllPositions() {
    const allPlayers = [];

    // Scrape WR, RB, and TE data
    for (const position of ['wr', 'rb', 'te']) {
      const players = await this.scrapePositionData(position);
      allPlayers.push(...players);

      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return allPlayers;
  }

  organizeDataByTeam(players) {
    const teamData = {};

    // Group players by team
    for (const player of players) {
      if (!teamData[player.team]) {
        teamData[player.team] = [];
      }
      teamData[player.team].push(player);
    }

    // Sort each team's players by targets and calculate target shares
    for (const team in teamData) {
      const teamPlayers = teamData[team];
      const totalTargets = teamPlayers.reduce((sum, player) => sum + player.targets, 0);

      // Sort by targets descending
      teamPlayers.sort((a, b) => b.targets - a.targets);

      // Take top 5 and add target share calculations
      const top5 = teamPlayers.slice(0, 5);
      const top5Targets = top5.reduce((sum, player) => sum + player.targets, 0);
      const otherTargets = totalTargets - top5Targets;

      const processedPlayers = top5.map(player => ({
        name: player.name,
        position: player.position,
        targets: player.targets,
        receptions: 0, // Not available from FantasyPros target distribution
        receiving_yards: 0, // Not available from FantasyPros target distribution
        targetShare: totalTargets > 0 ? parseFloat(((player.targets / totalTargets) * 100).toFixed(1)) : 0,
        player_id: `fp_${player.name.toLowerCase().replace(/\s+/g, '_')}`,
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"
      }));

      // Add "Other" slice if there are remaining targets
      if (otherTargets > 0) {
        processedPlayers.push({
          name: 'Other',
          position: 'OTHER',
          targets: otherTargets,
          receptions: 0,
          receiving_yards: 0,
          targetShare: totalTargets > 0 ? parseFloat(((otherTargets / totalTargets) * 100).toFixed(1)) : 0,
          player_id: 'other',
          photo: "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"
        });
      }

      teamData[team] = processedPlayers;
    }

    return teamData;
  }
}

// For now, create realistic sample data until we can implement proper scraping
function createSampleData() {
  const teams = ['KC', 'BUF', 'LAR', 'TB', 'DAL', 'GB', 'SF', 'MIA', 'MIN', 'CHI'];

  const samplePlayers = {
    KC: [
      { name: 'Travis Kelce', position: 'TE', targets: 45, targetShare: 18.5 },
      { name: 'Tyreek Hill', position: 'WR', targets: 42, targetShare: 17.3 },
      { name: 'JuJu Smith-Schuster', position: 'WR', targets: 38, targetShare: 15.6 },
      { name: 'Clyde Edwards-Helaire', position: 'RB', targets: 25, targetShare: 10.3 },
      { name: 'Mecole Hardman', position: 'WR', targets: 22, targetShare: 9.1 },
      { name: 'Other', position: 'OTHER', targets: 71, targetShare: 29.2 }
    ],
    BUF: [
      { name: 'Stefon Diggs', position: 'WR', targets: 48, targetShare: 19.8 },
      { name: 'Dawson Knox', position: 'TE', targets: 35, targetShare: 14.5 },
      { name: 'Cole Beasley', position: 'WR', targets: 32, targetShare: 13.2 },
      { name: 'Gabe Davis', position: 'WR', targets: 28, targetShare: 11.6 },
      { name: 'Isaiah McKenzie', position: 'WR', targets: 24, targetShare: 9.9 },
      { name: 'Other', position: 'OTHER', targets: 75, targetShare: 31.0 }
    ]
  };

  const teamData = {};

  teams.forEach(team => {
    const players = samplePlayers[team] || samplePlayers.KC.map(p => ({
      ...p,
      name: p.name.replace('Travis Kelce', 'Team Player 1')
                  .replace('Tyreek Hill', 'Team Player 2')
                  .replace('JuJu Smith-Schuster', 'Team Player 3')
                  .replace('Clyde Edwards-Helaire', 'Team Player 4')
                  .replace('Mecole Hardman', 'Team Player 5')
    }));

    teamData[team] = players.map(player => ({
      name: player.name,
      position: player.position,
      targets: player.targets,
      receptions: Math.floor(player.targets * 0.7),
      receiving_yards: Math.floor(player.targets * 12),
      targetShare: player.targetShare,
      player_id: `sample_${player.name.toLowerCase().replace(/\s+/g, '_')}`,
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"
    }));
  });

  return teamData;
}

async function main() {
  console.log('🏈 Creating NFL target share data for build...');

  try {
    // For now, use sample data - can be extended with real scraping later
    console.log('📊 Generating sample 2025 NFL target share data...');

    const teamData = createSampleData();

    // Create output data structure
    const outputData = {
      success: true,
      source: 'sample_build_time',
      dataType: 'sample',
      season: 2025,
      weeks: '1-3',
      lastUpdated: new Date().toISOString(),
      notice: 'Sample 2025 NFL target data for development',
      teams: teamData,
      totalPlayers: Object.values(teamData).reduce((sum, team) => sum + team.length, 0),
      availableTeams: Object.keys(teamData).sort()
    };

    // Ensure public directory exists
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write data to public directory for static serving
    const dataPath = path.join(publicDir, 'nfl-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(outputData, null, 2));

    console.log(`✅ Successfully created sample data for ${Object.keys(teamData).length} teams`);
    console.log(`📁 Data saved to: ${dataPath}`);
    console.log(`🎯 Available teams: ${Object.keys(teamData).length}`);

  } catch (error) {
    console.error('❌ Error during data creation:', error.message);

    // Create fallback data structure
    const fallbackData = {
      success: false,
      source: 'build_time_fallback',
      dataType: 'error',
      error: error.message,
      lastUpdated: new Date().toISOString(),
      notice: 'Error creating data during build',
      teams: {},
      totalPlayers: 0,
      availableTeams: []
    };

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const dataPath = path.join(publicDir, 'nfl-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(fallbackData, null, 2));

    console.log('📁 Fallback data written for graceful degradation');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FantasyProsScraper };