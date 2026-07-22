// ========================================
// admin.js — ЛОГИКА АДМИН-ПАНЕЛИ
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

    // Загружаем контент
    container.innerHTML = '<div class="loading-terminal">ЗАГРУЗКА ТЕРМИНАЛА</div>';

    // Имитация загрузки
    setTimeout(() => {
        switch(page) {
            case 'dashboard': renderDashboard(container); break;
            case 'hwid': renderHWID(container); break;
            case 'bans': renderBans(container); break;
            case 'staff': renderStaff(container); break;
            case 'finance': renderFinance(container); break;
            case 'reports': renderReports(container); break;
            default: renderDefault(container, page);
        }
    }, 500);
}

// ===== СТРАНИЦА: ДАШБОРД =====
function renderDashboard(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-block">
                <div class="label">👥 Онлайн сейчас</div>
                <div class="value gold" id="online-now">${Math.floor(Math.random()*30+5)}</div>
            </div>
            <div class="stat-block">
                <div class="label">📈 Пик за сутки</div>
                <div class="value" id="peak-today">${Math.floor(Math.random()*50+20)}</div>
            </div>
            <div class="stat-block">
                <div class="label">📊 Посещаемость (30 дн)</div>
                <div class="value" id="visits-30d">${Math.floor(Math.random()*500+200)}</div>
            </div>
            <div class="stat-block">
                <div class="label">💻 Нагрузка CPU</div>
                <div class="value" id="cpu-load">${Math.floor(Math.random()*40+10)}%</div>
            </div>
            <div class="stat-block">
                <div class="label">🧠 RAM использование</div>
                <div class="value" id="ram-usage">${Math.floor(Math.random()*60+20)}%</div>
            </div>
            <div class="stat-block">
                <div class="label">🌐 Сетевой трафик</div>
                <div class="value" id="network-traffic">${Math.floor(Math.random()*100+50)} пак/с</div>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">🌡️ Тепловая карта посещаемости (30 дней)</div>
            <div class="chart-container" id="heatmap">
                ${[40,25,15,30,70,95,60,45,55,85,65,35,20,50,75,90,45,60,80,55,30,70,85,40].map((h,i) => `
                    <div class="chart-bar ${h>70?'active':h<20?'danger':''}" style="height:${h}%;">
                        <span class="label">${['00','02','04','06','08','10','12','14','16','18','20','22'][i%12]||''}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 Последние события</div>
            <table class="admin-table">
                <thead><tr><th>Время</th><th>Событие</th><th>Игрок</th><th>Статус</th></tr></thead>
                <tbody>
                    <tr><td>15:32:21</td><td>🚫 Бан</td><td>pley1657</td><td><span style="color:#1a6a1a;">Выполнено</span></td></tr>
                    <tr><td>14:15:03</td><td>📝 Регистрация</td><td>new_player</td><td><span style="color:#b8860b;">Ожидает</span></td></tr>
                    <tr><td>13:48:12</td><td>💬 Мут</td><td>spammer_99</td><td><span style="color:#1a6a1a;">Выполнено</span></td></tr>
                    <tr><td>12:30:45</td><td>🛡️ HWID-бан</td><td>hacker_1337</td><td><span style="color:#8b0000;">Заблокирован</span></td></tr>
                </tbody>
            </table>
        </div>
    `;
}

// ===== СТРАНИЦА: HWID-БАН =====
function renderHWID(container) {
    container.innerHTML = `
        <div class="hwid-section">
            <div class="hwid-header">
                <span class="hwid-icon">🛡️</span>
                <h2>БЛОКИРОВКА HWID</h2>
                <span class="hwid-sub">Аппаратная блокировка компьютера</span>
            </div>

            <div class="hwid-profile">
                <div class="avatar">⛏️</div>
                <div class="info">
                    <div class="name">pley1657</div>
                    <div class="uuid">UUID: 30a71527-9a29-3892-9391-14be43ce85d2</div>
                    <div class="hwid">HWID: 7F3A-9B2C-4D8E-1F5A-6B3C</div>
                </div>
            </div>

            <div class="admin-card" style="margin-bottom:16px;">
                <div class="card-title">🔍 Поиск игрока</div>
                <input class="admin-input" placeholder="Введите ник для поиска..." id="hwid-search" oninput="searchHWID(this.value)">
                <div id="hwid-results" style="margin-top:12px;"></div>
            </div>

            <div class="admin-card">
                <div class="card-title">⚙️ Параметры блокировки</div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <div>
                        <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Причина</label>
                        <select class="admin-select" id="hwid-reason">
                            <option value="chips">🎯 Использование читов</option>
                            <option value="dupe">🔄 Использование дюпов</option>
                            <option value="grief">🔨 Гриферство</option>
                            <option value="ddos">💥 DDoS-атака</option>
                            <option value="multihack">👥 Мультиаккаунтинг</option>
                            <option value="other">❓ Другое</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Срок блокировки</label>
                        <select class="admin-select" id="hwid-duration">
                            <option value="permanent">🔒 НАВСЕГДА</option>
                            <option value="30d">📅 30 дней</option>
                            <option value="90d">📅 90 дней</option>
                            <option value="180d">📅 180 дней</option>
                            <option value="365d">📅 365 дней</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Комментарий (виден только админам)</label>
                    <textarea class="admin-textarea" id="hwid-comment" rows="3" placeholder="Подробности блокировки..."></textarea>
                </div>

                <div class="hwid-warning">
                    ⚠️ Это действие необратимо! Игрок не сможет зайти даже с новым аккаунтом.
                </div>

                <div class="hwid-actions">
                    <button class="admin-btn danger" onclick="confirmHWIDBan()">🔒 ЗАБЛОКИРОВАТЬ HWID</button>
                    <button class="admin-btn" onclick="document.getElementById('hwid-comment').value=''">◻ ОЧИСТИТЬ</button>
                </div>
            </div>

            <div class="admin-card">
                <div class="card-title">🔒 Заблокированные HWID</div>
                <table class="admin-table">
                    <thead><tr><th>Игрок</th><th>HWID</th><th>Причина</th><th>Срок</th><th>Осталось</th><th>Действия</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>pley1657</td>
                            <td style="font-family:monospace;font-size:0.8em;">7F3A-9B2C-4D8E-1F5A-6B3C</td>
                            <td>Использование читов</td>
                            <td style="color:#8b0000;">🔒 Навсегда</td>
                            <td>♾️ Бессрочно</td>
                            <td><button class="admin-btn admin-btn-sm danger" onclick="unbanHWID()">🔓 Снять</button></td>
                        </tr>
                        <tr>
                            <td>test_hacker</td>
                            <td style="font-family:monospace;font-size:0.8em;">1A2B-3C4D-5E6F-7G8H-9I0J</td>
                            <td>DDoS-атака</td>
                            <td style="color:#b8860b;">📅 30 дней</td>
                            <td>12д 5ч</td>
                            <td><button class="admin-btn admin-btn-sm danger" onclick="unbanHWID()">🔓 Снять</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ===== ФУНКЦИИ HWID =====
function confirmHWIDBan() {
    const reason = document.getElementById('hwid-reason').value;
    const comment = document.getElementById('hwid-comment').value || 'Без комментария';
    const duration = document.getElementById('hwid-duration').value;
    const durationText = duration === 'permanent' ? 'НАВСЕГДА' : duration;

    if (confirm(`⚠️ ВЫ УВЕРЕНЫ?\n\nБлокировка HWID для pley1657\nПричина: ${reason}\nСрок: ${durationText}\nКомментарий: ${comment}`)) {
        showNotification('✅ HWID УСПЕШНО ЗАБЛОКИРОВАН!', 'success');
        addAdminLog('HWID-бан', 'pley1657', reason, duration);
        document.getElementById('hwid-comment').value = '';
        // Обновляем таблицу
        const rows = document.querySelector('#hwid-section table tbody');
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
    document.getElementById('hwid-search').value = nick;
    document.getElementById('hwid-results').innerHTML = '';
    showNotification(`👤 Выбран игрок: ${nick}`, 'info');
}

// ===== СТРАНИЦА: БАНЫ =====
function renderBans(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">🚫 БАН АККАУНТА</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Ник игрока</label>
                    <input class="admin-input" placeholder="Введите ник..." id="ban-nick">
                </div>
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Причина</label>
                    <select class="admin-select" id="ban-reason">
                        <option value="Читы">🎯 Читы</option>
                        <option value="Оскорбления">💬 Оскорбления</option>
                        <option value="Спам">📢 Спам</option>
                        <option value="Гриферство">🔨 Гриферство</option>
                        <option value="Дюпы">🔄 Дюпы</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Срок</label>
                    <select class="admin-select" id="ban-duration">
                        <option value="permanent">🔒 Навсегда</option>
                        <option value="1d">📅 1 день</option>
                        <option value="3d">📅 3 дня</option>
                        <option value="7d">📅 7 дней</option>
                        <option value="14d">📅 14 дней</option>
                        <option value="30d">📅 30 дней</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:16px;display:flex;gap:12px;">
                <button class="admin-btn danger" onclick="executeBan()">🚫 ВЫДАТЬ БАН</button>
                <button class="admin-btn" onclick="document.getElementById('ban-nick').value=''">◻ ОЧИСТИТЬ</button>
                <span style="margin-left:auto;font-size:0.7em;color:var(--admin-text);opacity:0.3;">
                    ⚡ Режим: РЕАЛЬНОЕ ВРЕМЯ
                </span>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 Активные баны</div>
            <table class="admin-table">
                <thead><tr><th>Игрок</th><th>Причина</th><th>Срок</th><th>Осталось</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>
                    <tr>
                        <td>pley1657</td>
                        <td>Читы</td>
                        <td>7 дней</td>
                        <td>5д 3ч</td>
                        <td style="color:#8b0000;">🔒 Активен</td>
                        <td><button class="admin-btn admin-btn-sm" onclick="unbanPlayer()">🔓 Снять</button></td>
                    </tr>
                    <tr>
                        <td>spammer_99</td>
                        <td>Спам</td>
                        <td>1 день</td>
                        <td>12ч 45м</td>
                        <td style="color:#8b0000;">🔒 Активен</td>
                        <td><button class="admin-btn admin-btn-sm" onclick="unbanPlayer()">🔓 Снять</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="admin-card">
            <div class="card-title">🌐 IP-БАНЫ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                    <input class="admin-input" placeholder="Введите IP-адрес..." id="ip-ban-input">
                </div>
                <div>
                    <select class="admin-select" id="ip-ban-reason">
                        <option value="VPN">🔀 VPN/Прокси</option>
                        <option value="DDoS">💥 DDoS-атака</option>
                        <option value="Multi">👥 Мультиаккаунтинг</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:12px;">
                <button class="admin-btn danger" onclick="executeIPBan()">🌐 ЗАБЛОКИРОВАТЬ IP</button>
                <button class="admin-btn" onclick="document.getElementById('ip-ban-input').value=''">◻ ОЧИСТИТЬ</button>
            </div>
        </div>
    `;
}

// ===== СТРАНИЦА: ПЕРСОНАЛ =====
function renderStaff(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">👥 УПРАВЛЕНИЕ ПЕРСОНАЛОМ</div>
            <table class="admin-table">
                <thead><tr><th>Имя</th><th>Роль</th><th>Права</th><th>Последняя активность</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>
                    <tr>
                        <td>Grif_Mo</td>
                        <td style="color:#b8860b;">👑 Владелец</td>
                        <td>Полный доступ</td>
                        <td>15:32:21</td>
                        <td style="color:#1a6a1a;">🟢 Онлайн</td>
                        <td><button class="admin-btn admin-btn-sm">✏️</button></td>
                    </tr>
                    <tr>
                        <td>pley1657</td>
                        <td style="color:#1a6a1a;">🛡️ Модератор</td>
                        <td>Баны, Муты, Телепорт</td>
                        <td>14:15:03</td>
                        <td style="color:#1a6a1a;">🟢 Онлайн</td>
                        <td><button class="admin-btn admin-btn-sm danger" onclick="deactivateStaff()">🔒</button></td>
                    </tr>
                    <tr>
                        <td>helper_01</td>
                        <td style="color:#b8860b;">🤝 Хелпер</td>
                        <td>Только чат</td>
                        <td>12:30:45</td>
                        <td style="color:#8b0000;">🔴 Офлайн</td>
                        <td><button class="admin-btn admin-btn-sm danger" onclick="deactivateStaff()">🔒</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="admin-card">
            <div class="card-title">➕ ДОБАВИТЬ СОТРУДНИКА</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <input class="admin-input" placeholder="Telegram ID">
                <select class="admin-select">
                    <option>Хелпер</option>
                    <option>Модератор</option>
                    <option>Главный инженер</option>
                </select>
                <button class="admin-btn gold">👥 ДОБАВИТЬ</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 ЛОГ ДЕЙСТВИЙ ПЕРСОНАЛА</div>
            <table class="admin-table">
                <thead><tr><th>Время</th><th>Сотрудник</th><th>Действие</th><th>Цель</th></tr></thead>
                <tbody>
                    <tr><td>15:32:21</td><td>pley1657</td><td>🚫 Бан</td><td>hacker_1337</td></tr>
                    <tr><td>14:15:03</td><td>Grif_Mo</td><td>🛡️ HWID-бан</td><td>cheater_99</td></tr>
                    <tr><td>13:48:12</td><td>pley1657</td><td>💬 Мут</td><td>spammer_01</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

// ===== СТРАНИЦА: ФИНАНСЫ =====
function renderFinance(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-block">
                <div class="label">💰 Баланс доната</div>
                <div class="value gold">$1,247.50</div>
            </div>
            <div class="stat-block">
                <div class="label">📊 Транзакций за месяц</div>
                <div class="value">156</div>
            </div>
            <div class="stat-block">
                <div class="label">📈 Прибыль за месяц</div>
                <div class="value success">+12.4%</div>
            </div>
            <div class="stat-block">
                <div class="label">🎟️ Активных купонов</div>
                <div class="value gold">8</div>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 ТРАНЗАКЦИИ</div>
            <table class="admin-table">
                <thead><tr><th>ID</th><th>Игрок</th><th>Сумма</th><th>Привилегия</th><th>Дата</th><th>Статус</th></tr></thead>
                <tbody>
                    <tr><td>#1284</td><td>pley1657</td><td style="color:#1a6a1a;">$25.00</td><td>VIP</td><td>22.07.2026 15:30</td><td style="color:#1a6a1a;">✅ Успешно</td></tr>
                    <tr><td>#1283</td><td>test_user</td><td style="color:#1a6a1a;">$10.00</td><td>Премиум</td><td>22.07.2026 14:20</td><td style="color:#1a6a1a;">✅ Успешно</td></tr>
                    <tr><td>#1282</td><td>hacker_1337</td><td style="color:#8b0000;">$50.00</td><td>VIP+</td><td>22.07.2026 12:15</td><td style="color:#8b0000;">❌ Отменён</td></tr>
                </tbody>
            </table>
        </div>

        <div class="admin-card">
            <div class="card-title">💳 РУЧНАЯ КОМПЕНСАЦИЯ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <input class="admin-input" placeholder="Ник игрока">
                <input class="admin-input" placeholder="Сумма (USD)" type="number">
                <input class="admin-input" placeholder="Причина компенсации">
            </div>
            <div style="margin-top:12px;">
                <button class="admin-btn gold">💰 ВЫДАТЬ КОМПЕНСАЦИЮ</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">🎟️ СОЗДАТЬ КУПОН</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;">
                <input class="admin-input" placeholder="Код купона" value="GRIFMC2026">
                <input class="admin-input" placeholder="Скидка %" type="number" value="20">
                <input class="admin-input" placeholder="Дата истечения" value="31.08.2026">
                <button class="admin-btn gold">🎟️ СОЗДАТЬ</button>
            </div>
        </div>
    `;
}

// ===== СТРАНИЦА: ЖАЛОБЫ =====
function renderReports(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">📋 ВХОДЯЩИЕ ЖАЛОБЫ <span style="color:#8b0000;font-size:0.8em;">● 3 новых</span></div>
            <table class="admin-table">
                <thead><tr><th>ID</th><th>Игрок</th><th>Нарушитель</th><th>Причина</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>
                    <tr>
                        <td>#R-001</td>
                        <td>new_player</td>
                        <td>hacker_1337</td>
                        <td>Использование читов</td>
                        <td style="color:#0066cc;">🔵 Новая</td>
                        <td>
                            <button class="admin-btn admin-btn-sm gold">📋 Взять</button>
                            <button class="admin-btn admin-btn-sm">📹 Видео</button>
                        </td>
                    </tr>
                    <tr>
                        <td>#R-002</td>
                        <td>pley1657</td>
                        <td>spammer_99</td>
                        <td>Спам в чате</td>
                        <td style="color:#b8860b;">🟡 Изучается</td>
                        <td>
                            <button class="admin-btn admin-btn-sm success">✅ Закрыть</button>
                            <button class="admin-btn admin-btn-sm">📹 Видео</button>
                        </td>
                    </tr>
                    <tr>
                        <td>#R-003</td>
                        <td>test_user</td>
                        <td>griefer_01</td>
                        <td>Гриферство</td>
                        <td style="color:#0066cc;">🔵 Новая</td>
                        <td>
                            <button class="admin-btn admin-btn-sm gold">📋 Взять</button>
                            <button class="admin-btn admin-btn-sm">📹 Видео</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ===== ОБЩИЕ ФУНКЦИИ =====
function executeBan() {
    const nick = document.getElementById('ban-nick')?.value || 'pley1657';
    const reason = document.getElementById('ban-reason')?.value || 'Нарушение';
    const duration = document.getElementById('ban-duration')?.value || 'permanent';
    const durationText = duration === 'permanent' ? 'Навсегда' : duration;
    
    if (confirm(`⚠️ Выдать бан для ${nick}?\nПричина: ${reason}\nСрок: ${durationText}`)) {
        showNotification(`✅ ${nick} забанен на ${durationText}`, 'success');
        addAdminLog(`Бан: ${nick}`, reason, duration);
    }
}

function executeIPBan() {
    const ip = document.getElementById('ip-ban-input')?.value || '192.168.1.1';
    if (confirm(`🌐 Заблокировать IP: ${ip}?`)) {
        showNotification(`✅ IP ${ip} заблокирован`, 'success');
        addAdminLog(`IP-бан: ${ip}`);
        document.getElementById('ip-ban-input').value = '';
    }
}

function unbanPlayer() {
    if (confirm('🔓 Снять бан?')) {
        showNotification('✅ Бан снят', 'success');
        addAdminLog('Анбан');
    }
}

function deactivateStaff() {
    if (confirm('⚠️ Деактивировать права сотрудника?')) {
        showNotification('✅ Права отозваны', 'success');
        addAdminLog('Деактивация прав сотрудника');
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

// ===== ЛОГИ =====
function addAdminLog(action, ...details) {
    const log = {
        timestamp: new Date().toISOString(),
        action: action,
        details: details.join(' | ')
    };
    console.log('[ADMIN LOG]', log);
    // Сохраняем в localStorage для демонстрации
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

    // Вход по Enter в поле пароля
    document.getElementById('admin-password').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkAdminPassword();
    });

    // Если уже залогинены
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('admin-gear').style.display = 'none';
        document.getElementById('admin-sidebar').style.display = 'flex';
        document.getElementById('admin-main').style.display = 'block';
        loadPage('dashboard');
    }
});

// ===== ГЛОБАЛЬНЫЕ СТИЛИ ДЛЯ НОТИФИКАЦИЙ =====
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

// ===== ДОПОЛНИТЕЛЬНЫЕ СТРАНИЦЫ (ЗАГЛУШКИ) =====
function renderDefault(container, page) {
    const titles = {
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
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">${titles[page] || 'СТРАНИЦА В РАЗРАБОТКЕ'}</div>
            <div style="padding:40px 20px;text-align:center;color:var(--admin-text);opacity:0.3;font-size:0.9em;letter-spacing:0.1em;">
                ⚙️ ТЕРМИНАЛ НАСТРАИВАЕТСЯ<br>
                <span style="font-size:0.7em;opacity:0.5;">Модуль "${page}" будет доступен в следующем обновлении</span>
            </div>
        </div>
    `;
}

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
// ========================================
// admin.js — ПОЛНАЯ ЛОГИКА АДМИН-ПАНЕЛИ
// ВСЕ СТРАНИЦЫ
// ========================================

// ... (предыдущий код остаётся)

// ===== СТРАНИЦА: ТЕХНИЧЕСКИЙ ХАБ =====
function renderTech(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">🖥️ ВИРТУАЛЬНАЯ КОНСОЛЬ SSH</div>
            <div style="background:#000;border:1px solid var(--admin-border);padding:16px;font-family:'Courier New',monospace;font-size:0.85em;color:#33ff33;min-height:200px;overflow-y:auto;" id="console-output">
                <div>$ GRIFMC-SERVER:~ administrator$ <span style="color:#aaa;">Добро пожаловать в терминал управления</span></div>
                <div style="color:#666;">$ uptime</div>
                <div style="color:#aaa;"> 22:30:15 up 12 days, 4:32, 1 user, load average: 0.45, 0.32, 0.28</div>
                <div style="color:#666;">$ free -h</div>
                <div style="color:#aaa;">               total        used        free      shared  buff/cache   available</div>
                <div style="color:#aaa;">Mem:           7.8G        4.2G        1.1G        256M        2.5G        3.0G</div>
                <div style="color:#666;">$ <span id="console-cursor" style="background:#33ff33;display:inline-block;width:8px;height:16px;animation:blink 1s step-end infinite;"></span></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <input class="admin-input" id="console-input" placeholder="Введите команду..." style="flex:1;font-family:'Courier New',monospace;font-size:0.85em;" onkeydown="if(event.key==='Enter') executeCommand()">
                <button class="admin-btn" onclick="executeCommand()">⏎ Выполнить</button>
                <button class="admin-btn danger" onclick="document.getElementById('console-output').innerHTML=''">🗑️ Очистить</button>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div class="admin-card">
                <div class="card-title">💾 ИНДИКАТОРЫ БЭКАПОВ</div>
                <div style="padding:8px 0;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">📅 Последнее сохранение</span>
                    <span style="color:var(--admin-text-light);">22.07.2026 22:15:32</span>
                </div>
                <div style="padding:8px 0;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">💽 Объём хранилища</span>
                    <span style="color:var(--admin-text-light);">4.2 ГБ / 10 ГБ (42%)</span>
                </div>
                <div style="padding:8px 0;display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">📋 Количество бэкапов</span>
                    <span style="color:var(--admin-text-light);">8</span>
                </div>
                <div style="margin-top:12px;display:flex;gap:8px;">
                    <button class="admin-btn gold" onclick="alert('Создание бэкапа запущено')">💾 СОЗДАТЬ БЭКАП</button>
                    <button class="admin-btn" onclick="alert('Список бэкапов загружен')">📋 СПИСОК</button>
                </div>
            </div>

            <div class="admin-card">
                <div class="card-title">🔌 МОНИТОРИНГ ПОРТОВ</div>
                <div style="padding:8px 0;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">🌐 25565 (Minecraft)</span>
                    <span style="color:#1a6a1a;">🟢 Открыт</span>
                </div>
                <div style="padding:8px 0;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">🔌 25575 (RCON)</span>
                    <span style="color:#1a6a1a;">🟢 Открыт</span>
                </div>
                <div style="padding:8px 0;border-bottom:1px solid var(--admin-border);display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">🌐 80 (HTTP)</span>
                    <span style="color:#1a6a1a;">🟢 Открыт</span>
                </div>
                <div style="padding:8px 0;display:flex;justify-content:space-between;">
                    <span style="color:var(--admin-text);">🔒 443 (HTTPS)</span>
                    <span style="color:#1a6a1a;">🟢 Открыт</span>
                </div>
                <div style="margin-top:12px;">
                    <button class="admin-btn" onclick="alert('Сканирование портов запущено')">🔄 ПРОВЕРИТЬ ВСЕ ПОРТЫ</button>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">⚠️ МЯГКАЯ ПЕРЕЗАГРУЗКА ПЛАГИНОВ</div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                <span style="color:var(--admin-text);font-size:0.9em;">Перезагрузить все плагины без остановки сервера?</span>
                <button class="admin-btn danger" onclick="confirmSoftReload()" style="padding:12px 32px;">🔴 ПЕРЕЗАГРУЗИТЬ</button>
                <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">⚠️ Требует двойного подтверждения</span>
            </div>
        </div>
    `;
}

// ===== СТРАНИЦА: ГЛОБАЛЬНЫЕ АНОНСЫ =====
function renderAnnouncements(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">📢 ГЛОБАЛЬНЫЙ АНОНС</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:12px;">
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Текст анонса</label>
                    <input class="admin-input" id="announce-text" placeholder="Введите сообщение для всех игроков...">
                </div>
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Тип уведомления</label>
                    <select class="admin-select" id="announce-type">
                        <option value="chat">💬 Тихое (чат)</option>
                        <option value="sound">🔊 Громкое (звук)</option>
                        <option value="title">📺 На весь экран</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Таргетинг</label>
                    <select class="admin-select" id="announce-target">
                        <option value="all">🌍 Все игроки</option>
                        <option value="vip">⭐ VIP</option>
                        <option value="staff">👑 Персонал</option>
                        <option value="world">🌎 Конкретный мир</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:12px;">
                <button class="admin-btn gold" onclick="sendAnnouncement()">📢 ОТПРАВИТЬ АНОНС</button>
                <button class="admin-btn" onclick="document.getElementById('announce-text').value=''">◻ ОЧИСТИТЬ</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 ШАБЛОНЫ ФРАЗ</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
                <div style="background:var(--admin-card);border:1px solid var(--admin-border);padding:12px;cursor:pointer;" onclick="document.getElementById('announce-text').value='Добро пожаловать на сервер! Используй /help для помощи.'">
                    <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">🎮 Приветствие</span>
                    <div style="font-size:0.85em;color:var(--admin-text-light);">/help для помощи</div>
                </div>
                <div style="background:var(--admin-card);border:1px solid var(--admin-border);padding:12px;cursor:pointer;" onclick="document.getElementById('announce-text').value='Внимание! Технические работы начнутся через 15 минут. Сохраните прогресс!'">
                    <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">🔧 Техработы</span>
                    <div style="font-size:0.85em;color:var(--admin-text-light);">Через 15 минут</div>
                </div>
                <div style="background:var(--admin-card);border:1px solid var(--admin-border);padding:12px;cursor:pointer;" onclick="document.getElementById('announce-text').value='Стартует турнир! Регистрация в Discord до 20:00.'">
                    <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">⚡ Ивент</span>
                    <div style="font-size:0.85em;color:var(--admin-text-light);">Регистрация до 20:00</div>
                </div>
                <div style="background:var(--admin-card);border:1px solid var(--admin-border);padding:12px;cursor:pointer;" onclick="document.getElementById('announce-text').value='Обновление античита выкачено! Пожалуйста, перезапустите лаунчер.'">
                    <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">🛡️ Безопасность</span>
                    <div style="font-size:0.85em;color:var(--admin-text-light);">Обновление античита</div>
                </div>
            </div>
        </div>
    `;
}

// ===== СТРАНИЦА: МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ =====
function renderPerformance(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-block">
                <div class="label">⚡ TPS (Тики/сек)</div>
                <div class="value gold" id="tps-value">19.8</div>
            </div>
            <div class="stat-block">
                <div class="label">📊 MSPT (мс/тик)</div>
                <div class="value" id="mspt-value">45</div>
            </div>
            <div class="stat-block">
                <div class="label">🧊 Тяжёлых чанков</div>
                <div class="value danger">12</div>
            </div>
            <div class="stat-block">
                <div class="label">🎮 Активных игроков</div>
                <div class="value success">27</div>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📊 ГРАФИК TPS (за последние 30 минут)</div>
            <div class="chart-container" style="height:120px;">
                ${[19,18,20,19,17,16,18,19,20,19,18,17,19,20,19,18,17,16,18,19,20,19,18,17,19,20,19,18,17,16].map((h,i) => `
                    <div class="chart-bar ${h<18?'danger':h>19.5?'active':''}" style="height:${h/20*100}%;">
                        <span class="label">${i%5===0?i+'м':''}</span>
                    </div>
                `).join('')}
            </div>
            <div style="font-size:0.7em;color:var(--admin-text);opacity:0.3;margin-top:8px;">⚡ Зелёный — отлично, ⚠️ Жёлтый — средне, 🔴 Красный — критично</div>
        </div>

        <div class="admin-card">
            <div class="card-title">🧊 ТОП ТЯЖЁЛЫХ ЧАНКОВ</div>
            <table class="admin-table">
                <thead><tr><th>Координаты</th><th>Мир</th><th>Нагрузка</th><th>Сущности</th><th>Действия</th></tr></thead>
                <tbody>
                    <tr>
                        <td>-456, 78</td>
                        <td>world</td>
                        <td style="color:#8b0000;">🔴 94%</td>
                        <td>1,247</td>
                        <td><button class="admin-btn admin-btn-sm" onclick="alert('Чанк анализируется')">🔍</button></td>
                    </tr>
                    <tr>
                        <td>234, -122</td>
                        <td>world_nether</td>
                        <td style="color:#b8860b;">🟡 78%</td>
                        <td>856</td>
                        <td><button class="admin-btn admin-btn-sm" onclick="alert('Чанк анализируется')">🔍</button></td>
                    </tr>
                    <tr>
                        <td>89, 345</td>
                        <td>world</td>
                        <td style="color:#b8860b;">🟡 65%</td>
                        <td>432</td>
                        <td><button class="admin-btn admin-btn-sm" onclick="alert('Чанк анализируется')">🔍</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="admin-card">
            <div class="card-title">🌍 УПРАВЛЕНИЕ ВАРП-ТОЧКАМИ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
                <input class="admin-input" placeholder="Название варпа" value="Spawn">
                <input class="admin-input" placeholder="X" value="0">
                <input class="admin-input" placeholder="Y" value="64">
                <input class="admin-input" placeholder="Z" value="0">
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;">
                <button class="admin-btn gold" onclick="alert('Варп-точка сохранена')">💾 СОХРАНИТЬ</button>
                <button class="admin-btn danger" onclick="alert('Варп-точка удалена')">🗑️ УДАЛИТЬ</button>
            </div>
        </div>
    `;
}

// ===== СТРАНИЦА: БАЗА ЗНАНИЙ =====
function renderKnowledge(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">📚 БАЗА ЗНАНИЙ — ПРЕДМЕТЫ</div>
            <div style="display:flex;gap:8px;margin-bottom:16px;">
                <input class="admin-input" id="item-search" placeholder="Поиск по ID или названию..." style="flex:1;" oninput="searchItems(this.value)">
                <button class="admin-btn" onclick="searchItems(document.getElementById('item-search').value)">🔍</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;" id="items-grid">
                ${[
                    {id: 'minecraft:diamond_sword', name: 'Алмазный меч', icon: '🗡️'},
                    {id: 'minecraft:diamond_pickaxe', name: 'Алмазная кирка', icon: '⛏️'},
                    {id: 'minecraft:diamond_helmet', name: 'Алмазный шлем', icon: '🪖'},
                    {id: 'minecraft:diamond_chestplate', name: 'Алмазный нагрудник', icon: '🛡️'},
                    {id: 'minecraft:diamond_leggings', name: 'Алмазные поножи', icon: '👖'},
                    {id: 'minecraft:diamond_boots', name: 'Алмазные ботинки', icon: '👢'},
                    {id: 'minecraft:totem_of_undying', name: 'Тотем бессмертия', icon: '🧿'},
                    {id: 'minecraft:elytra', name: 'Элитры', icon: '🪶'},
                    {id: 'minecraft:netherite_ingot', name: 'Незеритовый слиток', icon: '🔩'},
                    {id: 'minecraft:enchanted_golden_apple', name: 'Зачарованное золотое яблоко', icon: '🍎'},
                ].map(item => `
                    <div style="background:var(--admin-card);border:1px solid var(--admin-border);padding:12px;text-align:center;cursor:pointer;" onclick="alert('ID: ${item.id}')">
                        <div style="font-size:2em;">${item.icon}</div>
                        <div style="font-size:0.7em;color:var(--admin-text-light);">${item.name}</div>
                        <div style="font-size:0.5em;color:var(--admin-text);opacity:0.3;margin-top:4px;">${item.id}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">🔄 РЕЗЕРВНОЕ КОПИРОВАНИЕ</div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                <span style="color:var(--admin-text);">📦 Скачать конфигурацию сайта</span>
                <button class="admin-btn gold" onclick="alert('Скачивание конфигурации начато')">📥 СКАЧАТЬ</button>
                <span style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">Версия: 3.0.1 | Коммит: a7f3d9e</span>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 ЖУРНАЛ ДЕПЛОЯ</div>
            <table class="admin-table">
                <thead><tr><th>Дата</th><th>Версия</th><th>Автор</th><th>Изменения</th></tr></thead>
                <tbody>
                    <tr>
                        <td>22.07.2026 15:30</td>
                        <td style="color:#1a6a1a;">v3.0.1</td>
                        <td>Grif_Mo</td>
                        <td>Добавлена админ-панель</td>
                    </tr>
                    <tr>
                        <td>20.07.2026 12:15</td>
                        <td style="color:#1a6a1a;">v3.0.0</td>
                        <td>Grif_Mo</td>
                        <td>Полный редизайн сайта</td>
                    </tr>
                    <tr>
                        <td>15.07.2026 09:45</td>
                        <td style="color:#b8860b;">v2.5.0</td>
                        <td>pley1657</td>
                        <td>Добавлена система регистрации</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ===== СТРАНИЦА: НАСТРОЙКИ БЕЗОПАСНОСТИ =====
function renderSecurity(container) {
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-title">⚙️ НАСТРОЙКИ БЕЗОПАСНОСТИ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Автозавершение сессии</label>
                    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--admin-border);">
                        <span style="color:var(--admin-text);">Неактивность более</span>
                        <select class="admin-select" style="width:auto;padding:4px 8px;">
                            <option value="5">5 минут</option>
                            <option value="10" selected>10 минут</option>
                            <option value="30">30 минут</option>
                            <option value="60">1 час</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="font-size:0.7em;text-transform:uppercase;color:var(--admin-text);opacity:0.4;">Подтверждение критических изменений</label>
                    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--admin-border);">
                        <span style="color:var(--admin-text);">Смена IP сервера требует</span>
                        <span style="color:var(--admin-text-light);font-weight:600;">🔒 Мастер-пароль</span>
                    </div>
                </div>
            </div>
            <div style="margin-top:16px;">
                <button class="admin-btn gold" onclick="alert('Настройки безопасности сохранены')">💾 СОХРАНИТЬ НАСТРОЙКИ</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">📋 ЖУРНАЛ АВТОРИЗАЦИЙ</div>
            <table class="admin-table">
                <thead><tr><th>Время</th><th>Пользователь</th><th>IP</th><th>Браузер</th><th>Статус</th></tr></thead>
                <tbody>
                    <tr>
                        <td>22.07 15:32:21</td>
                        <td style="color:#1a6a1a;">Grif_Mo</td>
                        <td>194.85.210.107</td>
                        <td>Chrome 114</td>
                        <td style="color:#1a6a1a;">✅ Успешно</td>
                    </tr>
                    <tr>
                        <td>22.07 14:15:03</td>
                        <td style="color:#b8860b;">pley1657</td>
                        <td>192.168.1.100</td>
                        <td>Firefox 115</td>
                        <td style="color:#1a6a1a;">✅ Успешно</td>
                    </tr>
                    <tr>
                        <td>22.07 12:30:45</td>
                        <td style="color:#8b0000;">unknown</td>
                        <td>10.0.0.5</td>
                        <td>Edge 114</td>
                        <td style="color:#8b0000;">❌ Отклонён</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="admin-card">
            <div class="card-title">🔒 СМЕНА МАСТЕР-ПАРОЛЯ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                <input class="admin-input" type="password" placeholder="Текущий пароль">
                <input class="admin-input" type="password" placeholder="Новый пароль">
                <input class="admin-input" type="password" placeholder="Подтвердить пароль">
            </div>
            <div style="margin-top:12px;">
                <button class="admin-btn gold" onclick="alert('Пароль успешно изменён')">🔒 СМЕНИТЬ ПАРОЛЬ</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="card-title">🔄 ОБНОВЛЕНИЯ СИСТЕМЫ</div>
            <div style="display:flex;align-items:center;gap:12px;">
                <span style="color:var(--admin-text);">Доступно обновление безопасности</span>
                <span style="color:#b8860b;font-weight:600;">⚠️ Версия 3.0.2</span>
                <button class="admin-btn gold" onclick="alert('Обновление установлено')">⬆️ УСТАНОВИТЬ</button>
                <span style="margin-left:auto;font-size:0.7em;color:var(--admin-text);opacity:0.3;">Последняя проверка: 22.07.2026 22:00</span>
            </div>
        </div>
    `;
}

// ========================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

// ===== КОНСОЛЬ =====
function executeCommand() {
    const input = document.getElementById('console-input');
    const output = document.getElementById('console-output');
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

// ===== АНОНСЫ =====
function sendAnnouncement() {
    const text = document.getElementById('announce-text').value.trim();
    if (!text) {
        alert('❌ Введите текст анонса');
        return;
    }
    const type = document.getElementById('announce-type').value;
    const target = document.getElementById('announce-target').value;
    
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
    
    if (confirm(`📢 Отправить анонс?\n\nТекст: "${text}"\nТип: ${typeNames[type]}\nТаргетинг: ${targetNames[target]}`)) {
        alert('✅ Анонс отправлен успешно!');
        addAdminLog(`Анонс: ${text} (${typeNames[type]})`);
        document.getElementById('announce-text').value = '';
        // Добавляем в список недавних анонсов
        const list = document.querySelector('.admin-card:last-child .admin-table tbody');
        if (list) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date().toLocaleString()}</td>
                <td>Grif_Mo</td>
                <td style="color:#1a6a1a;">${typeNames[type]}</td>
                <td style="color:var(--admin-text-light);">${text.length > 30 ? text.substring(0,30)+'...' : text}</td>
            `;
            list.prepend(row);
        }
    }
}

// ===== СОБЫТИЯ =====
function addEvent() {
    const name = document.getElementById('event-name').value.trim();
    const time = document.getElementById('event-time').value;
    const type = document.getElementById('event-type').value;
    
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
    const eventDiv = document.createElement('div');
    eventDiv.style.cssText = `background:var(--admin-card);border:1px solid var(--admin-border);padding:16px;border-left:3px solid ${colors[type]};`;
    eventDiv.innerHTML = `
        <div style="font-size:0.7em;color:var(--admin-text);opacity:0.3;">${new Date(time).toLocaleString()}</div>
        <div style="font-weight:700;color:var(--admin-text-light);">${typeNames[type]} ${name}</div>
        <div style="font-size:0.7em;color:var(--admin-text);opacity:0.5;">⏳ Добавлено только что</div>
    `;
    list.prepend(eventDiv);
    
    alert('✅ Событие добавлено в календарь!');
    addAdminLog(`Событие: ${name} (${typeNames[type]})`);
    document.getElementById('event-name').value = '';
}

// ===== МЯГКАЯ ПЕРЕЗАГРУЗКА =====
function confirmSoftReload() {
    if (confirm('⚠️ ПЕРВОЕ ПОДТВЕРЖДЕНИЕ: Вы уверены, что хотите перезагрузить все плагины?')) {
        if (confirm('⚠️ ВТОРОЕ ПОДТВЕРЖДЕНИЕ: Перезагрузка плагинов займёт 5-10 секунд. Продолжить?')) {
            alert('🔄 Перезагрузка плагинов запущена...\n\n✅ Плагины успешно перезагружены!');
            addAdminLog('Мягкая перезагрузка плагинов');
        }
    }
}

// ===== ПОИСК ПРЕДМЕТОВ =====
function searchItems(query) {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    const items = grid.querySelectorAll('div[style*="background:var(--admin-card);"]');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ===== ПУБЛИКАЦИЯ НОВОСТЕЙ =====
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

// ========================================
// ОБНОВЛЕНИЕ НАВИГАЦИИ
// ========================================

// Добавляем в функцию loadPage новые страницы
const originalLoadPage = loadPage;
loadPage = function(page) {
    const container = document.getElementById('page-container');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    
    const titles = {
        dashboard: '📊 ТЕРМИНАЛ УПРАВЛЕНИЯ',
        content: '🏗️ КОНСТРУКТОР ГЛАВНОЙ СТРАНИЦЫ',
        analytics: '📈 ГЛУБОКАЯ АНАЛИТИКА',
        staff: '👥 УПРАВЛЕНИЕ ПЕРСОНАЛОМ',
        finance: '💰 ФИНАНСЫ',
        profile: '👤 ДОСЬЕ БЕЗОПАСНОСТИ',
        calendar: '📅 ПЛАНИРОВЩИК ЖИЗНИ СЕРВЕРА',
        integrations: '🔗 ИНТЕГРАЦИИ',
        tech: '🖥️ ΤΕΧΗИЧЕСКИЙ ХАБ',
        bans: '⚖️ СИСТЕМА НАКАЗАНИЙ',
        reports: '📋 ЖАЛОБЫ ИГРОКОВ',
        announcements: '📢 ГЛОБАЛЬНЫЕ АНОНСЫ',
        performance: '📊 МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ',
        knowledge: '📚 БАЗА ЗНАНИЙ',
        hwid: '🛡️ БЛОКИРОВКА HWID',
        security: '⚙️ НАСТРОЙКИ БЕЗОПАСНОСТИ'
    };
    document.getElementById('page-title').textContent = titles[page] || 'АДМИН-ПАНЕЛЬ';
    
    container.innerHTML = '<div class="loading-terminal">ЗАГРУЗКА ТЕРМИНАЛА</div>';
    
    setTimeout(() => {
        switch(page) {
            case 'dashboard': renderDashboard(container); break;
            case 'hwid': renderHWID(container); break;
            case 'bans': renderBans(container); break;
            case 'staff': renderStaff(container); break;
            case 'finance': renderFinance(container); break;
            case 'reports': renderReports(container); break;
            case 'content': renderContent(container); break;
            case 'analytics': renderAnalytics(container); break;
            case 'profile': renderProfile(container); break;
            case 'calendar': renderCalendar(container); break;
            case 'integrations': renderIntegrations(container); break;
            case 'tech': renderTech(container); break;
            case 'announcements': renderAnnouncements(container); break;
            case 'performance': renderPerformance(container); break;
            case 'knowledge': renderKnowledge(container); break;
            case 'security': renderSecurity(container); break;
            default: renderDefault(container, page);
        }
    }, 500);
};

console.log('✅ Админ-панель загружена (все страницы)');
