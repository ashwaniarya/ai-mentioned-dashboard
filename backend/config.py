import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "mentions.db")
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

DEFAULT_PAGE_SIZE = 25
MAX_PAGE_SIZE = 100
