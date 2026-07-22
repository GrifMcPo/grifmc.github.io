// ========================================
// script.js — ОСНОВНАЯ ЛОГИКА
// GRIFMC • ANARCHY SURVIVAL
// ========================================

// ===== ЧАСТИЦЫ =====
(function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDelay = Math.random() * 15 + 's';
        p.style.animationDuration = (8 + Math.random() * 15) + 's';
        p.style.width = (2 + Math.random() * 5) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
})();

// ===== КОПИРОВАНИЕ IP =====
function copyIP() {
    const el = document.getElementById('server-ip');
    const ip = el.textContent;
    navigator.clipboard.writeText(ip).then(() => {
        el.classList.add('copied');
        el.textContent = '✅ Скопировано!';
        setTimeout(() => {
            el.textContent = ip;
            el.classList.remove('copied');
        }, 2000);
    });
}

// ===== ДАННЫЕ ПОЛЬЗОВАТЕЛЯ =====
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
if (userData.siteNick) {
    document.getElementById('user-name').textContent = userData.siteNick;
    document.getElementById('user-rank').textContent = '👑 Игрок';
    document.getElementById('logout-btn').style.display = 'inline-block';
}

// ===== ВЫХОД =====
function logout() {
    localStorage.removeItem('userData');
    window.location.reload();
}

// ===== СТАТИСТИКА В РЕАЛЬНОМ ВРЕМЕНИ =====
db.collection('users').onSnapshot(snap => {
    document.getElementById('stat-total').textContent = snap.size;
    
    // Топ игроков (карусель)
    const users = [];
    snap.forEach(d => users.push(d.data()));
    users.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    const track = document.getElementById('carousel-track');
    if (!track) return;
    if (users.length === 0) {
        track.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.15);padding:40px;width:100%;">Нет игроков</div>';
        return;
    }
    // Дублируем для бесконечной карусели
    const topUsers = users.slice(0,15);
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const renderItems = (list) => list.map((u, i) => `
        <div class="carousel-item">
            <div class="avatar">⛏️</div>
            <div class="rank">${medals[i] || '#'+(i+1)}</div>
            <div class="name">${u.siteNick || u.nickname || '—'}</div>
        </div>
    `).join('');
    // Дублируем для плавной анимации
    track.innerHTML = renderItems(topUsers) + renderItems(topUsers);
});

db.collection('bans').where('active','==',true).onSnapshot(snap => {
    document.getElementById('stat-bans').textContent = snap.size;
});

// ===== ОНЛАЙН И ТАЙМЕР =====
document.getElementById('stat-online').textContent = Math.floor(Math.random() * 25 + 8);

// Таймер до ивента (пример)
function updateEventTimer() {
    const now = new Date();
    const target = new Date();
    target.setDate(target.getDate() + 3);
    target.setHours(20, 0, 0, 0);
    const diff = target - now;
    if (diff <= 0) {
        document.getElementById('stat-event-timer').textContent = '🔥 ИДЁТ';
        return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    document.getElementById('stat-event-timer').textContent = `${d}д ${h}ч ${m}м`;
}
updateEventTimer();
setInterval(updateEventTimer, 60000);

// ===== НОВОСТИ ИЗ FIREBASE =====
db.collection('news').orderBy('createdAt','desc').onSnapshot(snap => {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    if (snap.empty) {
        grid.innerHTML = `
            <div class="news-card glass-card">
                <div class="news-badge update">🆕 Обновление</div>
                <div class="news-title">Сервер запущен!</div>
                <div class="news-text">Добро пожаловать на наш сервер. Регистрируйся и играй!</div>
                <div class="news-date">Сегодня</div>
            </div>
            <div class="news-card glass-card">
                <div class="news-badge event">⚡ Ивент</div>
                <div class="news-title">Турнир чемпионов</div>
                <div class="news-text">Каждое воскресенье в 20:00 разыгрываем призы</div>
                <div class="news-date">Вчера</div>
            </div>
            <div class="news-card glass-card">
                <div class="news-badge important">🛡️ Важно</div>
                <div class="news-title">Новый античит</div>
                <div class="news-text">Система обнаружения читеров обновлена</div>
                <div class="news-date">2 дня назад</div>
            </div>
        `;
        return;
    }
    grid.innerHTML = snap.docs.map(doc => {
        const n = doc.data();
        return `
            <div class="news-card glass-card ${n.important ? 'important' : ''}">
                <span class="news-badge ${n.badgeType || 'update'}">${n.badgeText || '📢 Обновление'}</span>
                <div class="news-title">${n.title || 'Без названия'}</div>
                <div class="news-text">${n.text || ''}</div>
                <div class="news-date">${n.createdAt?.toDate?.().toLocaleDateString('ru-RU') || 'Сегодня'}</div>
            </div>
        `;
    }).join('');
});

// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== АКТИВНАЯ ССЫЛКА =====
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

console.log('✅ GRIFMC • ANARCHY SURVIVAL — САЙТ ЗАГРУЖЕН!');
