// Простая проверка доступа (в продакшене использовать реальную авторизацию)
const ADMIN_IDS = []; // Добавьте сюда Telegram ID администраторов

// Переключение вкладок
function switchTab(tab) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById(tab + 'Section').classList.add('active');
    event.target.classList.add('active');
}

// Загрузка фруктов
async function loadFruits() {
    try {
        const response = await fetch('/api/fruits');
        const fruits = await response.json();
        renderFruitsTable(fruits);
    } catch (error) {
        console.error('Ошибка загрузки фруктов:', error);
    }
}

// Отображение таблицы фруктов
function renderFruitsTable(fruits) {
    const tbody = document.getElementById('fruitsTableBody');
    tbody.innerHTML = fruits.map(fruit => `
        <tr>
            <td>${fruit.id}</td>
            <td>${fruit.image} ${fruit.name}</td>
            <td>${fruit.price} ₽</td>
            <td>${getCategoryName(fruit.category)}</td>
            <td>
                <button class="btn-small btn-edit" onclick="editFruit(${fruit.id})">✏️</button>
                <button class="btn-small btn-delete" onclick="deleteFruit(${fruit.id})">❌</button>
            </td>
        </tr>
    `).join('');
}

// Получение названия категории
function getCategoryName(category) {
    const names = {
        'apples': 'Яблоки',
        'citrus': 'Цитрусовые',
        'berries': 'Ягоды',
        'exotic': 'Экзотика'
    };
    return names[category] || category;
}

// Добавление фрукта
document.getElementById('addFruitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fruit = {
        name: document.getElementById('fruitName').value,
        price: parseFloat(document.getElementById('fruitPrice').value),
        category: document.getElementById('fruitCategory').value,
        description: document.getElementById('fruitDescription').value,
        unit: document.getElementById('fruitUnit').value,
        image: '🍎' // По умолчанию
    };
    
    try {
        const response = await fetch('/api/fruits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fruit)
        });
        
        if (response.ok) {
            alert('Фрукт добавлен!');
            document.getElementById('addFruitForm').reset();
            loadFruits();
        }
    } catch (error) {
        console.error('Ошибка добавления фрукта:', error);
        alert('Ошибка при добавлении фрукта');
    }
});

// Загрузка заказов
async function loadOrders() {
    // В реальном приложении загружать с сервера
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    renderOrdersTable(orders);
}

// Отображение таблицы заказов
function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Заказов пока нет</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id || 'N/A'}</td>
            <td>${order.user?.first_name || order.user?.name || 'Неизвестно'}</td>
            <td>${order.user?.phone || '-'}</td>
            <td>${order.items?.length || 0} товаров</td>
            <td>${order.total} ₽</td>
            <td>
                <span class="status-badge" style="background: ${getStatusColor(order.status)}">
                    ${order.status || 'Принят'}
                </span>
            </td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="Принят" ${order.status === 'Принят' ? 'selected' : ''}>Принят</option>
                    <option value="Готовится" ${order.status === 'Готовится' ? 'selected' : ''}>Готовится</option>
                    <option value="В пути" ${order.status === 'В пути' ? 'selected' : ''}>В пути</option>
                    <option value="Доставлен" ${order.status === 'Доставлен' ? 'selected' : ''}>Доставлен</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'Принят': '#2196F3',
        'Готовится': '#FF9800',
        'В пути': '#9C27B0',
        'Доставлен': '#4CAF50'
    };
    return colors[status] || '#999';
}

function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

function logout() {
    if (confirm('Выйти из админ-панели?')) {
        window.location.href = '/';
    }
}

// Инициализация
loadFruits();
loadOrders();
