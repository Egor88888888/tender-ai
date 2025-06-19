# 🚀 Развертывание РЕАЛЬНОЙ Azure Инфраструктуры

## Проблема

Сейчас API работает на базовых Azure ресурсах без:

- ❌ PostgreSQL Database
- ❌ Computer Vision (OCR)
- ❌ Form Recognizer
- ❌ Cognitive Services

## Решение: Полное развертывание Azure Stack

### Вариант 1: Автоматический скрипт (рекомендуется)

```bash
# 1. Убедитесь что у вас есть Azure CLI
az --version

# 2. Войдите в Azure
az login

# 3. Установите Gemini API Key (опционально)
export GEMINI_API_KEY="your_gemini_api_key_here"

# 4. Запустите полное развертывание
./scripts/deploy-full-azure.sh
```

**Что сделает скрипт:**

- ✅ Создаст PostgreSQL Database
- ✅ Настроит Computer Vision API
- ✅ Развернет Form Recognizer
- ✅ Настроит Storage с контейнерами
- ✅ Обновит Container App с новыми переменными
- ✅ Протестирует все endpoints

### Вариант 2: Manual Deployment (GitHub Actions)

1. **Добавьте секреты в GitHub:**

   - `DB_ADMIN_PASSWORD` = "TenderAI_2024_SecurePass!"
   - `GEMINI_API_KEY` = ваш Gemini API ключ

2. **Запустите workflow:**
   - Перейдите в Actions
   - Выберите "Deploy Full Azure Stack"
   - Поставьте галочку "Deploy new infrastructure"
   - Нажмите "Run workflow"

### Вариант 3: Azure CLI команды

```bash
# 1. Создайте ресурс группу
az group create --name tender-rg --location westeurope

# 2. Разверните инфраструктуру
az deployment group create \
  --resource-group tender-rg \
  --template-file infra/azuredeploy-full.bicep \
  --parameters dbAdminPassword="TenderAI_2024_SecurePass!"

# 3. Получите outputs и обновите Container App
# (подробные команды в скрипте)
```

## После развертывания

### Проверка работы:

```bash
# API Status (все должно быть true)
curl https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/

# Environment Variables
curl https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/api/debug-env

# Storage Info
curl https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/api/storage-info
```

### Тестирование функций:

1. **OCR**: Загрузите PDF/изображение через `/docs`
2. **Database**: Проверьте `/api/tenders`
3. **AI Analysis**: Используйте `/api/analyze-tender`

## Что будет развернуто:

### Azure Resources:

- 🗄️ **PostgreSQL Flexible Server** - основная база данных
- 🧠 **Cognitive Services** - OCR и Computer Vision
- 📄 **Form Recognizer** - анализ документов
- 💾 **Storage Account** - хранение файлов
- 🐳 **Container Registry** - Docker образы
- 📱 **Container Apps** - API hosting
- 🔐 **Key Vault** - секреты
- 📊 **Application Insights** - мониторинг

### Ориентировочная стоимость:

- **Development**: $50-100/месяц
- **Production**: $150-300/месяц

## Устранение проблем:

### "Computer Vision not configured"

```bash
# Проверьте переменные в Container App
az containerapp show --name tender-api --resource-group tender-rg
```

### "Database not configured"

```bash
# Проверьте строку подключения
az containerapp env show --name tender-ca-env --resource-group tender-rg
```

### "Blob storage errors"

```bash
# Проверьте ключи Storage Account
az storage account keys list --account-name [storage_name] --resource-group tender-rg
```

## 🎯 Результат

После успешного развертывания:

- ✅ OCR работает с реальными документами
- ✅ База данных хранит тендеры
- ✅ Computer Vision анализирует изображения
- ✅ Gemini AI обрабатывает тексты
- ✅ Все endpoints возвращают реальные данные

**Больше никаких моков и заглушек!** 🚀
