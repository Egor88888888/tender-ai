# 🚀 ПРОСТОЕ РАЗВЕРТЫВАНИЕ - 2 команды

## Шаг 1: Установите Azure CLI (если нет)

**macOS:**

```bash
curl -L https://aka.ms/InstallAzureCli | bash
```

**или через Homebrew:**

```bash
brew install azure-cli
```

## Шаг 2: Запустите развертывание

```bash
# 1. Войдите в Azure
az login

# 2. Запустите полное развертывание (автоматически создаст ВСЕ)
./scripts/deploy-full-azure.sh
```

**ВСЁ! Через 10-15 минут у вас будет полностью работающее приложение!**

---

## 🎯 ВАРИАНТ 2: БЕЗ УСТАНОВКИ (через GitHub)

Если не хотите ничего устанавливать:

### 1. Перейдите в GitHub Actions

- Откройте: https://github.com/Egor88888888/tender-ai/actions
- Найдите workflow "Deploy Full Azure Stack"
- Нажмите "Run workflow"

### 2. Поставьте галочку

- ✅ Deploy new infrastructure = **true**
- Нажмите зеленую кнопку "Run workflow"

### 3. Подождите 15 минут

GitHub автоматически создаст все Azure ресурсы

---

## ✅ Что получите после развертывания:

### Полностью работающий API с:

- 🗄️ **PostgreSQL база данных** - хранит тендеры
- 🧠 **Computer Vision** - OCR для документов
- 📄 **Form Recognizer** - анализ PDF
- 💾 **Blob Storage** - хранение файлов
- 🤖 **Gemini AI** - анализ тендеров
- 📱 **Красивый Frontend** - веб-интерфейс

### Готовые функции:

1. **Загрузка документов** с автоматическим OCR
2. **AI анализ тендеров** через Gemini
3. **База данных тендеров**
4. **Красивый веб-интерфейс**

## 🧪 Тестирование после развертывания:

```bash
# Проверьте что все работает (все должно быть true)
curl https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/

# Откройте Swagger для тестирования
open https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io/docs
```

## 🆘 Если что-то не работает:

**Проблема**: "Azure CLI не найден"
**Решение**: Используйте Вариант 2 (GitHub Actions)

**Проблема**: "az login не работает"  
**Решение**: Попробуйте `az login --use-device-code`

**Проблема**: Что-то сломалось
**Решение**: Напишите мне - исправлю!
