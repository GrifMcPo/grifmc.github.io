// Ссылки на элементы
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

// Генерация 5-значного кода
function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// Показать сообщение
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
}

// Обработка отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const telegramId = telegramIdInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const siteNick = siteNickInput.value.trim();
    const siteId = siteIdInput.value.trim();

    // Проверка на пустые поля
    if (!telegramId || !nickname || !siteNick || !siteId) {
        showMessage('❌ Заполните все поля!', 'error');
        return;
    }

    // Проверка на цифры в Telegram ID
    if (!/^\d+$/.test(telegramId)) {
        showMessage('❌ Telegram ID должен содержать только цифры!', 'error');
        return;
    }

    try {
        registerBtn.disabled = true;
        registerBtn.textContent = '⏳ Отправка...';

        // Проверяем, не зарегистрирован ли уже этот ник
        const snapshot = await db.collection('users').where('nickname', '==', nickname).get();
        if (!snapshot.empty) {
            showMessage('❌ Аккаунт уже зарегистрирован!', 'error');
            registerBtn.disabled = false;
            registerBtn.textContent = 'Зарегистрироваться';
            return;
        }

        // Проверяем Telegram ID
        const tgSnapshot = await db.collection('users').where('telegram_id', '==', telegramId).get();
        if (!tgSnapshot.empty) {
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
            registered_at: new Date().toLocaleString()
        });

        // Показываем поле для кода
        codeSection.style.display = 'block';
        codeInput.value = '';
        codeStatus.textContent = '📨 Код отправлен в Telegram!';
        codeStatus.style.color = '#2ecc71';
        form.style.display = 'none';

        showMessage('✅ Запрос отправлен! Введите код из Telegram.', 'success');

    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Ошибка: ' + error.message, 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Зарегистрироваться';
    }
});

// Проверка кода
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
            // Код правильный
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

// Экран "Сайт в бета-тесте"
function showBetaScreen() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <h1 style="font-size: 3em;">🎉</h1>
            <h2 style="color: #2ecc71;">Сайт в бета-тесте!</h2>
            <p style="color: #aaa; margin-top: 15px;">Спасибо за регистрацию!</p>
            <p style="color: #888; font-size: 0.8em; margin-top: 30px;">Версия 0.1.0</p>
        </div>
    `;
}
