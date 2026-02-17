from supabase import Client
from services.supabase_client import get_supabase_client
from io import BytesIO
import os
import requests
from typing import Optional


class StorageService:
    def __init__(self):
        self.supabase: Client = get_supabase_client()
        self.bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "puresign-storage")

    async def upload_file(self, file_content: bytes, file_path: str) -> str:
        """Upload file to Supabase Storage and return public URL"""
        try:
            # Upload to Supabase Storage
            response = self.supabase.storage.from_(self.bucket_name).upload(
                file_path,
                file_content,
                file_options={"content-type": "image/jpeg", "upsert": "true"}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(file_path)
            return public_url
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")

    async def download_file(self, file_url: str) -> bytes:
        """Download file from URL (handles both Supabase Storage URLs and external URLs)"""
        try:
            # If it's already a full URL, download directly
            if file_url.startswith('http://') or file_url.startswith('https://'):
                response = requests.get(file_url)
                response.raise_for_status()
                return response.content
            
            # Otherwise, treat as Supabase Storage path
            response = self.supabase.storage.from_(self.bucket_name).download(file_url)
            return response
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")

