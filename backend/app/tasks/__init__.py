"""Celery application and basic tasks."""
from __future__ import annotations

import os

from celery import Celery

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv(
    "CELERY_RESULT_BACKEND", "redis://redis:6379/1")

celery_app = Celery("tender-ai", broker=CELERY_BROKER_URL,
                    backend=CELERY_RESULT_BACKEND)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)


@celery_app.task(name="ping")
def ping() -> str:  # type: ignore[return-value]
    """Simple ping task to verify worker is alive."""
    return "pong"
