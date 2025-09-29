#!/usr/bin/env node

/**
 * Build-time data preparation script
 * Tries to run Python data export, falls back to using existing data
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏈 Preparing NFL data for build...');

const dataPath = path.join(__dirname, '..', 'public', 'nfl-data.json');
const pythonScript = path.join(__dirname, 'exportNFLData.py');

// Check if we have existing data
const hasExistingData = fs.existsSync(dataPath);

try {
  // Try to run Python script to generate fresh data
  console.log('📡 Attempting to generate fresh NFL data...');

  // Check if Python script exists
  if (!fs.existsSync(pythonScript)) {
    throw new Error('Python script not found');
  }

  // Try to run the Python script
  execSync('cd backend && source venv/bin/activate && cd .. && python3 scripts/exportNFLData.py', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Successfully generated fresh NFL data');

} catch (error) {
  console.log('⚠️ Could not generate fresh data:', error.message);

  if (hasExistingData) {
    console.log('📁 Using existing NFL data file');

    // Update the timestamp in existing data to indicate when build occurred
    try {
      const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      existingData.buildTimestamp = new Date().toISOString();
      existingData.notice = existingData.notice + ' (using cached data from build)';
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
      console.log('📝 Updated existing data with build timestamp');
    } catch (updateError) {
      console.log('⚠️ Could not update existing data timestamp:', updateError.message);
    }
  } else {
    console.log('❌ No existing data found and could not generate fresh data');
    console.log('🔄 The app will need to rely on API fallback in production');

    // Create a minimal fallback data structure
    const fallbackData = {
      success: false,
      source: 'build_fallback',
      dataType: 'fallback',
      season: 2025,
      lastUpdated: new Date().toISOString(),
      buildTimestamp: new Date().toISOString(),
      notice: 'Build-time data generation failed - app will use API fallback',
      weeks: {},
      totalPlayers: 0,
      availableTeams: [],
      availableWeeks: [1, 2, 3],
      error: 'Build environment does not support data generation'
    };

    fs.writeFileSync(dataPath, JSON.stringify(fallbackData, null, 2));
    console.log('📄 Created fallback data structure');
  }
}

console.log('🎯 NFL data preparation complete');