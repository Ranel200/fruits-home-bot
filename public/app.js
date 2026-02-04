// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    showAlert: (msg) => {
        try {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(msg);
            } else {
                alert(msg);
            }
        } catch (e) {
            alert(msg);
        }
    },
    HapticFeedback: null,
    initDataUnsafe: {}
};

// Безопасная функция для показа уведомлений
function showNotification(message, type = 'info') {
    try {
        // Пробуем использовать showAlert
        if (tg.showAlert && typeof tg.showAlert === 'function') {
            tg.showAlert(message);
            return;
        }
    } catch (e) {
        console.log('showAlert не поддерживается, используем fallback');
    }
    
    // Fallback: показываем сообщение в интерфейсе
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        font-size: 16px;
        max-width: 80%;
        text-align: center;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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
let currentPage = 'home';
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;

// Элементы DOM
const registerScreen = document.getElementById('registerScreen');
const mainContainer = document.getElementById('mainContainer');
const registerForm = document.getElementById('registerForm');
const fruitsGrid = document.getElementById('fruitsGrid');
const catalogGrid = document.getElementById('catalogGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const navCartCount = document.getElementById('navCartCount');
const profileName = document.getElementById('profileName');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileInfo = document.getElementById('profileInfo');
const editProfileForm = document.getElementById('editProfileForm');
const updateProfileForm = document.getElementById('updateProfileForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const catalogCategoryBtns = document.querySelectorAll('.catalog-category-btn');
let catalogCategory = 'all';

// Проверка регистрации
function checkRegistration() {
    if (!userProfile) {
        registerScreen.style.display = 'flex';
        mainContainer.style.display = 'none';
    } else {
        registerScreen.style.display = 'none';
        mainContainer.style.display = 'block';
        updateProfileDisplay();
    }
}

// Обработка регистрации
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    
    if (name && phone && address) {
        userProfile = {
            name,
            phone,
            address,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        checkRegistration();
        showNotification('Регистрация успешна!', 'success');
    }
});

// Редактирование профиля
editProfileBtn.addEventListener('click', () => {
    // Заполняем форму текущими данными
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editPhone').value = userProfile.phone;
    document.getElementById('editAddress').value = userProfile.address;
    
    // Показываем форму, скрываем просмотр
    profileInfo.style.display = 'none';
    editProfileBtn.style.display = 'none';
    editProfileForm.style.display = 'block';
});

// Отмена редактирования
cancelEditBtn.addEventListener('click', () => {
    profileInfo.style.display = 'block';
    editProfileBtn.style.display = 'block';
    editProfileForm.style.display = 'none';
});

// Сохранение профиля
updateProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    
    if (name && phone && address) {
        userProfile = {
            ...userProfile,
            name,
            phone,
            address
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        updateProfileDisplay();
        
        // Скрываем форму, показываем просмотр
        profileInfo.style.display = 'block';
        editProfileBtn.style.display = 'block';
        editProfileForm.style.display = 'none';
        
        showNotification('Профиль обновлен!', 'success');
    }
});

// Обновление отображения профиля
function updateProfileDisplay() {
    if (userProfile) {
        profileName.textContent = userProfile.name;
        profilePhone.textContent = userProfile.phone;
        profileAddress.textContent = userProfile.address;
    }
}

// Навигация
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        switchPage(page);
    });
});

function switchPage(page) {
    currentPage = page;
    
    // Обновляем активную кнопку
    navBtns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    // Показываем нужную страницу
    if (page === 'home') {
        document.getElementById('homePage').style.display = 'block';
        renderFruits(fruitsGrid);
    } else if (page === 'catalog') {
        document.getElementById('catalogPage').style.display = 'block';
        renderCatalogFruits();
    } else if (page === 'cart') {
        document.getElementById('cartPage').style.display = 'block';
        updateCartUI();
    } else if (page === 'profile') {
        document.getElementById('profilePage').style.display = 'block';
        updateProfileDisplay();
        // Убеждаемся, что форма скрыта при открытии профиля
        profileInfo.style.display = 'block';
        editProfileBtn.style.display = 'block';
        editProfileForm.style.display = 'none';
    }
}

// Загрузка фруктов
async function loadFruits() {
    console.log('Загрузка фруктов...');
    
    // Сначала устанавливаем встроенные данные (на случай если API не работает)
    fruits = [...defaultFruits];
    console.log('Установлены встроенные фрукты:', fruits.length);
    renderFruits(fruitsGrid);
    
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
                renderFruits(fruitsGrid);
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
function renderFruits(container) {
    console.log('renderFruits вызвана, fruits:', fruits?.length);
    
    if (!container) {
        console.error('Контейнер не найден!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!fruits || fruits.length === 0) {
        console.log('Нет фруктов для отображения');
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Загрузка фруктов...</p>';
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
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Фрукты не найдены</p>';
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
        container.appendChild(card);
    });
}

// Отображение фруктов в каталоге с фильтрацией по категориям
function renderCatalogFruits() {
    if (!catalogGrid) {
        console.error('catalogGrid не найден!');
        return;
    }
    
    catalogGrid.innerHTML = '';
    
    if (!fruits || fruits.length === 0) {
        catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Загрузка фруктов...</p>';
        return;
    }
    
    const filtered = fruits.filter(fruit => {
        return catalogCategory === 'all' || fruit.category === catalogCategory;
    });

    if (filtered.length === 0) {
        catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white; padding: 20px;">Фрукты не найдены</p>';
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
        catalogGrid.appendChild(card);
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
    
    showNotification('Добавлено в корзину!', 'success');
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
    // Обновление счетчика в навигации
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        navCartCount.textContent = totalItems;
        navCartCount.style.display = 'block';
    } else {
        navCartCount.style.display = 'none';
    }

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
                    username: user.username,
                    ...userProfile
                }
            })
        });

        const result = await response.json();

        if (result.success) {
            // Очистка корзины
            cart = [];
            saveCart();
            updateCartUI();
            switchPage('home');

            // Показ уведомления
            showNotification('Заказ успешно оформлен!', 'success');
            
            // Вибрация
            try {
                if (tg.HapticFeedback && tg.HapticFeedback.notificationOccurred) {
                    tg.HapticFeedback.notificationOccurred('success');
                }
            } catch (e) {
                // Игнорируем ошибки вибрации
            }
        } else {
            showNotification('Ошибка при оформлении заказа', 'error');
        }
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        showNotification('Ошибка при оформлении заказа', 'error');
    }
}

// Обработчики событий
checkoutBtn.addEventListener('click', checkout);

// Поиск
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFruits(fruitsGrid);
});

// Фильтр по категориям на главной
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderFruits(fruitsGrid);
    });
});

// Фильтр по категориям в каталоге
catalogCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catalogCategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        catalogCategory = btn.dataset.category;
        renderCatalogFruits();
    });
});

// Инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkRegistration();
        loadFruits();
        updateCartUI();
    });
} else {
    checkRegistration();
    loadFruits();
    updateCartUI();
}

// Экспорт функций для использования в onclick
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
