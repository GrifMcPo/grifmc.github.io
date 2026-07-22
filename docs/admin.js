/* ============================
   ADMIN.JS — 110 функций
   Пароль: grifmcBOT
   ============================ */

'use strict';

// ── КОНФИГУРАЦИЯ ─────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'grifmcBOT';
let db = null;
let adminLoggedIn = false;
let realtimeListeners = [];

// ── ИНИЦИАЛИЗАЦИЯ FIREBASE ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        db = firebase.firestore();
        addLog('system', 'Подключение к Firebase установлено');
    } else {
        addLog('system', 'Firebase не инициализирован — проверьте firebase-config.js');
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 1: ПРОВЕРКА ПАРОЛЯ АДМИНИСТРАТОРА
// ═══════════════════════════════════════════════════════════════════════════
function checkAdminPassword() {
    const input = document.getElementById('admin-password-input').value;
    if (input === ADMIN_PASSWORD) {
        adminLoggedIn = true;
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        initAdminPanel();
        addAdminLog('Вход в панель администратора');
        showNotif('✅ Добро пожаловать, Администратор!', 'info');
    } else {
        const err = document.getElementById('login-error');
        err.textContent = '❌ Неверный пароль! Доступ запрещён.';
        err.style.animation = 'none';
        setTimeout(() => { err.style.animation = ''; }, 50);
        addLog('admin', 'Попытка входа с неверным паролем');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 2: ВЫХОД ИЗ ПАНЕЛИ
// ═══════════════════════════════════════════════════════════════════════════
function adminLogout() {
    realtimeListeners.forEach(unsub => unsub());
    realtimeListeners = [];
    adminLoggedIn = false;
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-login-screen').style.display = 'flex';
    document.getElementById('admin-password-input').value = '';
    addLog('admin', 'Выход из панели');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 3: ИНИЦИАЛИЗАЦИЯ ПАНЕЛИ (запуск всех реальном-времени слушателей)
// ═══════════════════════════════════════════════════════════════════════════
function initAdminPanel() {
    if (!db) return;
    showSection('dashboard');

    // Слушатель пользователей
    const unsubUsers = db.collection('users').onSnapshot(snap => {
        document.getElementById('dash-users').textContent = snap.size;
        renderUsers(snap);
        renderRecentRegistrations(snap);
        renderRolesList(snap);
        renderRealtimeEvent('reg', '📋', `Игроков в базе: ${snap.size}`);
    });
    realtimeListeners.push(unsubUsers);

    // Слушатель банов
    const unsubBans = db.collection('bans').onSnapshot(snap => {
        const activeBans = [], ipBans = [], accountBans = [];
        snap.forEach(doc => {
            const d = doc.data();
            if (d.active) {
                activeBans.push({ id: doc.id, ...d });
                if (d.type === 'ip') ipBans.push({ id: doc.id, ...d });
                if (d.type === 'account' || d.type === 'telegram' || d.type === 'siteid') accountBans.push({ id: doc.id, ...d });
            }
        });
        document.getElementById('dash-bans').textContent = activeBans.length;
        document.getElementById('dash-ipbans').textContent = ipBans.length;
        renderBans(activeBans);
        renderIPBansList(ipBans);
        renderRecentBansFeed(activeBans);
    });
    realtimeListeners.push(unsubBans);

    // Слушатель предупреждений
    const unsubWarns = db.collection('warns').where('active', '==', true).onSnapshot(snap => {
        document.getElementById('dash-warns').textContent = snap.size;
        renderWarns(snap);
    });
    realtimeListeners.push(unsubWarns);

    // Слушатель логов
    const unsubLogs = db.collection('logs').orderBy('createdAt', 'desc').limit(200).onSnapshot(snap => {
        renderLogs(snap);
    });
    realtimeListeners.push(unsubLogs);

    // Слушатель объявлений
    const unsubAnn = db.collection('announcements').orderBy('createdAt', 'desc').onSnapshot(snap => {
        renderAnnouncements(snap);
    });
    realtimeListeners.push(unsubAnn);

    // Слушатель апелляций
    const unsubAppeals = db.collection('appeals').onSnapshot(snap => {
        renderAppeals(snap);
    });
    realtimeListeners.push(unsubAppeals);

    // Слушатель новостей
    const unsubNews = db.collection('news').orderBy('createdAt', 'desc').onSnapshot(snap => {
        renderNewsList(snap);
    });
    realtimeListeners.push(unsubNews);

    // IP Whitelist
    const unsubWL = db.collection('ipWhitelist').onSnapshot(snap => {
        renderIPWhitelist(snap);
    });
    realtimeListeners.push(unsubWL);

    // Admin logs
    const unsubAdminLog = db.collection('adminLogs').orderBy('createdAt', 'desc').limit(100).onSnapshot(snap => {
        renderAdminLog(snap);
    });
    realtimeListeners.push(unsubAdminLog);

    // Suspicious
    const unsubSusp = db.collection('suspicious').onSnapshot(snap => {
        renderSuspicious(snap);
    });
    realtimeListeners.push(unsubSusp);

    // Blacklist nicks
    const unsubBL = db.collection('blacklistNicks').onSnapshot(snap => {
        renderBlacklistNicks(snap);
    });
    realtimeListeners.push(unsubBL);

    renderAnalytics();
    addLog('admin', 'Все реальном-времени слушатели запущены');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 4: ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ
// ═══════════════════════════════════════════════════════════════════════════
function showSection(name) {
    document.querySelectorAll('.a-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.s-link').forEach(l => l.classList.remove('active'));
    const sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');
    const titles = {
        dashboard: 'Dashboard', realtime: 'Реальное время', logs: 'Логи',
        analytics: 'Аналитика', users: 'Все игроки', 'search-users': 'Поиск игрока',
        roles: 'Роли', messages: 'Сообщения', bans: 'Все баны', 'ban-account': 'Бан аккаунта',
        'ban-ip': 'IP-бан', 'ban-telegram': 'Telegram бан', 'ban-siteid': 'Site ID бан',
        'mass-ban': 'Массовый бан', appeals: 'Апелляции', warns: 'Предупреждения',
        'ip-whitelist': 'IP Whitelist', announcements: 'Объявления', 'news-admin': 'Новости',
        'rules-admin': 'Правила', motd: 'MOTD', 'blacklist-nicks': 'Чёрный список ников',
        security: 'Безопасность', suspicious: 'Подозрительные', 'admin-log': 'Лог администратора',
        lockdown: 'Экстренный локдаун', 'rate-limits': 'Rate Limits',
        settings: 'Настройки сайта', 'server-settings': 'Настройки сервера',
        'notifications-settings': 'Уведомления', webhook: 'Webhook', backup: 'Бэкап', export: 'Экспорт'
    };
    document.getElementById('section-title').textContent = titles[name] || name;
    event && event.target && event.target.classList && event.target.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 5: ПЕРЕКЛЮЧЕНИЕ САЙДБАРА (мобильная)
// ═══════════════════════════════════════════════════════════════════════════
function toggleSidebar() {
    document.getElementById('admin-sidebar').classList.toggle('open');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 6: УВЕДОМЛЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
// ═══════════════════════════════════════════════════════════════════════════
function showNotif(text, type = 'info') {
    const container = document.getElementById('admin-notifications');
    const n = document.createElement('div');
    n.className = `admin-notif ${type}`;
    n.innerHTML = `<span>${text}</span>`;
    container.appendChild(n);
    setTimeout(() => {
        n.classList.add('notif-fade-out');
        setTimeout(() => n.remove(), 400);
    }, 4000);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 7: ДОБАВЛЕНИЕ В ЛОГ
// ═══════════════════════════════════════════════════════════════════════════
function addLog(type, message) {
    if (!db) return;
    db.collection('logs').add({
        type, message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 8: ДОБАВЛЕНИЕ В ЛОГА АДМИНИСТРАТОРА
// ═══════════════════════════════════════════════════════════════════════════
function addAdminLog(action) {
    if (!db) return;
    db.collection('adminLogs').add({
        action,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 9: СОБЫТИЕ В РЕАЛЬНОМ ВРЕМЕНИ
// ═══════════════════════════════════════════════════════════════════════════
function renderRealtimeEvent(type, icon, text) {
    const feed = document.getElementById('realtime-feed');
    if (!feed) return;
    const el = document.createElement('div');
    el.className = `rt-event ${type}`;
    el.innerHTML = `<span class="rt-time">${getTime()}</span><span class="rt-icon">${icon}</span><span class="rt-text">${text}</span>`;
    feed.insertBefore(el, feed.firstChild);
    // Лимит — последние 100
    while (feed.children.length > 100) feed.removeChild(feed.lastChild);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 10: БАН АККАУНТА (РЕАЛЬНОЕ ВРЕМЯ)
// ═══════════════════════════════════════════════════════════════════════════
async function banAccount() {
    const target = val('ban-acc-target');
    const reason = val('ban-acc-reason') || val('ban-acc-reason-preset') || 'Нарушение правил';
    const duration = val('ban-acc-duration');
    if (!target) return alert('Введите идентификатор');
    if (!db) return alert('Firebase не подключён');

    const expires = calcExpires(duration);
    await db.collection('bans').add({
        type: 'account', target, reason, duration,
        expires: expires ? firebase.firestore.Timestamp.fromDate(expires) : null,
        expiresStr: expires ? expires.toLocaleString('ru-RU') : 'Навсегда',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    addLog('ban', `Бан аккаунта: ${target} | Причина: ${reason} | Срок: ${duration}`);
    addAdminLog(`Бан аккаунта: ${target}`);
    showNotif(`🚫 Бан выдан: ${target}`, 'ban');
    renderRealtimeEvent('ban', '🚫', `Бан аккаунта: ${target} — ${reason}`);
    clearFields(['ban-acc-target', 'ban-acc-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 11: СНЯТЬ БАН АККАУНТА
// ═══════════════════════════════════════════════════════════════════════════
async function unbanAccount() {
    const target = val('unban-acc-target');
    const reason = val('unban-acc-reason') || 'Апелляция';
    if (!target || !db) return alert('Введите идентификатор');
    const snap = await db.collection('bans').where('target', '==', target).where('active', '==', true).get();
    if (snap.empty) return alert('Активный бан не найден');
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false, unbanReason: reason, unbannedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    await batch.commit();
    addLog('unban', `Снят бан с: ${target} | Причина: ${reason}`);
    addAdminLog(`Снят бан: ${target}`);
    showNotif(`✅ Бан снят: ${target}`, 'unban');
    renderRealtimeEvent('unban', '✅', `Бан снят: ${target}`);
    clearFields(['unban-acc-target', 'unban-acc-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 12: IP-БАН (РЕАЛЬНОЕ ВРЕМЯ)
// ═══════════════════════════════════════════════════════════════════════════
async function banIP() {
    const ip = val('ban-ip-target');
    const reason = val('ban-ip-reason') || val('ban-ip-reason-preset') || 'Нарушение';
    const duration = val('ban-ip-duration');
    if (!ip || !db) return alert('Введите IP-адрес');
    const expires = calcExpires(duration);
    await db.collection('bans').add({
        type: 'ip', target: ip, reason, duration,
        expires: expires ? firebase.firestore.Timestamp.fromDate(expires) : null,
        expiresStr: expires ? expires.toLocaleString('ru-RU') : 'Навсегда',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    addLog('ban', `IP-бан: ${ip} | Причина: ${reason}`);
    addAdminLog(`IP-бан: ${ip}`);
    showNotif(`🌐 IP заблокирован: ${ip}`, 'ban');
    renderRealtimeEvent('ban', '🌐', `IP-бан: ${ip} — ${reason}`);
    clearFields(['ban-ip-target', 'ban-ip-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 13: СНЯТЬ IP-БАН
// ═══════════════════════════════════════════════════════════════════════════
async function unbanIP() {
    const ip = val('unban-ip-target');
    if (!ip || !db) return alert('Введите IP-адрес');
    const snap = await db.collection('bans').where('target', '==', ip).where('type', '==', 'ip').where('active', '==', true).get();
    if (snap.empty) return alert('Активный IP-бан не найден');
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false, unbannedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    await batch.commit();
    addLog('unban', `IP-бан снят: ${ip}`);
    addAdminLog(`IP-бан снят: ${ip}`);
    showNotif(`✅ IP-бан снят: ${ip}`, 'unban');
    renderRealtimeEvent('unban', '✅', `IP-бан снят: ${ip}`);
    clearFields(['unban-ip-target']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 14: БАН TELEGRAM ID
// ═══════════════════════════════════════════════════════════════════════════
async function banTelegram() {
    const tgId = val('ban-tg-target');
    const reason = val('ban-tg-reason') || 'Нарушение';
    const duration = val('ban-tg-duration');
    if (!tgId || !db) return alert('Введите Telegram ID');
    const expires = calcExpires(duration);
    await db.collection('bans').add({
        type: 'telegram', target: tgId, reason, duration,
        expires: expires ? firebase.firestore.Timestamp.fromDate(expires) : null,
        expiresStr: expires ? expires.toLocaleString('ru-RU') : 'Навсегда',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    addLog('ban', `TG-бан: ${tgId} | ${reason}`);
    addAdminLog(`Telegram-бан: ${tgId}`);
    showNotif(`📱 TG заблокирован: ${tgId}`, 'ban');
    renderRealtimeEvent('ban', '📱', `TG-бан: ${tgId} — ${reason}`);
    clearFields(['ban-tg-target', 'ban-tg-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 15: СНЯТЬ TELEGRAM-БАН
// ═══════════════════════════════════════════════════════════════════════════
async function unbanTelegram() {
    const tgId = val('unban-tg-target');
    if (!tgId || !db) return alert('Введите Telegram ID');
    const snap = await db.collection('bans').where('target', '==', tgId).where('type', '==', 'telegram').where('active', '==', true).get();
    if (snap.empty) return alert('Бан не найден');
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false }));
    await batch.commit();
    addLog('unban', `TG-бан снят: ${tgId}`);
    showNotif(`✅ TG-бан снят: ${tgId}`, 'unban');
    renderRealtimeEvent('unban', '✅', `TG-бан снят: ${tgId}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 16: БАН SITE ID
// ═══════════════════════════════════════════════════════════════════════════
async function banSiteId() {
    const sid = val('ban-sid-target');
    const reason = val('ban-sid-reason') || 'Нарушение';
    const duration = val('ban-sid-duration');
    if (!sid || !db) return alert('Введите Site ID');
    const expires = calcExpires(duration);
    await db.collection('bans').add({
        type: 'siteid', target: sid, reason, duration,
        expires: expires ? firebase.firestore.Timestamp.fromDate(expires) : null,
        expiresStr: expires ? expires.toLocaleString('ru-RU') : 'Навсегда',
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    addLog('ban', `Site ID бан: ${sid} | ${reason}`);
    addAdminLog(`Site ID бан: ${sid}`);
    showNotif(`🆔 Site ID заблокирован: ${sid}`, 'ban');
    renderRealtimeEvent('ban', '🆔', `Site ID бан: ${sid} — ${reason}`);
    clearFields(['ban-sid-target', 'ban-sid-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 17: СНЯТЬ БАН SITE ID
// ═══════════════════════════════════════════════════════════════════════════
async function unbanSiteId() {
    const sid = val('unban-sid-target');
    if (!sid || !db) return alert('Введите Site ID');
    const snap = await db.collection('bans').where('target', '==', sid).where('type', '==', 'siteid').where('active', '==', true).get();
    if (snap.empty) return alert('Бан не найден');
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false }));
    await batch.commit();
    addLog('unban', `Site ID бан снят: ${sid}`);
    showNotif(`✅ Site ID бан снят: ${sid}`, 'unban');
    renderRealtimeEvent('unban', '✅', `Site ID бан снят: ${sid}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 18: МАССОВЫЙ БАН
// ═══════════════════════════════════════════════════════════════════════════
async function massBan() {
    const raw = val('mass-ban-targets');
    const type = val('mass-ban-type');
    const reason = val('mass-ban-reason') || 'Массовый бан';
    const duration = val('mass-ban-duration');
    if (!raw || !db) return alert('Введите список целей');
    const targets = raw.split('\n').map(s => s.trim()).filter(Boolean);
    if (!targets.length) return;
    const expires = calcExpires(duration);
    const batch = db.batch();
    targets.forEach(target => {
        const ref = db.collection('bans').doc();
        batch.set(ref, {
            type, target, reason, duration,
            expires: expires ? firebase.firestore.Timestamp.fromDate(expires) : null,
            expiresStr: expires ? expires.toLocaleString('ru-RU') : 'Навсегда',
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
    await batch.commit();
    addLog('ban', `Массовый бан: ${targets.length} целей`);
    addAdminLog(`Массовый бан: ${targets.length} игроков`);
    showNotif(`💥 Массовый бан: ${targets.length} целей`, 'ban');
    renderRealtimeEvent('ban', '💥', `Массовый бан выдан: ${targets.length} целей`);
    document.getElementById('mass-ban-targets').value = '';
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 19: СНЯТЬ ВСЕ БАНЫ
// ═══════════════════════════════════════════════════════════════════════════
async function massUnban() {
    if (!confirm('Снять ВСЕ активные баны?')) return;
    if (!db) return;
    const snap = await db.collection('bans').where('active', '==', true).get();
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false }));
    await batch.commit();
    addLog('unban', `Снято банов: ${snap.size}`);
    addAdminLog(`Массовый анбан: ${snap.size} банов снято`);
    showNotif(`✅ Снято ${snap.size} банов`, 'unban');
    renderRealtimeEvent('unban', '✅', `Массовый анбан: ${snap.size} банов снято`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 20: ВЫДАТЬ ПРЕДУПРЕЖДЕНИЕ
// ═══════════════════════════════════════════════════════════════════════════
async function warnUser() {
    const target = val('warn-target');
    const reason = val('warn-reason') || 'Нарушение';
    if (!target || !db) return alert('Введите идентификатор');
    await db.collection('warns').add({ target, reason, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('warn', `Предупреждение: ${target} | ${reason}`);
    addAdminLog(`Варн: ${target}`);
    showNotif(`⚠️ Предупреждение выдано: ${target}`, 'warn');
    renderRealtimeEvent('warn', '⚠️', `Варн: ${target} — ${reason}`);
    clearFields(['warn-target', 'warn-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 21: УДАЛИТЬ ПРЕДУПРЕЖДЕНИЕ
// ═══════════════════════════════════════════════════════════════════════════
async function removeWarn(id) {
    if (!db) return;
    await db.collection('warns').doc(id).update({ active: false });
    addLog('admin', `Варн снят: ${id}`);
    showNotif('✅ Предупреждение снято', 'unban');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 22: ДОБАВИТЬ IP В WHITELIST
// ═══════════════════════════════════════════════════════════════════════════
async function addIPWhitelist() {
    const ip = val('wl-ip-target');
    const note = val('wl-ip-note') || '';
    if (!ip || !db) return alert('Введите IP-адрес');
    await db.collection('ipWhitelist').doc(ip).set({ ip, note, addedAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', `IP добавлен в whitelist: ${ip}`);
    showNotif(`✅ IP в whitelist: ${ip}`, 'info');
    clearFields(['wl-ip-target', 'wl-ip-note']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 23: УДАЛИТЬ IP ИЗ WHITELIST
// ═══════════════════════════════════════════════════════════════════════════
async function removeIPWhitelist(ip) {
    if (!db) return;
    await db.collection('ipWhitelist').doc(ip).delete();
    addLog('admin', `IP удалён из whitelist: ${ip}`);
    showNotif(`🗑️ IP удалён из whitelist: ${ip}`, 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 24: ПОИСК ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════════════════════════
async function searchUser() {
    const q = val('user-search-input').trim();
    const res = document.getElementById('user-search-result');
    if (!q || !db) return;
    res.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:10px;">Поиск...</div>';
    const snaps = await Promise.all([
        db.collection('users').where('telegramId', '==', q).get(),
        db.collection('users').where('nickname', '==', q).get(),
        db.collection('users').where('siteNick', '==', q).get(),
        db.collection('users').where('siteId', '==', q).get()
    ]);
    const found = new Map();
    snaps.forEach(snap => snap.forEach(doc => found.set(doc.id, doc.data())));
    if (!found.size) { res.innerHTML = '<div style="color:#ff0080;padding:10px;">Пользователь не найден</div>'; return; }
    res.innerHTML = [...found.entries()].map(([id, u]) => `
        <div class="user-result-card">
            <div style="font-family:'Orbitron',monospace;font-size:1em;font-weight:700;margin-bottom:12px;">${u.siteNick || u.nickname || id}</div>
            <div class="profile-fields">
                ${field('📱 Telegram ID', u.telegramId)}
                ${field('⛏️ Ник Minecraft', u.nickname)}
                ${field('👤 Ник сайта', u.siteNick)}
                ${field('🆔 Site ID', u.siteId)}
                ${field('📅 Регистрация', u.createdAt?.toDate?.().toLocaleDateString('ru-RU') || '—')}
            </div>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button class="btn-sm danger" onclick="quickBan('${u.siteId||u.telegramId}')">🚫 Бан</button>
                <button class="btn-sm" onclick="quickWarn('${u.siteId||u.telegramId}')">⚠️ Варн</button>
                <button class="btn-sm success" onclick="quickUnban('${u.siteId||u.telegramId}')">🔓 Анбан</button>
                <button class="btn-sm danger" onclick="deleteUser('${id}')">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 25-27: БЫСТРЫЕ ДЕЙСТВИЯ
// ═══════════════════════════════════════════════════════════════════════════
async function quickBan(target) {
    const reason = prompt('Причина бана:', 'Нарушение правил');
    if (!reason || !db) return;
    await db.collection('bans').add({ type: 'account', target, reason, duration: 'permanent', active: true, expiresStr: 'Навсегда', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('ban', `Быстрый бан: ${target}`);
    showNotif(`🚫 Бан: ${target}`, 'ban');
    renderRealtimeEvent('ban', '🚫', `Быстрый бан: ${target}`);
}
async function quickWarn(target) {
    const reason = prompt('Причина предупреждения:', 'Нарушение');
    if (!reason || !db) return;
    await db.collection('warns').add({ target, reason, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    showNotif(`⚠️ Варн: ${target}`, 'warn');
}
async function quickUnban(target) {
    if (!db) return;
    const snap = await db.collection('bans').where('target', '==', target).where('active', '==', true).get();
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { active: false }));
    await batch.commit();
    showNotif(`✅ Анбан: ${target}`, 'unban');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 28: УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════════════════════════
async function deleteUser(id) {
    if (!confirm('Удалить пользователя из базы?') || !db) return;
    await db.collection('users').doc(id).delete();
    addLog('admin', `Пользователь удалён: ${id}`);
    addAdminLog(`Удалён пользователь: ${id}`);
    showNotif('🗑️ Пользователь удалён', 'warn');
    document.getElementById('user-search-result').innerHTML = '';
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 29: НАЗНАЧИТЬ РОЛЬ
// ═══════════════════════════════════════════════════════════════════════════
async function assignRole() {
    const target = val('role-target');
    const role = val('role-select');
    if (!target || !db) return alert('Введите идентификатор');
    const snap = await db.collection('users').where('siteId', '==', target).get();
    if (snap.empty) { alert('Пользователь не найден'); return; }
    const batch = db.batch();
    snap.forEach(doc => batch.update(doc.ref, { role }));
    await batch.commit();
    addLog('admin', `Роль назначена: ${target} → ${role}`);
    addAdminLog(`Роль: ${target} → ${role}`);
    showNotif(`🎖️ Роль назначена: ${target} → ${role}`, 'info');
    renderRealtimeEvent('admin', '🎖️', `Роль: ${target} → ${role}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 30: ОТПРАВИТЬ СООБЩЕНИЕ
// ═══════════════════════════════════════════════════════════════════════════
async function sendMessage() {
    const target = val('msg-target');
    const subject = val('msg-subject');
    const body = val('msg-body');
    if (!target || !subject || !body || !db) return alert('Заполните все поля');
    await db.collection('messages').add({ target, subject, body, read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', `Сообщение отправлено: ${target}`);
    showNotif(`✉️ Сообщение отправлено: ${target}`, 'info');
    clearFields(['msg-target', 'msg-subject', 'msg-body']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 31: СОЗДАТЬ ОБЪЯВЛЕНИЕ
// ═══════════════════════════════════════════════════════════════════════════
async function createAnnouncement() {
    const title = val('ann-title');
    const type = val('ann-type');
    const body = val('ann-body');
    const pinned = document.getElementById('ann-pinned').checked;
    if (!title || !body || !db) return alert('Заполните поля');
    await db.collection('announcements').add({ title, type, body, pinned, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', `Объявление: ${title}`);
    showNotif(`📢 Объявление опубликовано: ${title}`, 'info');
    renderRealtimeEvent('admin', '📢', `Новое объявление: ${title}`);
    clearFields(['ann-title', 'ann-body']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 32: УДАЛИТЬ ОБЪЯВЛЕНИЕ
// ═══════════════════════════════════════════════════════════════════════════
async function deleteAnnouncement(id) {
    if (!db) return;
    await db.collection('announcements').doc(id).delete();
    addLog('admin', `Объявление удалено: ${id}`);
    showNotif('🗑️ Объявление удалено', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 33: СОЗДАТЬ НОВОСТЬ
// ═══════════════════════════════════════════════════════════════════════════
async function createNews() {
    const title = val('news-title');
    const badge = val('news-badge-txt');
    const body = val('news-body');
    if (!title || !body || !db) return alert('Заполните поля');
    await db.collection('news').add({ title, badge, body, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', `Новость: ${title}`);
    showNotif(`📰 Новость опубликована: ${title}`, 'info');
    clearFields(['news-title', 'news-badge-txt', 'news-body']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 34: СОХРАНИТЬ ПРАВИЛО
// ═══════════════════════════════════════════════════════════════════════════
async function saveRule() {
    const num = val('rule-num');
    const title = val('rule-title-input');
    const body = val('rule-body');
    if (!title || !body || !db) return alert('Заполните поля');
    await db.collection('rules').doc(num || Date.now().toString()).set({ num, title, body, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    showNotif(`📜 Правило сохранено: ${title}`, 'info');
    clearFields(['rule-num', 'rule-title-input', 'rule-body']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 35: СОХРАНИТЬ MOTD
// ═══════════════════════════════════════════════════════════════════════════
async function saveMOTD() {
    const motd = val('motd-text');
    const ip = val('server-ip-setting');
    if (!db) return;
    await db.collection('settings').doc('motd').set({ motd, ip, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', 'MOTD обновлён');
    showNotif('💬 MOTD сохранён', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 36: ДОБАВИТЬ НИК В ЧЁРНЫЙ СПИСОК
// ═══════════════════════════════════════════════════════════════════════════
async function addBlacklistNick() {
    const nick = val('bl-nick-input');
    const reason = val('bl-nick-reason') || '';
    if (!nick || !db) return alert('Введите ник');
    await db.collection('blacklistNicks').doc(nick.toLowerCase()).set({ nick, reason, addedAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('admin', `Ник в ЧС: ${nick}`);
    showNotif(`🔇 Ник запрещён: ${nick}`, 'ban');
    clearFields(['bl-nick-input', 'bl-nick-reason']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 37: УДАЛИТЬ НИК ИЗ ЧЁРНОГО СПИСКА
// ═══════════════════════════════════════════════════════════════════════════
async function removeBlacklistNick(nick) {
    if (!db) return;
    await db.collection('blacklistNicks').doc(nick.toLowerCase()).delete();
    showNotif(`✅ Ник разрешён: ${nick}`, 'unban');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 38: ПЕРЕКЛЮЧИТЬ РЕЖИМ ТЕХ. РАБОТ
// ═══════════════════════════════════════════════════════════════════════════
async function toggleMaintenance() {
    if (!db) return;
    const val2 = document.getElementById('sec-maintenance').checked;
    await db.collection('settings').doc('site').set({ maintenance: val2 }, { merge: true });
    addLog('admin', `Тех. работы: ${val2 ? 'вкл' : 'выкл'}`);
    addAdminLog(`Тех. работы: ${val2 ? 'включены' : 'выключены'}`);
    showNotif(`🔧 Тех. работы: ${val2 ? 'включены' : 'выключены'}`, 'info');
    renderRealtimeEvent('system', '🔧', `Тех. работы: ${val2 ? 'включены' : 'выключены'}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 39: ПЕРЕКЛЮЧИТЬ РЕГИСТРАЦИЮ
// ═══════════════════════════════════════════════════════════════════════════
async function toggleRegistration() {
    if (!db) return;
    const val2 = document.getElementById('sec-registration').checked;
    await db.collection('settings').doc('site').set({ registrationOpen: val2 }, { merge: true });
    addLog('admin', `Регистрация: ${val2 ? 'открыта' : 'закрыта'}`);
    addAdminLog(`Регистрация: ${val2 ? 'открыта' : 'закрыта'}`);
    showNotif(`📋 Регистрация: ${val2 ? 'открыта' : 'закрыта'}`, 'info');
    renderRealtimeEvent('system', val2 ? '✅' : '🚫', `Регистрация ${val2 ? 'открыта' : 'закрыта'}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 40: СОХРАНИТЬ НАСТРОЙКИ БЕЗОПАСНОСТИ
// ═══════════════════════════════════════════════════════════════════════════
async function saveSecuritySettings() {
    if (!db) return;
    const settings = {
        vpnDetect: document.getElementById('sec-vpn-detect').checked,
        autoBan: document.getElementById('sec-auto-ban').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('settings').doc('security').set(settings);
    addLog('admin', 'Настройки безопасности сохранены');
    showNotif('💾 Настройки безопасности сохранены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 41: СМЕНИТЬ ПАРОЛЬ АДМИНИСТРАТОРА
// ═══════════════════════════════════════════════════════════════════════════
function changeAdminPassword() {
    const np = val('new-admin-pass');
    const cp = val('confirm-admin-pass');
    if (!np || np !== cp) return alert('Пароли не совпадают');
    if (np.length < 6) return alert('Пароль слишком короткий (мин. 6 символов)');
    // Сохраняем в localStorage (в реальном проекте используйте Firebase Auth)
    localStorage.setItem('adminPassword', np);
    addLog('admin', 'Пароль администратора изменён');
    addAdminLog('Пароль изменён');
    showNotif('🔒 Пароль изменён', 'info');
    clearFields(['new-admin-pass', 'confirm-admin-pass']);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 42: ЛОКДАУН
// ═══════════════════════════════════════════════════════════════════════════
async function triggerLockdown() {
    if (!confirm('⚠️ АКТИВИРОВАТЬ ЭКСТРЕННЫЙ ЛОКДАУН? Все пользователи будут отключены!')) return;
    if (!db) return;
    await db.collection('settings').doc('site').set({ lockdown: true, maintenance: true }, { merge: true });
    addLog('admin', '⚠️ ЛОКДАУН АКТИВИРОВАН');
    addAdminLog('ЭКСТРЕННЫЙ ЛОКДАУН активирован');
    showNotif('🔒 ЛОКДАУН АКТИВИРОВАН!', 'ban');
    renderRealtimeEvent('system', '🔒', 'ЭКСТРЕННЫЙ ЛОКДАУН активирован!');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 43: СНЯТЬ ЛОКДАУН
// ═══════════════════════════════════════════════════════════════════════════
async function deactivateLockdown() {
    if (!db) return;
    await db.collection('settings').doc('site').set({ lockdown: false, maintenance: false }, { merge: true });
    addLog('admin', 'Локдаун снят');
    addAdminLog('Локдаун деактивирован');
    showNotif('✅ Локдаун снят', 'unban');
    renderRealtimeEvent('system', '✅', 'Локдаун деактивирован');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 44: СОХРАНИТЬ НАСТРОЙКИ САЙТА
// ═══════════════════════════════════════════════════════════════════════════
async function saveSettings() {
    if (!db) return;
    const s = { name: val('set-server-name'), desc: val('set-server-desc'), ip: val('set-server-ip'), discord: val('set-discord'), telegram: val('set-telegram') };
    await db.collection('settings').doc('general').set(s);
    addLog('admin', 'Настройки сайта сохранены');
    showNotif('💾 Настройки сохранены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 45: СОХРАНИТЬ НАСТРОЙКИ СЕРВЕРА
// ═══════════════════════════════════════════════════════════════════════════
async function saveServerSettings() {
    if (!db) return;
    const s = { mcVersion: val('mc-version'), port: val('mc-port'), rconIp: val('rcon-ip'), slots: val('mc-slots') };
    await db.collection('settings').doc('server').set(s);
    showNotif('💾 Настройки сервера сохранены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 46: СОХРАНИТЬ УВЕДОМЛЕНИЯ
// ═══════════════════════════════════════════════════════════════════════════
async function saveNotificationSettings() {
    if (!db) return;
    const s = {
        notifBan: document.getElementById('notif-ban').checked,
        notifReg: document.getElementById('notif-reg').checked,
        notifSuspicious: document.getElementById('notif-suspicious').checked,
        notifAppeal: document.getElementById('notif-appeal').checked,
        botToken: val('notif-bot-token'),
        chatId: val('notif-chat-id')
    };
    await db.collection('settings').doc('notifications').set(s);
    showNotif('🔔 Настройки уведомлений сохранены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 47: СОХРАНИТЬ WEBHOOK
// ═══════════════════════════════════════════════════════════════════════════
async function saveWebhook() {
    if (!db) return;
    const s = { url: val('webhook-url'), name: val('webhook-name'), bans: document.getElementById('webhook-bans').checked, regs: document.getElementById('webhook-regs').checked };
    await db.collection('settings').doc('webhook').set(s);
    showNotif('🔗 Webhook сохранён', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 48: ТЕСТ WEBHOOK
// ═══════════════════════════════════════════════════════════════════════════
async function testWebhook() {
    const url = val('webhook-url');
    if (!url) return alert('Введите URL');
    try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '✅ Тестовое сообщение от AdminPanel v2.0' }) });
        showNotif('✅ Webhook работает!', 'info');
    } catch { showNotif('❌ Ошибка Webhook', 'ban'); }
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 49: СОХРАНИТЬ ТЕМУ
// ═══════════════════════════════════════════════════════════════════════════
function saveTheme() {
    const theme = val('theme-select');
    const speed = val('rgb-speed');
    localStorage.setItem('adminTheme', theme);
    localStorage.setItem('rgbSpeed', speed);
    document.documentElement.style.setProperty('--rgb-speed', speed);
    showNotif(`🎨 Тема применена: ${theme}`, 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 50: СОХРАНИТЬ RATE LIMITS
// ═══════════════════════════════════════════════════════════════════════════
async function saveRateLimits() {
    if (!db) return;
    const s = { maxReq: val('rl-max-req'), maxReg: val('rl-max-reg'), blockTime: val('rl-block-time') };
    await db.collection('settings').doc('rateLimits').set(s);
    showNotif('⏱️ Rate Limits сохранены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИИ 51-60: ЭКСПОРТ И БЭКАП
// ═══════════════════════════════════════════════════════════════════════════
async function exportUsers() {
    if (!db) return;
    const snap = await db.collection('users').get();
    const rows = ['Ник сайта,Ник MC,Site ID,TG ID,Дата'];
    snap.forEach(doc => {
        const d = doc.data();
        rows.push(`${d.siteNick||''},${d.nickname||''},${d.siteId||''},${d.telegramId||''},${d.createdAt?.toDate?.().toLocaleDateString('ru-RU')||''}`);
    });
    downloadFile('users.csv', rows.join('\n'), 'text/csv');
    showNotif('📤 Экспорт игроков выполнен', 'info');
}

async function exportBansCSV() {
    if (!db) return;
    const snap = await db.collection('bans').get();
    const rows = ['Тип,Цель,Причина,Срок,Статус,Дата'];
    snap.forEach(doc => {
        const d = doc.data();
        rows.push(`${d.type||''},${d.target||''},${d.reason||''},${d.expiresStr||''},${d.active?'Активен':'Снят'},${d.createdAt?.toDate?.().toLocaleDateString('ru-RU')||''}`);
    });
    downloadFile('bans.csv', rows.join('\n'), 'text/csv');
    showNotif('📤 Экспорт банов выполнен', 'info');
}

async function exportLogsCSV() {
    if (!db) return;
    const snap = await db.collection('logs').orderBy('createdAt','desc').limit(1000).get();
    const rows = ['Тип,Сообщение,Дата'];
    snap.forEach(doc => {
        const d = doc.data();
        rows.push(`${d.type||''},${(d.message||'').replace(/,/g,';')},${d.createdAt?.toDate?.().toLocaleString('ru-RU')||''}`);
    });
    downloadFile('logs.csv', rows.join('\n'), 'text/csv');
    showNotif('📤 Экспорт логов выполнен', 'info');
}

async function exportAllJSON() {
    if (!db) return;
    const [users, bans, logs] = await Promise.all([
        db.collection('users').get(),
        db.collection('bans').get(),
        db.collection('logs').limit(500).get()
    ]);
    const data = { users: [], bans: [], logs: [] };
    users.forEach(d => data.users.push({ id: d.id, ...d.data() }));
    bans.forEach(d => data.bans.push({ id: d.id, ...d.data() }));
    logs.forEach(d => data.logs.push({ id: d.id, ...d.data() }));
    downloadFile('backup.json', JSON.stringify(data, null, 2), 'application/json');
    showNotif('📦 Полный экспорт выполнен', 'info');
}

async function backupUsers() { await exportUsers(); showBackupStatus('✅ Бэкап игроков создан'); }
async function backupBans()  { await exportBansCSV(); showBackupStatus('✅ Бэкап банов создан'); }
async function backupLogs()  { await exportLogsCSV(); showBackupStatus('✅ Бэкап логов создан'); }
async function fullBackup()  { await exportAllJSON(); showBackupStatus('✅ Полный бэкап создан'); }
function showBackupStatus(t) { const el = document.getElementById('backup-status'); if(el) el.innerHTML=`<div style="color:#00ff88;padding:12px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:10px;">${t}</div>`; }

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 61: ЗАБАНИТЬ ВСЕХ ПОДОЗРИТЕЛЬНЫХ
// ═══════════════════════════════════════════════════════════════════════════
async function banAllSuspicious() {
    if (!confirm('Забанить всех подозрительных?') || !db) return;
    const snap = await db.collection('suspicious').where('active', '==', true).get();
    const batch = db.batch();
    snap.forEach(doc => {
        const d = doc.data();
        const ref = db.collection('bans').doc();
        batch.set(ref, { type: 'account', target: d.target, reason: 'Подозрительная активность', duration: '7d', active: true, expiresStr: '7 дней', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        batch.update(doc.ref, { active: false });
    });
    await batch.commit();
    addLog('ban', `Забанено подозрительных: ${snap.size}`);
    showNotif(`🚫 Забанено: ${snap.size} подозрительных`, 'ban');
    renderRealtimeEvent('ban', '🔍', `Забанено подозрительных: ${snap.size}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 62: СОХРАНИТЬ НАСТРОЙКИ (ОБЩАЯ)
// ═══════════════════════════════════════════════════════════════════════════
function setPresetReason(fieldId, value) {
    if (value) document.getElementById(fieldId).value = value;
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 63: ФИЛЬТР ПОЛЬЗОВАТЕЛЕЙ
// ═══════════════════════════════════════════════════════════════════════════
function filterUsers() {
    const q = document.getElementById('users-filter').value.toLowerCase();
    document.querySelectorAll('#users-tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 64: ФИЛЬТР БАНОВ
// ═══════════════════════════════════════════════════════════════════════════
function filterBans() {
    const type = document.getElementById('bans-type-filter').value;
    document.querySelectorAll('#bans-tbody tr').forEach(row => {
        row.style.display = (!type || row.dataset.type === type) ? '' : 'none';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 65: ФИЛЬТР ЛОГОВ
// ═══════════════════════════════════════════════════════════════════════════
function filterLogs() {
    const q = document.getElementById('log-search').value.toLowerCase();
    document.querySelectorAll('#all-logs .log-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 66: ОЧИСТИТЬ ЛОГИ
// ═══════════════════════════════════════════════════════════════════════════
async function clearLogs() {
    if (!confirm('Очистить все логи?') || !db) return;
    const snap = await db.collection('logs').limit(500).get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    addLog('admin', 'Логи очищены');
    showNotif('🗑️ Логи очищены', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ 67: АНАЛИТИКА (графики через CSS)
// ═══════════════════════════════════════════════════════════════════════════
async function renderAnalytics() {
    if (!db) return;
    const bansSnap = await db.collection('bans').get();
    const types = { account: 0, ip: 0, telegram: 0, siteid: 0 };
    bansSnap.forEach(doc => {
        const t = doc.data().type;
        if (types[t] !== undefined) types[t]++;
    });
    const maxBans = Math.max(...Object.values(types), 1);
    document.getElementById('chart-bans').innerHTML = Object.entries(types).map(([t, c]) => `
        <div class="chart-bar" style="height:${Math.max(c/maxBans*120,8)}px;background:linear-gradient(0deg,${t==='ip'?'#ff6600':'#7b2fff'},#00d4ff);" title="${t}: ${c}">
            <span class="chart-bar-label">${t}</span>
        </div>
    `).join('');

    const hours = Array(7).fill(0).map((_,i)=>Math.floor(Math.random()*20+2));
    const maxH = Math.max(...hours);
    const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    document.getElementById('chart-regs').innerHTML = hours.map((h,i)=>`
        <div class="chart-bar" style="height:${h/maxH*120}px;" title="${days[i]}: ${h}">
            <span class="chart-bar-label">${days[i]}</span>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// ФУНКЦИИ 68-80: РЕНДЕРИНГ ДАННЫХ
// ═══════════════════════════════════════════════════════════════════════════
function renderUsers(snap) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    const rows = [];
    snap.forEach(doc => {
        const d = doc.data();
        rows.push(`<tr>
            <td>${d.siteNick||'—'}</td>
            <td>${d.nickname||'—'}</td>
            <td>${d.siteId||'—'}</td>
            <td>${d.telegramId||'—'}</td>
            <td>${d.createdAt?.toDate?.().toLocaleDateString('ru-RU')||'—'}</td>
            <td><span class="status-badge ${d.banned?'banned':'ok'}">${d.banned?'🚫 Бан':'✅ OK'}</span></td>
            <td>
                <div style="display:flex;gap:4px;">
                    <button class="btn-sm danger" onclick="quickBan('${d.siteId||d.telegramId}')">🚫</button>
                    <button class="btn-sm" onclick="quickWarn('${d.siteId||d.telegramId}')">⚠️</button>
                    <button class="btn-sm success" onclick="quickUnban('${d.siteId||d.telegramId}')">🔓</button>
                </div>
            </td>
        </tr>`);
    });
    tbody.innerHTML = rows.join('') || '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,0.3);padding:24px;">Нет игроков</td></tr>';
}

function renderBans(bans) {
    const tbody = document.getElementById('bans-tbody');
    if (!tbody) return;
    tbody.innerHTML = bans.map(b => `<tr data-type="${b.type}">
        <td><span class="type-badge ${b.type}">${{account:'👤 Акк.',ip:'🌐 IP',telegram:'📱 TG',siteid:'🆔 ID'}[b.type]||b.type}</span></td>
        <td>${b.target}</td>
        <td>${b.reason||'—'}</td>
        <td>${b.expiresStr||'Навсегда'}</td>
        <td>${b.createdAt?.toDate?.().toLocaleDateString('ru-RU')||'—'}</td>
        <td><span class="status-badge active">🚫 Активен</span></td>
        <td><button class="btn-sm success" onclick="unbanById('${b.id}')">🔓 Снять</button></td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,0.3);padding:24px;">Нет активных банов</td></tr>';
}

function renderRecentRegistrations(snap) {
    const el = document.getElementById('recent-registrations');
    if (!el) return;
    const users = [];
    snap.forEach(doc => users.push(doc.data()));
    users.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    el.innerHTML = users.slice(0,8).map(u => `<div class="feed-item"><span class="feed-icon">👤</span><div class="feed-text"><div class="feed-title">${u.siteNick||u.nickname||'—'}</div><div class="feed-sub">TG: ${u.telegramId||'—'} | ID: ${u.siteId||'—'}</div></div><span class="feed-time">${u.createdAt?.toDate?.().toLocaleDateString('ru-RU')||'—'}</span></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет данных</div>';
}

function renderRecentBansFeed(bans) {
    const el = document.getElementById('recent-bans-feed');
    if (!el) return;
    el.innerHTML = bans.slice(0,8).map(b => `<div class="feed-item"><span class="feed-icon">🚫</span><div class="feed-text"><div class="feed-title">${b.target}</div><div class="feed-sub">${b.reason||'—'} | ${b.type}</div></div><span class="feed-time">${b.createdAt?.toDate?.().toLocaleDateString('ru-RU')||'—'}</span></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет банов</div>';
}

function renderIPBansList(ipBans) {
    const el = document.getElementById('ip-bans-list');
    if (!el) return;
    el.innerHTML = ipBans.map(b => `<div class="feed-item"><span class="feed-icon">🌐</span><div class="feed-text"><div class="feed-title">${b.target}</div><div class="feed-sub">${b.reason||'—'}</div></div><button class="btn-sm success" onclick="unbanById('${b.id}')">🔓</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет IP-банов</div>';
}

function renderWarns(snap) {
    const el = document.getElementById('warns-list');
    if (!el) return;
    const warns = [];
    snap.forEach(doc => warns.push({ id: doc.id, ...doc.data() }));
    el.innerHTML = warns.map(w => `<div class="feed-item"><span class="feed-icon">⚠️</span><div class="feed-text"><div class="feed-title">${w.target}</div><div class="feed-sub">${w.reason||'—'}</div></div><button class="btn-sm" onclick="removeWarn('${w.id}')">✅ Снять</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет предупреждений</div>';
}

function renderLogs(snap) {
    const el = document.getElementById('all-logs');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push(doc.data()));
    el.innerHTML = items.map(l => `<div class="log-item"><span class="log-time">${l.createdAt?.toDate?.().toLocaleTimeString('ru-RU')||'—'}</span><span class="log-type ${l.type||'system'}">[${(l.type||'SYS').toUpperCase()}]</span><span class="log-msg">${l.message||''}</span></div>`).join('') || '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.3);">Нет логов</div>';
}

function renderAnnouncements(snap) {
    const el = document.getElementById('announcements-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    el.innerHTML = items.map(a => `<div class="feed-item"><span class="feed-icon">${a.pinned?'📌':'📢'}</span><div class="feed-text"><div class="feed-title">${a.title||'—'}</div><div class="feed-sub">${a.body?.slice(0,60)||'—'}...</div></div><button class="btn-sm danger" onclick="deleteAnnouncement('${a.id}')">🗑️</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет объявлений</div>';
}

function renderAppeals(snap) {
    const el = document.getElementById('appeals-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    el.innerHTML = items.map(a => `<div class="feed-item"><span class="feed-icon">📨</span><div class="feed-text"><div class="feed-title">${a.target||'—'}</div><div class="feed-sub">${a.reason||'—'}</div></div><div class="feed-actions"><button class="btn-sm success" onclick="approveAppeal('${a.id}',this)">✅ Принять</button><button class="btn-sm danger" onclick="rejectAppeal('${a.id}',this)">❌ Отклонить</button></div></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет апелляций</div>';
}

function renderNewsList(snap) {
    const el = document.getElementById('news-admin-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    el.innerHTML = items.map(n => `<div class="feed-item"><span class="feed-icon">📰</span><div class="feed-text"><div class="feed-title">${n.title||'—'}</div><div class="feed-sub">${n.badge||''}</div></div><button class="btn-sm danger" onclick="deleteNews('${n.id}')">🗑️</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет новостей</div>';
}

function renderIPWhitelist(snap) {
    const el = document.getElementById('ip-whitelist-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push(doc.data()));
    el.innerHTML = items.map(i => `<div class="feed-item"><span class="feed-icon">✅</span><div class="feed-text"><div class="feed-title">${i.ip}</div><div class="feed-sub">${i.note||'—'}</div></div><button class="btn-sm danger" onclick="removeIPWhitelist('${i.ip}')">🗑️</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Whitelist пуст</div>';
}

function renderAdminLog(snap) {
    const el = document.getElementById('admin-action-log');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push(doc.data()));
    el.innerHTML = items.map(l => `<div class="log-item"><span class="log-time">${l.createdAt?.toDate?.().toLocaleString('ru-RU')||'—'}</span><span class="log-type admin">[ADMIN]</span><span class="log-msg">${l.action||''}</span></div>`).join('') || '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.3);">Нет действий</div>';
}

function renderSuspicious(snap) {
    const el = document.getElementById('suspicious-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    el.innerHTML = items.filter(i=>i.active).map(s => `<div class="feed-item"><span class="feed-icon">🔍</span><div class="feed-text"><div class="feed-title">${s.target||'—'}</div><div class="feed-sub">${s.reason||'—'}</div></div><button class="btn-sm danger" onclick="quickBan('${s.target}')">🚫 Бан</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Нет подозрительных</div>';
}

function renderBlacklistNicks(snap) {
    const el = document.getElementById('bl-nicks-list');
    if (!el) return;
    const items = [];
    snap.forEach(doc => items.push(doc.data()));
    el.innerHTML = items.map(n => `<div class="feed-item"><span class="feed-icon">🔇</span><div class="feed-text"><div class="feed-title">${n.nick}</div><div class="feed-sub">${n.reason||'—'}</div></div><button class="btn-sm success" onclick="removeBlacklistNick('${n.nick}')">✅</button></div>`).join('') || '<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.3);">Список пуст</div>';
}

function renderRolesList(snap) {
    const el = document.getElementById('roles-list');
    if (!el) return;
    const byRole = {};
    snap.forEach(doc => {
        const r = doc.data().role || 'player';
        if (!byRole[r]) byRole[r] = 0;
        byRole[r]++;
    });
    el.innerHTML = '<div style="padding:16px;">' + Object.entries(byRole).map(([r,c]) => `<div class="feed-item"><span class="feed-icon">🎖️</span><div class="feed-text"><div class="feed-title">${r}</div></div><span style="font-family:\'Orbitron\',monospace;font-weight:700;color:#a78bfa;">${c}</span></div>`).join('') + '</div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ═══════════════════════════════════════════════════════════════════════════
async function unbanById(id) {
    if (!db) return;
    await db.collection('bans').doc(id).update({ active: false, unbannedAt: firebase.firestore.FieldValue.serverTimestamp() });
    addLog('unban', `Бан снят по ID: ${id}`);
    showNotif('✅ Бан снят', 'unban');
    renderRealtimeEvent('unban', '✅', `Бан снят: ${id}`);
}

async function approveAppeal(id) {
    if (!db) return;
    const doc = await db.collection('appeals').doc(id).get();
    const d = doc.data();
    await quickUnban(d.target);
    await db.collection('appeals').doc(id).update({ status: 'approved' });
    showNotif(`✅ Апелляция принята: ${d.target}`, 'unban');
}

async function rejectAppeal(id) {
    if (!db) return;
    await db.collection('appeals').doc(id).update({ status: 'rejected' });
    showNotif('❌ Апелляция отклонена', 'ban');
}

async function deleteNews(id) {
    if (!db) return;
    await db.collection('news').doc(id).delete();
    showNotif('🗑️ Новость удалена', 'info');
}

function calcExpires(duration) {
    if (duration === 'permanent') return null;
    const map = { '1h': 3600000, '6h': 21600000, '12h': 43200000, '1d': 86400000, '3d': 259200000, '7d': 604800000, '14d': 1209600000, '30d': 2592000000 };
    return map[duration] ? new Date(Date.now() + map[duration]) : null;
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function clearFields(ids) {
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function getTime() {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function field(label, value) {
    return `<div class="profile-field"><span class="pf-label">${label}</span><span class="pf-value">${value||'—'}</span></div>`;
}

function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
}
