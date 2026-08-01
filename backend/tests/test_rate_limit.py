import pytest
from core.limiter import check_rate_limit

def test_public_routes_are_exempt_from_rate_limit(client):
    """
    Testa se as rotas públicas liberadas (/config/public, /) 
    podem receber múltiplas requisições sem bloqueio por rate limit.
    """
    for _ in range(10):
        resp_public = client.get("/config/public")
        assert resp_public.status_code == 200

    for _ in range(10):
        resp_home = client.get("/")
        assert resp_home.status_code == 200

def test_check_rate_limit_function():
    """
    Testa a função de verificação de limite por IP e a rejeição quando ultrapassar 50 requisições.
    """
    test_ip = "192.168.1.99"
    # Faz 50 requisições permitidas
    for _ in range(50):
        assert check_rate_limit(test_ip, "test_sensitive", max_requests=50, window=60) is True

    # A 51ª requisição na mesma janela deve ser rejeitada
    assert check_rate_limit(test_ip, "test_sensitive", max_requests=50, window=60) is False
