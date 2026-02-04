const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS для работы с Telegram
app.use(cors({
  origin: [
    'https://web.telegram.org',
    'https://telegram.org',
    /\.vercel\.app$/,  // Разрешить все Vercel домены
    /\.ngrok\.io$/,    // Разрешить ngrok для тестирования
    'http://localhost:3000',
    'http://localhost:8000'
  ],
  credentials: true
}));
app.use(bodyParser.json());

// Обслуживание статических файлов с правильными MIME типами
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Данные о фруктах
const fruits = [
  { id: 1, name: 'Яблоки', price: 150, image: '🍎', description: 'Свежие красные яблоки', category: 'fruits' },
  { id: 2, name: 'Бананы', price: 120, image: '🍌', description: 'Спелые желтые бананы', category: 'fruits' },
  { id: 3, name: 'Апельсины', price: 180, image: '🍊', description: 'Сочные апельсины', category: 'fruits' },
  { id: 4, name: 'Клубника', price: 250, image: '🍓', description: 'Свежая клубника', category: 'berries' },
  { id: 5, name: 'Виноград', price: 200, image: '🍇', description: 'Сладкий виноград', category: 'fruits' },
  { id: 6, name: 'Манго', price: 300, image: '🥭', description: 'Экзотическое манго', category: 'exotic' },
  { id: 7, name: 'Ананас', price: 350, image: '🍍', description: 'Свежий ананас', category: 'exotic' },
  { id: 8, name: 'Киви', price: 220, image: '🥝', description: 'Витаминный киви', category: 'fruits' },
  { id: 9, name: 'Груши', price: 170, image: '🍐', description: 'Сочные груши', category: 'fruits' },
  { id: 10, name: 'Черешня', price: 280, image: '🍒', description: 'Сладкая черешня', category: 'berries' }
];

// API: Получить все фрукты
app.get('/api/fruits', (req, res) => {
  res.json(fruits);
});

// API: Получить фрукт по ID
app.get('/api/fruits/:id', (req, res) => {
  const fruit = fruits.find(f => f.id === parseInt(req.params.id));
  if (!fruit) {
    return res.status(404).json({ error: 'Фрукт не найден' });
  }
  res.json(fruit);
});

// API: Создать заказ
app.post('/api/orders', (req, res) => {
  const { items, total, user } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const order = {
    id: Date.now(),
    items,
    total,
    user: user || {},
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // В реальном приложении здесь была бы запись в БД
  console.log('Новый заказ:', order);
  
  res.json({ success: true, order });
});

// На Vercel статические файлы обслуживаются автоматически
// Отдаем только главную страницу и API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Экспорт для Vercel (serverless функция)
module.exports = (req, res) => {
  // Обработка всех запросов через Express
  return app(req, res);
};

// Запуск локально (если не в Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
