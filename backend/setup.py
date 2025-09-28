#!/usr/bin/env python3
"""
Setup script for NFL Target Share API backend
Installs dependencies and sets up the environment
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None


def setup_environment():
    """Set up Python virtual environment and install dependencies"""
    backend_dir = Path(__file__).parent
    venv_dir = backend_dir / "venv"

    print("=" * 50)
    print("NFL Target Share API Backend Setup")
    print("=" * 50)

    # Check Python version
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")

    if python_version < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)

    # Create virtual environment if it doesn't exist
    if not venv_dir.exists():
        run_command("python3 -m venv venv", "Creating virtual environment")
    else:
        print("✅ Virtual environment already exists")

    # Determine activation script path
    if os.name == 'nt':  # Windows
        activate_script = venv_dir / "Scripts" / "activate"
        pip_path = venv_dir / "Scripts" / "pip"
    else:  # Unix/Linux/macOS
        activate_script = venv_dir / "bin" / "activate"
        pip_path = venv_dir / "bin" / "pip"

    # Install dependencies
    install_cmd = f"{pip_path} install -r requirements.txt"
    run_command(install_cmd, "Installing Python dependencies")

    # Create .env file if it doesn't exist
    env_file = backend_dir / ".env"
    if not env_file.exists():
        env_example = backend_dir / ".env.example"
        if env_example.exists():
            run_command(f"cp {env_example} {env_file}", "Creating .env file from example")
        else:
            print("⚠️ .env.example not found, skipping .env creation")
    else:
        print("✅ .env file already exists")

    # Create data directory
    data_dir = backend_dir / "data"
    data_dir.mkdir(exist_ok=True)
    print("✅ Data directory created")

    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print(f"1. Activate virtual environment: source {activate_script}")
    print("2. Test the scraper: python src/test_scraper.py")
    print("3. Start the API server: python src/api_server.py")
    print("4. Test API endpoints: curl http://localhost:5000/api/health")

    return True


if __name__ == "__main__":
    setup_environment()