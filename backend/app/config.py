import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/netcompliance.db")

SAMPLE_CONFIGS_DIR = DATA_DIR / "sample_configs"
REPORTS_DIR = BASE_DIR / "generated_reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

APP_NAME = "NetArmor AI - Network Compliance & Hardening Platform"
API_V1_STR = "/api/v1"
