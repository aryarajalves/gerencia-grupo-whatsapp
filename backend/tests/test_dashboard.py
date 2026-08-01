import uuid
from datetime import datetime, time
import models
import scheduler

def test_dashboard_stats(client, db_session):
    """
    Testa se o endpoint de estatísticas do dashboard retorna dados corretos.
    """
    headers = {"x-api-key": "test-secret"}
    
    # 1. Setup: Criar grupos
    grupo1 = models.GrupoWhatsApp(
        nome="Grupo Ativo", 
        id_do_grupo="ativo-jid", 
        ativo=True, 
        dia_lancamento_atual=1
    )
    grupo2 = models.GrupoWhatsApp(
        nome="Grupo Encerrado", 
        id_do_grupo="encerrado-jid", 
        ativo=False, 
        dia_lancamento_atual=0
    )
    db_session.add_all([grupo1, grupo2])
    db_session.commit()
    
    # 2. Setup: Criar mensagens e associar ao grupo
    m1 = models.MensagemDisparada(
        mensagem="Mensagem Dia 1 Futura",
        numero_da_mensagem=1,
        dia_do_lancamento=1,
        horario_do_disparo=time(23, 59, 59), # No futuro hoje
        tipo_de_mensagem="texto",
        ativo=True
    )
    m1.grupos.append(grupo1)
    db_session.add(m1)
    db_session.commit()
    
    # 3. Setup: Criar logs de hoje
    hoje = datetime.now(scheduler.BR_TZ)
    log1 = models.LogDisparo(
        grupo_nome="Grupo Ativo",
        mensagem_corpo="Mensagem Enviada",
        status="Sucesso",
        criado_em=hoje
    )
    log2 = models.LogDisparo(
        grupo_nome="Grupo Ativo",
        mensagem_corpo="Mensagem Falhou",
        status="Erro",
        criado_em=hoje
    )
    db_session.add_all([log1, log2])
    db_session.commit()
    
    # 4. Requisição para o dashboard
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    # 5. Validações
    assert data["total_grupos_ativos"] == 1
    assert data["total_grupos_encerrados"] == 1
    assert data["total_mensagens"] == 1
    assert data["disparos_hoje"] == 2 # Sucesso + Erro hoje
    assert data["taxa_sucesso"] == 50.0 # 1 sucesso / 2 total
    assert data["ultimo_disparo"]["grupo_nome"] == "Grupo Ativo"
    
    # Próximos disparos (m1 deve estar lá pois 23:59:59 > agora)
    assert len(data["proximos_disparos"]) > 0
    assert data["proximos_disparos"][0]["grupo"] == "Grupo Ativo"
    
    # Grupos por dia
    assert len(data["grupos_por_dia"]) == 1
    assert data["grupos_por_dia"][0]["dia"] == 1
    assert "Grupo Ativo" in data["grupos_por_dia"][0]["grupos"]
