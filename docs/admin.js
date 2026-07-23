// ========================================
// admin.js — ПОЛНАЯ ЛОГИКА АДМИН-ПАНЕЛИ
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

// ===== ЗАГРУЗКА СТРАНИЦ =====
function loadPage(page) {
    currentPage = page;
    const container = document.getElementById('page-container');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    const titles = {
        dashboard: '📊 ТЕРМИНАЛ УПРАВЛЕНИЯ',
        hwid: '🛡️ БЛОКИРОВКА HWID',
        bans: '⚖️ СИСТЕМА НАКАЗАНИЙ',
        staff: '👥 УПРАВЛЕНИЕ ПЕРСОНАЛОМ',
        finance: '💰 ФИНАНСЫ',
        reports: '📋 ЖАЛОБЫ ИГРОКОВ',
        content: '🏗️ КОНСТРУКТОР ГЛАВНОЙ СТРАНИЦЫ',
        analytics: '📈 ГЛУБОКАЯ АНАЛИТИКА',
        profile: '👤 ДОСЬЕ БЕЗОПАСНОСТИ',
        calendar: '📅 ПЛАНИРОВЩИК ЖИЗНИ СЕРВЕРА',
        integrations: '🔗 ИНТЕГРАЦИИ',
        tech: '🖥️ ТЕХНИЧЕСКИЙ ХАБ',
        announcements: '📢 ГЛОБАЛЬНЫЕ АНОНСЫ',
        performance: '📊 МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ',
        knowledge: '📚 БАЗА ЗНАНИЙ',
        security: '⚙️ НАСТРОЙКИ БЕЗОПАСНОСТИ'
    };
    document.getElementById('page-title').textContent = titles[page] || 'АДМИН-ПАНЕЛЬ';

    container.innerHTML = '<div class="loading-terminal">ЗАГРУЗКА ТЕРМИНАЛА</div>';

    // 🔥 ПРОСТО ЗАГРУЖАЕМ ПО ИМЕНИ ФАЙЛА (ВСЕ В КОРНЕ)
    fetch(`${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Страница не найдена');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            console.log(`✅ Страница ${page} загружена`);
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            container.innerHTML = `
                <div class="admin-card">
                    <div class="card-title">⚠️ ОШИБКА ЗАГРУЗКИ</div>
                    <div style="padding:40px 20px;text-align:center;color:var(--admin-text);opacity:0.5;">
                        Файл ${page}.html не найден<br>
                        <span style="font-size:0.7em;">Проверь, что файл существует в папке docs/</span>
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

    if (confirm(`⚠️ ВЫ УВЕРЕНЫ?\n\nБлокировка HWID\nПричина: ${reason}\nСрок: ${durationText}`)) {
        showNotification('✅ HWID УСПЕШНО ЗАБЛОКИРОВАН!', 'success');
        addAdminLog(`HWID-бан (${reason})`);
        if (document.getElementById('hwid-comment')) {
            document.getElementById('hwid-comment').value = '';
        }
    }
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
    if (confirm(`📢 Отправить анонс?\n\n"${text}"`)) {
        alert('✅ Анонс отправлен!');
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
    if (!name || !time) {
        alert('❌ Заполните все поля');
        return;
    }
    alert('✅ Событие добавлено!');
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
        alert('❌ Заполните заголовок и текст');
        return;
    }
    alert('✅ Новость опубликована!');
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
        'help': 'Доступные команды: help, status, reload, clear',
        'status': 'Статус: ✅ Работает | Онлайн: 27 игроков',
        'reload': '🔄 Перезагрузка... ✅ Готово!',
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
            output.innerHTML = `<div style="color:#666;">$ Консоль очищена</div>`;
        }, 100);
    }
    addAdminLog(`Консоль: ${cmd}`);
}

function confirmSoftReload() {
    if (confirm('⚠️ ПЕРВОЕ ПОДТВЕРЖДЕНИЕ: Перезагрузить плагины?')) {
        if (confirm('⚠️ ВТОРОЕ ПОДТВЕРЖДЕНИЕ: Продолжить?')) {
            alert('✅ Плагины перезагружены!');
            addAdminLog('Мягкая перезагрузка плагинов');
        }
    }
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

// ===== СТИЛИ =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .admin-notif {
        animation: slideIn 0.3s ease forwards;
        pointer-events: all;
        border-radius: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
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
