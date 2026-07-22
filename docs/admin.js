// ========================================
// admin.js — ПОЛНАЯ ЛОГИКА АДМИН-ПАНЕЛИ (С ЗАГРУЗКОЙ СТРАНИЦ)
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

// ===== ЗАГРУЗКА СТРАНИЦ (ЧЕРЕЗ FETCH) =====
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

    // Загружаем HTML-файл из папки admin-pages
    fetch(`admin-pages/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Страница не найдена');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            // Вызываем инициализацию скриптов на странице, если они есть
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
                        <span style="font-size:0.7em;">Убедитесь, что файл admin-pages/${page}.html существует</span>
                    </div>
                </div>
            `;
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

// ===== ГЛОБАЛЬНЫЕ СТИЛИ =====
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
        bar.style.display = 'none';
        return;
    }
    bar.innerHTML = `⚠️ ${text.toUpperCase()} <button class="emergency-close" onclick="emergencyMessage()">✕</button>`;
    bar.style.display = 'block';
    addAdminLog(`Экстренное оповещение: ${text}`);
};

console.log('✅ Админ-панель загружена');
