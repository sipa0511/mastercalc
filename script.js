// ============================================
// MasterCalc PRO v7.3 - Основной JavaScript файл
// Содержит всю логику приложения: расчеты, навигацию, сохранение данных
// ============================================

// КОНСТАНТЫ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
const APP_VERSION = "7.3";          // ВЕРСИЯ ПРИЛОЖЕНИЯ
let currentScreen = "menu";         // ТЕКУЩИЙ АКТИВНЫЙ ЭКРАН

// ============================================
// ФИКС ДЛЯ ГОРИЗОНТАЛЬНОГО СКРОЛЛА И iOS ПРОБЛЕМ
// ============================================
function fixHorizontalScroll() {
    document.body.style.width = '100vw';
    document.body.style.overflowX = 'hidden';
    
    // ПРОВЕРЯЕМ ВСЕ ЭЛЕМЕНТЫ НА ПЕРЕПОЛНЕНИЕ
    document.querySelectorAll('*').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 5) {
            el.style.maxWidth = '100%';
            el.style.overflowX = 'hidden';
        }
    });
    
    // iOS SAFARI ФИКС
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overflow = 'hidden';
        document.body.style.width = '100%';
        
        // ПРЕДОТВРАЩАЕМ СКРОЛЛ ЗА ПРЕДЕЛЫ ЭКРАНА
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.screen') || e.target.closest('.menu-overlay') || 
                e.target.closest('textarea') || e.target.closest('input')) {
                return true;
            }
            e.preventDefault();
        }, { passive: false });
    }
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ НАВИГАЦИИ
// ============================================
function openScreen(screenId) {
    console.log(`[${APP_VERSION}] Открываем экран:`, screenId);
    
    // СКРЫВАЕМ КЛАВИАТУРУ ЕСЛИ ОНА ОТКРЫТА
    document.activeElement?.blur();
    
    // ПРОКРУЧКА В НАЧАЛО СТРАНИЦЫ
    window.scrollTo(0, 0);
    
    // СКРЫВАЕМ ВСЕ ЭКРАНЫ
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // ПОКАЗЫВАЕМ ЦЕЛЕВОЙ ЭКРАН
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        setTimeout(() => {
            targetScreen.classList.add('active');
            setTimeout(fixHorizontalScroll, 100);
        }, 10);
        
        currentScreen = screenId;
        document.title = `MasterCalc PRO v${APP_VERSION} - ${getScreenTitle(screenId)}`;
        
        // ДОБАВЛЯЕМ В ИСТОРИЮ БРАУЗЕРА (ЧТОБЫ РАБОТАЛА КНОПКА "НАЗАД")
        if (history.pushState) {
            history.pushState(null, '', `#${screenId}`);
        }
    }
    
    // ЗАКРЫВАЕМ МЕНЮ ПРИ ПЕРЕХОДЕ
    closeMenu();
    
    // ЗАГРУЖАЕМ ДАННЫЕ ДЛЯ КОНКРЕТНЫХ ЭКРАНОВ
    switch(screenId) {
        case 'draft':
            setTimeout(loadDraft, 50);
            break;
        case 'favorites':
            setTimeout(loadFavorites, 50);
            break;
        case 'history':
            setTimeout(loadHistory, 50);
            break;
        case 'templates':
            setTimeout(loadTemplates, 50);
            break;
    }
}

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ НАЗВАНИЯ ЭКРАНА
function getScreenTitle(screenId) {
    const titles = {
        'menu': 'Главное меню',
        'elec': 'Электрика',
        'kip': 'КИПиА',
        'cable': 'Кабели',
        'new-calculators': 'Новые калькуляторы',
        'len': 'Длина',
        'vol': 'Объем',
        'tools': 'Инструменты',
        'circuit-breakers': 'Автоматы',
        'resistor-codes': 'Резисторы',
        'ups-calc': 'ИБП/АКБ',
        'grounding': 'Заземление',
        'busbars': 'Шины',
        'templates': 'Шаблоны',
        'draft': 'Черновик',
        'donate': 'Поддержка',
        'reference': 'Справочник',
        'favorites': 'Избранное',
        'history': 'История'
    };
    return titles[screenId] || 'MasterCalc PRO';
}

// ОТКРЫТИЕ/ЗАКРЫТИЕ МЕНЮ
function toggleMenu() {
    const menu = document.getElementById('menuOverlay');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        if (menu.style.display === 'block') {
            fixHorizontalScroll();
        }
    }
}

function closeMenu() {
    const menu = document.getElementById('menuOverlay');
    if (menu) {
        menu.style.display = 'none';
    }
}

// ============================================
// ТЕМНАЯ/СВЕТЛАЯ ТЕМА
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('mastercalc_theme') || 'dark';
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        themeToggle.textContent = '☀️';
        document.getElementById('themeColorMeta').content = '#ff9800';
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        themeToggle.textContent = '🌙';
        document.getElementById('themeColorMeta').content = '#121212';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDark) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        localStorage.setItem('mastercalc_theme', 'light');
        themeToggle.textContent = '☀️';
        document.getElementById('themeColorMeta').content = '#ff9800';
        showNotification('Светлая тема включена', 'info');
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        localStorage.setItem('mastercalc_theme', 'dark');
        themeToggle.textContent = '🌙';
        document.getElementById('themeColorMeta').content = '#121212';
        showNotification('Темная тема включена', 'info');
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================
// ПОКАЗАТЬ РЕЗУЛЬТАТ РАСЧЕТА
function showResult(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = text;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 10000); // СКРЫТЬ ЧЕРЕЗ 10 СЕКУНД
    }
}

// ПАРСИНГ ЧИСЛА ИЗ ПОЛЯ ВВОДА С ПРОВЕРКОЙ
function parseNumber(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    let value = el.value.replace(',', '.').trim();
    return parseFloat(value);
}

// ФОРМАТИРОВАНИЕ ЧИСЛА С РАЗДЕЛИТЕЛЯМИ
function formatNumber(num, decimals = 3) {
    if (isNaN(num)) return "Некорректное число";
    const rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(message, type = 'success') {
    const colors = {
        'success': '#4CAF50',
        'error': '#F44336',
        'info': '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.success};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 80%;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// ============================================
// ИЗБРАННОЕ
// ============================================
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('mastercalc_favorites') || '[]');
    const list = document.getElementById('favorites-list');
    
    if (!list) return;
    
    if (favorites.length === 0) {
        list.innerHTML = `
            <div class="info-box">
                <b>Избранных калькуляторов пока нет</b><br>
                Нажмите ☆ на любом калькуляторе, чтобы добавить его сюда
            </div>
        `;
        return;
    }
    
    let html = '';
    favorites.forEach((fav, index) => {
        html += `
            <div class="acc-item">
                <div class="acc-header">
                    <div class="acc-header-text">${fav.name}</div>
                    <button class="favorite-btn active" onclick="removeFavorite(${index})">★</button>
                </div>
                <div class="acc-content">
                    <div class="hint">${fav.description}</div>
                    <button class="btn" onclick="openScreen('${fav.screen}')">ОТКРЫТЬ КАЛЬКУЛЯТОР</button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function addFavorite(id, name, description, screen) {
    const favorites = JSON.parse(localStorage.getItem('mastercalc_favorites') || '[]');
    
    // ПРОВЕРЯЕМ, ЧТОБЫ НЕ ДУБЛИРОВАТЬ
    if (!favorites.some(fav => fav.id === id)) {
        favorites.push({ id, name, description, screen });
        localStorage.setItem('mastercalc_favorites', JSON.stringify(favorites));
        showNotification(`"${name}" добавлен в избранное`, 'success');
    }
}

function removeFavorite(index) {
    let favorites = JSON.parse(localStorage.getItem('mastercalc_favorites') || '[]');
    const removed = favorites[index];
    favorites.splice(index, 1);
    localStorage.setItem('mastercalc_favorites', JSON.stringify(favorites));
    loadFavorites();
    showNotification(`"${removed.name}" удален из избранного`, 'info');
}

// ============================================
// ИСТОРИЯ РАСЧЕТОВ
// ============================================
function addHistory(calculation) {
    let history = JSON.parse(localStorage.getItem('mastercalc_history') || '[]');
    
    // ДОБАВЛЯЕМ ВРЕМЕННУЮ МЕТКУ
    calculation.timestamp = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    calculation.id = Date.now(); // УНИКАЛЬНЫЙ ID
    
    history.unshift(calculation); // ДОБАВЛЯЕМ В НАЧАЛО
    
    // ОГРАНИЧИВАЕМ 20 ЗАПИСЯМИ
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('mastercalc_history', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('mastercalc_history') || '[]');
    const list = document.getElementById('history-list');
    
    if (!list) return;
    
    if (history.length === 0) {
        list.innerHTML = `
            <div class="info-box">
                <b>История расчетов пока пуста</b><br>
                Здесь будут отображаться ваши последние расчеты
            </div>
        `;
        return;
    }
    
    let html = '';
    history.forEach((item, index) => {
        html += `
            <div class="acc-item">
                <div class="acc-header">
                    <div class="acc-header-text">${item.name}</div>
                    <span style="font-size:0.8rem; color:var(--text-secondary); flex-shrink: 0;">${item.timestamp}</span>
                </div>
                <div class="acc-content">
                    <div style="color:var(--text-color); margin-bottom:10px;">${item.description}</div>
                    <div class="result" style="display:block; font-size:1rem;">${item.result}</div>
                    <button class="btn" onclick="deleteHistoryItem(${item.id})" style="background:#333; color:#ff9800; margin-top:10px;">
                        УДАЛИТЬ ИЗ ИСТОРИИ
                    </button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('mastercalc_history') || '[]');
    history = history.filter(item => item.id !== id);
    localStorage.setItem('mastercalc_history', JSON.stringify(history));
    loadHistory();
    showNotification('Расчет удален из истории', 'info');
}

function clearHistory() {
    if (confirm('Вы уверены, что хотите очистить всю историю расчетов?\nЭто действие нельзя отменить.')) {
        localStorage.removeItem('mastercalc_history');
        loadHistory();
        showNotification('История расчетов очищена', 'info');
    }
}

// ============================================
// ЧЕРНОВИК И ЗАМЕТКИ
// ============================================
function loadDraft() {
    const saved = localStorage.getItem('mastercalc_draft');
    if (saved) {
        document.getElementById('draft-text').value = saved;
    }
}

function saveDraft() {
    const text = document.getElementById('draft-text').value;
    localStorage.setItem('mastercalc_draft', text);
    showResult('res-draft', '✅ Черновик сохранен');
    setTimeout(() => {
        document.getElementById('res-draft').style.display = 'none';
    }, 2000);
}

function clearDraft() {
    if (confirm('Очистить черновик? Это действие нельзя отменить.')) {
        document.getElementById('draft-text').value = '';
        localStorage.removeItem('mastercalc_draft');
        showResult('res-draft', '🗑️ Черновик очищен');
        setTimeout(() => {
            document.getElementById('res-draft').style.display = 'none';
        }, 2000);
    }
}

// ============================================
// ШАБЛОНЫ РАСЧЕТОВ
// ============================================
function loadTemplates() {
    const templates = JSON.parse(localStorage.getItem('mastercalc_templates') || '[]');
    const list = document.getElementById('templates-list');
    
    if (!list) return;
    
    if (templates.length === 0) {
        list.innerHTML = `
            <div class="info-box">
                <b>Шаблонов пока нет</b><br>
                Чтобы создать шаблон, выполните расчет и нажмите кнопку "СОХРАНИТЬ ШАБЛОН"
            </div>
        `;
        return;
    }
    
    let html = '';
    templates.forEach((template, index) => {
        html += `
            <div class="acc-item" style="margin-bottom: 10px;">
                <div class="acc-header">
                    <div class="acc-header-text">${template.name}</div>
                </div>
                <div class="acc-content">
                    <div style="color:var(--text-color); margin-bottom:10px;">${template.description}</div>
                    <div style="background:var(--bg-tertiary); padding:10px; border-radius:5px; margin-bottom:10px;">
                        ${template.data}
                    </div>
                    <button class="btn" onclick="loadTemplateData(${index})">ЗАГРУЗИТЬ</button>
                    <button class="btn" onclick="deleteTemplate(${index})" style="background:#333; color:#ff9800; margin-top:10px;">
                        УДАЛИТЬ ШАБЛОН
                    </button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function saveTemplate() {
    const name = prompt('Введите название шаблона:');
    if (!name || name.trim() === '') {
        showNotification('Название шаблона не может быть пустым', 'error');
        return;
    }
    
    const templates = JSON.parse(localStorage.getItem('mastercalc_templates') || '[]');
    
    templates.push({
        name: name.trim(),
        description: 'Сохраненный расчет',
        data: 'Данные расчета',
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('mastercalc_templates', JSON.stringify(templates));
    loadTemplates();
    showNotification(`Шаблон "${name}" сохранен`, 'success');
}

function loadTemplateData(index) {
    const templates = JSON.parse(localStorage.getItem('mastercalc_templates') || '[]');
    if (templates[index]) {
        showNotification(`Шаблон "${templates[index].name}" загружен`, 'success');
    }
}

function deleteTemplate(index) {
    if (confirm('Удалить этот шаблон?')) {
        const templates = JSON.parse(localStorage.getItem('mastercalc_templates') || '[]');
        const deleted = templates.splice(index, 1);
        localStorage.setItem('mastercalc_templates', JSON.stringify(templates));
        loadTemplates();
        showNotification(`Шаблон "${deleted[0].name}" удален`, 'info');
    }
}

function clearTemplates() {
    if (confirm('Удалить все шаблоны? Это действие нельзя отменить.')) {
        localStorage.removeItem('mastercalc_templates');
        loadTemplates();
        showNotification('Все шаблоны удалены', 'info');
    }
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - ЭЛЕКТРИКА
// ============================================
function calcOhm() {
    const what = document.getElementById('ohm-what').value;
    let result = '';
    
    if (what === 'voltage') {
        const I = parseNumber('ohm-current');
        const R = parseNumber('ohm-resistance');
        
        if (isNaN(I) || isNaN(R)) {
            alert('Заполните все поля корректно!');
            return;
        }
        
        const U = I * R;
        result = `Напряжение: <b>${formatNumber(U)} В</b><br>I = ${formatNumber(I)} А, R = ${formatNumber(R)} Ом`;
        
        addHistory({
            name: 'Закон Ома (U)',
            description: `Ток: ${formatNumber(I)} А, Сопротивление: ${formatNumber(R)} Ом`,
            result: `U = ${formatNumber(U)} В`
        });
        
    } else if (what === 'current') {
        const U = parseNumber('ohm-current');
        const R = parseNumber('ohm-resistance');
        
        if (isNaN(U) || isNaN(R)) {
            alert('Заполните все поля корректно!');
            return;
        }
        
        if (R === 0) {
            alert('Сопротивление не может быть равно нулю!');
            return;
        }
        
        const I = U / R;
        result = `Ток: <b>${formatNumber(I)} А</b><br>U = ${formatNumber(U)} В, R = ${formatNumber(R)} Ом`;
        
        addHistory({
            name: 'Закон Ома (I)',
            description: `Напряжение: ${formatNumber(U)} В, Сопротивление: ${formatNumber(R)} Ом`,
            result: `I = ${formatNumber(I)} А`
        });
        
    } else if (what === 'resistance') {
        const U = parseNumber('ohm-current');
        const I = parseNumber('ohm-resistance');
        
        if (isNaN(U) || isNaN(I)) {
            alert('Заполните все поля корректно!');
            return;
        }
        
        if (I === 0) {
            alert('Ток не может быть равен нулю!');
            return;
        }
        
        const R = U / I;
        result = `Сопротивление: <b>${formatNumber(R)} Ом</b><br>U = ${formatNumber(U)} В, I = ${formatNumber(I)} А`;
        
        addHistory({
            name: 'Закон Ома (R)',
            description: `Напряжение: ${formatNumber(U)} В, Ток: ${formatNumber(I)} А`,
            result: `R = ${formatNumber(R)} Ом`
        });
    }
    
    showResult('res-ohm', result);
}

function calcPower() {
    const U = parseNumber('power-voltage');
    const I = parseNumber('power-current');
    
    if (isNaN(U) || isNaN(I)) {
        alert('Заполните все поля корректно!');
        return;
    }
    
    const P = U * I;
    const kW = P / 1000;
    
    let result = `Мощность: <b>${formatNumber(P)} Вт</b> (${formatNumber(kW)} кВт)<br>`;
    result += `U = ${formatNumber(U)} В, I = ${formatNumber(I)} А`;
    
    showResult('res-power', result);
    
    addHistory({
        name: 'Мощность P=UI',
        description: `Напряжение: ${formatNumber(U)} В, Ток: ${formatNumber(I)} А`,
        result: `P = ${formatNumber(P)} Вт (${formatNumber(kW)} кВт)`
    });
}

function calcElecConvert() {
    const type = document.getElementById('elec-convert-type').value;
    const from = document.getElementById('elec-from-unit').value;
    const to = document.getElementById('elec-to-unit').value;
    const value = parseNumber('elec-convert-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    let result = 0;
    
    const conversions = {
        voltage: {
            V: { kV: 0.001, mV: 1000 },
            kV: { V: 1000, mV: 1000000 },
            mV: { V: 0.001, kV: 0.000001 }
        },
        current: {
            A: { mA: 1000 },
            mA: { A: 0.001 }
        },
        resistance: {
            Ohm: { kOhm: 0.001 },
            kOhm: { Ohm: 1000 }
        },
        power: {
            W: { kW: 0.001 },
            kW: { W: 1000 }
        }
    };
    
    const unitNames = {
        V: 'Вольт (В)', kV: 'Киловольт (кВ)', mV: 'Милливольт (мВ)',
        A: 'Ампер (А)', mA: 'Миллиампер (мА)',
        Ohm: 'Ом', kOhm: 'Килоом (кОм)',
        W: 'Ватт (Вт)', kW: 'Киловатт (кВт)'
    };
    
    if (conversions[type] && conversions[type][from] && conversions[type][from][to]) {
        result = value * conversions[type][from][to];
        const fromName = unitNames[from] || from;
        const toName = unitNames[to] || to;
        
        const resultText = `${formatNumber(value)} ${fromName} = <b>${formatNumber(result)} ${toName}</b>`;
        showResult('res-elec-convert', resultText);
        
        addHistory({
            name: `Конвертация ${type}`,
            description: `${formatNumber(value)} ${fromName} → ${toName}`,
            result: `${formatNumber(result)} ${toName}`
        });
    } else {
        showResult('res-elec-convert', 'Невозможно выполнить конвертацию');
    }
}

function calcDivider() {
    const Uin = parseNumber('divider-voltage');
    const R1 = parseNumber('divider-r1');
    const R2 = parseNumber('divider-r2');
    
    if (isNaN(Uin) || isNaN(R1) || isNaN(R2)) {
        alert('Заполните все поля корректно!');
        return;
    }
    
    if (R1 <= 0 || R2 <= 0) {
        alert('Сопротивления должны быть больше нуля!');
        return;
    }
    
    const Uout = Uin * (R2 / (R1 + R2));
    const I = Uin / (R1 + R2);
    const P1 = I * I * R1;
    const P2 = I * I * R2;
    
    let result = `Выходное напряжение: <b>${formatNumber(Uout)} В</b><br>`;
    result += `Ток через делитель: ${formatNumber(I, 3)} А<br>`;
    result += `Мощность на R1: ${formatNumber(P1)} Вт<br>`;
    result += `Мощность на R2: ${formatNumber(P2)} Вт<br>`;
    result += `Коэффициент деления: ${(R2/(R1+R2)).toFixed(3)}`;
    
    showResult('res-divider', result);
    
    addHistory({
        name: 'Делитель напряжения',
        description: `Uвх: ${formatNumber(Uin)} В, R1: ${formatNumber(R1)} Ом, R2: ${formatNumber(R2)} Ом`,
        result: `Uвых = ${formatNumber(Uout)} В`
    });
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - КИПиА
// ============================================
function calcPressure() {
    const from = document.getElementById('pressure-from').value;
    const to = document.getElementById('pressure-to').value;
    const value = parseNumber('pressure-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    const toBar = {
        bar: 1,
        mpa: 10,
        kgf: 0.980665,
        atm: 1.01325
    };
    
    const fromBar = {
        bar: 1,
        mpa: 0.1,
        kgf: 1.019716,
        atm: 0.986923
    };
    
    if (toBar[from] && fromBar[to]) {
        const inBar = value * toBar[from];
        const result = inBar * fromBar[to];
        
        const unitNames = {
            bar: 'бар',
            mpa: 'МПа',
            kgf: 'кгс/см²',
            atm: 'атм'
        };
        
        const resultText = `${formatNumber(value)} ${unitNames[from]} = <b>${formatNumber(result)} ${unitNames[to]}</b>`;
        showResult('res-pressure', resultText);
        
        addHistory({
            name: 'Конвертация давления',
            description: `${formatNumber(value)} ${unitNames[from]} → ${unitNames[to]}`,
            result: `${formatNumber(result)} ${unitNames[to]}`
        });
    }
}

function calcTemp() {
    const from = document.getElementById('temp-from').value;
    const to = document.getElementById('temp-to').value;
    const value = parseNumber('temp-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    let inCelsius = value;
    if (from === 'f') inCelsius = (value - 32) * 5/9;
    if (from === 'k') inCelsius = value - 273.15;
    
    let result = inCelsius;
    if (to === 'f') result = (inCelsius * 9/5) + 32;
    if (to === 'k') result = inCelsius + 273.15;
    
    const unitNames = {
        c: '°C',
        f: '°F',
        k: 'K'
    };
    
    const resultText = `${formatNumber(value)} ${unitNames[from]} = <b>${formatNumber(result)} ${unitNames[to]}</b>`;
    showResult('res-temp', resultText);
    
    addHistory({
        name: 'Конвертация температуры',
        description: `${formatNumber(value)} ${unitNames[from]} → ${unitNames[to]}`,
        result: `${formatNumber(result)} ${unitNames[to]}`
    });
}

function calcFlow() {
    const from = document.getElementById('flow-from').value;
    const to = document.getElementById('flow-to').value;
    const value = parseNumber('flow-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    let inM3h = value;
    if (from === 'lmin') inM3h = value * 0.06;
    if (from === 'ls') inM3h = value * 3.6;
    
    let result = inM3h;
    if (to === 'lmin') result = inM3h / 0.06;
    if (to === 'ls') result = inM3h / 3.6;
    
    const unitNames = {
        m3h: 'м³/ч',
        lmin: 'л/мин',
        ls: 'л/с'
    };
    
    const resultText = `${formatNumber(value)} ${unitNames[from]} = <b>${formatNumber(result)} ${unitNames[to]}</b>`;
    showResult('res-flow', resultText);
    
    addHistory({
        name: 'Конвертация расхода',
        description: `${formatNumber(value)} ${unitNames[from]} → ${unitNames[to]}`,
        result: `${formatNumber(result)} ${unitNames[to]}`
    });
}

function calcLevel() {
    const height = parseNumber('level-height');
    const densityType = document.getElementById('level-density').value;
    
    if (isNaN(height)) {
        alert('Введите корректную высоту!');
        return;
    }
    
    let density = 1000;
    
    if (densityType === 'custom') {
        density = parseNumber('level-custom-density') || 1000;
    } else {
        density = parseFloat(densityType);
    }
    
    if (isNaN(density) || density <= 0) {
        alert('Введите корректную плотность!');
        return;
    }
    
    const heightM = height / 1000;
    const g = 9.80665;
    const pressurePa = density * g * heightM;
    const pressureBar = pressurePa / 100000;
    const pressureMmHg = pressurePa / 133.322;
    
    let result = `Давление столба жидкости:<br>`;
    result += `<b>${formatNumber(pressurePa)} Па</b><br>`;
    result += `<b>${formatNumber(pressureBar)} бар</b><br>`;
    result += `<b>${formatNumber(pressureMmHg)} мм рт.ст.</b><br>`;
    result += `Высота: ${height} мм, Плотность: ${density} кг/м³`;
    
    showResult('res-level', result);
    
    addHistory({
        name: 'Давление по уровню',
        description: `Высота: ${height} мм, Плотность: ${density} кг/м³`,
        result: `${formatNumber(pressureBar)} бар`
    });
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - КАБЕЛИ
// ============================================
function calcDrop() {
    const I = parseNumber('drop-current');
    const L = parseNumber('drop-length');
    const S = parseNumber('drop-section');
    const rho = parseNumber('drop-material');
    const U = parseNumber('drop-voltage');
    
    if (isNaN(I) || isNaN(L) || isNaN(S)) {
        alert('Заполните все обязательные поля!');
        return;
    }
    
    let dU = 0;
    let formula = '';
    
    if (U === 220) {
        dU = (2 * L * I * rho) / S;
        formula = 'ΔU = (2 × L × I × ρ) / S';
    } else {
        dU = (1.732 * L * I * rho) / S;
        formula = 'ΔU = (√3 × L × I × ρ) / S';
    }
    
    const dUpercent = (dU / U) * 100;
    
    let result = `Падение напряжения: <b>${formatNumber(dU)} В (${formatNumber(dUpercent, 2)}%)</b><br>`;
    result += `Формула: ${formula}<br>`;
    result += `Ток: ${I} А, Длина: ${L} м, Сечение: ${S} мм²<br>`;
    result += `Материал: ${rho === 0.0175 ? 'Медь' : 'Алюминий'}, Напряжение: ${U} В<br>`;
    
    if (dUpercent > 5) {
        result += '⚠️ <b>Превышено допустимое значение (5%)</b>';
    } else if (dUpercent > 3) {
        result += '⚠️ <b>На грани допустимого (3-5%)</b>';
    } else {
        result += '✅ <b>В пределах нормы</b>';
    }
    
    showResult('res-drop', result);
    
    addHistory({
        name: 'Падение напряжения',
        description: `Ток: ${I} А, Длина: ${L} м, Сечение: ${S} мм², ${U} В`,
        result: `ΔU = ${formatNumber(dU)} В (${formatNumber(dUpercent, 2)}%)`
    });
}

function calcSection() {
    const I = parseNumber('section-current');
    const material = document.getElementById('section-material').value;
    const install = document.getElementById('section-install').value;
    const count = parseInt(document.getElementById('section-count').value);
    
    if (isNaN(I)) {
        alert('Введите ток нагрузки!');
        return;
    }
    
    const currentTable = {
        copper: {
            '1.5': 19, '2.5': 27, '4': 38, '6': 46, '10': 68,
            '16': 90, '25': 115, '35': 140, '50': 175
        },
        aluminum: {
            '1.5': 15, '2.5': 21, '4': 29, '6': 36, '10': 50,
            '16': 70, '25': 90, '35': 110, '50': 135
        }
    };
    
    let kInstall = 1.0;
    if (install === 'tube') kInstall = 0.8;
    if (install === 'hidden') kInstall = 0.7;
    
    let kCount = 1.0;
    if (count === 3) kCount = 0.7;
    if (count === 5) kCount = 0.6;
    
    const sections = material === 'copper' ? 
        ['1.5', '2.5', '4', '6', '10', '16', '25', '35', '50'] :
        ['1.5', '2.5', '4', '6', '10', '16', '25', '35', '50'];
    
    let recommended = '';
    let recommendedCurrent = 0;
    
    for (const section of sections) {
        const Iallowed = currentTable[material][section] * kInstall * kCount;
        if (Iallowed >= I) {
            recommended = section;
            recommendedCurrent = currentTable[material][section];
            break;
        }
    }
    
    if (!recommended) {
        recommended = '50';
        recommendedCurrent = currentTable[material]['50'];
    }
    
    const IallowedTotal = recommendedCurrent * kInstall * kCount;
    const materialName = material === 'copper' ? 'Медь' : 'Алюминий';
    const installName = install === 'open' ? 'Открытая' : install === 'tube' ? 'В трубе' : 'Скрытая';
    
    let result = `Рекомендуемое сечение: <b>${recommended} мм²</b><br>`;
    result += `Материал: ${materialName}<br>`;
    result += `Прокладка: ${installName}<br>`;
    result += `Количество проводников: ${count}<br>`;
    result += `Допустимый ток: ${formatNumber(IallowedTotal)} А<br>`;
    result += `Требуемый ток: ${I} А<br>`;
    
    if (IallowedTotal >= I) {
        result += '✅ <b>Сечение подходит</b>';
    } else {
        result += '⚠️ <b>Увеличьте сечение или измените условия прокладки</b>';
    }
    
    showResult('res-section', result);
    
    addHistory({
        name: 'Подбор сечения кабеля',
        description: `Ток: ${I} А, Материал: ${materialName}, Прокладка: ${installName}`,
        result: `${recommended} мм² (${formatNumber(IallowedTotal)} А)`
    });
}

function calcCableCurrent() {
    const section = document.getElementById('cable-section').value;
    const material = document.getElementById('cable-material-current').value;
    const temp = parseInt(document.getElementById('cable-temp').value);
    
    if (!section) {
        alert('Выберите сечение кабеля!');
        return;
    }
    
    const baseCurrents = {
        copper: {
            '1.5': 19, '2.5': 27, '4': 38, '6': 46, '10': 68,
            '16': 90, '25': 115
        },
        aluminum: {
            '1.5': 15, '2.5': 21, '4': 29, '6': 36, '10': 50,
            '16': 70, '25': 90
        }
    };
    
    let kTemp = 1.0;
    if (temp === 40) kTemp = 0.91;
    if (temp === 50) kTemp = 0.82;
    
    const baseCurrent = baseCurrents[material][section] || 0;
    const allowedCurrent = baseCurrent * kTemp;
    
    const materialName = material === 'copper' ? 'Медь' : 'Алюминий';
    const power220 = allowedCurrent * 220 / 1000;
    const power380 = allowedCurrent * 380 * 1.732 / 1000;
    
    let result = `Допустимый ток: <b>${formatNumber(allowedCurrent)} А</b><br>`;
    result += `Сечение: ${section} мм², Материал: ${materialName}<br>`;
    result += `Температура: ${temp}°C<br>`;
    result += `Мощность при 220В: ${formatNumber(power220)} кВт<br>`;
    result += `Мощность при 380В: ${formatNumber(power380)} кВт`;
    
    showResult('res-cable-current', result);
    
    addHistory({
        name: 'Допустимый ток кабеля',
        description: `Сечение: ${section} мм², Материал: ${materialName}, Температура: ${temp}°C`,
        result: `${formatNumber(allowedCurrent)} А`
    });
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - НОВЫЕ КАЛЬКУЛЯТОРЫ
// ============================================
function calcLight() {
    const area = parseNumber('light-area');
    const lux = parseInt(document.getElementById('light-type').value);
    const power = parseNumber('light-power');
    const efficiency = parseInt(document.getElementById('light-efficiency').value);
    
    if (isNaN(area) || isNaN(power)) {
        alert('Заполните все обязательные поля!');
        return;
    }
    
    const totalLumen = area * lux;
    const fixtureLumen = power * efficiency;
    const fixtures = Math.ceil(totalLumen / fixtureLumen);
    const totalPower = fixtures * power;
    const powerPerM2 = totalPower / area;
    
    let result = `Количество светильников: <b>${fixtures} шт.</b><br>`;
    result += `Общая мощность: ${formatNumber(totalPower)} Вт<br>`;
    result += `Удельная мощность: ${formatNumber(powerPerM2, 1)} Вт/м²<br>`;
    result += `Площадь: ${area} м², Норма освещенности: ${lux} лк<br>`;
    result += `Мощность светильника: ${power} Вт, Светоотдача: ${efficiency} лм/Вт`;
    
    showResult('res-light', result);
    
    addHistory({
        name: 'Расчет освещенности',
        description: `Площадь: ${area} м², Норма: ${lux} лк, Светильник: ${power} Вт`,
        result: `${fixtures} светильников, ${formatNumber(totalPower)} Вт`
    });
}

function calcMotor() {
    const U = parseInt(document.getElementById('motor-voltage').value);
    const I = parseNumber('motor-current');
    const cosPhi = parseFloat(document.getElementById('motor-cos').value);
    const eta = parseInt(document.getElementById('motor-efficiency').value) / 100;
    
    if (isNaN(I)) {
        alert('Введите ток двигателя!');
        return;
    }
    
    let power = 0;
    
    if (U === 220) {
        power = U * I * cosPhi * eta;
    } else {
        power = 1.732 * U * I * cosPhi * eta;
    }
    
    const powerKW = power / 1000;
    const powerHP = powerKW * 1.35962;
    
    let result = `Мощность двигателя:<br>`;
    result += `<b>${formatNumber(power)} Вт</b><br>`;
    result += `<b>${formatNumber(powerKW, 2)} кВт</b><br>`;
    result += `<b>${formatNumber(powerHP, 2)} л.с.</b><br>`;
    result += `Напряжение: ${U} В, Ток: ${I} А<br>`;
    result += `cosφ: ${cosPhi}, КПД: ${eta * 100}%`;
    
    showResult('res-motor', result);
    
    addHistory({
        name: 'Мощность двигателя',
        description: `${U} В, ${I} А, cosφ: ${cosPhi}, КПД: ${eta * 100}%`,
        result: `${formatNumber(powerKW, 2)} кВт (${formatNumber(powerHP, 2)} л.с.)`
    });
}

function calcHeat() {
    const P = parseNumber('heat-power');
    const t = parseNumber('heat-time');
    const unit = document.getElementById('heat-unit').value;
    
    if (isNaN(P) || isNaN(t)) {
        alert('Заполните все поля!');
        return;
    }
    
    const energyKWh = P * t;
    let resultValue = 0;
    let unitName = '';
    
    switch(unit) {
        case 'kcal':
            resultValue = energyKWh * 860;
            unitName = 'ккал';
            break;
        case 'kj':
            resultValue = energyKWh * 3600;
            unitName = 'кДж';
            break;
        case 'kwh':
            resultValue = energyKWh;
            unitName = 'кВт·ч';
            break;
    }
    
    let result = `Тепловая энергия: <b>${formatNumber(resultValue)} ${unitName}</b><br>`;
    result += `Мощность: ${P} кВт, Время: ${t} ч<br>`;
    result += `Общая энергия: ${formatNumber(energyKWh)} кВт·ч`;
    
    showResult('res-heat', result);
    
    addHistory({
        name: 'Тепловая энергия',
        description: `Мощность: ${P} кВт, Время: ${t} ч`,
        result: `${formatNumber(resultValue)} ${unitName}`
    });
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - ДЛИНА И ОБЪЕМ
// ============================================
function calcLength() {
    const from = document.getElementById('length-from').value;
    const to = document.getElementById('length-to').value;
    const value = parseNumber('length-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    let inMeters = value;
    switch(from) {
        case 'cm': inMeters = value / 100; break;
        case 'mm': inMeters = value / 1000; break;
        case 'km': inMeters = value * 1000; break;
        case 'inch': inMeters = value * 0.0254; break;
        case 'feet': inMeters = value * 0.3048; break;
    }
    
    let result = inMeters;
    switch(to) {
        case 'cm': result = inMeters * 100; break;
        case 'mm': result = inMeters * 1000; break;
        case 'km': result = inMeters / 1000; break;
        case 'inch': result = inMeters / 0.0254; break;
        case 'feet': result = inMeters / 0.3048; break;
    }
    
    const unitNames = {
        m: 'м', cm: 'см', mm: 'мм', km: 'км',
        inch: 'дюйм', feet: 'фут'
    };
    
    const resultText = `${formatNumber(value)} ${unitNames[from]} = <b>${formatNumber(result)} ${unitNames[to]}</b>`;
    showResult('res-length', resultText);
    
    addHistory({
        name: 'Конвертация длины',
        description: `${formatNumber(value)} ${unitNames[from]} → ${unitNames[to]}`,
        result: `${formatNumber(result)} ${unitNames[to]}`
    });
}

function calcVolume() {
    const from = document.getElementById('volume-from').value;
    const to = document.getElementById('volume-to').value;
    const value = parseNumber('volume-value');
    
    if (isNaN(value)) {
        alert('Введите корректное число!');
        return;
    }
    
    let inLiters = value;
    switch(from) {
        case 'm3': inLiters = value * 1000; break;
        case 'ml': inLiters = value / 1000; break;
        case 'cm3': inLiters = value / 1000; break;
        case 'gal': inLiters = value * 3.78541; break;
    }
    
    let result = inLiters;
    switch(to) {
        case 'm3': result = inLiters / 1000; break;
        case 'ml': result = inLiters * 1000; break;
        case 'cm3': result = inLiters * 1000; break;
        case 'gal': result = inLiters / 3.78541; break;
    }
    
    const unitNames = {
        m3: 'м³', l: 'л', ml: 'мл', cm3: 'см³', gal: 'галлонов'
    };
    
    const resultText = `${formatNumber(value)} ${unitNames[from]} = <b>${formatNumber(result)} ${unitNames[to]}</b>`;
    showResult('res-volume', resultText);
    
    addHistory({
        name: 'Конвертация объема',
        description: `${formatNumber(value)} ${unitNames[from]} → ${unitNames[to]}`,
        result: `${formatNumber(result)} ${unitNames[to]}`
    });
}

// ============================================
// ФУНКЦИИ РАСЧЕТОВ - ИНСТРУМЕНТЫ
// ============================================
function calcBreaker() {
    const I = parseNumber('breaker-current');
    const loadType = document.getElementById('breaker-load-type').value;
    const characteristic = document.getElementById('breaker-characteristic').value;
    const temp = parseInt(document.getElementById('breaker-temperature').value);
    
    if (isNaN(I)) {
        alert('Введите ток нагрузки!');
        return;
    }
    
    let kLoad = 1.0;
    if (loadType === 'inductive') kLoad = 1.25;
    if (loadType === 'mixed') kLoad = 1.15;
    
    let kTemp = 1.0;
    if (temp === 40) kTemp = 0.9;
    if (temp === 50) kTemp = 0.8;
    
    const Icalc = I * kLoad * kTemp;
    
    const standardBreakers = [6, 10, 16, 20, 25, 32, 40, 50, 63];
    
    let recommended = 6;
    for (const breaker of standardBreakers) {
        if (breaker >= Icalc) {
            recommended = breaker;
            break;
        }
    }
    
    const charNames = {
        'B': 'B (3-5×Iн)',
        'C': 'C (5-10×Iн)',
        'D': 'D (10-20×Iн)'
    };
    
    const loadNames = {
        'resistive': 'Активная',
        'inductive': 'Индуктивная',
        'mixed': 'Смешанная'
    };
    
    const power220 = recommended * 220 / 1000;
    const power380 = recommended * 380 * 1.732 / 1000;
    
    let result = `Рекомендуемый автомат: <b>${recommended}А ${characteristic}</b><br>`;
    result += `Расчетный ток: ${formatNumber(Icalc, 1)} А<br>`;
    result += `Тип нагрузки: ${loadNames[loadType]}<br>`;
    result += `Характеристика: ${charNames[characteristic]}<br>`;
    result += `Температура: ${temp}°C<br>`;
    result += `Мощность (220В): ${formatNumber(power220, 1)} кВт<br>`;
    result += `Мощность (380В): ${formatNumber(power380, 1)} кВт`;
    
    showResult('res-breaker', result);
    
    addHistory({
        name: 'Подбор автомата',
        description: `Ток: ${I} А, Тип: ${loadNames[loadType]}, Характеристика: ${characteristic}`,
        result: `${recommended}А ${characteristic}`
    });
}

function calcResistor() {
    const band1 = parseInt(document.getElementById('band1').value);
    const band2 = parseInt(document.getElementById('band2').value);
    const band3 = parseFloat(document.getElementById('band3').value);
    const band4 = parseFloat(document.getElementById('band4').value);
    
    const value = (band1 * 10 + band2) * band3;
    
    let formattedValue = '';
    if (value >= 1000000) {
        formattedValue = `${(value / 1000000).toFixed(2)} МОм`;
    } else if (value >= 1000) {
        formattedValue = `${(value / 1000).toFixed(2)} кОм`;
    } else {
        formattedValue = `${value.toFixed(0)} Ом`;
    }
    
    const tolerance = band4;
    const min = value * (1 - tolerance / 100);
    const max = value * (1 + tolerance / 100);
    
    const colors = ['#000', '#964B00', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080', '#808080', '#FFFFFF'];
    const toleranceColors = {
        1: '#964B00', 2: '#FF0000', 0.5: '#008000', 0.25: '#0000FF', 
        0.1: '#800080', 5: '#FFD700', 10: '#C0C0C0'
    };
    
    let band3Index = 0;
    if (band3 === 10) band3Index = 1;
    if (band3 === 100) band3Index = 2;
    if (band3 === 1000) band3Index = 3;
    if (band3 === 10000) band3Index = 4;
    if (band3 === 100000) band3Index = 5;
    if (band3 === 1000000) band3Index = 6;
    if (band3 === 10000000) band3Index = 7;
    if (band3 === 0.1) band3Index = 8;
    if (band3 === 0.01) band3Index = 9;
    
    const bands = document.querySelectorAll('.resistor-band');
    if (bands.length >= 4) {
        bands[0].style.background = colors[band1];
        bands[1].style.background = colors[band2];
        bands[2].style.background = colors[band3Index];
        bands[3].style.background = toleranceColors[tolerance];
    }
    
    let result = `Номинал резистора: <b>${formattedValue}</b><br>`;
    result += `Точность: ±${tolerance}%<br>`;
    result += `Диапазон: ${min.toFixed(1)}...${max.toFixed(1)} Ом<br>`;
    result += `Цветовой код: ${band1}-${band2}-×${band3}±${tolerance}%`;
    
    showResult('res-resistor', result);
    
    addHistory({
        name: 'Цветовой код резистора',
        description: `Код: ${band1}-${band2}-×${band3}±${tolerance}%`,
        result: formattedValue
    });
}

function calcUps() {
    const P = parseNumber('ups-power');
    const U = parseInt(document.getElementById('ups-voltage').value);
    const C = parseNumber('ups-capacity');
    const count = parseNumber('ups-count') || 1;
    const eta = parseInt(document.getElementById('ups-efficiency').value) / 100;
    const dod = parseInt(document.getElementById('ups-discharge').value) / 100;
    
    if (isNaN(P) || isNaN(C)) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    const totalCapacity = C * count;
    const I = P / U / eta;
    const timeHours = (totalCapacity * U * dod) / P;
    const timeMinutes = timeHours * 60;
    
    let result = `Время автономии: <b>${formatNumber(timeHours, 1)} ч (${Math.round(timeMinutes)} мин)</b><br>`;
    result += `Ток разряда: ${formatNumber(I, 1)} А<br>`;
    result += `Мощность нагрузки: ${P} Вт<br>`;
    result += `АКБ: ${totalCapacity} А·ч при ${U} В (${count} шт.)<br>`;
    result += `КПД ИБП: ${eta * 100}%, Глубина разряда: ${dod * 100}%<br>`;
    result += `Использовано емкости: ${formatNumber(C * dod, 1)} А·ч`;
    
    if (timeHours < 0.5) {
        result += '<br>⚠️ <b>Малое время автономии!</b>';
    }
    
    showResult('res-ups', result);
    
    addHistory({
        name: 'Расчет ИБП',
        description: `Нагрузка: ${P} Вт, АКБ: ${totalCapacity} А·ч ${U} В, КПД: ${eta * 100}%`,
        result: `${formatNumber(timeHours, 1)} ч автономии`
    });
}

function calcGround() {
    const L = parseNumber('ground-length');
    const d = parseNumber('ground-diameter');
    const t = parseNumber('ground-depth');
    const soil = parseInt(document.getElementById('ground-soil').value);
    const type = document.getElementById('ground-type').value;
    
    if (isNaN(L) || isNaN(d)) {
        alert('Заполните длину и диаметр заземлителя!');
        return;
    }
    
    const rho = soil;
    const dM = d / 1000;
    
    let R = (rho / (2 * Math.PI * L)) * Math.log((4 * L) / dM);
    
    let kType = 1.0;
    let typeName = "Стержневой";
    if (type === 'angle') {
        kType = 1.2;
        typeName = "Уголковая сталь";
    } else if (type === 'strip') {
        kType = 1.4;
        typeName = "Полоса";
    }
    
    const Rfinal = R * kType;
    
    const soilNames = {
        100: "Чернозем, глина",
        300: "Суглинок",
        500: "Песок",
        1000: "Каменистый грунт"
    };
    
    let result = `Сопротивление заземлителя: <b>${formatNumber(Rfinal, 2)} Ом</b><br>`;
    result += `Тип: ${typeName}<br>`;
    result += `Длина: ${L} м, Диаметр: ${d} мм<br>`;
    result += `Глубина заложения: ${t} м<br>`;
    result += `Уд. сопротивление грунта: ${rho} Ом·м (${soilNames[rho]})<br>`;
    
    if (Rfinal > 30) {
        result += '⚠️ <b>Превышена норма для жилых домов (30 Ом)</b>';
    } else if (Rfinal > 10) {
        result += '⚠️ <b>Превышена норма для промпредприятий (10 Ом)</b>';
    } else if (Rfinal > 4) {
        result += '⚠️ <b>Соответствует большинству норм</b>';
    } else {
        result += '✅ <b>Отличное сопротивление заземления</b>';
    }
    
    showResult('res-ground', result);
    
    addHistory({
        name: 'Расчет заземления',
        description: `${typeName}, Длина: ${L} м, Диаметр: ${d} мм, Грунт: ${soilNames[rho]}`,
        result: `${formatNumber(Rfinal, 2)} Ом`
    });
}

function calcBusbar() {
    const I = parseNumber('busbar-current');
    const material = document.getElementById('busbar-material').value;
    const position = document.getElementById('busbar-position').value;
    const count = parseInt(document.getElementById('busbar-count').value);
    const temp = parseInt(document.getElementById('busbar-temp').value);
    
    if (isNaN(I)) {
        alert('Введите ток нагрузки!');
        return;
    }
    
    const currentTable = {
        copper: {
            '15x3': 210, '20x3': 275, '25x3': 340, '30x4': 475, '40x4': 625,
            '50x5': 860, '60x6': 1125, '80x8': 1680
        },
        aluminum: {
            '15x3': 165, '20x3': 215, '25x3': 265, '30x4': 370, '40x4': 490,
            '50x5': 675, '60x6': 880, '80x8': 1320
        }
    };
    
    let kPosition = 1.0;
    if (position === 'horizontal') kPosition = 0.95;
    
    let kTemp = 1.0;
    if (temp === 35) kTemp = 0.91;
    if (temp === 45) kTemp = 0.82;
    
    const IperBusbar = I / count;
    
    const sizes = ['15x3', '20x3', '25x3', '30x4', '40x4', '50x5', '60x6', '80x8'];
    let recommended = '';
    let recommendedCurrent = 0;
    
    for (const size of sizes) {
        const Iallowed = currentTable[material][size] * kPosition * kTemp * count;
        if (Iallowed >= I) {
            recommended = size;
            recommendedCurrent = currentTable[material][size];
            break;
        }
    }
    
    if (!recommended) {
        recommended = '80x8';
        recommendedCurrent = currentTable[material]['80x8'];
    }
    
    const areas = {
        '15x3': 45, '20x3': 60, '25x3': 75, '30x4': 120, '40x4': 160,
        '50x5': 250, '60x6': 360, '80x8': 640
    };
    
    const S = areas[recommended];
    const materialName = material === 'copper' ? 'Медь' : 'Алюминий';
    const positionName = position === 'vertical' ? 'Вертикально' : 'Горизонтально';
    const IallowedTotal = recommendedCurrent * kPosition * kTemp * count;
    
    let result = `Рекомендуемая шина: <b>${recommended} мм</b><br>`;
    result += `Площадь сечения: ${S} мм²<br>`;
    result += `Материал: ${materialName}<br>`;
    result += `Расположение: ${positionName}<br>`;
    result += `Количество в фазе: ${count} шт.<br>`;
    result += `Температура: ${temp}°C<br>`;
    result += `Допустимый ток на шину: ${formatNumber(recommendedCurrent)} А<br>`;
    result += `Общий допустимый ток: ${formatNumber(IallowedTotal)} А<br>`;
    result += `Требуемый ток: ${I} А<br>`;
    
    if (IallowedTotal >= I) {
        result += '✅ <b>Шина подходит</b>';
    } else {
        result += '⚠️ <b>Увеличьте количество шин или выберите большее сечение</b>';
    }
    
    showResult('res-busbar', result);
    
    addHistory({
        name: 'Подбор шины',
        description: `Ток: ${I} А, Материал: ${materialName}, Шин в фазе: ${count}`,
        result: `Шина ${recommended} мм (${S} мм²)`
    });
}

// ============================================
// ВАЛИДАЦИЯ ВВОДА - ЗАПРЕТ ОТРИЦАТЕЛЬНЫХ ЧИСЕЛ
// ============================================
function setupInputValidation() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            
            // ПРОВЕРКА НА ОТРИЦАТЕЛЬНЫЕ ЧИСЛА
            if (value < 0) {
                this.classList.add('error-input');
                showNotification('Ошибка: отрицательные значения не допускаются', 'error');
                this.value = Math.abs(value); // АВТОМАТИЧЕСКИ ДЕЛАЕМ ПОЛОЖИТЕЛЬНЫМ
            } else {
                this.classList.remove('error-input');
            }
            
            // ПРОВЕРКА НА НОЛЬ ДЛЯ ОПРЕДЕЛЕННЫХ ПОЛЕЙ
            if (value === 0 && (this.id.includes('resistance') || this.id.includes('divider'))) {
                this.classList.add('error-input');
                showNotification('Значение не может быть равно нулю', 'error');
            }
        });
        
        // ПРЕДОТВРАЩАЕМ ВВОД МИНУСА
        input.addEventListener('keydown', function(e) {
            if (e.key === '-') {
                e.preventDefault();
                showNotification('Отрицательные значения не допускаются', 'error');
            }
        });
    });
}

// ============================================
// PWA И SERVICE WORKER
// ============================================
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ Service Worker зарегистрирован:', registration.scope);
                    
                    // ПРОВЕРЯЕМ ОБНОВЛЕНИЯ КАЖДЫЕ 24 ЧАСА
                    setInterval(() => {
                        registration.update();
                    }, 24 * 60 * 60 * 1000);
                })
                .catch(error => {
                    console.log('❌ Ошибка регистрации SW:', error);
                });
        });
    }
    
    // ОБРАБОТКА УСТАНОВКИ PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        
        console.log('PWA можно установить как приложение');
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log(`MasterCalc PRO v${APP_VERSION} инициализирован`);
    
    // НАСТРОЙКА ВАЛИДАЦИИ ВВОДА
    setupInputValidation();
    
    // ФИКСЫ ДЛЯ iOS
    fixHorizontalScroll();
    
    window.addEventListener('resize', fixHorizontalScroll);
    window.addEventListener('orientationchange', function() {
        setTimeout(fixHorizontalScroll, 300);
    });
    
    // ИНИЦИАЛИЗАЦИЯ ТЕМЫ
    initTheme();
    
    // ЗАГРУЗКА ИЗ ХЕША URL
    function loadFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== 'menu' && hash !== currentScreen) {
            setTimeout(() => {
                openScreen(hash);
            }, 100);
        }
    }
    
    setTimeout(loadFromHash, 100);
    window.addEventListener('hashchange', loadFromHash);
    
    // ИНИЦИАЛИЗАЦИЯ PWA
    initServiceWorker();
    
    // ================= НАВИГАЦИЯ =================
    document.getElementById('menuButton').addEventListener('click', toggleMenu);
    document.getElementById('closeMenuBtn').addEventListener('click', closeMenu);
    
    // КЛИК ВНЕ МЕНЮ
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('menuOverlay');
        if (menu && menu.style.display === 'block' && 
            !e.target.closest('.menu-content') && 
            !e.target.closest('.menu-btn') &&
            !e.target.closest('.theme-toggle')) {
            closeMenu();
        }
    });
    
    // НАВИГАЦИЯ ПО МЕНЮ
    document.querySelectorAll('.menu-item[data-screen]').forEach(item => {
        item.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            openScreen(screenId);
        });
    });
    
    // НАВИГАЦИЯ ПО КАРТОЧКАМ
    document.querySelectorAll('.tile[data-screen]').forEach(tile => {
        tile.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            openScreen(screenId);
        });
    });
    
    // КНОПКИ "НАЗАД"
    document.querySelectorAll('.back-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            openScreen(screenId);
        });
    });
    
    // АККОРДЕОНЫ
    document.querySelectorAll('.acc-header').forEach(header => {
        header.addEventListener('click', function(e) {
            if (!e.target.classList.contains('favorite-btn')) {
                const item = this.parentElement;
                item.classList.toggle('open');
                setTimeout(fixHorizontalScroll, 100);
            }
        });
    });
    
    // ИЗБРАННОЕ
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('favorite-btn')) {
            e.stopPropagation();
            const btn = e.target;
            const header = btn.closest('.acc-header');
            const title = header.querySelector('.acc-header-text').textContent.replace('☆', '').replace('★', '').trim();
            const id = title.toLowerCase().replace(/[^a-z0-9а-я]/g, '-');
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                btn.textContent = '☆';
                
                const favorites = JSON.parse(localStorage.getItem('mastercalc_favorites') || '[]');
                const index = favorites.findIndex(fav => fav.id === id);
                if (index !== -1) {
                    removeFavorite(index);
                }
            } else {
                btn.classList.add('active');
                btn.textContent = '★';
                
                const screen = currentScreen;
                const description = header.nextElementSibling?.querySelector('.hint')?.textContent || 
                                  'Часто используемый калькулятор';
                
                addFavorite(id, title, description, screen);
            }
        }
    });
    
    // ================= КНОПКИ РАСЧЕТОВ =================
    document.getElementById('calcOhmBtn')?.addEventListener('click', calcOhm);
    document.getElementById('calcPowerBtn')?.addEventListener('click', calcPower);
    document.getElementById('calcElecConvertBtn')?.addEventListener('click', calcElecConvert);
    document.getElementById('calcDividerBtn')?.addEventListener('click', calcDivider);
    document.getElementById('calcPressureBtn')?.addEventListener('click', calcPressure);
    document.getElementById('calcTempBtn')?.addEventListener('click', calcTemp);
    document.getElementById('calcFlowBtn')?.addEventListener('click', calcFlow);
    document.getElementById('calcLevelBtn')?.addEventListener('click', calcLevel);
    document.getElementById('calcDropBtn')?.addEventListener('click', calcDrop);
    document.getElementById('calcSectionBtn')?.addEventListener('click', calcSection);
    document.getElementById('calcCableCurrentBtn')?.addEventListener('click', calcCableCurrent);
    document.getElementById('calcLightBtn')?.addEventListener('click', calcLight);
    document.getElementById('calcMotorBtn')?.addEventListener('click', calcMotor);
    document.getElementById('calcHeatBtn')?.addEventListener('click', calcHeat);
    document.getElementById('calcLengthBtn')?.addEventListener('click', calcLength);
    document.getElementById('calcVolumeBtn')?.addEventListener('click', calcVolume);
    document.getElementById('calcBreakerBtn')?.addEventListener('click', calcBreaker);
    document.getElementById('calcResistorBtn')?.addEventListener('click', calcResistor);
    document.getElementById('calcUpsBtn')?.addEventListener('click', calcUps);
    document.getElementById('calcGroundBtn')?.addEventListener('click', calcGround);
    document.getElementById('calcBusbarBtn')?.addEventListener('click', calcBusbar);
    
    // ================= УТИЛИТЫ =================
    document.getElementById('saveDraftBtn')?.addEventListener('click', saveDraft);
    document.getElementById('clearDraftBtn')?.addEventListener('click', clearDraft);
    document.getElementById('saveTemplateBtn')?.addEventListener('click', saveTemplate);
    document.getElementById('clearTemplatesBtn')?.addEventListener('click', clearTemplates);
    document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // ================= ДИНАМИЧЕСКИЕ ИЗМЕНЕНИЯ =================
    // ИЗМЕНЕНИЕ ПОЛЕЙ ДЛЯ ЗАКОНА ОМА
    document.getElementById('ohm-what')?.addEventListener('change', function() {
        const what = this.value;
        const inputsDiv = document.getElementById('ohm-inputs');
        
        if (what === 'voltage') {
            inputsDiv.innerHTML = `
                <label>Ток (I), А:</label>
                <input type="number" min="0" step="any" id="ohm-current" placeholder="Например: 5">
                
                <label>Сопротивление (R), Ом:</label>
                <input type="number" min="0" step="any" id="ohm-resistance" placeholder="Например: 44">
            `;
        } else if (what === 'current') {
            inputsDiv.innerHTML = `
                <label>Напряжение (U), В:</label>
                <input type="number" min="0" step="any" id="ohm-current" placeholder="Например: 220">
                
                <label>Сопротивление (R), Ом:</label>
                <input type="number" min="0" step="any" id="ohm-resistance" placeholder="Например: 44">
            `;
        } else if (what === 'resistance') {
            inputsDiv.innerHTML = `
                <label>Напряжение (U), В:</label>
                <input type="number" min="0" step="any" id="ohm-current" placeholder="Например: 220">
                
                <label>Ток (I), А:</label>
                <input type="number" min="0" step="any" id="ohm-resistance" placeholder="Например: 5">
            `;
        }
    });
    
    // ПОКАЗ/СКРЫТИЕ КАСТОМНОЙ ПЛОТНОСТИ
    document.getElementById('level-density')?.addEventListener('change', function() {
        const customInput = document.getElementById('custom-density');
        if (this.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    });
    
    // ЗАГРУЗКА ДАННЫХ
    loadDraft();
    
    // АВТОСОХРАНЕНИЕ ЧЕРНОВИКА
    setInterval(() => {
        const draftText = document.getElementById('draft-text');
        if (draftText && draftText.value.trim() !== '') {
            localStorage.setItem('mastercalc_draft', draftText.value);
            console.log('Черновик автосохранен');
        }
    }, 30000);
    
    // ГОРЯЧИЕ КЛАВИШИ
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (currentScreen === 'draft') {
                saveDraft();
            }
        }
        
        if (e.key === 'Escape') {
            if (currentScreen !== 'menu') {
                openScreen('menu');
            } else {
                closeMenu();
            }
        }
        
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
    });
    
    // СТАТИСТИКА ИСПОЛЬЗОВАНИЯ
    let usageStats = JSON.parse(localStorage.getItem('mastercalc_stats') || '{}');
    usageStats.firstLaunch = usageStats.firstLaunch || new Date().toISOString();
    usageStats.launchCount = (usageStats.launchCount || 0) + 1;
    usageStats.lastLaunch = new Date().toISOString();
    
    localStorage.setItem('mastercalc_stats', JSON.stringify(usageStats));
    
    console.log(`Запуск №${usageStats.launchCount}, первый запуск: ${new Date(usageStats.firstLaunch).toLocaleDateString()}`);
    
    // ФИНАЛЬНЫЙ ФИКС
    setTimeout(fixHorizontalScroll, 1000);
});

// ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ
window.openScreen = openScreen;
window.removeFavorite = removeFavorite;
window.deleteHistoryItem = deleteHistoryItem;
window.loadTemplateData = loadTemplateData;
window.deleteTemplate = deleteTemplate;