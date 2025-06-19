"""Wrapper around Azure Blob Storage for uploads/downloads.
If AZURE_STORAGE_CONNECTION_STRING is not set (local dev), raises RuntimeError.
"""
from __future__ import annotations

from pathlib import Path
from typing import BinaryIO

from azure.storage.blob import BlobServiceClient, ContentSettings

from ..core.settings import get_settings

_settings = get_settings()
if not _settings.storage_connection_string:
    raise RuntimeError(
        "AZURE_STORAGE_CONNECTION_STRING not configured; set it in Key Vault / .env")

_blob_service = BlobServiceClient.from_connection_string(
    _settings.storage_connection_string)
_container_client = _blob_service.get_container_client(
    _settings.storage_container)
if not _container_client.exists():
    _container_client.create_container()


def upload_file(file_stream: BinaryIO, destination: str, content_type: str | None = None) -> str:
    """Upload a file-like object and return blob URL."""
    blob_client = _container_client.get_blob_client(destination)
    cs = ContentSettings(content_type=content_type) if content_type else None
    blob_client.upload_blob(file_stream, overwrite=True, content_settings=cs)
    return blob_client.url


def upload_path(path: Path) -> str:
    """Upload file from local path, return blob URL."""
    with path.open("rb") as fh:
        return upload_file(fh, path.name)
