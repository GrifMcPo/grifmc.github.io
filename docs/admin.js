// ========================================
// admin.js — ПОЛНАЯ ЛОГИКА АДМИН-ПАНЕЛИ
// (ВСЕ ФАЙЛЫ В КОРНЕ)
// ========================================

const ADMIN_PASSWORD = 'grifmcBOT';
let currentPage = 'dashboard';

// ===== ПРОВЕРКА ПАРОЛЯ =====
function checkAdminPassword() {
    const input = document.getElementById('admin-password').value;
    if (input === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('admin-login').classList.remove('active');
        document.getElementById('admin-gear').style.display = 'none';
        document.getElementById('admin-sidebar').style.display = 'flex';
        document.getElementById('admin-main').style.display = 'block';
        loadPage('dashboard');
        showNotification('✅ ДОСТУП РАЗРЕШЁН', 'success');
        addAdminLog('Вход в админ-панель');
    } else {
        document.getElementById('login-error').textContent = '❌ НЕВЕРНЫЙ ПАРОЛЬ';
        addAdminLog('Неудачная попытка входа');
    }
}

// ===== ЗАГРУЗКА СТРАНИЦ (ИЗ КОРНЯ) =====
function loadPage(page) {
    currentPage = page;
    const container = document.getElementById('page-container');
    
    // Обновляем активный пункт меню
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Обновляем заголовок
    const titles = {
        dashboard: '📊 ТЕРМИНАЛ УПРАВЛЕНИЯ',
        content: '🏗️ КОНСТРУКТОР ГЛАВНОЙ СТРАНИЦЫ',
        analytics: '📈 ГЛУБОКАЯ АНАЛИТИКА',
        staff: '👥 УПРАВЛЕНИЕ ПЕРСОНАЛОМ',
        finance: '💰 ФИНАНСЫ',
        profile: '👤 ДОСЬЕ БЕЗОПАСНОСТИ',
        calendar: '📅 ПЛАНИРОВЩИК ЖИЗНИ СЕРВЕРА',
        integrations: '🔗 ИНТЕГРАЦИИ',
        tech: '🖥️ ТЕХНИЧЕСКИЙ ХАБ',
        bans: '⚖️ СИСТЕМА НАКАЗАНИЙ',
        reports: '📋 ЖАЛОБЫ ИГРОКОВ',
        announcements: '📢 ГЛОБАЛЬНЫЕ АНОНСЫ',
        performance: '📊 МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ',
        knowledge: '📚 БАЗА ЗНАНИЙ',
        hwid: '🛡️ БЛОКИРОВКА HWID',
        security: '⚙️ НАСТРОЙКИ БЕЗОПАСНОСТИ'
    };
    document.getElementById('page-title').textContent = titles[page] || 'АДМИН-ПАНЕЛЬ';

    // Показываем загрузку
    container.innerHTML = '<div class="loading-terminal">ЗАГРУЗКА ТЕРМИНАЛА</div>';

    // 🔥 ЗАГРУЖАЕМ ИЗ КОРНЯ (НЕ ИЗ ПАПКИ admin-pages)
    fetch(`${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Страница не найдена');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            // Инициализируем скрипты на странице, если есть
            if (window.initPage && typeof window.initPage === 'function') {
                window.initPage();
            }
            console.log(`✅ Страница ${page} загружена`);
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            container.innerHTML = `
                <div class="admin-card">
                    <div class="card-title">⚠️ ОШИБКА ЗАГРУЗКИ</div>
                    <div style="padding:40px 20px;text-align:center;color:var(--admin-text);opacity:0.5;">
                        Не удалось загрузить страницу "${page}"<br>
                        <span style="font-size:0.7em;">Файл ${page}.html не найден в корневой папке</span>
                    </div>
                </div>
            `;
        });
}

// ===== ФУНКЦИИ ДЛЯ СТРАНИЦ =====

// ===== HWID =====
function confirmHWIDBan() {
    const reason = document.getElementById('hwid-reason')?.value || 'Нарушение';
    const comment = document.getElementById('hwid-comment')?.value || 'Без комментария';
    const duration = document.getElementById('hwid-duration')?.value || 'permanent';
    const durationText = duration === 'permanent' ? 'НАВСЕГДА' : duration;

    if (confirm(`⚠️ ВЫ УВЕРЕНЫ?\n\nБлокировка HWID для pley1657\nПричина: ${reason}\nСрок: ${durationText}\nКомментарий: ${comment}`)) {
        showNotification('✅ HWID УСПЕШНО ЗАБЛОКИРОВАН!', 'success');
        addAdminLog(`HWID-бан: pley1657 (${reason})`);
        if (document.getElementById('hwid-comment')) {
            document.getElementById('hwid-comment').value = '';
        }
        // Обновляем таблицу
        const rows = document.querySelector('.hwid-section table tbody');
        if (rows) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>pley1657</td>
                <td style="font-family:monospace;font-size:0.8em;">7F3A-9B2C-4D8E-1F5A-6B3C</td>
                <td>${reason}</td>
                <td style="color:#8b0000;">🔒 ${durationText}</td>
                <td>${duration === 'permanent' ? '♾️ Бессрочно' : '0д 0ч'}</td>
                <td><button class="admin-btn admin-btn-sm danger" onclick="unbanHWID()">🔓 Снять</button></td>
            `;
            rows.prepend(newRow);
        }
    }
}

function unbanHWID() {
    if (confirm('⚠️ Снять блокировку HWID?')) {
        showNotification('✅ HWID РАЗБЛОКИРОВАН', 'success');
        addAdminLog('HWID-анбан');
    }
}

function searchHWID(query) {
    const results = document.getElementById('hwid-results');
    if (!results) return;
    if (!query || query.length < 2) {
        results.innerHTML = '';
        return;
    }
    results.innerHTML = `
        <div style="padding:8px 12px;border:1px solid var(--admin-border);margin-bottom:4px;cursor:pointer;" onclick="selectHWID('pley1657')">
            ⛏️ pley1657 — HWID: 7F3A-9B2C-4D8E-1F5A-6B3C
        </div>
        <div style="padding:8px 12px;border:1px solid var(--admin-border);margin-bottom:4px;cursor:pointer;" onclick="selectHWID('test_hacker')">
            ⛏️ test_hacker — HWID: 1A2B-3C4D-5E6F-7G8H-9I0J
        </div>
    `;
}

function selectHWID(nick) {
    const search = document.getElementById('hwid-search');
    if (search) search.value = nick;
    const results = document.getElementById('hwid-results');
    if (results) results.innerHTML = '';
    showNotification(`👤 Выбран игрок: ${nick}`, 'info');
}

// ===== БАНЫ =====
function executeBan() {
    const nick = document.getElementById('ban-nick')?.value || 'pley1657';
    const reason = document.getElementById('ban-reason')?.value || 'Нарушение';
    const duration = document.getElementById('ban-duration')?.value || 'permanent';
    const durationText = duration === 'permanent' ? 'Навсегда' : duration;
    
    if (confirm(`⚠️ Выдать бан для ${nick}?\nПричина: ${reason}\nСрок: ${durationText}`)) {
        showNotification(`✅ ${nick} забанен на ${durationText}`, 'success');
        addAdminLog(`Бан: ${nick} (${reason})`);
        if (document.getElementById('ban-nick')) {
            document.getElementById('ban-nick').value = '';
        }
    }
}

function executeIPBan() {
    const ip = document.getElementById('ip-ban-input')?.value || '192.168.1.1';
    if (confirm(`🌐 Заблокировать IP: ${ip}?`)) {
        showNotification(`✅ IP ${ip} заблокирован`, 'success');
        addAdminLog(`IP-бан: ${ip}`);
        if (document.getElementById('ip-ban-input')) {
            document.getElementById('ip-ban-input').value = '';
        }
    }
}

function unbanPlayer() {
    if (confirm('🔓 Снять бан?')) {
        showNotification('✅ Бан снят', 'success');
        addAdminLog('Анбан');
    }
}

// ===== ПЕРСОНАЛ =====
function deactivateStaff() {
    if (confirm('⚠️ Деактивировать права сотрудника?')) {
        showNotification('✅ Права отозваны', 'success');
        addAdminLog('Деактивация прав сотрудника');
    }
}

// ===== АНОНСЫ =====
function sendAnnouncement() {
    const text = document.getElementById('announce-text')?.value?.trim();
    if (!text) {
        alert('❌ Введите текст анонса');
        return;
    }
    const type = document.getElementById('announce-type')?.value || 'chat';
    const target = document.getElementById('announce-target')?.value || 'all';
    
    const typeNames = {
        chat: '💬 Тихое',
        sound: '🔊 Громкое',
        title: '📺 На весь экран'
    };
    const targetNames = {
        all: '🌍 Все игроки',
        vip: '⭐ VIP',
        staff: '👑 Персонал',
        world: '🌎 Конкретный мир'
    };
    
    if (confirm(`📢 Отправить анонс?\n\nТекст: "${text}"\nТип: ${typeNames[type] || type}\nТаргетинг: ${targetNames[target] || target}`)) {
        alert('✅ Анонс отправлен успешно!');
        addAdminLog(`Анонс: ${text}`);
        if (document.getElementById('announce-text')) {
            document.getElementById('announce-text').value = '';
        }
    }
}

// ===== СОБЫТИЯ =====
function addEvent() {
    const name = document.getElementById('event-name')?.value?.trim();
    const time = document.getElementById('event-time')?.value;
    const type = document.getElementById('event-type')?.value || 'tournament';
    
    if (!name || !time) {
        alert('❌ Заполните все поля');
        return;
    }
    
    const typeNames = {
        tournament: '🎯 Турнир',
        wipe: '🔄 Вайп',
        holiday: '🎉 Праздник',
        maintenance: '🔧 Техработы'
    };
    
    const colors = {
        tournament: '#b8860b',
        wipe: '#8b0000',
        holiday: '#1a6a1a',
        maintenance: '#b8860b'
    };
    
    const list = document.getElementById('events-list');
    if (list) {
        const eventDiv = document.createElement('div');
        eventDiv.style.cssText = `background:var(--admin-card);border:1px solid var(--admin-border);padding:16px;border-left:3px solid ${colors[type] || '#b8860b'};`;
        eventDiv.innerHTML = `
            <div style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">${new Date(time).toLocaleString()}</div>
            <div style="font-weight:700;color:var(--admin-text-light);">${typeNames[type] || type} ${name}</div>
            <div style="font-size:0.7em;color:var(--admin-text);opacity:0.5;">⏳ Добавлено только что</div>
        `;
        list.prepend(eventDiv);
    }
    
    alert('✅ Событие добавлено в календарь!');
    addAdminLog(`Событие: ${name}`);
    if (document.getElementById('event-name')) {
        document.getElementById('event-name').value = '';
    }
}

// ===== НОВОСТИ =====
function publishNews() {
    const title = document.getElementById('news-title')?.value;
    const body = document.getElementById('news-body')?.value;
    if (!title || !body) {
        alert('❌ Заполните заголовок и текст новости');
        return;
    }
    alert('✅ Новость успешно опубликована!');
    addAdminLog(`Новость: ${title}`);
}

// ===== КОНСОЛЬ =====
function executeCommand() {
    const input = document.getElementById('console-input');
    const output = document.getElementById('console-output');
    if (!input || !output) return;
    
    const cmd = input.value.trim();
    if (!cmd) return;
    
    const responses = {
        'help': 'Доступные команды: help, status, reload, list, backup, clear',
        'status': 'Статус сервера: ✅ Работает | Онлайн: 27 игроков | TPS: 19.8',
        'reload': '🔄 Перезагрузка плагинов... ✅ Готово!',
        'list': 'Активные плагины: Essentials, WorldGuard, LuckPerms, TAB',
        'backup': '💾 Создание бэкапа... ✅ Бэкап сохранён в /backups/backup-20260722-2230.tar.gz',
        'clear': '🗑️ Консоль очищена'
    };
    
    const response = responses[cmd] || `❌ Неизвестная команда: ${cmd}`;
    
    const newLine = document.createElement('div');
    newLine.style.cssText = 'color:#666;';
    newLine.innerHTML = `$ ${cmd}`;
    output.appendChild(newLine);
    
    const respLine = document.createElement('div');
    respLine.style.cssText = 'color:#aaa;padding-left:8px;';
    respLine.textContent = response;
    output.appendChild(respLine);
    
    input.value = '';
    output.scrollTop = output.scrollHeight;
    
    if (cmd === 'clear') {
        setTimeout(() => {
            output.innerHTML = `<div style="color:#666;">$ GRIFMC-SERVER:~ administrator$ <span style="color:#aaa;">Консоль очищена</span></div>`;
            addAdminLog('Консоль очищена');
        }, 100);
    }
    
    addAdminLog(`Консоль: ${cmd}`);
}

function confirmSoftReload() {
    if (confirm('⚠️ ПЕРВОЕ ПОДТВЕРЖДЕНИЕ: Вы уверены, что хотите перезагрузить все плагины?')) {
        if (confirm('⚠️ ВТОРОЕ ПОДТВЕРЖДЕНИЕ: Перезагрузка плагинов займёт 5-10 секунд. Продолжить?')) {
            alert('🔄 Перезагрузка плагинов запущена...\n\n✅ Плагины успешно перезагружены!');
            addAdminLog('Мягкая перезагрузка плагинов');
        }
    }
}

function searchItems(query) {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    const items = grid.querySelectorAll('div[style*="background:var(--admin-card);"]');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message, type = 'info') {
    const container = document.getElementById('admin-notifications') || createNotificationContainer();
    const el = document.createElement('div');
    el.className = `admin-notif ${type}`;
    el.textContent = message;
    el.style.cssText = `
        background: var(--admin-card);
        border: 1px solid ${type === 'success' ? '#1a6a1a' : type === 'danger' ? '#6b0000' : 'var(--admin-border)'};
        color: var(--admin-text-light);
        padding: 12px 20px;
        margin-bottom: 8px;
        font-size: 0.85em;
        letter-spacing: 0.05em;
        animation: slideIn 0.3s ease;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'admin-notifications';
    container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 99999;
        max-width: 340px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
}

// ===== ЛОГИ =====
function addAdminLog(action, ...details) {
    const log = {
        timestamp: new Date().toISOString(),
        action: action,
        details: details.join(' | ')
    };
    console.log('[ADMIN LOG]', log);
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.unshift(log);
    if (logs.length > 100) logs.pop();
    localStorage.setItem('adminLogs', JSON.stringify(logs));
}

// ===== НАВИГАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) loadPage(page);
        });
    });

    document.getElementById('admin-password').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkAdminPassword();
    });

    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('admin-gear').style.display = 'none';
        document.getElementById('admin-sidebar').style.display = 'flex';
        document.getElementById('admin-main').style.display = 'block';
        loadPage('dashboard');
    }
});

// ===== СТИЛИ ДЛЯ НОТИФИКАЦИЙ =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
    .admin-notif {
        animation: slideIn 0.3s ease forwards;
        pointer-events: all;
        cursor: default;
        border-radius: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .admin-notif.removing {
        animation: slideOut 0.3s ease forwards;
    }
`;
document.head.appendChild(style);

// ===== ЭКСТРЕННОЕ ОПОВЕЩЕНИЕ =====
window.emergencyMessage = function(text) {
    const bar = document.getElementById('emergency-bar');
    if (!text) {
        if (bar) bar.style.display = 'none';
        return;
    }
    if (bar) {
        bar.innerHTML = `⚠️ ${text.toUpperCase()} <button class="emergency-close" onclick="emergencyMessage()">✕</button>`;
        bar.style.display = 'block';
    }
    addAdminLog(`Экстренное оповещение: ${text}`);
};

console.log('✅ Админ-панель загружена');
