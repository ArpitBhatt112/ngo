from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / ".." / "backend"
PACKAGE_DIR = BACKEND_DIR / ".packages"

if str(PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(PACKAGE_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
