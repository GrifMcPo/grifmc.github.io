/* ============================
   BAN-CHECK.JS
   Реальное время — проверка банов
   Подключать ПОСЛЕ firebase-config.js
   ============================ */

'use strict';

(function() {

    let db = null;
    let userIP = null;
    let userData = null;
    let banListeners = [];

    // Ждём инициализации Firebase
    function init() {
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            setTimeout(init, 300);
            return;
        }
        db = firebase.firestore();
        userData = JSON.parse(localStorage.getItem('userData') || '{}');
        getIP().then(startBanListeners);
    }

    // Получить IP пользователя
    async function getIP() {
        try {
            const r = await fetch('https://api.ipify.org?format=json');
            const j = await r.json();
            userIP = j.ip;
            const ipEl = document.getElementById('ipban-ip-text');
            if (ipEl) ipEl.textContent = userIP;
        } catch {
            userIP = 'unknown';
        }
        return userIP;
    }

    // Запустить слушатели банов в реальном времени
    function startBanListeners() {
        stopBanListeners();

        // ── 1. Проверка бана по Telegram ID ─────────────────────────
        if (userData.telegramId) {
            const unsub1 = db.collection('bans')
                .where('type', '==', 'telegram')
                .where('target', '==', userData.telegramId)
                .where('active', '==', true)
                .onSnapshot(snap => {
                    if (!snap.empty) {
                        const ban = snap.docs[0].data();
                        if (!isBanExpired(ban)) {
                            showAccountBan(ban, userData.telegramId);
                        }
                    }
                });
            banListeners.push(unsub1);
        }

        // ── 2. Проверка бана по Site ID ──────────────────────────────
        if (userData.siteId) {
            const unsub2 = db.collection('bans')
                .where('type', '==', 'siteid')
                .where('target', '==', userData.siteId)
                .where('active', '==', true)
                .onSnapshot(snap => {
                    if (!snap.empty) {
                        const ban = snap.docs[0].data();
                        if (!isBanExpired(ban)) {
                            showAccountBan(ban, userData.siteId);
                        }
                    }
                });
            banListeners.push(unsub2);
        }

        // ── 3. Проверка бана аккаунта (по siteNick / telegramId) ────
        const targets = [userData.telegramId, userData.siteId, userData.nickname, userData.siteNick].filter(Boolean);
        targets.forEach(target => {
            const unsub = db.collection('bans')
                .where('type', '==', 'account')
                .where('target', '==', target)
                .where('active', '==', true)
                .onSnapshot(snap => {
                    if (!snap.empty) {
                        const ban = snap.docs[0].data();
                        if (!isBanExpired(ban)) {
                            showAccountBan(ban, target);
                        }
                    }
                });
            banListeners.push(unsub);
        });

        // ── 4. Проверка IP-бана ──────────────────────────────────────
        if (userIP && userIP !== 'unknown') {
            const unsub4 = db.collection('bans')
                .where('type', '==', 'ip')
                .where('target', '==', userIP)
                .where('active', '==', true)
                .onSnapshot(snap => {
                    if (!snap.empty) {
                        const ban = snap.docs[0].data();
                        if (!isBanExpired(ban)) {
                            showIPBan(ban);
                        }
                    }
                });
            banListeners.push(unsub4);
        }

        // ── 5. Проверка режима локдауна/тех. работ ──────────────────
        const unsub5 = db.collection('settings').doc('site').onSnapshot(snap => {
            if (snap.exists) {
                const d = snap.data();
                if (d.lockdown) {
                    showLockdown();
                }
                if (d.maintenance) {
                    showMaintenance();
                }
            }
        });
        banListeners.push(unsub5);
    }

    function stopBanListeners() {
        banListeners.forEach(unsub => { try { unsub(); } catch {} });
        banListeners = [];
    }

    // Проверить истёк ли бан
    function isBanExpired(ban) {
        if (!ban.expires) return false;
        const now = new Date();
        const expDate = ban.expires.toDate ? ban.expires.toDate() : new Date(ban.expires);
        return expDate < now;
    }

    // ── ПОКАЗАТЬ БАН АККАУНТА ────────────────────────────────────────────
    function showAccountBan(ban, target) {
        const overlay = document.getElementById('ban-overlay');
        if (!overlay) return;

        const reasonEl  = document.getElementById('ban-reason-text');
        const expiresEl = document.getElementById('ban-expires-text');
        const tgEl      = document.getElementById('ban-tg-text');

        if (reasonEl)  reasonEl.textContent  = ban.reason || 'Нарушение правил';
        if (expiresEl) expiresEl.textContent = ban.expiresStr || 'Навсегда';
        if (tgEl)      tgEl.textContent      = target || userData.telegramId || '—';

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Скрыть все остальные секции
        hidePageContent();

        // Частицы красного оттенка
        animateBanOverlay(overlay, '#ff0080');
    }

    // ── ПОКАЗАТЬ IP-БАН ──────────────────────────────────────────────────
    function showIPBan(ban) {
        const overlay = document.getElementById('ipban-overlay');
        if (!overlay) return;

        const reasonEl  = document.getElementById('ipban-reason-text');
        const expiresEl = document.getElementById('ipban-expires-text');
        const ipEl      = document.getElementById('ipban-ip-text');

        if (reasonEl)  reasonEl.textContent  = ban.reason || 'Нарушение';
        if (expiresEl) expiresEl.textContent = ban.expiresStr || 'Навсегда';
        if (ipEl)      ipEl.textContent      = userIP || '—';

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        hidePageContent();
        animateBanOverlay(overlay, '#ff6600');
    }

    // ── ЛОКДАУН ──────────────────────────────────────────────────────────
    function showLockdown() {
        if (document.getElementById('lockdown-overlay')) return;
        const el = document.createElement('div');
        el.id = 'lockdown-overlay';
        el.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.97);backdrop-filter:blur(16px);';
        el.innerHTML = `
            <div style="text-align:center;max-width:420px;padding:48px 32px;">
                <div style="font-size:4em;margin-bottom:16px;animation:banIconShake 0.6s ease 0.3s;">🔒</div>
                <h1 style="font-family:'Orbitron',monospace;font-size:1.6em;font-weight:900;background:linear-gradient(90deg,#ff0080,#7b2fff,#00d4ff,#ff0080);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rgbFlow 3s linear infinite;margin-bottom:12px;">Сервер временно недоступен</div>
                <p style="color:rgba(255,255,255,0.45);margin-bottom:24px;">Ведутся технические работы. Попробуйте позже.</p>
                <div style="display:inline-block;padding:8px 20px;background:rgba(255,102,0,0.1);border:1px solid rgba(255,102,0,0.3);border-radius:20px;color:#ff6600;font-size:0.85em;">⏳ Подождите...</div>
            </div>`;
        document.body.appendChild(el);
        hidePageContent();
    }

    // ── ТЕХ. РАБОТЫ ──────────────────────────────────────────────────────
    function showMaintenance() {
        if (document.getElementById('maintenance-overlay')) return;
        const el = document.createElement('div');
        el.id = 'maintenance-overlay';
        el.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);';
        el.innerHTML = `
            <div style="text-align:center;max-width:420px;padding:48px 32px;">
                <div style="font-size:4em;margin-bottom:16px;">🔧</div>
                <h1 style="font-family:'Orbitron',monospace;font-size:1.5em;font-weight:900;color:#f1c40f;text-shadow:0 0 30px rgba(241,196,15,0.5);margin-bottom:12px;">Технические работы</h1>
                <p style="color:rgba(255,255,255,0.45);">Сайт временно недоступен. Мы скоро вернёмся!</p>
            </div>`;
        document.body.appendChild(el);
    }

    // ── АНИМАЦИЯ ПРИ БАНЕ ────────────────────────────────────────────────
    function animateBanOverlay(overlay, color) {
        let shake = 0;
        const interval = setInterval(() => {
            shake = !shake;
            overlay.style.transform = shake ? 'translateX(2px)' : 'translateX(-2px)';
        }, 80);
        setTimeout(() => {
            clearInterval(interval);
            overlay.style.transform = '';
        }, 500);
    }

    // Скрыть основной контент под оверлеем
    function hidePageContent() {
        const app = document.getElementById('app');
        const main = document.querySelector('.main-content');
        if (app)  app.style.filter  = 'blur(8px) brightness(0.3)';
        if (main) main.style.filter = 'blur(8px) brightness(0.3)';
    }

    // ── ПУБЛИЧНЫЙ API ─────────────────────────────────────────────────────
    window.BanCheck = {
        // Вызывается после успешной регистрации для сохранения данных
        setUser: function(data) {
            userData = data;
            localStorage.setItem('userData', JSON.stringify(data));
            if (db) startBanListeners();
        },

        // Ручная проверка бана (один раз)
        checkNow: async function() {
            if (!db || !userData) return;
            const targets = [userData.telegramId, userData.siteId].filter(Boolean);
            for (const target of targets) {
                const snap = await db.collection('bans')
                    .where('target', '==', target)
                    .where('active', '==', true)
                    .get();
                if (!snap.empty) {
                    const ban = snap.docs[0].data();
                    if (!isBanExpired(ban)) {
                        if (ban.type === 'ip') showIPBan(ban);
                        else showAccountBan(ban, target);
                        return true;
                    }
                }
            }
            // Проверка IP
            if (userIP && userIP !== 'unknown') {
                const ipSnap = await db.collection('bans')
                    .where('type', '==', 'ip')
                    .where('target', '==', userIP)
                    .where('active', '==', true)
                    .get();
                if (!ipSnap.empty) {
                    const ban = ipSnap.docs[0].data();
                    if (!isBanExpired(ban)) {
                        showIPBan(ban);
                        return true;
                    }
                }
            }
            return false;
        },

        // Подать апелляцию (из формы пользователя, если хочешь добавить)
        submitAppeal: async function(target, reason) {
            if (!db) return;
            await db.collection('appeals').add({
                target, reason,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    };

    // Старт!
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
