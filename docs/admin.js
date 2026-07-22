'use strict';

const ADMIN_PASSWORD = 'grifmcBOT';
let db = null;
let adminLoggedIn = false;
let realtimeListeners = [];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        db = firebase.firestore();
        console.log('✅ Firebase подключена');
    }
});

function checkAdminPassword() {
    const input = document.getElementById('admin-password-input').value;
    if (input === ADMIN_PASSWORD) {
        adminLoggedIn = true;
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        initAdminPanel();
        document.getElementById('login-error').textContent = '';
        showNotif('👑 Добро пожаловать, Администратор!', 'info');
    } else {
        document.getElementById('login-error').textContent = '❌ Неверный пароль!';
    }
}

function adminLogout() {
    realtimeListeners.forEach(unsub => unsub());
    realtimeListeners = [];
    adminLoggedIn = false;
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-login-screen').style.display = 'flex';
    document.getElementById('admin-password-input').value = '';
    showNotif('🚪 Выход выполнен', 'info');
}

function initAdminPanel() {
    if (!db) return;
    showSection('dashboard');
    loadDashboardStats();
    loadUsers();
    loadBans();
    loadLogs();
    loadWarns();
    loadAnnouncements();
    loadNews();
    loadBlacklist();
    loadIPWhitelist();
    loadAppeals();
    loadSuspicious();
    loadAdminLog();
    loadRoles();
    renderRealtimeFeed();
    renderCharts();
    setInterval(renderCharts, 30000);
    showNotif('⚡ Админ-панель готова, всё в реальном времени!', 'info');
}

function showSection(name) {
    document.querySelectorAll('.a-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.s-link').forEach(l => l.classList.remove('active'));
    const sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');
    document.querySelectorAll('.s-link').forEach(l => {
        if (l.textContent.includes(name) || l.getAttribute('onclick')?.includes(name)) {
            l.classList.add('active');
        }
    });
    const titles = {
        dashboard: '📊 Dashboard',
        realtime: '⚡ Реальное время',
        logs: '📋 Логи',
        analytics: '📈 Аналитика',
        users: '👤 Все игроки',
        'search-users': '🔍 Поиск игрока',
        roles: '🎖️ Роли',
        messages: '✉️ Сообщения',
        bans: '🚫 Все баны',
        'ban-account': '👤 Бан аккаунта',
        'ban-ip': '🌐 IP-бан',
        'ban-telegram': '📱 Бан Telegram',
        'ban-siteid': '🆔 Бан Site ID',
        'mass-ban': '💥 Массовый бан',
        appeals: '📨 Апелляции',
        warns: '⚠️ Предупреждения',
        'ip-whitelist': '✅ IP Whitelist',
        announcements: '📢 Объявления',
        'news-admin': '📰 Новости',
        'rules-admin': '📜 Правила',
        motd: '💬 MOTD',
        'blacklist-nicks': '🔇 Чёрный список',
        security: '🛡️ Безопасность',
        suspicious: '🔍 Подозрительные',
        'admin-log': '📖 Лог админа',
        lockdown: '🔒 Локдаун',
        'rate-limits': '⏱️ Rate Limits',
        settings: '⚙️ Настройки',
        'server-settings': '🖥️ Сервер',
        'notifications-settings': '🔔 Уведомления',
        webhook: '🔗 Webhook',
        backup: '💾 Бэкап',
        export: '📤 Экспорт'
    };
    document.getElementById('section-title').textContent = titles[name] || name;
}

function toggleSidebar() {
    document.getElementById('admin-sidebar').classList.toggle('open');
}

function showNotif(text, type) {
    const container = document.getElementById('admin-notifications');
    const n = document.createElement('div');
    n.className = 'admin-notif ' + type;
    n.innerHTML = '<span>' + text + '</span>';
    container.appendChild(n);
    setTimeout(() => { n.classList.add('notif-fade-out'); setTimeout(() => n.remove(), 400); }, 4000);
}

// ============================================
// ==== DASHBOARD =====
// ============================================

function loadDashboardStats() {
    if (!db) return;
    db.collection('users').onSnapshot(snap => {
        document.getElementById('dash-users').textContent = snap.size;
        document.getElementById('recent-registrations').innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `<span class="icon">👤</span><div class="text"><div class="title">${d.siteNick || d.nickname || '—'}</div><div class="sub">${d.telegram_id || '—'} | ${d.registered_at || '—'}</div></div>`;
            document.getElementById('recent-registrations').prepend(item);
        });
    });
    db.collection('bans').where('active','==',true).onSnapshot(snap => {
        document.getElementById('dash-bans').textContent = snap.size;
        document.getElementById('recent-bans-feed').innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `<span class="icon">🚫</span><div class="text"><div class="title">${d.target}</div><div class="sub">${d.reason || '—'} | ${d.type || 'account'}</div></div>`;
            document.getElementById('recent-bans-feed').prepend(item);
        });
    });
    db.collection('warns').where('active','==',true).onSnapshot(snap => {
        document.getElementById('dash-warns').textContent = snap.size;
    });
    db.collection('bans').where('type','==','ip').where('active','==',true).onSnapshot(snap => {
        document.getElementById('dash-ipbans').textContent = snap.size;
    });
}

// ============================================
// ==== USERS =====
// ============================================

function loadUsers() {
    if (!db) return;
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    db.collection('users').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            const status = d.verified ? '<span class="status-badge ok">✅ OK</span>' : '<span class="status-badge warned">⏳ Не подтверждён</span>';
            html += `<tr>
                <td>${d.siteNick || '—'}</td>
                <td>${d.nickname || '—'}</td>
                <td>${d.siteId || '—'}</td>
                <td>${d.telegramId || d.telegram_id || '—'}</td>
                <td>${d.registered_at || '—'}</td>
                <td>${status}</td>
                <td>
                    <button class="btn-sm danger" onclick="quickBan('${d.siteId || d.telegramId || d.telegram_id}')">🚫</button>
                    <button class="btn-sm success" onclick="quickUnban('${d.siteId || d.telegramId || d.telegram_id}')">🔓</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">Нет игроков</td></tr>';
    });
}

function filterUsers() {
    const q = document.getElementById('users-filter').value.toLowerCase();
    document.querySelectorAll('#users-tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ============================================
// ==== BANS =====
// ============================================

function loadBans() {
    if (!db) return;
    const tbody = document.getElementById('bans-tbody');
    if (!tbody) return;
    db.collection('bans').where('active','==',true).onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            const typeMap = { account: '👤 Акк.', ip: '🌐 IP', telegram: '📱 TG', siteid: '🆔 ID' };
            html += `<tr data-type="${d.type}">
                <td><span class="type-badge ${d.type}">${typeMap[d.type] || d.type}</span></td>
                <td>${d.target}</td>
                <td>${d.reason || '—'}</td>
                <td>${d.expiresStr || 'Навсегда'}</td>
                <td>${d.createdAt?.toDate?.().toLocaleDateString('ru-RU') || '—'}</td>
                <td><span class="status-badge active">🚫 Активен</span></td>
                <td><button class="btn-sm success" onclick="unbanById('${doc.id}')">🔓</button></td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">Нет активных банов</td></tr>';
    });
}

function filterBans() {
    const type = document.getElementById('bans-type-filter').value;
    document.querySelectorAll('#bans-tbody tr').forEach(row => {
        row.style.display = (!type || row.dataset.type === type) ? '' : 'none';
    });
}

function banAccount() {
    const target = document.getElementById('ban-acc-target').value.trim();
    const reason = document.getElementById('ban-acc-reason').value.trim() || 'Нарушение правил';
    const duration = document.getElementById('ban-acc-duration').value;
    if (!target || !db) return alert('Введите идентификатор');
    db.collection('bans').add({
        type: 'account', target, reason, duration,
        expiresStr: duration === 'permanent' ? 'Навсегда' : duration,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('🚫 Бан выдан: ' + target, 'ban');
        addLog('ban', 'Бан: ' + target);
        document.getElementById('ban-acc-target').value = '';
        document.getElementById('ban-acc-reason').value = '';
    });
}

function unbanAccount() {
    const target = document.getElementById('unban-acc-target').value.trim();
    if (!target || !db) return alert('Введите идентификатор');
    db.collection('bans').where('target','==',target).where('active','==',true).get().then(snap => {
        if (snap.empty) return alert('Бан не найден');
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('🔓 Бан снят: ' + target, 'unban');
            addLog('unban', 'Анбан: ' + target);
            document.getElementById('unban-acc-target').value = '';
        });
    });
}

function banIP() {
    const ip = document.getElementById('ban-ip-target').value.trim();
    const reason = document.getElementById('ban-ip-reason').value.trim() || 'Нарушение';
    const duration = document.getElementById('ban-ip-duration').value;
    if (!ip || !db) return alert('Введите IP');
    db.collection('bans').add({
        type: 'ip', target: ip, reason, duration,
        expiresStr: duration === 'permanent' ? 'Навсегда' : duration,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('🌐 IP заблокирован: ' + ip, 'ban');
        addLog('ban', 'IP-бан: ' + ip);
        document.getElementById('ban-ip-target').value = '';
        document.getElementById('ban-ip-reason').value = '';
    });
}

function unbanIP() {
    const ip = document.getElementById('unban-ip-target').value.trim();
    if (!ip || !db) return alert('Введите IP');
    db.collection('bans').where('target','==',ip).where('type','==','ip').where('active','==',true).get().then(snap => {
        if (snap.empty) return alert('IP-бан не найден');
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('✅ IP-бан снят: ' + ip, 'unban');
            addLog('unban', 'IP-анбан: ' + ip);
            document.getElementById('unban-ip-target').value = '';
        });
    });
}

function banTelegram() {
    const tg = document.getElementById('ban-tg-target').value.trim();
    const reason = document.getElementById('ban-tg-reason').value.trim() || 'Нарушение';
    const duration = document.getElementById('ban-tg-duration').value;
    if (!tg || !db) return alert('Введите Telegram ID');
    db.collection('bans').add({
        type: 'telegram', target: tg, reason, duration,
        expiresStr: duration === 'permanent' ? 'Навсегда' : duration,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('📱 Telegram заблокирован: ' + tg, 'ban');
        addLog('ban', 'TG-бан: ' + tg);
        document.getElementById('ban-tg-target').value = '';
        document.getElementById('ban-tg-reason').value = '';
    });
}

function unbanTelegram() {
    const tg = document.getElementById('unban-tg-target').value.trim();
    if (!tg || !db) return alert('Введите Telegram ID');
    db.collection('bans').where('target','==',tg).where('type','==','telegram').where('active','==',true).get().then(snap => {
        if (snap.empty) return alert('Бан не найден');
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('✅ TG-бан снят: ' + tg, 'unban');
            addLog('unban', 'TG-анбан: ' + tg);
            document.getElementById('unban-tg-target').value = '';
        });
    });
}

function banSiteId() {
    const sid = document.getElementById('ban-sid-target').value.trim();
    const reason = document.getElementById('ban-sid-reason').value.trim() || 'Нарушение';
    const duration = document.getElementById('ban-sid-duration').value;
    if (!sid || !db) return alert('Введите Site ID');
    db.collection('bans').add({
        type: 'siteid', target: sid, reason, duration,
        expiresStr: duration === 'permanent' ? 'Навсегда' : duration,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('🆔 Site ID заблокирован: ' + sid, 'ban');
        addLog('ban', 'Site ID бан: ' + sid);
        document.getElementById('ban-sid-target').value = '';
        document.getElementById('ban-sid-reason').value = '';
    });
}

function unbanSiteId() {
    const sid = document.getElementById('unban-sid-target').value.trim();
    if (!sid || !db) return alert('Введите Site ID');
    db.collection('bans').where('target','==',sid).where('type','==','siteid').where('active','==',true).get().then(snap => {
        if (snap.empty) return alert('Бан не найден');
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('✅ Site ID бан снят: ' + sid, 'unban');
            addLog('unban', 'Site ID анбан: ' + sid);
            document.getElementById('unban-sid-target').value = '';
        });
    });
}

function massBan() {
    const raw = document.getElementById('mass-ban-targets').value.trim();
    const type = document.getElementById('mass-ban-type').value;
    const reason = document.getElementById('mass-ban-reason').value.trim() || 'Массовый бан';
    const duration = document.getElementById('mass-ban-duration').value;
    if (!raw || !db) return alert('Введите список целей');
    const targets = raw.split('\n').map(s => s.trim()).filter(Boolean);
    if (!targets.length) return;
    const batch = db.batch();
    targets.forEach(target => {
        const ref = db.collection('bans').doc();
        batch.set(ref, { type, target, reason, duration, expiresStr: duration === 'permanent' ? 'Навсегда' : duration, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    batch.commit().then(() => {
        showNotif('💥 Массовый бан: ' + targets.length + ' целей', 'ban');
        addLog('ban', 'Массовый бан: ' + targets.length + ' целей');
        document.getElementById('mass-ban-targets').value = '';
    });
}

function massUnban() {
    if (!confirm('Снять ВСЕ активные баны?')) return;
    if (!db) return;
    db.collection('bans').where('active','==',true).get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('✅ Снято ' + snap.size + ' банов', 'unban');
            addLog('unban', 'Массовый анбан: ' + snap.size + ' банов');
        });
    });
}

function unbanById(id) {
    if (!db) return;
    db.collection('bans').doc(id).update({ active: false }).then(() => {
        showNotif('✅ Бан снят', 'unban');
        addLog('unban', 'Бан снят по ID: ' + id);
    });
}

function quickBan(target) {
    if (!target || !confirm('Забанить ' + target + '?')) return;
    if (!db) return;
    db.collection('bans').add({
        type: 'account', target, reason: 'Быстрый бан', duration: 'permanent',
        expiresStr: 'Навсегда', active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('🚫 Бан выдан: ' + target, 'ban');
        addLog('ban', 'Быстрый бан: ' + target);
    });
}

function quickUnban(target) {
    if (!target) return;
    if (!db) return;
    db.collection('bans').where('target','==',target).where('active','==',true).get().then(snap => {
        if (snap.empty) return alert('Бан не найден');
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { active: false }));
        batch.commit().then(() => {
            showNotif('✅ Бан снят: ' + target, 'unban');
            addLog('unban', 'Быстрый анбан: ' + target);
        });
    });
}

// ============================================
// ==== WARNS =====
// ============================================

function loadWarns() {
    if (!db) return;
    const list = document.getElementById('warns-list');
    if (!list) return;
    db.collection('warns').where('active','==',true).onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">⚠️</span>
                <div class="text"><div class="title">${d.target}</div><div class="sub">${d.reason || '—'}</div></div>
                <button class="btn-sm success" onclick="db.collection('warns').doc('${doc.id}').update({active:false})">✅</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет предупреждений</div>';
    });
}

function warnUser() {
    const target = document.getElementById('warn-target').value.trim();
    const reason = document.getElementById('warn-reason').value.trim() || 'Нарушение';
    if (!target || !db) return alert('Введите идентификатор');
    db.collection('warns').add({ target, reason, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => {
        showNotif('⚠️ Предупреждение: ' + target, 'warn');
        addLog('warn', 'Варн: ' + target);
        document.getElementById('warn-target').value = '';
        document.getElementById('warn-reason').value = '';
    });
}

// ============================================
// ==== LOGS =====
// ============================================

function loadLogs() {
    if (!db) return;
    const list = document.getElementById('all-logs');
    if (!list) return;
    db.collection('logs').orderBy('createdAt','desc').limit(200).onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            const typeMap = { ban: '🚫 BAN', unban: '🔓 UNBAN', warn: '⚠️ WARN', admin: '👑 ADMIN', system: '💻 SYS', reg: '📋 REG' };
            html += `<div class="log-item">
                <span class="log-time">${d.createdAt?.toDate?.().toLocaleTimeString('ru-RU') || '—'}</span>
                <span class="log-type ${d.type || 'system'}">[${typeMap[d.type] || d.type}]</span>
                <span class="log-msg">${d.message || ''}</span>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">Нет логов</div>';
    });
}

function filterLogs() {
    const q = document.getElementById('log-search').value.toLowerCase();
    document.querySelectorAll('#all-logs .log-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function addLog(type, message) {
    if (!db) return;
    db.collection('logs').add({ type, message, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

function clearLogs() {
    if (!confirm('Очистить все логи?')) return;
    if (!db) return;
    db.collection('logs').limit(500).get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        batch.commit().then(() => {
            showNotif('🗑️ Логи очищены', 'info');
            addLog('admin', 'Логи очищены');
        });
    });
}

// ============================================
// ==== SEARCH USER =====
// ============================================

function searchUser() {
    const q = document.getElementById('user-search-input').value.trim();
    const res = document.getElementById('user-search-result');
    if (!q || !db) return;
    res.innerHTML = '<div style="padding:20px;color:rgba(255,255,255,0.4);">Поиск...</div>';
    Promise.all([
        db.collection('users').where('telegramId','==',q).get(),
        db.collection('users').where('nickname','==',q).get(),
        db.collection('users').where('siteNick','==',q).get(),
        db.collection('users').where('siteId','==',q).get()
    ]).then(results => {
        const found = new Map();
        results.forEach(snap => snap.forEach(doc => found.set(doc.id, doc.data())));
        if (!found.size) { res.innerHTML = '<div style="padding:20px;color:#ff0080;">❌ Пользователь не найден</div>'; return; }
        let html = '';
        found.forEach((u, id) => {
            html += `<div class="user-result-card">
                <div style="font-weight:700;font-size:1.1em;margin-bottom:12px;">${u.siteNick || u.nickname || 'Без имени'}</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;">
                    <div style="background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:6px;"><span style="color:rgba(255,255,255,0.4);font-size:0.7em;">Telegram</span><br><strong>${u.telegramId || u.telegram_id || '—'}</strong></div>
                    <div style="background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:6px;"><span style="color:rgba(255,255,255,0.4);font-size:0.7em;">Ник MC</span><br><strong>${u.nickname || '—'}</strong></div>
                    <div style="background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:6px;"><span style="color:rgba(255,255,255,0.4);font-size:0.7em;">Site ID</span><br><strong>${u.siteId || '—'}</strong></div>
                    <div style="background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:6px;"><span style="color:rgba(255,255,255,0.4);font-size:0.7em;">Статус</span><br><strong style="color:${u.verified ? '#00ff88' : '#fbbf24'};">${u.verified ? '✅ Подтверждён' : '⏳ Не подтверждён'}</strong></div>
                </div>
                <div style="display:flex;gap:8px;margin-top:12px;">
                    <button class="btn-sm danger" onclick="quickBan('${u.siteId || u.telegramId || u.telegram_id}')">🚫 Бан</button>
                    <button class="btn-sm success" onclick="quickUnban('${u.siteId || u.telegramId || u.telegram_id}')">🔓 Анбан</button>
                </div>
            </div>`;
        });
        res.innerHTML = html;
    });
}

// ============================================
// ==== ANNOUNCEMENTS =====
// ============================================

function loadAnnouncements() {
    if (!db) return;
    const list = document.getElementById('announcements-list');
    if (!list) return;
    db.collection('announcements').orderBy('createdAt','desc').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">${d.pinned ? '📌' : '📢'}</span>
                <div class="text"><div class="title">${d.title || '—'}</div><div class="sub">${d.body?.slice(0,60) || '—'}</div></div>
                <button class="btn-sm danger" onclick="db.collection('announcements').doc('${doc.id}').delete()">🗑️</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет объявлений</div>';
    });
}

function createAnnouncement() {
    const title = document.getElementById('ann-title').value.trim();
    const type = document.getElementById('ann-type').value;
    const body = document.getElementById('ann-body').value.trim();
    if (!title || !body || !db) return alert('Заполните поля');
    db.collection('announcements').add({
        title, type, body,
        pinned: document.getElementById('ann-pinned').checked,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('📢 Объявление опубликовано', 'info');
        addLog('admin', 'Объявление: ' + title);
        document.getElementById('ann-title').value = '';
        document.getElementById('ann-body').value = '';
    });
}

// ============================================
// ==== NEWS =====
// ============================================

function loadNews() {
    if (!db) return;
    const list = document.getElementById('news-admin-list');
    if (!list) return;
    db.collection('news').orderBy('createdAt','desc').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">📰</span>
                <div class="text"><div class="title">${d.title || '—'}</div><div class="sub">${d.badge || ''}</div></div>
                <button class="btn-sm danger" onclick="db.collection('news').doc('${doc.id}').delete()">🗑️</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет новостей</div>';
    });
}

function createNews() {
    const title = document.getElementById('news-title').value.trim();
    const badge = document.getElementById('news-badge-txt').value.trim();
    const body = document.getElementById('news-body').value.trim();
    if (!title || !body || !db) return alert('Заполните поля');
    db.collection('news').add({ title, badge, body, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => {
        showNotif('📰 Новость опубликована', 'info');
        addLog('admin', 'Новость: ' + title);
        document.getElementById('news-title').value = '';
        document.getElementById('news-badge-txt').value = '';
        document.getElementById('news-body').value = '';
    });
}

// ============================================
// ==== BLACKLIST =====
// ============================================

function loadBlacklist() {
    if (!db) return;
    const list = document.getElementById('bl-nicks-list');
    if (!list) return;
    db.collection('blacklistNicks').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">🔇</span>
                <div class="text"><div class="title">${d.nick}</div><div class="sub">${d.reason || '—'}</div></div>
                <button class="btn-sm success" onclick="db.collection('blacklistNicks').doc('${doc.id}').delete()">✅</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Список пуст</div>';
    });
}

function addBlacklistNick() {
    const nick = document.getElementById('bl-nick-input').value.trim();
    const reason = document.getElementById('bl-nick-reason').value.trim() || '';
    if (!nick || !db) return alert('Введите ник');
    db.collection('blacklistNicks').doc(nick.toLowerCase()).set({ nick, reason, addedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => {
        showNotif('🔇 Ник запрещён: ' + nick, 'ban');
        addLog('admin', 'Ник в ЧС: ' + nick);
        document.getElementById('bl-nick-input').value = '';
        document.getElementById('bl-nick-reason').value = '';
    });
}

// ============================================
// ==== IP WHITELIST =====
// ============================================

function loadIPWhitelist() {
    if (!db) return;
    const list = document.getElementById('ip-whitelist-list');
    if (!list) return;
    db.collection('ipWhitelist').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">✅</span>
                <div class="text"><div class="title">${d.ip}</div><div class="sub">${d.note || '—'}</div></div>
                <button class="btn-sm danger" onclick="db.collection('ipWhitelist').doc('${doc.id}').delete()">🗑️</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Whitelist пуст</div>';
    });
}

function addIPWhitelist() {
    const ip = document.getElementById('wl-ip-target').value.trim();
    const note = document.getElementById('wl-ip-note').value.trim() || '';
    if (!ip || !db) return alert('Введите IP');
    db.collection('ipWhitelist').doc(ip).set({ ip, note, addedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => {
        showNotif('✅ IP в whitelist: ' + ip, 'info');
        addLog('admin', 'IP в whitelist: ' + ip);
        document.getElementById('wl-ip-target').value = '';
        document.getElementById('wl-ip-note').value = '';
    });
}

// ============================================
// ==== APPEALS =====
// ============================================

function loadAppeals() {
    if (!db) return;
    const list = document.getElementById('appeals-list');
    if (!list) return;
    db.collection('appeals').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">📨</span>
                <div class="text"><div class="title">${d.target || '—'}</div><div class="sub">${d.reason || '—'}</div></div>
                <button class="btn-sm success" onclick="approveAppeal('${doc.id}')">✅</button>
                <button class="btn-sm danger" onclick="rejectAppeal('${doc.id}')">❌</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет апелляций</div>';
    });
}

function approveAppeal(id) {
    if (!db) return;
    db.collection('appeals').doc(id).update({ status: 'approved' });
    showNotif('✅ Апелляция принята', 'unban');
}

function rejectAppeal(id) {
    if (!db) return;
    db.collection('appeals').doc(id).update({ status: 'rejected' });
    showNotif('❌ Апелляция отклонена', 'ban');
}

// ============================================
// ==== SUSPICIOUS =====
// ============================================

function loadSuspicious() {
    if (!db) return;
    const list = document.getElementById('suspicious-list');
    if (!list) return;
    db.collection('suspicious').where('active','==',true).onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="feed-item">
                <span class="icon">🔍</span>
                <div class="text"><div class="title">${d.target || '—'}</div><div class="sub">${d.reason || '—'}</div></div>
                <button class="btn-sm danger" onclick="quickBan('${d.target}')">🚫</button>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет подозрительных</div>';
    });
}

function banAllSuspicious() {
    if (!confirm('Забанить всех подозрительных?')) return;
    if (!db) return;
    db.collection('suspicious').where('active','==',true).get().then(snap => {
        const batch = db.batch();
        snap.forEach(doc => {
            const d = doc.data();
            const ref = db.collection('bans').doc();
            batch.set(ref, { type: 'account', target: d.target, reason: 'Подозрительная активность', duration: '7d', expiresStr: '7 дней', active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            batch.update(doc.ref, { active: false });
        });
        batch.commit().then(() => {
            showNotif('🚫 Забанено: ' + snap.size + ' подозрительных', 'ban');
            addLog('ban', 'Забанено подозрительных: ' + snap.size);
        });
    });
}

// ============================================
// ==== ADMIN LOG =====
// ============================================

function loadAdminLog() {
    if (!db) return;
    const list = document.getElementById('admin-action-log');
    if (!list) return;
    db.collection('adminLogs').orderBy('createdAt','desc').limit(100).onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="log-item">
                <span class="log-time">${d.createdAt?.toDate?.().toLocaleString('ru-RU') || '—'}</span>
                <span class="log-type admin">[ADMIN]</span>
                <span class="log-msg">${d.action || ''}</span>
            </div>`;
        });
        list.innerHTML = html || '<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);">Нет действий</div>';
    });
}

function addAdminLog(action) {
    if (!db) return;
    db.collection('adminLogs').add({ action, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

// ============================================
// ==== ROLES =====
// ============================================

function loadRoles() {
    if (!db) return;
    const list = document.getElementById('roles-list');
    if (!list) return;
    db.collection('users').onSnapshot(snap => {
        const roles = {};
        snap.forEach(doc => {
            const r = doc.data().role || 'player';
            roles[r] = (roles[r] || 0) + 1;
        });
        let html = '';
        Object.entries(roles).forEach(([r, c]) => {
            html += `<div class="feed-item"><span class="icon">🎖️</span><div class="text"><div class="title">${r}</div></div><div style="font-family:'Orbitron',monospace;font-weight:700;color:#a78bfa;">${c}</div></div>`;
        });
        list.innerHTML = html || '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);">Нет данных</div>';
    });
}

function assignRole() {
    const target = document.getElementById('role-target').value.trim();
    const role = document.getElementById('role-select').value;
    if (!target || !db) return alert('Введите идентификатор');
    db.collection('users').where('siteId','==',target).get().then(snap => {
        if (snap.empty) { alert('Пользователь не найден'); return; }
        const batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { role }));
        batch.commit().then(() => {
            showNotif('🎖️ Роль назначена: ' + target + ' → ' + role, 'info');
            addLog('admin', 'Роль: ' + target + ' → ' + role);
            document.getElementById('role-target').value = '';
        });
    });
}

// ============================================
// ==== SETTINGS =====
// ============================================

function toggleMaintenance() {
    if (!db) return;
    const val = document.getElementById('sec-maintenance').checked;
    db.collection('settings').doc('site').set({ maintenance: val }, { merge: true }).then(() => {
        showNotif('🔧 Тех. работы: ' + (val ? 'включены' : 'выключены'), 'info');
        addLog('admin', 'Тех. работы: ' + (val ? 'вкл' : 'выкл'));
    });
}

function toggleRegistration() {
    if (!db) return;
    const val = document.getElementById('sec-registration').checked;
    db.collection('settings').doc('site').set({ registrationOpen: val }, { merge: true }).then(() => {
        showNotif('📋 Регистрация: ' + (val ? 'открыта' : 'закрыта'), 'info');
        addLog('admin', 'Регистрация: ' + (val ? 'открыта' : 'закрыта'));
    });
}

function saveSecuritySettings() {
    if (!db) return;
    const s = {
        vpnDetect: document.getElementById('sec-vpn-detect').checked,
        autoBan: document.getElementById('sec-auto-ban').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection('settings').doc('security').set(s).then(() => {
        showNotif('💾 Настройки безопасности сохранены', 'info');
        addLog('admin', 'Настройки безопасности сохранены');
    });
}

function triggerLockdown() {
    if (!confirm('⚠️ АКТИВИРОВАТЬ ЭКСТРЕННЫЙ ЛОКДАУН?')) return;
    if (!db) return;
    db.collection('settings').doc('site').set({ lockdown: true, maintenance: true }, { merge: true }).then(() => {
        showNotif('🔒 ЛОКДАУН АКТИВИРОВАН!', 'ban');
        addLog('admin', '⚠️ ЛОКДАУН АКТИВИРОВАН');
    });
}

function deactivateLockdown() {
    if (!db) return;
    db.collection('settings').doc('site').set({ lockdown: false, maintenance: false }, { merge: true }).then(() => {
        showNotif('✅ Локдаун снят', 'unban');
        addLog('admin', 'Локдаун снят');
    });
}

function saveSettings() {
    if (!db) return;
    const s = {
        name: document.getElementById('set-server-name').value.trim(),
        desc: document.getElementById('set-server-desc').value.trim(),
        ip: document.getElementById('set-server-ip').value.trim(),
        discord: document.getElementById('set-discord').value.trim(),
        telegram: document.getElementById('set-telegram').value.trim()
    };
    db.collection('settings').doc('general').set(s).then(() => {
        showNotif('💾 Настройки сохранены', 'info');
        addLog('admin', 'Настройки сайта сохранены');
    });
}

function saveServerSettings() {
    if (!db) return;
    const s = {
        mcVersion: document.getElementById('mc-version').value.trim(),
        port: document.getElementById('mc-port').value.trim(),
        rconIp: document.getElementById('rcon-ip').value.trim(),
        slots: document.getElementById('mc-slots').value.trim()
    };
    db.collection('settings').doc('server').set(s).then(() => {
        showNotif('💾 Настройки сервера сохранены', 'info');
        addLog('admin', 'Настройки сервера сохранены');
    });
}

function saveRateLimits() {
    if (!db) return;
    const s = {
        maxReq: document.getElementById('rl-max-req').value,
        maxReg: document.getElementById('rl-max-reg').value,
        blockTime: document.getElementById('rl-block-time').value
    };
    db.collection('settings').doc('rateLimits').set(s).then(() => {
        showNotif('⏱️ Rate Limits сохранены', 'info');
        addLog('admin', 'Rate Limits сохранены');
    });
}

function saveWebhook() {
    if (!db) return;
    const s = {
        url: document.getElementById('webhook-url').value.trim(),
        name: document.getElementById('webhook-name').value.trim(),
        bans: document.getElementById('webhook-bans').checked,
        regs: document.getElementById('webhook-regs').checked
    };
    db.collection('settings').doc('webhook').set(s).then(() => {
        showNotif('🔗 Webhook сохранён', 'info');
        addLog('admin', 'Webhook сохранён');
    });
}

function testWebhook() {
    const url = document.getElementById('webhook-url').value.trim();
    if (!url) return alert('Введите URL');
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '✅ Тестовое сообщение от AdminPanel' })
    }).then(() => showNotif('✅ Webhook работает!', 'info'))
    .catch(() => showNotif('❌ Ошибка Webhook', 'ban'));
}

// ============================================
// ==== EXPORT / BACKUP =====
// ============================================

function exportUsers() {
    if (!db) return;
    db.collection('users').get().then(snap => {
        let csv = 'Ник сайта,Ник MC,Site ID,TG ID,Дата\n';
        snap.forEach(doc => {
            const d = doc.data();
            csv += `${d.siteNick||''},${d.nickname||''},${d.siteId||''},${d.telegramId||d.telegram_id||''},${d.registered_at||''}\n`;
        });
        downloadFile('users.csv', csv);
        showNotif('📤 Экспорт игроков выполнен', 'info');
    });
}

function exportBansCSV() {
    if (!db) return;
    db.collection('bans').get().then(snap => {
        let csv = 'Тип,Цель,Причина,Срок,Статус,Дата\n';
        snap.forEach(doc => {
            const d = doc.data();
            csv += `${d.type||''},${d.target||''},${d.reason||''},${d.expiresStr||''},${d.active?'Активен':'Снят'},${d.createdAt?.toDate?.().toLocaleDateString('ru-RU')||''}\n`;
        });
        downloadFile('bans.csv', csv);
        showNotif('📤 Экспорт банов выполнен', 'info');
    });
}

function exportLogsCSV() {
    if (!db) return;
    db.collection('logs').orderBy('createdAt','desc').limit(1000).get().then(snap => {
        let csv = 'Тип,Сообщение,Дата\n';
        snap.forEach(doc => {
            const d = doc.data();
            csv += `${d.type||''},${(d.message||'').replace(/,/g,';')},${d.createdAt?.toDate?.().toLocaleString('ru-RU')||''}\n`;
        });
        downloadFile('logs.csv', csv);
        showNotif('📤 Экспорт логов выполнен', 'info');
    });
}

function exportAllJSON() {
    if (!db) return;
    Promise.all([
        db.collection('users').get(),
        db.collection('bans').get(),
        db.collection('logs').limit(500).get()
    ]).then(([users, bans, logs]) => {
        const data = { users: [], bans: [], logs: [] };
        users.forEach(d => data.users.push({ id: d.id, ...d.data() }));
        bans.forEach(d => data.bans.push({ id: d.id, ...d.data() }));
        logs.forEach(d => data.logs.push({ id: d.id, ...d.data() }));
        downloadFile('backup.json', JSON.stringify(data, null, 2));
        showNotif('📦 Полный экспорт выполнен', 'info');
    });
}

function backupUsers() { exportUsers(); }
function backupBans() { exportBansCSV(); }
function backupLogs() { exportLogsCSV(); }
function fullBackup() { exportAllJSON(); }

// ============================================
// ==== MESSAGES =====
// ============================================

function sendMessage() {
    const target = document.getElementById('msg-target').value.trim();
    const subject = document.getElementById('msg-subject').value.trim();
    const body = document.getElementById('msg-body').value.trim();
    if (!target || !subject || !body || !db) return alert('Заполните все поля');
    db.collection('messages').add({
        target, subject, body, read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('✉️ Сообщение отправлено: ' + target, 'info');
        addLog('admin', 'Сообщение: ' + target);
        document.getElementById('msg-target').value = '';
        document.getElementById('msg-subject').value = '';
        document.getElementById('msg-body').value = '';
    });
}

// ============================================
// ==== MOTD =====
// ============================================

function saveMOTD() {
    const motd = document.getElementById('motd-text').value.trim();
    const ip = document.getElementById('server-ip-setting').value.trim();
    if (!db) return;
    db.collection('settings').doc('motd').set({ motd, ip, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(() => {
            showNotif('💬 MOTD сохранён', 'info');
            addLog('admin', 'MOTD обновлён');
        });
}

// ============================================
// ==== NOTIFICATIONS =====
// ============================================

function saveNotificationSettings() {
    if (!db) return;
    const s = {
        notifBan: document.getElementById('notif-ban').checked,
        notifReg: document.getElementById('notif-reg').checked,
        notifSuspicious: document.getElementById('notif-suspicious').checked,
        notifAppeal: document.getElementById('notif-appeal').checked,
        botToken: document.getElementById('notif-bot-token').value.trim(),
        chatId: document.getElementById('notif-chat-id').value.trim()
    };
    db.collection('settings').doc('notifications').set(s).then(() => {
        showNotif('🔔 Настройки уведомлений сохранены', 'info');
        addLog('admin', 'Настройки уведомлений сохранены');
    });
}

// ============================================
// ==== RULES =====
// ============================================

function saveRule() {
    const num = document.getElementById('rule-num').value.trim();
    const title = document.getElementById('rule-title-input').value.trim();
    const body = document.getElementById('rule-body').value.trim();
    if (!title || !body || !db) return alert('Заполните поля');
    db.collection('rules').doc(num || Date.now().toString()).set({
        num, title, body,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotif('📜 Правило сохранено: ' + title, 'info');
        addLog('admin', 'Правило: ' + title);
        document.getElementById('rule-num').value = '';
        document.getElementById('rule-title-input').value = '';
        document.getElementById('rule-body').value = '';
    });
}

function changeAdminPassword() {
    const np = document.getElementById('new-admin-pass').value.trim();
    const cp = document.getElementById('confirm-admin-pass').value.trim();
    if (!np || np !== cp) return alert('Пароли не совпадают');
    if (np.length < 6) return alert('Пароль слишком короткий');
    localStorage.setItem('adminPassword', np);
    showNotif('🔒 Пароль изменён', 'info');
    addLog('admin', 'Пароль администратора изменён');
    document.getElementById('new-admin-pass').value = '';
    document.getElementById('confirm-admin-pass').value = '';
}

function saveTheme() {
    const theme = document.getElementById('theme-select').value;
    const speed = document.getElementById('rgb-speed').value;
    localStorage.setItem('adminTheme', theme);
    localStorage.setItem('rgbSpeed', speed);
    showNotif('🎨 Тема применена: ' + theme, 'info');
}

function downloadFile(name, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

// ============================================
// ==== CHARTS / ANALYTICS =====
// ============================================

function renderCharts() {
    if (!db) return;
    db.collection('users').get().then(snap => {
        const total = snap.size;
        document.getElementById('chart-regs').innerHTML = '';
        const data = Array(7).fill(0);
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.createdAt?.toDate?.() || new Date();
            const day = date.getDay();
            data[day] = (data[day] || 0) + 1;
        });
        const max = Math.max(...data, 1);
        const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
        data.forEach((v, i) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = Math.max(v/max*120, 8) + 'px';
            bar.title = days[i] + ': ' + v;
            const label = document.createElement('span');
            label.className = 'chart-bar-label';
            label.textContent = days[i];
            bar.appendChild(label);
            document.getElementById('chart-regs').appendChild(bar);
        });
    });
}

function renderRealtimeFeed() {
    const feed = document.getElementById('realtime-feed');
    if (!feed) return;
    const events = [
        { type: 'reg', icon: '👤', text: 'Новый игрок зарегистрировался' },
        { type: 'ban', icon: '🚫', text: 'Выдан бан игроку' },
        { type: 'unban', icon: '🔓', text: 'Снят бан с игрока' },
        { type: 'warn', icon: '⚠️', text: 'Выдано предупреждение' },
    ];
    setInterval(() => {
        const event = events[Math.floor(Math.random() * events.length)];
        const el = document.createElement('div');
        el.className = 'rt-event ' + event.type;
        el.innerHTML = `<span class="rt-time">${new Date().toLocaleTimeString('ru-RU')}</span><span class="rt-icon">${event.icon}</span><span class="rt-text">${event.text}</span>`;
        feed.prepend(el);
        while (feed.children.length > 50) feed.removeChild(feed.lastChild);
    }, 10000);
}

// ============================================
// ==== UTILITY =====
// ============================================

function setPresetReason(fieldId, value) {
    if (value) document.getElementById(fieldId).value = value;
}
