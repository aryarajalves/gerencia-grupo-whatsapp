import pytest
import io
import models

def test_importar_contatos_csv_endpoint(client, db_session):
    """
    Testa a importação de contatos a partir de um arquivo CSV via POST /contatos/import
    """
    csv_data = "Nome,Numero,Grupo\nLead Importado 1,5511999998888,Grupo VIP\nLead Importado 2,5511988887777,Grupo VIP\n"
    
    file_bytes = io.BytesIO(csv_data.encode('utf-8'))
    
    files = {
        'file': ('contatos_teste.csv', file_bytes, 'text/csv')
    }

    resp = client.post("/contatos/import", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["imported_count"] == 2

    # Verifica persistência no banco
    contatos = db_session.query(models.ContatoGrupo).filter(
        models.ContatoGrupo.nome_grupo == "Grupo VIP"
    ).all()
    assert len(contatos) == 2
    numeros = [c.numero for c in contatos]
    assert "5511999998888" in numeros
    assert "5511988887777" in numeros

def test_importar_contatos_csv_invalido(client):
    """
    Testa rejeição de arquivos com extensão inválida
    """
    files = {
        'file': ('arquivo.pdf', io.BytesIO(b"dummy pdf content"), 'application/pdf')
    }
    resp = client.post("/contatos/import", files=files)
    assert resp.status_code == 400
    assert "Apenas arquivos .csv ou .txt são aceitos" in resp.json()["detail"]
