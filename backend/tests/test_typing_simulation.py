import pytest
from unittest.mock import patch, MagicMock
from services.message_service import simular_digitando, enviar_wapi

class DummyGrupo:
    id = "g1"
    nome = "Grupo Teste"
    id_do_grupo = "120363123456@g.us"
    tempo_digitando_segundos = 3
    cliente_id = None

class DummyGrupoSemDigitando:
    id = "g2"
    nome = "Grupo Sem Digitando"
    id_do_grupo = "120363654321@g.us"
    tempo_digitando_segundos = 0
    cliente_id = None

class DummyMsg:
    id = "m1"
    mensagem = "Olá grupo!"
    tipo_de_mensagem = "texto"

@patch("httpx.post")
@patch("time.sleep")
def test_simular_digitando_executa_composing_e_paused(mock_sleep, mock_post):
    mock_post.return_value = MagicMock(status_code=200)
    
    simular_digitando("120363123456@g.us", "inst1", {"Authorization": "Bearer tok"}, 3)
    
    # Deve chamar httpx.post duas vezes: 1 para 'composing' e 1 para 'paused'
    assert mock_post.call_count == 2
    
    # Chamada 1: composing
    args1, kwargs1 = mock_post.call_args_list[0]
    assert kwargs1["json"]["presence"] == "composing"
    assert kwargs1["json"]["phone"] == "120363123456@g.us"
    
    # Sleep de 3s
    mock_sleep.assert_called_once_with(3)
    
    # Chamada 2: paused
    args2, kwargs2 = mock_post.call_args_list[1]
    assert kwargs2["json"]["presence"] == "paused"

@patch("httpx.post")
@patch("time.sleep")
def test_simular_digitando_zero_segundos_nao_faz_nada(mock_sleep, mock_post):
    simular_digitando("120363123456@g.us", "inst1", {}, 0)
    mock_post.assert_not_called()
    mock_sleep.assert_not_called()

@patch("services.message_service.simular_digitando")
@patch("httpx.post")
@patch("services.message_service.get_wapi_instance", return_value="inst1")
@patch("services.message_service.get_wapi_headers", return_value={"Authorization": "Bearer tok"})
def test_enviar_wapi_chama_simular_digitando_quando_configurado(mock_headers, mock_inst, mock_post, mock_simular):
    mock_post.return_value = MagicMock(status_code=200, json=lambda: {"id": "wmsg1"})
    db = MagicMock()
    
    grupo = DummyGrupo()
    msg = DummyMsg()
    
    enviar_wapi(grupo, msg, db)
    
    # Deve ter chamado simular_digitando com os segundos do grupo (3)
    mock_simular.assert_called_once_with("120363123456@g.us", "inst1", {"Authorization": "Bearer tok"}, 3)
