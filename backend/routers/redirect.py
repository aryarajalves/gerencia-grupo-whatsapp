from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import models
from database import get_db
from core.logger import logger

router = APIRouter(tags=["Redirecionamento Público"])

@router.get("/join/{slug}")
def redirecionar_lead(slug: str, db: Session = Depends(get_db)):
    """
    Endpoint público para redirecionar o lead para o grupo correto dentro de um conjunto.
    Lógica: Pega os grupos do conjunto ordenados por posição. 
    Redireciona para o primeiro que não atingiu o max_leads.
    """
    conjunto = db.query(models.ConjuntoGrupo).filter_by(slug=slug, ativo=True).first()
    if not conjunto:
        logger.warning(f"Redirecionamento falhou: Slug '{slug}' não encontrado ou inativo.")
        raise HTTPException(status_code=404, detail="Link inválido ou conjunto inativo.")

    logger.info(f"Acesso ao link universal: '{slug}' (Conjunto: {conjunto.nome})")

    # Buscar associações ordenadas por posição
    associacoes = db.query(models.GrupoConjuntoAssociacao).filter_by(
        conjunto_id=conjunto.id
    ).order_by(models.GrupoConjuntoAssociacao.posicao).all()

    if not associacoes:
        logger.error(f"Conjunto '{conjunto.nome}' não possui grupos associados.")
        raise HTTPException(status_code=400, detail="Este conjunto não possui grupos configurados.")

    links_ausentes = 0
    for assoc in associacoes:
        grupo = db.query(models.GrupoWhatsApp).filter_by(id=assoc.grupo_id, ativo=True).first()
        if not grupo:
            continue

        # Verificar se o grupo está cheio
        if grupo.quantidade_contatos < assoc.max_leads:
            if grupo.link_convite:
                logger.info(f"Redirecionando lead para o grupo: '{grupo.nome}' (JID: {grupo.jid})")
                return RedirectResponse(url=grupo.link_convite)
            else:
                logger.warning(f"Grupo '{grupo.nome}' disponível, mas sem link de convite configurado.")
                links_ausentes += 1
                continue
    
    if links_ausentes > 0:
        logger.error(f"Todos os grupos disponíveis no conjunto '{conjunto.nome}' estão sem link de convite.")
        raise HTTPException(
            status_code=400, 
            detail=f"Existem {links_ausentes} grupos disponíveis no conjunto '{conjunto.nome}', mas eles não possuem link de convite configurado no sistema."
        )
    
    logger.warning(f"Todos os grupos do conjunto '{conjunto.nome}' estão lotados. Redirecionando para página de esgotamento.")
    
    # Obter URL do Frontend para a página de esgotamento
    import os
    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        # Fallback para BASE_URL ou localhost se não configurado
        frontend_url = os.getenv("BASE_URL", "http://localhost:5173")
    
    # Garantir que não usemos a porta do backend se cair no fallback do localhost
    if "localhost:8000" in frontend_url:
        frontend_url = frontend_url.replace("8000", "5173")

    return RedirectResponse(url=f"{frontend_url}/esgotado?slug={slug}")
    
@router.get("/info/{slug}")
def buscar_info_conjunto(slug: str, db: Session = Depends(get_db)):
    """
    Retorna informações básicas do conjunto (nome e redes sociais) para a página de esgotamento.
    """
    conjunto = db.query(models.ConjuntoGrupo).filter_by(slug=slug, ativo=True).first()
    if not conjunto:
        raise HTTPException(status_code=404, detail="Conjunto não encontrado")
    
    return {
        "nome": conjunto.nome,
        "social_links": conjunto.social_links
    }
