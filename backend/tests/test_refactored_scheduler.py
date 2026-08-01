import pytest
from unittest.mock import MagicMock, patch
from services.message_service import montar_payload
from core.wapi import get_system_config

def test_montar_payload_texto():
    grupo = MagicMock()
    grupo.id_do_grupo = "123@g.us"
    
    msg = MagicMock()
    msg.tipo_de_mensagem = "texto"
    msg.mensagem = "Olá Mundo"
    
    payload, tipo = montar_payload(grupo, msg)
    
    assert tipo == "texto"
    assert payload["phone"] == "123@g.us"
    assert payload["message"] == "Olá Mundo"

def test_montar_payload_imagem():
    grupo = MagicMock()
    grupo.id_do_grupo = "123@g.us"
    
    msg = MagicMock()
    msg.tipo_de_mensagem = "imagem"
    msg.mensagem = "Legenda"
    msg.link_midia = "http://site.com/foto.jpg"
    
    payload, tipo = montar_payload(grupo, msg)
    
    assert tipo == "imagem"
    assert payload["image"] == "http://site.com/foto.jpg"
    assert payload["caption"] == "Legenda"

def test_get_system_config_fallback():
    db = MagicMock()
    db.query().filter().first.return_value = None # Simula config inexistente no banco
    
    with patch('os.getenv', return_value="fallback_val"):
        val = get_system_config(db, "CHAVE_TESTE", "ENV_TESTE")
        assert val == "fallback_val"
