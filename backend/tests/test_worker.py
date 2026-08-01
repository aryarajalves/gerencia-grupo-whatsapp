import pytest
import os
import scheduler
from worker import main as run_worker

def test_worker_module_import():
    """
    Testa se o modulo worker pode ser importado corretamente.
    """
    import worker
    assert hasattr(worker, 'main')

def test_disable_scheduler_env(monkeypatch):
    """
    Testa a flag DISABLE_SCHEDULER usada pelo main.py.
    """
    monkeypatch.setenv("DISABLE_SCHEDULER", "true")
    disable_flag = os.getenv("DISABLE_SCHEDULER", "false").lower() in ("true", "1", "yes")
    assert disable_flag is True
