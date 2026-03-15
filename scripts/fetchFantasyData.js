#!/usr/bin/env node

/**
 * Fetches ESPN Fantasy Football historical data for league 26867
 * and generates a JSON file for the dashboard.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LEAGUE_ID = 26867;
const SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const BASE_URL = 'lm-api-reads.fantasy.espn.com';

// Auth cookies for private/current season access
const ESPN_S2 = 'AEAPW5pAPYP0yde9pcFGuVk09X8%2Fpy28dPUKS8SxIgsuijhMfaVjMlcZSXW9G7zA664FcGOghRip3OAk0nspOJUdnnw84K6OgcMizsr8lZdLnDwZ1QJ6hmUxZqevQmdphiGTM0ufrs%2F5EZN5FfYEvCV5Plz0%2BWBQ2CPJnJ%2F6hmfiKdZTiO%2F5MqQrfSx9Gj1aCVgHY%2BY%2BsQ2CrqojB7kr093HzwF%2FKpdbZC7ZAHtI5AX0kY7oSgAG%2F7R6g0VBFUVf9rnZnUZDP5fAC3nAtf3DU7Zj';
const SWID = '{CBE2DF41-59CA-490E-A2DF-4159CA890EC1}';

// Owner names mapped by owner ID (from ESPN member data)
const OWNER_NAMES = {
  '{C8F3FD33-C71E-473C-B3FD-33C71EA73CA3}': 'Michael Rothstein',
  '{8ECCF67B-4709-4DD0-8916-0CEDAC593A06}': 'Alec Greaney',
  '{E2CFABD6-0694-4F7E-8FAB-D606946F7E88}': 'Michael Eaton',
  '{D1DA91E3-54C5-41A9-9A91-E354C5D1A9CF}': 'Joey Rothstein',
  '{D0E15690-96E0-48A6-A156-9096E088A6A1}': 'Joey Rothstein',
  '{240B7FE6-2ADD-4153-9346-3149A6C85A4C}': 'Evan Couture',
  '{45D5C255-DA8E-4206-95C2-55DA8E3206BF}': 'Former Owner (Team 6)',
  '{A57F65C8-4642-458F-A728-8C121D14997F}': 'Reese Bresson',
  '{4F42FB79-73CB-4FCB-8909-840EC96EC02F}': 'Brian Rothstein',
  '{66AAD5D9-A5F6-445E-AAD5-D9A5F6645E82}': 'Former Owner (Team 8)',
  '{260838A0-692D-4336-AA8D-280EDACDC720}': 'Owen Mckiernan',
  '{EC39A4D9-989E-4247-B9A4-D9989EE2479A}': 'Angus Gorman',
  '{B46DDEF8-89CC-4C4D-A80A-45741E30E879}': 'Angus Gorman',
  '{CBE2DF41-59CA-490E-A2DF-4159CA890EC1}': 'Austin Ramberg',
};

function fetchSeason(year) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${LEAGUE_ID}?view=mTeam&view=mStandings&view=mSettings&view=mMatchup`,
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
    req.setTimeout(15000, () => { req.destroy(); reject(new Error(`Timeout fetching season ${year}`)); });
    req.end();
  });
}

function extractSeasonData(raw, year) {
  const teams = raw.teams || [];
  const schedule = raw.schedule || [];
  const settings = raw.settings || {};

  const regularSeasonMatchupPeriods = settings.scheduleSettings?.matchupPeriodCount || 13;
  const numberOfPlayoffTeams = settings.scheduleSettings?.playoffTeamCount || 4;

  return teams.map(team => {
    const record = team.record?.overall || {};
    const primaryOwnerId = team.owners?.[0] || '';

    // Calculate points from regular season matchups
    let totalPointsFor = 0;
    let totalPointsAgainst = 0;
    let regularSeasonWins = 0;
    let regularSeasonLosses = 0;

    schedule.forEach(matchup => {
      if (matchup.matchupPeriodId <= regularSeasonMatchupPeriods) {
        if (matchup.home?.teamId === team.id) {
          totalPointsFor += matchup.home?.totalPoints || 0;
          totalPointsAgainst += matchup.away?.totalPoints || 0;
          if ((matchup.home?.totalPoints || 0) > (matchup.away?.totalPoints || 0)) regularSeasonWins++;
          else regularSeasonLosses++;
        } else if (matchup.away?.teamId === team.id) {
          totalPointsFor += matchup.away?.totalPoints || 0;
          totalPointsAgainst += matchup.home?.totalPoints || 0;
          if ((matchup.away?.totalPoints || 0) > (matchup.home?.totalPoints || 0)) regularSeasonWins++;
          else regularSeasonLosses++;
        }
      }
    });

    // Fallback to API record
    if (totalPointsFor === 0) {
      totalPointsFor = record.pointsFor || 0;
      totalPointsAgainst = record.pointsAgainst || 0;
      regularSeasonWins = record.wins || 0;
      regularSeasonLosses = record.losses || 0;
    }

    const playoffSeed = team.playoffSeed || 0;
    const madePlayoffs = playoffSeed > 0 && playoffSeed <= numberOfPlayoffTeams;
    const finalStanding = team.rankCalculatedFinal || 0;

    // Regular season rank = playoff seed (seeded by record/points)
    const regularSeasonRank = playoffSeed || 0;

    return {
      teamId: team.id,
      teamName: team.name || (team.location + ' ' + team.nickname),
      abbreviation: team.abbrev || '',
      ownerName: OWNER_NAMES[primaryOwnerId] || 'Unknown',
      wins: regularSeasonWins,
      losses: regularSeasonLosses,
      pointsFor: Math.round(totalPointsFor * 100) / 100,
      pointsAgainst: Math.round(totalPointsAgainst * 100) / 100,
      playoffSeed: playoffSeed,
      madePlayoffs: madePlayoffs,
      finalStanding: finalStanding,
      regularSeasonRank: regularSeasonRank,
    };
  });
}

async function main() {
  console.log('Fetching ESPN Fantasy Football data for league', LEAGUE_ID);

  const allData = {};
  const errors = [];

  for (const year of SEASONS) {
    try {
      console.log(`  Fetching ${year}...`);
      const raw = await fetchSeason(year);
      allData[year] = extractSeasonData(raw, year);
      console.log(`  Done: ${year} (${allData[year].length} teams)`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`  Failed ${year}: ${err.message}`);
      errors.push({ year, error: err.message });
    }
  }

  const output = {
    leagueId: LEAGUE_ID,
    leagueName: 'Exeter Day Studs',
    fetchedAt: new Date().toISOString(),
    availableSeasons: Object.keys(allData).map(Number).sort(),
    errors,
    seasonData: allData,
    // Manual data placeholder for 2016-2018
    manualSeasons: {},
  };

  const outputPath = path.join(__dirname, '..', 'public', 'fantasy-football-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nData written to ${outputPath}`);
  console.log(`Fetched ${Object.keys(allData).length} seasons`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
