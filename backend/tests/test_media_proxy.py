import pytest
from fastapi.testclient import TestClient
from main import app
import httpx
from unittest.mock import AsyncMock, patch

client = TestClient(app)

@pytest.mark.asyncio
async def test_media_proxy_success():
    """
    Testa se o proxy consegue buscar uma imagem e retornar os headers corretos.
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.headers = {"content-type": "image/jpeg"}
    mock_response.content = b"fake-image-content"

    with patch("httpx.AsyncClient.get", return_value=mock_response):
        response = client.get("/captura/media-proxy?url=https://example.com/image.jpg")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/jpeg"
        assert response.headers["access-control-allow-origin"] == "*"
        assert response.content == b"fake-image-content"

@pytest.mark.asyncio
async def test_media_proxy_identification():
    """
    Testa a identificação de content-type baseada na URL quando a origem retorna octet-stream.
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.headers = {"content-type": "application/octet-stream"}
    mock_response.content = b"fake-content"

    # Testando com .png na URL
    with patch("httpx.AsyncClient.get", return_value=mock_response):
        response = client.get("/captura/media-proxy?url=https://example.com/file.png")
        assert response.headers["content-type"] == "image/png"

    # Testando com mmg.whatsapp.net na URL
    with patch("httpx.AsyncClient.get", return_value=mock_response):
        response = client.get("/captura/media-proxy?url=https://mmg.whatsapp.net/v/t62.3894-24/test")
        assert response.headers["content-type"] == "image/jpeg"

@pytest.mark.asyncio
async def test_media_proxy_error():
    """
    Testa se o proxy repassa erros da origem corretamente.
    """
    mock_response = AsyncMock()
    mock_response.status_code = 404
    mock_response.text = "Not Found"

    with patch("httpx.AsyncClient.get", return_value=mock_response):
        response = client.get("/captura/media-proxy?url=https://example.com/notfound")
        assert response.status_code == 404
