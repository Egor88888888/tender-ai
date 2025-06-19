# Environment Setup

## .env файл

Создайте файл `.env` в корне проекта и добавьте переменные:

```env
# Google Gemini API
GEMINI_API_KEY=

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tender_ai

# MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=miniosecret
```

## Хранение секретов в продакшене

1. Разместите значения в **Azure Key Vault**.
2. Подключите их к Azure App Service через **Application Settings**.
3. В CI/CD добавьте переменные окружения `GEMINI_API_KEY` и др. в Secrets GitHub Actions.

## Локальный запуск

Docker Compose прочитает `.env` автоматически. Не коммитьте реальные ключи!
