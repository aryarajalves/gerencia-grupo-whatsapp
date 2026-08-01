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
        ACL='public-read' # Certifique-se que o bucket permite leitura pública
    )
    
    # Construir a URL (Virtual Host Style para melhor compatibilidade com B2 S3)
    # Formato: https://{bucketName}.s3.{region}.backblazeb2.com/{fileName}
    url = f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.backblazeb2.com/{file_name}"
    return url
