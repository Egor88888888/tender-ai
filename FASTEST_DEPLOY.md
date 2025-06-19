# ⚡ САМЫЙ БЫСТРЫЙ СПОСОБ - 1 клик!

## 🎯 Вариант 1: GitHub Actions (БЕЗ установки)

### Шаг 1: Откройте ссылку

👆 **Нажмите здесь:** https://github.com/Egor88888888/tender-ai/actions/workflows/deploy-full-stack.yml

### Шаг 2: Запустите deployment

1. Нажмите серую кнопку **"Run workflow"** (справа)
2. Поставьте галочку ✅ **"Deploy new infrastructure"** = `true`
3. Нажмите зеленую кнопку **"Run workflow"**

### Шаг 3: Подождите 15 минут ☕

GitHub автоматически создаст ВСЕ Azure ресурсы

---

## 🎯 Вариант 2: Быстрая установка CLI (5 минут)

```bash
# Установка Azure CLI (занимает ~200MB)
curl -L https://aka.ms/InstallAzureCli | bash

# Перезагрузите терминал
exec bash

# Войдите в Azure
az login

# Запустите развертывание (автоматически создаст ВСЁ)
./scripts/deploy-full-azure.sh
```

---

## ✅ РЕЗУЛЬТАТ - Полностью работающее приложение:

### 🌐 URL приложения:

- **API:** https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io
- **Swagger UI:** https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/docs
- **Frontend:** (будет создан при развертывании)

### 🚀 Готовые функции:

1. **📄 Загрузка PDF/изображений** → автоматический OCR
2. **🧠 AI анализ тендеров** → анализ через Gemini AI
3. **🗄️ База данных** → хранение тендеров в PostgreSQL
4. **💾 Файловое хранилище** → Azure Blob Storage
5. **🎨 Красивый интерфейс** → React frontend

### 🧪 Как тестировать:

```bash
# 1. Проверьте статус (все должно быть true)
curl https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/

# 2. Откройте Swagger для загрузки файлов
open https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/docs
```

---

## 🆘 Проблемы?

**"GitHub Actions не работает"**
→ Попробуйте Вариант 2 (Azure CLI)

**"Azure CLI не устанавливается"**  
→ Попробуйте через Homebrew: `brew install azure-cli`

**"Что-то сломалось"**
→ Напишите мне - исправлю за 5 минут!

## 💰 Стоимость

- **Тестирование:** ~$5-10 в день
- **Продакшен:** ~$50-100/месяц

**Можете удалить ресурсы в любой момент через Azure портал**
