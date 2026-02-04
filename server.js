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

// Данные о фруктах (в продакшене использовать БД)
let fruits = [
  { id: 1, name: 'Яблоки', price: 150, image: '🍎', description: 'Свежие красные яблоки', category: 'apples', unit: 'кг' },
  { id: 2, name: 'Бананы', price: 120, image: '🍌', description: 'Спелые желтые бананы', category: 'exotic', unit: 'кг' },
  { id: 3, name: 'Апельсины', price: 180, image: '🍊', description: 'Сочные апельсины', category: 'citrus', unit: 'кг' },
  { id: 4, name: 'Клубника', price: 250, image: '🍓', description: 'Свежая клубника', category: 'berries', unit: 'кг' },
  { id: 5, name: 'Виноград', price: 200, image: '🍇', description: 'Сладкий виноград', category: 'berries', unit: 'кг' },
  { id: 6, name: 'Манго', price: 300, image: '🥭', description: 'Экзотическое манго', category: 'exotic', unit: 'шт' },
  { id: 7, name: 'Ананас', price: 350, image: '🍍', description: 'Свежий ананас', category: 'exotic', unit: 'шт' },
  { id: 8, name: 'Киви', price: 220, image: '🥝', description: 'Витаминный киви', category: 'exotic', unit: 'кг' },
  { id: 9, name: 'Груши', price: 170, image: '🍐', description: 'Сочные груши', category: 'apples', unit: 'кг' },
  { id: 10, name: 'Черешня', price: 280, image: '🍒', description: 'Сладкая черешня', category: 'berries', unit: 'кг' },
  { id: 11, name: 'Лимон', price: 160, image: '🍋', description: 'Свежий лимон', category: 'citrus', unit: 'кг' },
  { id: 12, name: 'Грейпфрут', price: 200, image: '🍊', description: 'Сочный грейпфрут', category: 'citrus', unit: 'шт' }
];

// Хранилище заказов (в продакшене использовать БД)
let orders = [];

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

// API: Добавить фрукт (для админки)
app.post('/api/fruits', (req, res) => {
  const { name, price, category, description, unit, image } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  const newFruit = {
    id: fruits.length > 0 ? Math.max(...fruits.map(f => f.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    category,
    description: description || '',
    unit: unit || 'кг',
    image: image || '🍎'
  };

  fruits.push(newFruit);
  console.log('Добавлен фрукт:', newFruit);
  
  res.json({ success: true, fruit: newFruit });
});

// API: Создать заказ
app.post('/api/orders', (req, res) => {
  const { items, total, user, address, comment, payment } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }

  const order = {
    id: Date.now(),
    items,
    total,
    user: user || {},
    address: address || '',
    comment: comment || '',
    payment: payment || 'cash',
    status: 'Принят',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  console.log('Новый заказ:', order);
  
  res.json({ success: true, order });
});

// API: Получить все заказы (для админки)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// На Vercel статические файлы обслуживаются автоматически
// Отдаем только главную страницу и API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Админ-панель
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
