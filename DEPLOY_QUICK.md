# 🚀 Быстрый деплой на Vercel

## Шаг 1: Инициализация Git

```bash
cd ~/Documents/ARIT/фрукты
git init
git add .
git commit -m "Initial commit: Telegram Mini App"
```

## Шаг 2: Создать репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Название: `fruits-home-bot`
3. **НЕ** добавляйте README, .gitignore (уже есть)
4. Нажмите "Create repository"

## Шаг 3: Отправить код на GitHub

```bash
git remote add origin https://github.com/Ranel200/fruits-home-bot.git
git branch -M main
git push -u origin main
```

(Замените `YOUR_USERNAME` на ваш GitHub username)

## Шаг 4: Деплой на Vercel

1. Зайдите на **https://vercel.com**
2. Войдите через **GitHub**
3. Нажмите **"Add New Project"**
4. Выберите репозиторий `fruits-home-bot`
5. Настройки:
   - **Framework Preset**: `Other`
   - **Build Command**: (оставьте пустым)
   - **Output Directory**: (оставьте пустым)
   - **Install Command**: `npm install`
6. Нажмите **"Deploy"**

## Шаг 5: Получить URL

После деплоя скопируйте URL (например: `https://fruits-home-bot.vercel.app`)

## Шаг 6: Настроить в Telegram

1. Откройте **@BotFather** в Telegram
2. Отправьте `/newapp`
3. Выберите вашего бота
4. В поле **Web App URL** вставьте URL от Vercel
5. Сохраните

## Готово! 🎉

Ваше Mini App теперь доступно в Telegram!

---

**Примечание:** При каждом `git push` Vercel автоматически передеплоит проект.
