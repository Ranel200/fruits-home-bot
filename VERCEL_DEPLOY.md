# Деплой на Vercel

## Быстрый деплой

### Способ 1: Через веб-интерфейс Vercel

1. **Зайдите на https://vercel.com**
   - Войдите через GitHub (или создайте аккаунт)

2. **Нажмите "Add New Project"**

3. **Подключите репозиторий**
   - Если репозиторий уже на GitHub, выберите его
   - Или импортируйте проект напрямую

4. **Настройки проекта:**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (оставьте как есть)
   - **Build Command**: (оставьте пустым)
   - **Output Directory**: (оставьте пустым)
   - **Install Command**: `npm install`

5. **Нажмите "Deploy"**

6. **После деплоя:**
   - Скопируйте URL вашего проекта (например: `https://fruits-home-bot.vercel.app`)
   - Используйте этот URL в @BotFather как Web App URL

### Способ 2: Через Vercel CLI

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Войдите в Vercel:**
   ```bash
   vercel login
   ```

3. **Деплой:**
   ```bash
   vercel
   ```

4. **Для продакшена:**
   ```bash
   vercel --prod
   ```

## Настройка в Telegram BotFather

После деплоя на Vercel:

1. Откройте **@BotFather** в Telegram
2. Отправьте `/newapp` или `/myapps`
3. Выберите вашего бота
4. В поле **Web App URL** вставьте URL от Vercel:
   ```
   https://your-project-name.vercel.app
   ```
5. Сохраните настройки

## Структура проекта для Vercel

Проект уже настроен для Vercel:
- ✅ `vercel.json` - конфигурация маршрутов
- ✅ `server.js` - экспортирует Express app
- ✅ `public/` - статические файлы
- ✅ `package.json` - зависимости

## Важные моменты

⚠️ **HTTPS автоматически** - Vercel предоставляет HTTPS по умолчанию

⚠️ **Переменные окружения** - если нужны, добавьте в настройках проекта на Vercel

⚠️ **Обновления** - при каждом push в GitHub, Vercel автоматически передеплоит проект

## Проверка работы

После деплоя откройте в браузере:
```
https://your-project-name.vercel.app
```

Должна открыться главная страница с каталогом фруктов.

## Полезные команды

```bash
# Посмотреть логи
vercel logs

# Посмотреть информацию о проекте
vercel inspect

# Удалить деплой
vercel remove
```
