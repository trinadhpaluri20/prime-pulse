import os
import sys
import shutil
from pathlib import Path

# Resolve base directories
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure Vercel serverless environment defaults
os.environ.setdefault("APP_ENV", "production")

# In Vercel serverless functions, root filesystem is read-only.
# We copy SQLite database to /tmp if using local SQLite fallback.
tmp_db = Path("/tmp/competitive_intelligence.db")
src_db = BACKEND_DIR / "competitive_intelligence.db"
root_db = ROOT_DIR / "competitive_intelligence.db"

if not tmp_db.exists():
    if src_db.exists():
        try:
            shutil.copyfile(str(src_db), str(tmp_db))
        except Exception:
            pass
    elif root_db.exists():
        try:
            shutil.copyfile(str(root_db), str(tmp_db))
        except Exception:
            pass

if not os.environ.get("DATABASE_URL") or "sqlite" in os.environ.get("DATABASE_URL", ""):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/competitive_intelligence.db"

from app.main import app
