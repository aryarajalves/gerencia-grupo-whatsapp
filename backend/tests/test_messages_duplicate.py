import pytest
import uuid
from datetime import time
import models

def test_duplicar_mensagens_bulk(client, db_session):
    # Criar grupo
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Duplicação",
        id_do_grupo="123456789@g.us",
        numero_do_disparo="5511999999999"
    )
    db_session.add(grupo)
    db_session.commit()
    db_session.refresh(grupo)

    # Criar mensagens para duplicar
    msg1 = models.MensagemDisparada(
        mensagem="Mensagem 1 para duplicar",
        numero_da_mensagem=1,
        dia_do_lancamento=1,
        horario_do_disparo=time(10, 0, 0),
        tipo_de_mensagem="texto",
        etiqueta="boas_vindas"
    )
    msg2 = models.MensagemDisparada(
        mensagem="Mensagem 2 para duplicar",
        numero_da_mensagem=2,
        dia_do_lancamento=1,
        horario_do_disparo=time(14, 30, 0),
        tipo_de_mensagem="texto",
        etiqueta="oferta"
    )
    db_session.add_all([msg1, msg2])
    db_session.commit()
    db_session.refresh(msg1)
    db_session.refresh(msg2)

    # Executar duplicação para o Dia 5 com grupo associado
    payload = {
        "ids": [str(msg1.id), str(msg2.id)],
        "dia_do_lancamento": 5,
        "grupo_ids": [str(grupo.id)]
    }

    response = client.post("/mensagens/bulk-duplicate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["duplicated_count"] == 2

    # Verificar mensagens no banco
    mensagens_dia_5 = db_session.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.dia_do_lancamento == 5
    ).all()

    assert len(mensagens_dia_5) == 2
    corpos = [m.mensagem for m in mensagens_dia_5]
    assert "Mensagem 1 para duplicar" in corpos
    assert "Mensagem 2 para duplicar" in corpos

    # Verificar que os grupos foram vinculados
    for m in mensagens_dia_5:
        assert len(m.grupos) == 1
        assert m.grupos[0].id == grupo.id
