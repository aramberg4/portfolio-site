"""
Debug script to understand nfl-data-py structure and available data
"""

import nfl_data_py as nfl
import pandas as pd

def explore_available_data():
    """Explore what data is available in nfl-data-py"""
    print("=" * 50)
    print("Exploring NFL Data Structure")
    print("=" * 50)

    try:
        print("Testing basic weekly data import...")

        # Try to get weekly data for 2024 without specifying columns
        print("\n1. Fetching 2024 week 1 data (all columns)...")
        weekly_data = nfl.import_weekly_data(years=[2024])

        if not weekly_data.empty:
            print(f"✅ Found {len(weekly_data)} rows of data")
            print(f"Columns available: {list(weekly_data.columns)}")

            # Look at a sample of the data
            print(f"\nSample data (first 3 rows):")
            print(weekly_data.head(3))

            # Check for receiving-related data
            receiving_cols = [col for col in weekly_data.columns if 'target' in col.lower() or 'receiv' in col.lower()]
            print(f"\nReceiving-related columns: {receiving_cols}")

            # Filter for week 1
            week1 = weekly_data[weekly_data['week'] == 1]
            print(f"\nWeek 1 data: {len(week1)} rows")

            if not week1.empty:
                # Show players with targets
                players_with_targets = week1[week1['targets'] > 0] if 'targets' in week1.columns else pd.DataFrame()
                print(f"Players with targets in week 1: {len(players_with_targets)}")

                if not players_with_targets.empty:
                    print("\nTop 5 players by targets:")
                    top_players = players_with_targets.nlargest(5, 'targets')
                    for _, player in top_players.iterrows():
                        print(f"  {player.get('player_display_name', player.get('player_name', 'Unknown'))}: {player['targets']} targets")

        else:
            print("❌ No weekly data found")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def test_team_specific_data():
    """Test getting data for specific teams"""
    print("\n" + "=" * 50)
    print("Testing Team-Specific Data")
    print("=" * 50)

    try:
        # Get all 2024 data
        weekly_data = nfl.import_weekly_data(years=[2024])

        if not weekly_data.empty:
            # Check available teams
            teams = weekly_data['recent_team'].unique() if 'recent_team' in weekly_data.columns else weekly_data['team'].unique() if 'team' in weekly_data.columns else []
            print(f"Available teams: {sorted(teams)}")

            # Try KC specifically
            team_col = 'recent_team' if 'recent_team' in weekly_data.columns else 'team'
            kc_data = weekly_data[weekly_data[team_col] == 'KC']
            print(f"\nKC data rows: {len(kc_data)}")

            if not kc_data.empty:
                # Week 1 KC data
                kc_week1 = kc_data[kc_data['week'] == 1]
                print(f"KC Week 1 data: {len(kc_week1)} rows")

                if not kc_week1.empty and 'targets' in kc_week1.columns:
                    kc_targets = kc_week1[kc_week1['targets'] > 0]
                    print(f"KC players with targets: {len(kc_targets)}")

    except Exception as e:
        print(f"❌ Error: {e}")

def test_other_data_sources():
    """Test other data sources in nfl-data-py"""
    print("\n" + "=" * 50)
    print("Testing Other Data Sources")
    print("=" * 50)

    try:
        # Try pbp (play-by-play) data which might have target info
        print("Testing play-by-play data...")
        pbp_data = nfl.import_pbp_data(years=[2024], columns=['week', 'posteam', 'receiver_player_name', 'pass_attempt', 'complete_pass'])

        if not pbp_data.empty:
            print(f"✅ Found {len(pbp_data)} play-by-play rows")

            # Look for passing plays
            passing_plays = pbp_data[pbp_data['pass_attempt'] == 1]
            print(f"Passing plays: {len(passing_plays)}")

            # Week 1 passing plays
            week1_passing = passing_plays[passing_plays['week'] == 1]
            print(f"Week 1 passing plays: {len(week1_passing)}")

        else:
            print("❌ No play-by-play data found")

    except Exception as e:
        print(f"❌ PBP Error: {e}")

    try:
        # Try seasonal data
        print("\nTesting seasonal data...")
        seasonal_data = nfl.import_seasonal_data(years=[2024])

        if not seasonal_data.empty:
            print(f"✅ Found {len(seasonal_data)} seasonal rows")
            print(f"Seasonal columns: {list(seasonal_data.columns)}")

    except Exception as e:
        print(f"❌ Seasonal Error: {e}")

if __name__ == "__main__":
    explore_available_data()
    test_team_specific_data()
    test_other_data_sources()