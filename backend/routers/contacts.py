from fastapi import APIRouter, Depends, Query, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
import uuid
from datetime import datetime

import models, schemas, security
from database import get_db
from client_context import get_active_client_id

router = APIRouter(tags=["Contatos"])

@router.get("/contatos/", response_model=schemas.PaginatedContatos, dependencies=[Depends(security.get_api_key)])
def listar_contatos(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    jid_grupo: Optional[str] = None,
    no_grupo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    cid = get_active_client_id(db)
    query = db.query(models.ContatoGrupo).filter(
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    )
    
    if jid_grupo:
        query = query.filter(models.ContatoGrupo.jid_grupo == jid_grupo)
    
    if no_grupo is not None:
        query = query.filter(models.ContatoGrupo.no_grupo == no_grupo)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.ContatoGrupo.nome.ilike(search_filter),
                models.ContatoGrupo.numero.ilike(search_filter),
                models.ContatoGrupo.nome_grupo.ilike(search_filter)
            )
        )
    
    total = query.count()
    items = query.order_by(models.ContatoGrupo.extraido_em.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

@router.get("/contatos/stats", dependencies=[Depends(security.get_api_key)])
def get_contatos_stats(db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    total = db.query(models.ContatoGrupo).filter(
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    ).count()
    total_grupos = db.query(models.ContatoGrupo.jid_grupo).filter(
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    ).distinct().count()
    
    return {
        "total_contatos": total,
        "total_grupos": total_grupos
    }

@router.get("/contatos/grupos", response_model=List[schemas.GrupoFiltro], dependencies=[Depends(security.get_api_key)])
def listar_grupos_dos_contatos(db: Session = Depends(get_db)):
    """
    Retorna a lista de grupos únicos que possuem pelo menos um contato registrado.
    Utilizado para o filtro de grupos na tela de contatos.
    """
    cid = get_active_client_id(db)
    grupos = db.query(
        models.ContatoGrupo.jid_grupo, 
        models.ContatoGrupo.nome_grupo
    ).filter(
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    ).distinct().order_by(models.ContatoGrupo.nome_grupo).all()
    
    return [
        {"jid_grupo": g.jid_grupo, "nome_grupo": g.nome_grupo} 
        for g in grupos
    ]

@router.get("/contatos/export", dependencies=[Depends(security.get_api_key)])
def exportar_contatos(
    search: Optional[str] = None,
    jid_grupo: Optional[str] = None,
    no_grupo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    from fastapi.responses import StreamingResponse
    import csv
    import io

    cid = get_active_client_id(db)
    query = db.query(models.ContatoGrupo).filter(
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    )
    
    if jid_grupo:
        query = query.filter(models.ContatoGrupo.jid_grupo == jid_grupo)
    
    if no_grupo is not None:
        query = query.filter(models.ContatoGrupo.no_grupo == no_grupo)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.ContatoGrupo.nome.ilike(search_filter),
                models.ContatoGrupo.numero.ilike(search_filter),
                models.ContatoGrupo.nome_grupo.ilike(search_filter)
            )
        )
    
    contacts = query.order_by(models.ContatoGrupo.extraido_em.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Nome", "Numero/ID", "Grupo", "Status no Grupo", "JID Grupo", "Extraído em"])
    
    # Data
    for c in contacts:
        writer.writerow([
            c.nome or "Sem Nome",
            c.numero,
            c.nome_grupo,
            "No Grupo" if c.no_grupo else "Saiu do Grupo",
            c.jid_grupo,
            c.extraido_em.strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    output.seek(0)
    
    filename = f"contatos_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

from pydantic import BaseModel

class BatchDeleteContactsReq(BaseModel):
    ids: List[str]

@router.delete("/contatos/{contato_id}", dependencies=[Depends(security.get_api_key)])
def deletar_contato(contato_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    contato = db.query(models.ContatoGrupo).filter(
        models.ContatoGrupo.id == contato_id,
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    ).first()
    if not contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    
    db.delete(contato)
    db.commit()
    return {"message": "Contato excluído com sucesso"}

@router.post("/contatos/batch-delete", dependencies=[Depends(security.get_api_key)])
def deletar_contatos_em_lote(payload: dict, db: Session = Depends(get_db)):
    ids = payload.get("ids", [])
    if not ids:
        raise HTTPException(status_code=400, detail="Lista de IDs não fornecida")
    
    cid = get_active_client_id(db)
    valid_ids = []
    for id_str in ids:
        try:
            valid_ids.append(uuid.UUID(id_str))
        except ValueError:
            continue
            
    if not valid_ids:
        return {"deleted_count": 0}
        
    deleted_count = db.query(models.ContatoGrupo).filter(
        models.ContatoGrupo.id.in_(valid_ids),
        or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"deleted_count": deleted_count, "message": f"{deleted_count} contato(s) excluído(s) com sucesso"}

from fastapi import File, UploadFile
import csv
import io
import re

@router.post("/contatos/import", dependencies=[Depends(security.get_api_key)])
def importar_contatos_csv(
    file: UploadFile = File(...),
    jid_grupo: Optional[str] = Query(None),
    nome_grupo: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Importa contatos a partir de um arquivo CSV.
    Campos aceitos no CSV: Nome/Name, Numero/Phone/Telefone, Grupo/Nome_Grupo.
    """
    if not file.filename.lower().endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Apenas arquivos .csv ou .txt são aceitos.")

    cid = get_active_client_id(db)

    try:
        content = file.file.read().decode('utf-8-sig', errors='ignore')
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        if not rows:
            raise HTTPException(status_code=400, detail="O arquivo CSV está vazio.")

        # Detectar cabeçalho
        header = [c.strip().lower() for c in rows[0]]
        has_header = any(k in header for k in ["nome", "name", "numero", "phone", "telefone", "grupo", "contato", "celular"])
        start_idx = 1 if has_header else 0

        nome_col = next((i for i, h in enumerate(header) if h in ["nome", "name", "contato"]), 0) if has_header else 0
        num_col = next((i for i, h in enumerate(header) if h in ["numero", "phone", "telefone", "id", "celular"]), 1) if has_header else 1
        grupo_col = next((i for i, h in enumerate(header) if h in ["grupo", "nome_grupo", "nome grupo"]), 2) if has_header else 2

        importados = 0
        agora = datetime.now()

        for row in rows[start_idx:]:
            if not row or len(row) == 0: continue
            
            raw_nome = row[nome_col].strip() if (nome_col < len(row)) else ""
            raw_num = row[num_col].strip() if (num_col < len(row)) else ""
            raw_grupo = row[grupo_col].strip() if (grupo_col < len(row)) else (nome_grupo or "Grupo Importado")

            # Se tiver apenas 1 coluna na linha e for número
            if not raw_num and raw_nome:
                raw_num = raw_nome

            clean_num = re.sub(r'\D', '', raw_num)
            if not clean_num: continue

            final_nome = raw_nome if raw_nome and raw_nome != clean_num else clean_num
            final_jid = jid_grupo or f"import_{uuid.uuid4().hex[:6]}@g.us"

            # Verifica se já existe
            existe = db.query(models.ContatoGrupo).filter(
                models.ContatoGrupo.numero == clean_num,
                or_(models.ContatoGrupo.cliente_id == cid, models.ContatoGrupo.cliente_id.is_(None))
            ).first()

            if existe:
                if final_nome: existe.nome = final_nome
                if cid: existe.cliente_id = cid
                existe.no_grupo = True
            else:
                novo = models.ContatoGrupo(
                    cliente_id=cid,
                    nome=final_nome,
                    numero=clean_num,
                    jid_grupo=final_jid,
                    nome_grupo=raw_grupo,
                    no_grupo=True,
                    extraido_em=agora
                )
                db.add(novo)
                importados += 1

        db.commit()
        return {
            "status": "success",
            "imported_count": importados,
            "message": f"{importados} contatos importados com sucesso!"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo CSV: {str(e)}")
