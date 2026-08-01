import pytest
import uuid
from datetime import datetime
import models

def test_logs_return_tipo_field(client, db_session):
    # 1. Cria cliente e adiciona logs com diferentes tipos
    c1 = models.Cliente(id=uuid.uuid4(), nome="Cliente Logs Test", ativo=True)
    db_session.add(c1)
    db_session.commit()

    log_txt = models.LogDisparo(id=uuid.uuid4(), cliente_id=c1.id, grupo_nome="Grupo A", mensagem_corpo="Mensagem texto", status="Sucesso", tipo="texto", criado_em=datetime.now())
    log_img = models.LogDisparo(id=uuid.uuid4(), cliente_id=c1.id, grupo_nome="Grupo A", mensagem_corpo="https://example.com/imagem.png", status="Sucesso", tipo="imagem", criado_em=datetime.now())
    log_enq = models.LogDisparo(id=uuid.uuid4(), cliente_id=c1.id, grupo_nome="Grupo A", mensagem_corpo="Quanto é 2 + 2 ?", status="Sucesso", tipo="enquete", criado_em=datetime.now())
    
    db_session.add_all([log_txt, log_img, log_enq])
    db_session.commit()

    # 2. Seleciona Cliente
    client.post(f"/clientes/{c1.id}/selecionar")

    # 3. Chama GET /logs/
    resp = client.get("/logs/")
    assert resp.status_code == 200
    data = resp.json()
    items = data["items"]
    assert len(items) >= 3

    # 4. Valida se os tipos retornaram corretamente no JSON
    tipos_retornados = {item["mensagem_corpo"]: item.get("tipo") for item in items}
    assert tipos_retornados.get("Mensagem texto") == "texto"
    assert tipos_retornados.get("https://example.com/imagem.png") == "imagem"
    assert tipos_retornados.get("Quanto é 2 + 2 ?") == "enquete"
