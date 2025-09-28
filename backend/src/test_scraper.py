"""
Test script for NFL data scraper
Tests data accuracy and API functionality
"""

import json
import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from nfl_data_scraper import NFLDataScraper


def test_scraper_basic():
    """Test basic scraper functionality"""
    print("=" * 50)
    print("Testing NFL Data Scraper")
    print("=" * 50)

    scraper = NFLDataScraper()

    # Test current week detection
    current_week = scraper.get_current_week()
    print(f"✓ Current week detected: {current_week}")
    print(f"✓ Current season: {scraper.current_season}")

    return scraper, current_week


def test_team_data(scraper, week=None):
    """Test fetching data for specific teams"""
    if week is None:
        week = scraper.get_current_week()

    print(f"\n--- Testing Team Data (Week {week}) ---")

    # Test popular teams
    test_teams = ['KC', 'BUF', 'DAL', 'SF', 'PHI']

    for team in test_teams:
        print(f"\nTesting {team}...")
        result = scraper.get_team_target_data(team, week)

        if result['success']:
            players = result['data']
            print(f"  ✓ Found {len(players)} players with targets")

            if players:
                top_player = players[0]
                print(f"  Top target: {top_player['name']} ({top_player['position']}) - {top_player['targetShare']}%")
                print(f"  Targets: {top_player['targets']}, Receptions: {top_player['receptions']}")

                # Verify target share calculation
                total_percentage = sum(p['targetShare'] for p in players)
                print(f"  Total target share: {total_percentage:.1f}% (should be ~100%)")

                if abs(total_percentage - 100.0) > 5.0:
                    print(f"  ⚠️ Warning: Target shares don't add up to 100%")
                else:
                    print(f"  ✓ Target share calculation looks correct")
            else:
                print(f"  ⚠️ No players found with targets")
        else:
            print(f"  ❌ Error: {result.get('error', 'Unknown error')}")


def test_all_teams_data(scraper, week=None):
    """Test fetching data for all teams"""
    if week is None:
        week = scraper.get_current_week()

    print(f"\n--- Testing All Teams Data (Week {week}) ---")

    result = scraper.get_all_teams_data(week)

    if result['success']:
        teams_data = result['data']
        print(f"✓ Found data for {len(teams_data)} teams")

        # Check a few teams
        teams_with_data = 0
        total_players = 0

        for team_info in teams_data[:5]:  # Check first 5 teams
            team = team_info['team']
            players = team_info['data']
            if players:
                teams_with_data += 1
                total_players += len(players)
                print(f"  {team}: {len(players)} players")

        print(f"✓ {teams_with_data} teams have player data")
        print(f"✓ Total players across checked teams: {total_players}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")


def test_data_accuracy(scraper, week=None):
    """Test data accuracy and consistency"""
    if week is None:
        week = scraper.get_current_week()

    print(f"\n--- Testing Data Accuracy (Week {week}) ---")

    # Test KC (Chiefs) as they're likely to have good data
    result = scraper.get_team_target_data('KC', week)

    if result['success'] and result['data']:
        players = result['data']
        print(f"✓ KC has {len(players)} players with targets")

        # Check for realistic target shares
        for player in players[:3]:  # Check top 3
            name = player['name']
            targets = player['targets']
            target_share = player['targetShare']
            position = player['position']

            print(f"  {name} ({position}): {targets} targets ({target_share}%)")

            # Basic sanity checks
            if targets < 0:
                print(f"    ❌ Negative targets!")
            elif targets > 20:
                print(f"    ⚠️ Very high targets for one week")
            else:
                print(f"    ✓ Target count seems reasonable")

            if target_share < 0 or target_share > 100:
                print(f"    ❌ Invalid target share percentage!")
            elif target_share > 50:
                print(f"    ⚠️ Very high target share for one player")
            else:
                print(f"    ✓ Target share seems reasonable")

        # Check if player photos exist
        players_with_photos = sum(1 for p in players if 'photo' in p and p['photo'])
        print(f"✓ {players_with_photos}/{len(players)} players have photo URLs")

    else:
        print(f"❌ Could not get KC data for testing: {result.get('error', 'No data')}")


def test_caching(scraper, week=None):
    """Test caching functionality"""
    if week is None:
        week = scraper.get_current_week()

    print(f"\n--- Testing Caching (Week {week}) ---")

    # First request (should fetch fresh data)
    start_time = datetime.now()
    result1 = scraper.get_team_target_data('KC', week)
    first_duration = (datetime.now() - start_time).total_seconds()

    if result1['success']:
        print(f"✓ First request completed in {first_duration:.2f}s (source: {result1.get('source', 'unknown')})")

        # Second request (should use cache)
        start_time = datetime.now()
        result2 = scraper.get_team_target_data('KC', week)
        second_duration = (datetime.now() - start_time).total_seconds()

        if result2['success']:
            print(f"✓ Second request completed in {second_duration:.2f}s (source: {result2.get('source', 'unknown')})")

            if result2.get('source') == 'cache':
                print(f"✓ Caching is working correctly")
                if second_duration < first_duration:
                    print(f"✓ Cache is faster ({second_duration:.2f}s vs {first_duration:.2f}s)")
            else:
                print(f"⚠️ Second request didn't use cache")

            # Verify data consistency
            if result1['data'] == result2['data']:
                print(f"✓ Cached data matches fresh data")
            else:
                print(f"❌ Cached data differs from fresh data")
        else:
            print(f"❌ Second request failed: {result2.get('error')}")
    else:
        print(f"❌ First request failed: {result1.get('error')}")


def main():
    """Run all tests"""
    try:
        # Basic functionality test
        scraper, current_week = test_scraper_basic()

        # Test with a recent week that should have data
        test_week = min(current_week, 18)  # Don't go beyond week 18

        # Run individual tests
        test_team_data(scraper, test_week)
        test_all_teams_data(scraper, test_week)
        test_data_accuracy(scraper, test_week)
        test_caching(scraper, test_week)

        print("\n" + "=" * 50)
        print("All tests completed!")
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()