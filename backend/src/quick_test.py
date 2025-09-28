"""
Quick test to verify scraper works with known good data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from nfl_data_scraper import NFLDataScraper

def test_2024_data():
    """Test with 2024 season data (should be available)"""
    print("Testing with 2024 season data...")

    scraper = NFLDataScraper()

    # Test with week 1 of 2024 season (should have data)
    result = scraper.get_team_target_data('KC', 1, 2024)

    if result['success']:
        print(f"✅ 2024 data works! Found {len(result['data'])} players for KC week 1")
        for player in result['data'][:3]:
            print(f"  {player['name']} ({player['position']}): {player['targets']} targets ({player['targetShare']}%)")
        return True
    else:
        print(f"❌ 2024 data failed: {result.get('error')}")
        return False

def test_2025_data():
    """Test with 2025 season data"""
    print("\nTesting with 2025 season data...")

    scraper = NFLDataScraper()

    # Test current week and season
    current_week = scraper.get_current_week()
    current_season = scraper.current_season

    print(f"Current season: {current_season}, week: {current_week}")

    # Test with week 1 of 2025 season
    result = scraper.get_team_target_data('KC', 1, 2025)

    if result['success']:
        print(f"✅ 2025 data works! Found {len(result['data'])} players for KC week 1")
        return True
    else:
        print(f"⚠️ 2025 data not available yet: {result.get('error')}")

        # Try week 3 or 4 in case week 1 isn't available yet
        for week in [3, 4]:
            result = scraper.get_team_target_data('KC', week, 2025)
            if result['success']:
                print(f"✅ 2025 week {week} data works! Found {len(result['data'])} players")
                return True

        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Quick NFL Data Test")
    print("=" * 50)

    # Test 2024 first (should work)
    works_2024 = test_2024_data()

    # Test 2025 (may or may not work depending on data availability)
    works_2025 = test_2025_data()

    print("\n" + "=" * 50)
    if works_2024:
        print("✅ Scraper is working correctly with 2024 data")
        if works_2025:
            print("✅ 2025 data is also available")
        else:
            print("⚠️ 2025 data not available yet - will use 2024 for now")
    else:
        print("❌ Scraper has issues - need to debug")
    print("=" * 50)