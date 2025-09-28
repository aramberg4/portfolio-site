"""
Flask API Server for NFL Target Share Data
Provides RESTful endpoints for the React frontend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import schedule
import time
import threading
from datetime import datetime

from nfl_data_scraper import NFLDataScraper
from espn_data_scraper import ESPNDataScraper

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))

# Initialize scrapers - ESPN for 2025 data, nfl-data-py for historical
espn_scraper = ESPNDataScraper(data_dir=os.getenv('DATA_DIRECTORY', './data'))
nfl_scraper = NFLDataScraper(data_dir=os.getenv('DATA_DIRECTORY', './data'))


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })


@app.route('/api/current-week', methods=['GET'])
def get_current_week():
    """Get current NFL week"""
    try:
        # Check if 2025 data is requested specifically
        season = request.args.get('season', 2024, type=int)

        if season >= 2025:
            # ESPN confirms we're in 2025 season, week 4, with real data for weeks 1-3
            current_week = espn_scraper.get_current_week()
            return jsonify({
                'success': True,
                'week': current_week,
                'season': espn_scraper.current_season,
                'notice': 'Real 2025 target share data available for weeks 1-3. Week 4+ data will be available after games are completed.',
                'available_weeks': [1, 2, 3]
            })
        else:
            # Use 2024 data by default since that's what's actually available
            current_week = nfl_scraper.get_current_week()
            return jsonify({
                'success': True,
                'week': current_week,
                'season': nfl_scraper.current_season,
                'notice': 'Using 2024 season data - real 2025 statistics not yet available.'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/target-share/<team>/<int:week>', methods=['GET'])
def get_team_target_share(team, week):
    """Get target share data for a specific team and week"""
    try:
        # Validate team - check both scrapers for team mapping
        if team.upper() not in espn_scraper.team_mapping and team.upper() not in nfl_scraper.team_mapping:
            return jsonify({
                'success': False,
                'error': f'Invalid team: {team}'
            }), 400

        # Validate week
        if not 1 <= week <= 18:
            return jsonify({
                'success': False,
                'error': 'Week must be between 1 and 18'
            }), 400

        # Get season from query params (default to 2025 now that we have real data)
        season = request.args.get('season', 2025, type=int)

        # Use ESPN scraper for 2025 season data (will return error for now), nfl-data-py for historical
        if season >= 2025:
            print(f"🏈 Checking ESPN for real {season} season data")
            result = espn_scraper.get_team_target_data(team.upper(), week)

            # If ESPN doesn't have real 2025 data, suggest using 2024 data
            if not result['success']:
                result['suggestion'] = f"Try using 2024 data instead: /api/target-share/{team}/{week}?season=2024"
        else:
            print(f"📊 Using nfl-data-py scraper for {season} season data")
            result = nfl_scraper.get_team_target_data(team.upper(), week, season)

        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/target-share/all/<int:week>', methods=['GET'])
def get_all_teams_target_share(week):
    """Get target share data for all teams for a specific week"""
    try:
        # Validate week
        if not 1 <= week <= 18:
            return jsonify({
                'success': False,
                'error': 'Week must be between 1 and 18'
            }), 400

        # Get season from query params (default to current)
        season = request.args.get('season', espn_scraper.current_season, type=int)

        # Use ESPN scraper for 2025 season data, nfl-data-py for historical
        if season >= 2025:
            result = espn_scraper.get_all_teams_data(week, season)
        else:
            result = nfl_scraper.get_all_teams_data(week, season)

        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get list of all NFL teams"""
    return jsonify({
        'success': True,
        'teams': list(espn_scraper.team_mapping.keys())
    })


@app.route('/api/weeks', methods=['GET'])
def get_weeks():
    """Get list of available weeks"""
    weeks = [{'value': i, 'label': f'Week {i}'} for i in range(1, 19)]
    return jsonify({
        'success': True,
        'weeks': weeks
    })


@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Manually refresh data for current week"""
    try:
        result = espn_scraper.refresh_data()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all cached data"""
    try:
        import glob
        cache_files = glob.glob(f"{espn_scraper.data_dir}/*.json")
        removed_count = 0

        for cache_file in cache_files:
            try:
                os.remove(cache_file)
                removed_count += 1
            except Exception:
                pass

        return jsonify({
            'success': True,
            'message': f'Cleared {removed_count} cache files',
            'files_removed': removed_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


def schedule_data_refresh():
    """Schedule automatic data refresh"""
    def refresh_job():
        print(f"[{datetime.now()}] Running scheduled data refresh...")
        try:
            result = espn_scraper.refresh_data()
            if result['success']:
                print(f"[{datetime.now()}] Data refresh completed successfully")
            else:
                print(f"[{datetime.now()}] Data refresh failed: {result.get('error')}")
        except Exception as e:
            print(f"[{datetime.now()}] Data refresh error: {e}")

    # Schedule refresh every Tuesday at 8 AM (after Monday Night Football)
    refresh_day = os.getenv('DATA_REFRESH_DAY', 'Tuesday').lower()
    refresh_hour = int(os.getenv('DATA_REFRESH_HOUR', '8'))

    if refresh_day == 'tuesday':
        schedule.every().tuesday.at(f"{refresh_hour:02d}:00").do(refresh_job)
    elif refresh_day == 'wednesday':
        schedule.every().wednesday.at(f"{refresh_hour:02d}:00").do(refresh_job)

    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    # Run scheduler in background thread
    if os.getenv('DATA_REFRESH_ENABLED', 'True').lower() == 'true':
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        print(f"[{datetime.now()}] Scheduled data refresh: Every {refresh_day} at {refresh_hour}:00")


if __name__ == '__main__':
    # Start the scheduler
    schedule_data_refresh()

    # Run the Flask app
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('FLASK_PORT', 5000))

    print(f"[{datetime.now()}] Starting NFL Target Share API server...")
    print(f"[{datetime.now()}] Current season: {espn_scraper.current_season}")
    print(f"[{datetime.now()}] Current week: {espn_scraper.get_current_week()}")
    print(f"[{datetime.now()}] Debug mode: {debug_mode}")
    print(f"[{datetime.now()}] Port: {port}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )