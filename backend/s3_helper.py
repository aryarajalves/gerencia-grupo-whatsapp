import boto3
import os
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("S3_REGION", "us-west-004")

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name=S3_REGION
    )

def upload_file_to_s3(file_content, file_name, content_type):
    """
    Realiza o upload de um arquivo para o Backblaze B2 via interface S3.
    Retorna a URL pública do arquivo.
    """
    s3 = get_s3_client()
    
    s3.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=file_name,
        Body=file_content,
        ContentType=content_type or 'application/octet-stream',
        ACL='public-read'
    )
    
    url = f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.backblazeb2.com/{file_name}"
    return url

def is_s3_configured():
    """Verifica se as variáveis do S3/Backblaze B2 estão devidamente preenchidas."""
    return bool(S3_ENDPOINT_URL and S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY and S3_BUCKET_NAME)

def sanitize_folder(folder):
    if not folder:
        return "backups/"
    folder = folder.strip()
    if not folder.endswith("/"):
        folder = folder + "/"
    return folder

def upload_backup_to_s3(file_bytes, file_name, folder="backups/"):
    """Uploads a backup dump to the specified folder in Backblaze B2 S3."""
    if not is_s3_configured():
        return False
    s3 = get_s3_client()
    prefix = sanitize_folder(folder)
    key = f"{prefix}{file_name}" if not file_name.startswith(prefix) else file_name
    s3.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType='application/gzip'
    )
    return True

def list_backups_from_s3(folder="backups/"):
    """Lists all backup objects stored under specified folder in Backblaze B2 S3."""
    if not is_s3_configured():
        return []
    s3 = get_s3_client()
    prefix = sanitize_folder(folder)
    try:
        response = s3.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=prefix)
        items = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            filename = key.replace(prefix, "")
            if not filename or filename.endswith("/"):
                continue
            items.append({
                "filename": filename,
                "key": key,
                "size_bytes": obj.get('Size', 0),
                "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None
            })
        items.sort(key=lambda x: x['last_modified'] or '', reverse=True)
        return items
    except Exception as e:
        print(f"Erro ao listar backups do S3: {e}")
        return []

def download_backup_from_s3(file_name, folder="backups/"):
    """Downloads object bytes from Backblaze B2 S3."""
    if not is_s3_configured():
        return None
    s3 = get_s3_client()
    prefix = sanitize_folder(folder)
    key = f"{prefix}{file_name}" if not file_name.startswith(prefix) else file_name
    try:
        obj = s3.get_object(Bucket=S3_BUCKET_NAME, Key=key)
        return obj['Body'].read()
    except Exception as e:
        print(f"Erro ao baixar backup {file_name} do S3: {e}")
        return None

def delete_backup_from_s3(file_name, folder="backups/"):
    """Deletes backup object from Backblaze B2 S3."""
    if not is_s3_configured():
        return False
    s3 = get_s3_client()
    prefix = sanitize_folder(folder)
    key = f"{prefix}{file_name}" if not file_name.startswith(prefix) else file_name
    try:
        s3.delete_object(Bucket=S3_BUCKET_NAME, Key=key)
        return True
    except Exception as e:
        print(f"Erro ao deletar backup {file_name} do S3: {e}")
        return False

