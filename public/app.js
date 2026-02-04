// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    showAlert: (msg) => alert(msg),
    HapticFeedback: null,
    initDataUnsafe: {}
};
tg.ready();
tg.expand();

// Данные о фруктах (встроенные, если нет backend)
const defaultFruits = [
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

// Состояние приложения
let fruits = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

// Элементы DOM
const fruitsGrid = document.getElementById('fruitsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const overlay = document.getElementById('overlay');

// Загрузка фруктов
async function loadFruits() {
    console.log('Загрузка фруктов...');
    
    // Сначала устанавливаем встроенные данные (на случай если API не работает)
    fruits = [...defaultFruits];
    console.log('Установлены встроенные фрукты:', fruits.length);
    renderFruits();
    
    try {
        // Пробуем загрузить с API
        const apiUrl = window.location.origin + '/api/fruits';
        console.log('Попытка загрузить с API:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Получены данные с API:', data.length);
            if (Array.isArray(data) && data.length > 0) {
                fruits = data;
                renderFruits();
            }
        } else {
            console.log('API вернул статус:', response.status);
        }
    } catch (error) {
        console.log('API недоступен, используем встроенные данные:', error);
        // fruits уже установлены в defaultFruits выше
    }
}

// Отображение фруктов
function renderFruits() {
    console.log('renderFruits вызвана, fruits:', fruits?.length);
    
    if (!fruitsGrid) {
        console.error('fruitsGrid не найден!');
        return;
    }
    
    fruitsGrid.innerHTML = '';
    
    if (!fruits || fruits.length === 0) {
        console.log('Нет фруктов для отображения');
        fruitsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Загрузка фруктов...</p>';
        return;
    }
    
    console.log('Фильтрация фруктов, категория:', currentCategory, 'поиск:', searchQuery);
    const filtered = fruits.filter(fruit => {
        const matchesCategory = currentCategory === 'all' || fruit.category === currentCategory;
        const matchesSearch = fruit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             fruit.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    console.log('Отфильтровано фруктов:', filtered.length);
    if (filtered.length === 0) {
        fruitsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Фрукты не найдены</p>';
        return;
    }

    filtered.forEach(fruit => {
        const card = document.createElement('div');
        card.className = 'fruit-card';
        card.innerHTML = `
            <div class="fruit-emoji">${fruit.image}</div>
            <div class="fruit-name">${fruit.name}</div>
            <div class="fruit-description">${fruit.description}</div>
            <div class="fruit-price">${fruit.price} ₽</div>
            <button class="add-to-cart-btn" onclick="addToCart(${fruit.id})">
                В корзину
            </button>
        `;
        fruitsGrid.appendChild(card);
    });
}

// Добавление в корзину
function addToCart(fruitId) {
    const fruit = fruits.find(f => f.id === fruitId);
    if (!fruit) return;

    const existingItem = cart.find(item => item.id === fruitId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...fruit,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    
    // Вибрация (если поддерживается)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Удаление из корзины
function removeFromCart(fruitId) {
    cart = cart.filter(item => item.id !== fruitId);
    saveCart();
    updateCartUI();
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Изменение количества
function updateQuantity(fruitId, change) {
    const item = cart.find(item => item.id === fruitId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(fruitId);
    } else {
        saveCart();
        updateCartUI();
    }
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление UI корзины
function updateCartUI() {
    // Обновление счетчика
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Обновление списка товаров
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-emoji">${item.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Удалить</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    // Обновление итоговой суммы
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total} ₽`;
}

// Открытие корзины
function openCart() {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие корзины
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Оформление заказа
async function checkout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const user = tg.initDataUnsafe?.user || {};

    try {
        const apiUrl = window.location.origin + '/api/orders';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                total: total,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    username: user.username
                }
            })
        });

        const result = await response.json();

        if (result.success) {
            // Очистка корзины
            cart = [];
            saveCart();
            updateCartUI();
            closeCartSidebar();

            // Показ уведомления
            tg.showAlert('Заказ успешно оформлен!');
            
            // Вибрация
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
        } else {
            tg.showAlert('Ошибка при оформлении заказа');
        }
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        tg.showAlert('Ошибка при оформлении заказа');
    }
}

// Обработчики событий
cartIcon.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);
checkoutBtn.addEventListener('click', checkout);

// Поиск
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFruits();
});

// Фильтр по категориям
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderFruits();
    });
});

// Инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadFruits();
        updateCartUI();
    });
} else {
    loadFruits();
    updateCartUI();
}

// Экспорт функций для использования в onclick
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
