import logging


class SuppressPathAccessFilter(logging.Filter):
    """Drop uvicorn access-log records for noisy, high-frequency polling paths.

    Heartbeat/polling endpoints get hit every few seconds and drown out
    everything else in the access log; this keeps access logging for every
    other request while dropping just those.
    """

    def __init__(self, suppressed_substrings: list[str]):
        super().__init__()
        self._suppressed = tuple(suppressed_substrings)

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        return not any(substring in message for substring in self._suppressed)
