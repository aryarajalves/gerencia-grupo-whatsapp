import pytest
from services.message_service import montar_payload
from core.wapi import ENDPOINT_MAP

class DummyGrupo:
    id_do_grupo = "120363123456@g.us"

class DummyMsgFechar:
    tipo_de_mensagem = "status_grupo"
    link_midia = "fechar"
    mensagem = "fechar"

class DummyMsgAbrir:
    tipo_de_mensagem = "status_grupo"
    link_midia = "abrir"
    mensagem = "abrir"

def test_endpoint_map_status_grupo():
    assert "status_grupo" in ENDPOINT_MAP
    assert ENDPOINT_MAP["status_grupo"] == "/group/update-group-settings"

def test_montar_payload_status_grupo_fechar():
    grupo = DummyGrupo()
    msg = DummyMsgFechar()
    payload, tipo = montar_payload(grupo, msg)
    assert tipo == "status_grupo"
    assert payload["groupId"] == "120363123456@g.us"
    assert payload["adminOnlyMessage"] is True
    assert "adminOnlySettings" not in payload

class DummyMsgComTexto:
    tipo_de_mensagem = "status_grupo"
    link_midia = "abrir"
    mensagem = "O grupo está aberto! Podem enviar dúvidas."

def test_montar_payload_status_grupo_abrir():
    """Ao abrir o grupo, apenas adminOnlyMessage deve ser alterado (False). adminOnlySettings não deve ser afetado."""
    grupo = DummyGrupo()
    msg = DummyMsgAbrir()
    payload, tipo = montar_payload(grupo, msg)
    assert tipo == "status_grupo"
    assert payload["groupId"] == "120363123456@g.us"
    assert payload["adminOnlyMessage"] is False
    assert "adminOnlySettings" not in payload
    assert payload["_optional_text"] == ""

def test_montar_payload_status_grupo_com_texto_opcional():
    grupo = DummyGrupo()
    msg = DummyMsgComTexto()
    payload, tipo = montar_payload(grupo, msg)
    assert tipo == "status_grupo"
    assert payload["groupId"] == "120363123456@g.us"
    assert payload["adminOnlyMessage"] is False
    assert payload["_optional_text"] == "O grupo está aberto! Podem enviar dúvidas."

def test_obter_configuracoes_atuais_grupo_preserva_settings():
    from unittest.mock import patch, MagicMock
    from services.message_service import obter_configuracoes_atuais_grupo

    with patch("httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"group": {"adminOnlySettings": True}}
        mock_get.return_value = mock_resp

        res = obter_configuracoes_atuais_grupo("120363123456@g.us", "inst123", {"Authorization": "Bearer tok"})
        assert res is True

class DummyMsgComAdminSettings:
    tipo_de_mensagem = "status_grupo"
    link_midia = "abrir"
    mensagem = "abrir"
    admin_only_settings = False

def test_montar_payload_status_grupo_com_admin_settings_customizado():
    grupo = DummyGrupo()
    msg = DummyMsgComAdminSettings()
    payload, tipo = montar_payload(grupo, msg)
    assert tipo == "status_grupo"
    assert payload["groupId"] == "120363123456@g.us"
    assert payload["adminOnlyMessage"] is False
    assert payload["_admin_only_settings"] is False




