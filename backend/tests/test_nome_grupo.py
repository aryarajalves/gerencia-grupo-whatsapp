from types import SimpleNamespace
from services.message_service import montar_payload
from core.wapi import ENDPOINT_MAP

def test_montar_payload_nome_grupo():
    # Simula um objeto de grupo
    grupo = SimpleNamespace(id_do_grupo="123456789@g.us")
    
    # Simula um objeto de mensagem do novo tipo
    msg = SimpleNamespace(
        tipo_de_mensagem="nome_grupo",
        mensagem="O Novo Nome do Grupo",
        link_midia=None,
        opcoes_enquete=None
    )
    
    payload, tipo = montar_payload(grupo, msg)
    
    assert tipo == "nome_grupo"
    assert payload["groupName"] == "O Novo Nome do Grupo"
    assert payload["groupId"] == "123456789@g.us"
    assert "message" not in payload

def test_endpoint_map_nome_grupo():
    assert "nome_grupo" in ENDPOINT_MAP
    assert ENDPOINT_MAP["nome_grupo"] == "/group/update-group-name"

