import os

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(_BACKEND_ROOT, "mentions.db")
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]


def parse_configured_cors_origins(configured_origins):
    if configured_origins is None:
        return DEFAULT_CORS_ORIGINS.copy()

    cleaned_origins = [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return cleaned_origins


CORS_ORIGINS = parse_configured_cors_origins(os.getenv("CORS_ORIGINS"))

DEFAULT_PAGE_SIZE = 25
MAX_PAGE_SIZE = 100
