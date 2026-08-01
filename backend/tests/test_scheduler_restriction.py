import pytest
from unittest.mock import patch
import scheduler
import models
from datetime import datetime, timedelta
import pytz

BR_TZ = pytz.timezone('America/Sao_Paulo')

def test_mensagem_sem_grupo_nao_dispara(db_session):
    """
    Valida que mensagens que não possuem grupos vinculados NÃO são disparadas pelo agendador.
    Anteriormente, elas eram enviadas para todos os grupos (comportamento global).
    """
    # Patch SessionLocal para usar o db_session do pytest (SQLite em memória)
    with patch("scheduler.SessionLocal", return_value=db_session):
        # 1. Configurar o cenário: Grupo ativo no Dia 1
        grupo = models.GrupoWhatsApp(
            nome="Grupo de Teste Restrição",
            id_do_grupo="restricao-test-jid",
            numero_do_disparo="5511999999999",
            ativo=True,
            dia_lancamento_atual=1
        )
        db_session.add(grupo)
        db_session.commit()
        
        # 2. Definir horário atual dentro da janela do agendador
        agora_br = datetime.now(BR_TZ)
        horario_msg = agora_br.time()
        
        # 3. Criar uma mensagem SEM grupo vinculado (Não deve disparar)
        msg_sem_grupo = models.MensagemDisparada(
            mensagem="MENSAGEM_SEM_GRUPO",
            dia_do_lancamento=1,
            horario_do_disparo=horario_msg,
            ativo=True,
            tipo_de_mensagem="texto"
        )
        db_session.add(msg_sem_grupo)
        
        # 4. Criar uma mensagem COM grupo vinculado (Deve disparar)
        msg_com_grupo = models.MensagemDisparada(
            mensagem="MENSAGEM_COM_GRUPO",
            dia_do_lancamento=1,
            horario_do_disparo=horario_msg,
            ativo=True,
            tipo_de_mensagem="texto"
        )
        db_session.add(msg_com_grupo)
        db_session.commit()
        
        # Associar a segunda mensagem ao grupo
        msg_com_grupo.grupos = [grupo]
        db_session.commit()
        
        # 5. Mockar o envio real para a W-API para apenas contar as chamadas
        with patch("scheduler.enviar_wapi") as mock_send:
            mock_send.return_value = (True, {"status": "success"})
            
            # Executar a lógica do agendador
            scheduler.verificar_e_disparar_mensagens()
            
            # 6. Validações
            # Pegamos o texto das mensagens enviadas nas chamadas do mock
            mensagens_enviadas = [call.args[1].mensagem for call in mock_send.call_args_list]
            
            print(f"Mensagens enviadas: {mensagens_enviadas}")
            
            # Deve ter enviado a mensagem vinculada
            assert "MENSAGEM_COM_GRUPO" in mensagens_enviadas
            
            # NÃO deve ter enviado a mensagem sem vínculo (A falha aqui indicaria que o bug persiste)
            assert "MENSAGEM_SEM_GRUPO" not in mensagens_enviadas
            
            # O total de envios para este grupo deve ser exatamente 1 (desconsiderando outros processos)
            # Como o db_session é limpo por função, deve ser apenas 1 mesmo.
            assert len(mensagens_enviadas) == 1
