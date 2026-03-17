#!/usr/bin/env node

/**
 * Fetches ESPN Fantasy Football roster/player data for league 26867
 * and computes "Signature Players" (top 3 per team by career points while rostered).
 *
 * Merges results into public/fantasy-football-data.json under the "signaturePlayers" key.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LEAGUE_ID = 26867;
const SEASONS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const BASE_URL = 'lm-api-reads.fantasy.espn.com';

// Same auth cookies as fetchFantasyData.js
const ESPN_S2 = 'AEAPW5pAPYP0yde9pcFGuVk09X8%2Fpy28dPUKS8SxIgsuijhMfaVjMlcZSXW9G7zA664FcGOghRip3OAk0nspOJUdnnw84K6OgcMizsr8lZdLnDwZ1QJ6hmUxZqevQmdphiGTM0ufrs%2F5EZN5FfYEvCV5Plz0%2BWBQ2CPJnJ%2F6hmfiKdZTiO%2F5MqQrfSx9Gj1aCVgHY%2BY%2BsQ2CrqojB7kr093HzwF%2FKpdbZC7ZAHtI5AX0kY7oSgAG%2F7R6g0VBFUVf9rnZnUZDP5fAC3nAtf3DU7Zj';
const SWID = '{CBE2DF41-59CA-490E-A2DF-4159CA890EC1}';

// ESPN default position ID mapping
const POSITION_MAP = {
  1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K',
  7: 'DT', 9: 'DT', 10: 'DE', 11: 'LB', 12: 'CB',
  13: 'S', 14: 'IDP',
  16: 'D/ST',
};

function fetchSeasonRoster(year) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${LEAGUE_ID}?view=mRoster&view=mTeam&view=mStandings`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': `espn_s2=${ESPN_S2}; SWID=${SWID}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error(`Failed to parse JSON for ${year}: ${e.message}`)); }
        } else {
          reject(new Error(`HTTP ${res.statusCode} for season ${year}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout fetching roster for ${year}`)); });
    req.end();
  });
}

function extractPlayerData(raw, year) {
  const teams = raw.teams || [];
  const settings = raw.settings || {};
  const numberOfPlayoffTeams = settings.scheduleSettings?.playoffTeamCount || 4;

  const result = [];

  for (const team of teams) {
    const teamId = team.id;
    const playoffSeed = team.playoffSeed || 0;
    const madePlayoffs = playoffSeed > 0 && playoffSeed <= numberOfPlayoffTeams;
    const finalStanding = team.rankCalculatedFinal || 0;

    const rosterEntries = team.roster?.entries || [];

    for (const entry of rosterEntries) {
      const player = entry.playerPoolEntry?.player;
      if (!player) continue;

      const playerId = player.id;
      const playerName = player.fullName || player.firstName + ' ' + player.lastName || 'Unknown';
      const position = POSITION_MAP[player.defaultPositionId] || 'FLEX';

      // Find the season stats — look for statSourceId=0 (actual) and statSplitTypeId=0 (season total)
      let seasonPoints = 0;
      if (player.stats && player.stats.length > 0) {
        for (const stat of player.stats) {
          // statSourceId: 0 = actual, 1 = projected
          // statSplitTypeId: 0 = season total
          if (stat.statSourceId === 0 && stat.statSplitTypeId === 0) {
            seasonPoints = stat.appliedTotal || 0;
            break;
          }
        }
        // Fallback: use any actual stats entry
        if (seasonPoints === 0) {
          for (const stat of player.stats) {
            if (stat.statSourceId === 0 && (stat.appliedTotal || 0) > 0) {
              seasonPoints = stat.appliedTotal;
              break;
            }
          }
        }
      }

      result.push({
        teamId,
        playerId,
        playerName,
        position,
        year,
        seasonPoints: Math.round(seasonPoints * 100) / 100,
        madePlayoffs,
        wonChampionship: finalStanding === 1,
      });
    }
  }

  return result;
}

function computeSignaturePlayers(allPlayerSeasons, existingData) {
  // Group by teamId → playerId
  const teamPlayers = {};

  for (const entry of allPlayerSeasons) {
    const key = `${entry.teamId}_${entry.playerId}`;
    if (!teamPlayers[key]) {
      teamPlayers[key] = {
        teamId: entry.teamId,
        playerId: entry.playerId,
        playerName: entry.playerName,
        position: entry.position,
        seasons: [],
        totalPoints: 0,
        playoffAppearances: 0,
        championships: 0,
      };
    }

    const p = teamPlayers[key];
    p.seasons.push({ year: entry.year, points: entry.seasonPoints });
    p.totalPoints += entry.seasonPoints;
    if (entry.madePlayoffs) p.playoffAppearances++;
    if (entry.wonChampionship) p.championships++;
  }

  // Group by teamId, sort by totalPoints, take top 3
  const byTeam = {};
  for (const p of Object.values(teamPlayers)) {
    if (!byTeam[p.teamId]) byTeam[p.teamId] = [];
    byTeam[p.teamId].push(p);
  }

  const signaturePlayers = {};
  for (const [teamId, players] of Object.entries(byTeam)) {
    // Filter out D/ST and K — focus on skill position players
    const skillPlayers = players.filter(p => !['D/ST', 'K'].includes(p.position));

    // Sort by total points descending
    skillPlayers.sort((a, b) => b.totalPoints - a.totalPoints);

    signaturePlayers[teamId] = skillPlayers.slice(0, 4).map(p => {
      const numSeasons = p.seasons.length;
      const seasonPoints = {};
      p.seasons.forEach(s => { seasonPoints[s.year] = s.points; });

      return {
        playerId: p.playerId,
        playerName: p.playerName,
        position: p.position,
        seasonsPlayed: numSeasons,
        seasonYears: p.seasons.map(s => s.year).sort(),
        totalPoints: Math.round(p.totalPoints * 100) / 100,
        avgPointsPerSeason: Math.round((p.totalPoints / numSeasons) * 100) / 100,
        seasonPoints,
        playoffAppearances: p.playoffAppearances,
        championships: p.championships,
      };
    });
  }

  return signaturePlayers;
}

async function main() {
  console.log('Fetching ESPN roster data for Signature Players...');

  const allPlayerSeasons = [];
  const errors = [];

  for (const year of SEASONS) {
    try {
      console.log(`  Fetching ${year} rosters...`);
      const raw = await fetchSeasonRoster(year);
      const players = extractPlayerData(raw, year);
      allPlayerSeasons.push(...players);
      console.log(`  Done: ${year} (${players.length} player-team entries)`);
      // Rate-limit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`  Failed ${year}: ${err.message}`);
      errors.push({ year, error: err.message });
    }
  }

  console.log(`\nTotal player-season entries: ${allPlayerSeasons.length}`);

  // Load existing data file
  const dataPath = path.join(__dirname, '..', 'public', 'fantasy-football-data.json');
  let existingData = {};
  try {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.error('Could not read existing data file:', e.message);
    process.exit(1);
  }

  // Compute signature players
  const signaturePlayers = computeSignaturePlayers(allPlayerSeasons, existingData);

  // Log results
  for (const [teamId, players] of Object.entries(signaturePlayers)) {
    console.log(`\n  Team ${teamId}:`);
    players.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.playerName} (${p.position}) — ${p.totalPoints.toLocaleString()} pts over ${p.seasonsPlayed} seasons (avg ${p.avgPointsPerSeason}/season)`);
    });
  }

  // Merge into existing data
  existingData.signaturePlayers = signaturePlayers;
  if (errors.length > 0) {
    existingData.signaturePlayerErrors = errors;
  }

  fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
  console.log(`\nSignature players merged into ${dataPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
