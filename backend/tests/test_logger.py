import pytest
import logging
import time
from datetime import datetime, timezone, timedelta
from core.logger import BrasiliaFormatter, BR_OFFSET

def test_brasilia_formatter():
    """
    Testa se o BrasiliaFormatter formata o timestamp no fuso horário de Brasília (UTC-3).
    """
    formatter = BrasiliaFormatter("%(asctime)s [%(levelname)s]: %(message)s")
    record = logging.LogRecord(
        name="test_logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="Mensagem de Teste",
        args=(),
        exc_info=None
    )
    
    formatted_time = formatter.formatTime(record)
    expected_time = datetime.fromtimestamp(record.created, tz=BR_OFFSET).strftime("%Y-%m-%d %H:%M:%S")
    
    assert formatted_time == expected_time
    assert len(formatted_time) == 19 # Format YYYY-MM-DD HH:MM:SS
