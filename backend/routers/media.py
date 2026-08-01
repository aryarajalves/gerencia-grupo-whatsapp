from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import uuid
import os

import security, s3_helper

router = APIRouter(tags=["Mídia"])

@router.post("/upload/", dependencies=[Depends(security.get_api_key)])
async def upload_midia(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if len(content) > 16 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 16MB.")
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        # Se for áudio e for webm (comum em gravadores), muda para ogg para compatibilidade W-API
        if "audio" in file.content_type and (file_extension == ".webm" or not file_extension):
            file_extension = ".ogg"
            
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        url = s3_helper.upload_file_to_s3(content, unique_filename, file.content_type)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")
