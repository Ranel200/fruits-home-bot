// Загрузка переменных окружения из .env файла
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

// Токен бота (получите у @BotFather)
const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// URL вашего Mini App на Vercel
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://fruits-home-bot.vercel.app';

// Создаем бота
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🍎 Заказать фрукты',
                        web_app: { url: WEB_APP_URL }
                    }
                ]
            ]
        }
    };
    
    bot.sendMessage(
        chatId,
        '🍎 Добро пожаловать в мир фруктов! 🌟\n\nВыберите свежие фрукты и оформите заказ прямо здесь.',
        options
    );
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        '🍎 Фрукты Дома\n\n' +
        'Используйте кнопку "Заказать фрукты" для открытия каталога.\n\n' +
        'Команды:\n' +
        '/start - Начать работу с ботом\n' +
        '/help - Показать эту справку'
    );
});

// Обработка любых других сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    // Если это не команда, предлагаем открыть Mini App
    if (!msg.text.startsWith('/')) {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🍎 Заказать фрукты',
                            web_app: { url: WEB_APP_URL }
                        }
                    ]
                ]
            }
        };
        
        bot.sendMessage(
            chatId,
            'Нажмите кнопку ниже, чтобы открыть каталог фруктов 🍎',
            options
        );
    }
});

console.log('Бот запущен и готов к работе! 🤖');
