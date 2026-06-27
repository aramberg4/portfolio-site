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
const SEASONS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
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
    // Seasons before 2018 are only served via the leagueHistory endpoint
    // (the per-season endpoint returns 404 for them).
    const useHistory = year < 2018;
    const reqPath = useHistory
      ? `/apis/v3/games/ffl/leagueHistory/${LEAGUE_ID}?seasonId=${year}&view=mRoster&view=mTeam&view=mStandings`
      : `/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${LEAGUE_ID}?view=mRoster&view=mTeam&view=mStandings`;
    const options = {
      hostname: BASE_URL,
      path: reqPath,
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
          try {
            const parsed = JSON.parse(data);
            // leagueHistory returns an array of season objects; unwrap to the first.
            resolve(Array.isArray(parsed) ? parsed[0] : parsed);
          }
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

// Build an era-adjustment factor from the existing team data: rebase each season's
// scoring to the league's all-time per-game baseline (same baseline the UI uses for
// team PF/PA), so player points from low-scoring early years compare fairly with the
// modern high-scoring era.
function buildEraFactor(data) {
  const seasonData = data.seasonData || {};
  const manualSeasons = data.manualSeasons || {};
  const years = new Set([...Object.keys(seasonData), ...Object.keys(manualSeasons)]);
  const seasonPg = {};
  let totalPts = 0, totalGames = 0;
  for (const y of years) {
    const teams = seasonData[y] || manualSeasons[y] || [];
    let pts = 0, games = 0;
    for (const t of teams) {
      const g = (t.wins || 0) + (t.losses || 0);
      if (g > 0) { pts += t.pointsFor; games += g; }
    }
    seasonPg[y] = games > 0 ? pts / games : null;
    totalPts += pts;
    totalGames += games;
  }
  const baselinePg = totalGames > 0 ? totalPts / totalGames : 1;
  return (year) => {
    const pg = seasonPg[String(year)];
    return pg ? baselinePg / pg : 1;
  };
}

function computeSignaturePlayers(allPlayerSeasons, existingData) {
  // Positional baseline: average points of rostered players who scored, per season &
  // position. Used to value a player relative to their own position so QBs (who simply
  // score more) don't crowd out elite RB/WR/TE. Inherently era-relative since the
  // baseline rises with the scoring environment.
  const posPool = {};
  for (const e of allPlayerSeasons) {
    if (!(e.seasonPoints > 0)) continue;
    const key = `${e.year}_${e.position}`;
    const a = posPool[key] || (posPool[key] = { sum: 0, n: 0 });
    a.sum += e.seasonPoints;
    a.n += 1;
  }
  const posBaseline = (year, position) => {
    const a = posPool[`${year}_${position}`];
    return a && a.n ? a.sum / a.n : 0;
  };

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

  const eraFactor = buildEraFactor(existingData);

  // Eligibility: >=2 seasons with the team (staying power). ALL positions are eligible,
  // including K and D/ST, so a long-tenured kicker/defense can earn a slot on tenure.
  const W_VALUE = 0.6;   // weight on value-over-position (peak quality)
  const W_TENURE = 0.4;  // weight on tenure (longevity / franchise loyalty)

  // Pass 1: compute value-over-position, era-adjusted points, and tenure for every
  // eligible player-team stint, league-wide.
  // Exclude non-individual roster entries: ESPN's "head coach" slot (e.g. "Chiefs Coach")
  // and team defenses (D/ST). Kickers stay eligible (so a long-tenured kicker can qualify).
  const isExcluded = (p) => /\bcoach\b/i.test(p.playerName) || p.position === 'D/ST';
  const eligible = [];
  for (const players of Object.values(byTeam)) {
    for (const p of players) {
      if (p.seasons.length < 2 || isExcluded(p)) continue;
      p.adjTotalPoints = p.seasons.reduce((s, x) => s + x.points * eraFactor(x.year), 0);
      p.posValue = p.seasons.reduce((s, x) => s + (x.points - posBaseline(x.year, p.position)), 0);
      p.tenure = p.seasons.length;
      eligible.push(p);
    }
  }

  // Standardize value and tenure league-wide so they combine on a comparable scale,
  // then blend. A "signature" player has strong positional value AND/OR long tenure.
  const zStats = (vals) => {
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length) || 1;
    return { mean, sd };
  };
  const valZ = zStats(eligible.map(p => p.posValue));
  const tenZ = zStats(eligible.map(p => p.tenure));
  eligible.forEach(p => {
    p.blendScore = W_VALUE * ((p.posValue - valZ.mean) / valZ.sd) + W_TENURE * ((p.tenure - tenZ.mean) / tenZ.sd);
  });

  const signaturePlayers = {};
  for (const [teamId, players] of Object.entries(byTeam)) {
    const teamEligible = players.filter(p => p.seasons.length >= 2 && !isExcluded(p));
    teamEligible.sort((a, b) => b.blendScore - a.blendScore);

    signaturePlayers[teamId] = teamEligible.slice(0, 4).map(p => {
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
        adjTotalPoints: Math.round(p.adjTotalPoints * 100) / 100,
        adjAvgPointsPerSeason: Math.round((p.adjTotalPoints / numSeasons) * 100) / 100,
        posValue: Math.round(p.posValue * 100) / 100,
        avgPosValue: Math.round((p.posValue / numSeasons) * 100) / 100,
        blendScore: Math.round(p.blendScore * 1000) / 1000,
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

  // Safety guard: never write an empty result (e.g. expired cookies / all fetches failed),
  // which would wipe the existing signaturePlayers from the data file.
  if (allPlayerSeasons.length === 0) {
    console.error('No player data fetched — aborting write to preserve existing signaturePlayers.');
    process.exit(1);
  }

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
      console.log(`    ${i + 1}. ${p.playerName} (${p.position}) — blend ${p.blendScore} | value ${p.posValue.toLocaleString()} | ${p.seasonsPlayed} szn`);
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
