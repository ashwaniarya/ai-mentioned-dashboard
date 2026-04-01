class AppApiException(Exception):
    """Raise from any route's except block with context.
    Global handler catches and formats into ErrorResponse."""

    def __init__(self, status_code: int, error: str, detail: str | None = None):
        self.status_code = status_code
        self.error = error
        self.detail = detail
