import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from database import get_db
import security
import s3_helper
from services import backup_service
from core.logger import logger

router = APIRouter()

@router.get("/info")
def get_backup_info(db: Session = Depends(get_db), current_user: dict = Depends(security.check_super_admin)):
    return backup_service.get_backup_info(db)

@router.get("/list")
def list_backups(db: Session = Depends(get_db), current_user: dict = Depends(security.check_super_admin)):
    items = backup_service.get_backup_list()
    return {"total": len(items), "items": items}

@router.post("/create")
def create_backup(db: Session = Depends(get_db), current_user: dict = Depends(security.check_super_admin)):
    try:
        res = backup_service.execute_backup(db)
        return {"status": "success", "message": "Backup do banco de dados realizado com sucesso!", "data": res}
    except Exception as e:
        logger.error(f"Erro ao criar backup: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar backup: {str(e)}")

@router.post("/upload")
async def upload_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(security.check_super_admin)
):
    if not (file.filename.endswith(".dump") or file.filename.endswith(".gz") or file.filename.endswith(".sql")):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie um arquivo .dump, .dump.gz ou .sql")

    try:
        content = await file.read()
        filename = file.filename
        s3_uploaded = s3_helper.upload_backup_to_s3(content, filename)
        
        # Salva cópia local
        local_path = os.path.join(backup_service.BACKUP_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(content)

        return {
            "status": "success",
            "message": f"Backup {filename} enviado com sucesso!",
            "filename": filename,
            "s3_uploaded": s3_uploaded
        }
    except Exception as e:
        logger.error(f"Erro ao fazer upload de backup: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload de backup: {str(e)}")

@router.get("/download/{filename}")
def download_backup(
    filename: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(security.check_super_admin)
):
    file_bytes = s3_helper.download_backup_from_s3(filename)
    if not file_bytes:
        local_path = os.path.join(backup_service.BACKUP_DIR, filename)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                file_bytes = f.read()

    if not file_bytes:
        raise HTTPException(status_code=404, detail="Arquivo de backup não encontrado no S3 ou localmente.")

    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(BytesIO(file_bytes), media_type="application/gzip", headers=headers)

@router.post("/restore/{filename}")
def restore_backup(
    filename: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(security.check_super_admin)
):
    file_bytes = s3_helper.download_backup_from_s3(filename)
    if not file_bytes:
        local_path = os.path.join(backup_service.BACKUP_DIR, filename)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                file_bytes = f.read()

    if not file_bytes:
        raise HTTPException(status_code=404, detail="Arquivo de backup não foi localizado no S3 ou em disco.")

    logger.info(f"Restauração do backup {filename} solicitada pelo administrador {current_user.get('sub')}")
    return {"status": "success", "message": f"Solicitação de restauração para {filename} processada com sucesso!"}

@router.delete("/delete/{filename}")
def delete_backup(
    filename: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(security.check_super_admin)
):
    s3_deleted = s3_helper.delete_backup_from_s3(filename)
    local_path = os.path.join(backup_service.BACKUP_DIR, filename)
    if os.path.exists(local_path):
        try:
            os.remove(local_path)
        except Exception:
            pass

    return {"status": "success", "message": f"Backup {filename} removido com sucesso!", "s3_deleted": s3_deleted}

@router.post("/settings")
def update_backup_settings(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(security.check_super_admin)
):
    if "interval_hours" in payload:
        backup_service.set_config_val(db, "BACKUP_INTERVAL_HOURS", payload["interval_hours"])
    if "retencao_count" in payload:
        backup_service.set_config_val(db, "BACKUP_RETENTION_COUNT", payload["retencao_count"])
    if "agendamento_ativo" in payload:
        backup_service.set_config_val(db, "BACKUP_AUTO_ENABLED", str(payload["agendamento_ativo"]).lower())

    return {"status": "success", "message": "Configurações de backup atualizadas com sucesso!"}
