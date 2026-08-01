import pytest
from unittest.mock import patch, MagicMock
from services.queue_service import publish_dispatch_task, publish_extraction_task, is_queue_available

def test_is_queue_available_disabled():
    with patch("services.queue_service.RABBITMQ_ENABLED", False):
        assert is_queue_available() is False

@patch("services.queue_service._get_connection")
def test_publish_dispatch_task_success(mock_get_conn):
    mock_conn = MagicMock()
    mock_channel = MagicMock()
    mock_conn.channel.return_value = mock_channel
    mock_get_conn.return_value = mock_conn

    res = publish_dispatch_task("grupo-123", "msg-456")
    assert res is True
    mock_channel.queue_declare.assert_called_once()
    mock_channel.basic_publish.assert_called_once()

@patch("services.queue_service._get_connection")
def test_publish_extraction_task_success(mock_get_conn):
    mock_conn = MagicMock()
    mock_channel = MagicMock()
    mock_conn.channel.return_value = mock_channel
    mock_get_conn.return_value = mock_conn

    res = publish_extraction_task("grupo-789")
    assert res is True
    mock_channel.queue_declare.assert_called_once()
    mock_channel.basic_publish.assert_called_once()
