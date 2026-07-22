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
