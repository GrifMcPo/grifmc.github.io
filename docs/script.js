// ===== ЭЛЕМЕНТЫ =====
const form = document.getElementById('register-form');
const telegramIdInput = document.getElementById('telegram-id');
const nicknameInput = document.getElementById('nickname');
const siteNickInput = document.getElementById('site-nick');
const siteIdInput = document.getElementById('site-id');
const messageDiv = document.getElementById('message');
const codeSection = document.getElementById('code-section');
const codeInput = document.getElementById('code-input');
const verifyBtn = document.getElementById('verify-btn');
const codeStatus = document.getElementById('code-status');
const registerBtn = document.getElementById('register-btn');

// ===== ГЕНЕРАЦИЯ КОДА =====
function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// ===== ПОКАЗАТЬ СООБЩЕНИЕ =====
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
}

function hideMessage() {
    messageDiv.style.display = 'none';
}

// ===== БЕТА-ЭКРАН =====
function showBetaScreen() {
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="beta-screen fade-in">
            <h1>🎉</h1>
            <h2>Сайт в бета-тесте!</h2>
            <p>Спасибо за регистрацию!</p>
            <p class="version">Версия 0.1.0</p>
        </div>
    `;
}

// ===== ПРОВЕРКА СУЩЕСТВУЕТ ЛИ ПОЛЬЗОВАТЕЛЬ =====
async function userExists(field, value) {
    const snapshot = await db.collection('users').where(field, '==', value).get();
    return !snapshot.empty;
}

// ===== РЕГИСТРАЦИЯ =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const telegramId = telegramIdInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const siteNick = siteNickInput.value.trim();
    const siteId = siteIdInput.value.trim();

    // Валидация
    if (!telegramId || !nickname || !siteNick || !siteId) {
        showMessage('❌ Заполните все поля!', 'error');
        return;
    }

    if (!/^\d+$/.test(telegramId)) {
        showMessage('❌ Telegram ID должен содержать только цифры!', 'error');
        return;
    }

    if (nickname.length < 3 || nickname.length > 16) {
        showMessage('❌ Ник должен быть от 3 до 16 символов!', 'error');
        return;
    }

    try {
        registerBtn.disabled = true;
        registerBtn.textContent = '⏳ Отправка...';

        // Проверка ника
        if (await userExists('nickname', nickname)) {
            showMessage('❌ Этот ник уже зарегистрирован!', 'error');
            registerBtn.disabled = false;
            registerBtn.textContent = 'Зарегистрироваться';
            return;
        }

        // Проверка Telegram ID
        if (await userExists('telegram_id', telegramId)) {
            showMessage('❌ Этот Telegram ID уже зарегистрирован!', 'error');
            registerBtn.disabled = false;
            registerBtn.textContent = 'Зарегистрироваться';
            return;
        }

        // Генерируем код
        const code = generateCode();

        // Сохраняем в Firebase
        await db.collection('users').doc(telegramId).set({
            telegram_id: telegramId,
            nickname: nickname,
            site_nick: siteNick,
            site_id: siteId,
            code: code,
            verified: false,
            code_sent: false,
            registered_at: new Date().toLocaleString()
        });

        // Показываем поле для кода
        codeSection.style.display = 'block';
        codeInput.value = '';
        codeStatus.textContent = '📨 Код отправлен в чат сервера!';
        codeStatus.style.color = '#2ecc71';
        form.style.display = 'none';

        showMessage('✅ Запрос отправлен! Введите код из чата сервера.', 'success');

    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Ошибка: ' + error.message, 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Зарегистрироваться';
    }
});

// ===== ПРОВЕРКА КОДА =====
verifyBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    const telegramId = telegramIdInput.value.trim();

    if (!code || code.length !== 5) {
        codeStatus.textContent = '❌ Введите 5-значный код!';
        codeStatus.style.color = '#e74c3c';
        return;
    }

    try {
        verifyBtn.disabled = true;
        verifyBtn.textContent = '⏳ Проверка...';

        const docRef = db.collection('users').doc(telegramId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            codeStatus.textContent = '❌ Ошибка: пользователь не найден!';
            codeStatus.style.color = '#e74c3c';
            return;
        }

        const data = docSnap.data();

        if (data.verified) {
            codeStatus.textContent = '✅ Аккаунт уже подтверждён!';
            codeStatus.style.color = '#2ecc71';
            showBetaScreen();
            return;
        }

        if (data.code === code) {
            await docRef.update({
                verified: true,
                verified_at: new Date().toLocaleString()
            });

            codeStatus.textContent = '✅ Аккаунт успешно зарегистрирован!';
            codeStatus.style.color = '#2ecc71';
            showBetaScreen();
        } else {
            codeStatus.textContent = '❌ Неверный код! Попробуйте снова.';
            codeStatus.style.color = '#e74c3c';
        }

    } catch (error) {
        console.error('Ошибка проверки кода:', error);
        codeStatus.textContent = '❌ Ошибка: ' + error.message;
        codeStatus.style.color = '#e74c3c';
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Подтвердить';
    }
});

// ===== ОБРАБОТКА ENTER В ПОЛЕ КОДА =====
codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyBtn.click();
    }
});

console.log('✅ Сайт загружен! Версия 0.1.0');
