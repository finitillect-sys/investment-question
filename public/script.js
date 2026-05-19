let projectData = {
    A: {},
    B: [],
    E: [],
    C1: [],
    C2: [],
    D: [],
    F: [],
    G: {}
};

let currentSection = 'A';
let tableTransposed = false; // default: items as rows, years as columns

const MONTHS_RU = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];

const RUSSIAN_MONTHS_MAP = {
    'январь':0,'января':0,'февраль':1,'февраля':1,'март':2,'марта':2,
    'апрель':3,'апреля':3,'май':4,'мая':4,'июнь':5,'июня':5,
    'июль':6,'июля':6,'август':7,'августа':7,'сентябрь':8,'сентября':8,
    'октябрь':9,'октября':9,'ноябрь':10,'ноября':10,'декабрь':11,'декабря':11
};

function russianToMonthInput(str) {
    if (!str) return '';
    const parts = str.trim().toLowerCase().split(/[\.\s]+/);
    if (parts.length < 2) return '';
    const month = RUSSIAN_MONTHS_MAP[parts[0]];
    const year = parseInt(parts[1]);
    if (month === undefined || isNaN(year)) return '';
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function monthInputToRussian(val) {
    if (!val) return '';
    const [year, month] = val.split('-');
    const idx = parseInt(month) - 1;
    if (isNaN(idx) || !MONTHS_RU[idx]) return '';
    return `${MONTHS_RU[idx]}.${year}`;
}

const SECTION_CONFIG = {
    B: {
        title: 'Средства производства',
        columns: cur => ['Название', cur ? `Сумма (${cur})` : 'Сумма', 'Дата покупки'],
        fields: [
            { key: 'name',   type: 'text',   placeholder: 'Станок ЧПУ' },
            { key: 'amount', type: 'money',  placeholder: '300 000' },
            { key: 'date',   type: 'month' }
        ],
        emptyRow: () => ({ name: '', amount: '', date: '' })
    },
    E: {
        title: 'Продукты и услуги',
        columns: cur => ['Продукт', cur ? `Цена (${cur})` : 'Цена', 'Кол-во/мес', 'Дата старта продаж', 'Рост % в год'],
        fields: [
            { key: 'product',   type: 'text',   placeholder: 'Электросамокат' },
            { key: 'price',     type: 'money',  placeholder: '25 000' },
            { key: 'quantity',  type: 'number', placeholder: '100' },
            { key: 'startDate', type: 'month' },
            { key: 'growth',    type: 'number', placeholder: '24' }
        ],
        emptyRow: () => ({ product: '', price: '', quantity: '', startDate: '', growth: '' })
    },
    C1: {
        title: 'Прямые затраты на единицу продукции',
        columns: cur => ['Продукт', 'Статья затрат', cur ? `Сумма на ед. (${cur})` : 'Сумма на ед.', 'Рост %'],
        fields: [
            { key: 'product',      type: 'product-select' },
            { key: 'costItem',     type: 'text',   placeholder: 'Материалы' },
            { key: 'amountPerUnit', type: 'money',  placeholder: '8 500' },
            { key: 'growth',       type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ product: '', costItem: '', amountPerUnit: '', growth: '' })
    },
    C2: {
        title: 'Косвенные производственные затраты',
        columns: cur => ['Название', cur ? `Сумма (${cur})` : 'Сумма', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name',        type: 'text',   placeholder: 'Аренда' },
            { key: 'amount',      type: 'money',  placeholder: '50 000' },
            { key: 'startDate',   type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год', 'единовременно'] },
            { key: 'growth',      type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    D: {
        title: 'Административно-хозяйственные затраты',
        columns: cur => ['Название', cur ? `Сумма (${cur})` : 'Сумма', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name',        type: 'text',   placeholder: 'Реклама' },
            { key: 'amount',      type: 'money',  placeholder: '30 000' },
            { key: 'startDate',   type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год', 'единовременно'] },
            { key: 'growth',      type: 'number', placeholder: '5' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    F: {
        title: 'Персонал',
        columns: cur => ['Должность', cur ? `Оклад (${cur})` : 'Оклад', 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
        fields: [
            { key: 'position', type: 'text',   placeholder: 'Токарь' },
            { key: 'salary',   type: 'money',  placeholder: '80 000' },
            { key: 'count',    type: 'number', placeholder: '2' },
            { key: 'hireDate', type: 'month' },
            { key: 'growth',   type: 'number', placeholder: '7' }
        ],
        emptyRow: () => ({ position: '', salary: '', count: '', hireDate: '', growth: '' })
    }
};

const DEMO_DATA = {
    A: {
        name:        'ВертФерм',
        description: 'Вертикальная городская ферма по выращиванию микрозелени, пряных трав и листовых салатов. Продажи ресторанам, отелям, ретейлу и напрямую потребителям через подписку.',
        horizon:     10,
        region:      'Москва',
        startDate:   'январь 2026',
        firstSale:   'апрель 2026',
        cashStart:   500000,
        currency:    'RUB'
    },
    B: [
        { name: 'Стеллажные системы для выращивания',        amount: 1200000, date: 'январь 2026'  },
        { name: 'Системы LED-освещения',                     amount: 800000,  date: 'январь 2026'  },
        { name: 'Климатическая система',                     amount: 600000,  date: 'февраль 2026' },
        { name: 'Автоматическая система полива',             amount: 400000,  date: 'февраль 2026' },
        { name: 'Ремонт производственного помещения',        amount: 500000,  date: 'март 2026'    },
        { name: 'Холодильное и упаковочное оборудование',    amount: 350000,  date: 'март 2026'    },
        { name: 'Электрогрузовик для доставки',              amount: 2500000, date: 'март 2026'    }
    ],
    E: [
        { product: 'Микрозелень (подсолнух, горох, редис)', price: 1500, quantity: 300, startDate: 'апрель 2026', growth: 20 },
        { product: 'Пряные травы (базилик, кинза, мята)',   price: 2000, quantity: 200, startDate: 'апрель 2026', growth: 15 },
        { product: 'Листовые салаты (руккола, шпинат)',     price: 1000, quantity: 400, startDate: 'июнь 2026',   growth: 25 },
        { product: 'Подписочный набор B2C',                 price: 3000, quantity: 80,  startDate: 'июль 2026',   growth: 35 }
    ],
    C1: [
        { product: 'Микрозелень (подсолнух, горох, редис)', costItem: 'Семена',                  amountPerUnit: 50,  growth: 5 },
        { product: 'Микрозелень (подсолнух, горох, редис)', costItem: 'Упаковка',                amountPerUnit: 30,  growth: 5 },
        { product: 'Пряные травы (базилик, кинза, мята)',   costItem: 'Семена',                  amountPerUnit: 80,  growth: 5 },
        { product: 'Пряные травы (базилик, кинза, мята)',   costItem: 'Упаковка',                amountPerUnit: 30,  growth: 5 },
        { product: 'Листовые салаты (руккола, шпинат)',     costItem: 'Семена',                  amountPerUnit: 40,  growth: 5 },
        { product: 'Листовые салаты (руккола, шпинат)',     costItem: 'Упаковка',                amountPerUnit: 20,  growth: 5 },
        { product: 'Подписочный набор B2C',                 costItem: 'Упаковка и комплектация', amountPerUnit: 150, growth: 8 },
        { product: 'Подписочный набор B2C',                 costItem: 'Курьерская доставка',     amountPerUnit: 200, growth: 8 }
    ],
    C2: [
        { name: 'Аренда производственного помещения',     amount: 120000, startDate: 'январь 2026', periodicity: 'ежемесячно',    growth: 7  },
        { name: 'Электроэнергия',                         amount: 80000,  startDate: 'апрель 2026', periodicity: 'ежемесячно',    growth: 10 },
        { name: 'Субстрат и питательные растворы',        amount: 50000,  startDate: 'апрель 2026', periodicity: 'ежемесячно',    growth: 8  },
        { name: 'Техническое обслуживание оборудования',  amount: 40000,  startDate: 'апрель 2026', periodicity: 'ежеквартально', growth: 5  }
    ],
    D: [
        { name: 'Маркетинг и продвижение',   amount: 80000,  startDate: 'апрель 2026',  periodicity: 'ежемесячно',   growth: 5 },
        { name: 'Бухгалтерия (аутсорсинг)',  amount: 25000,  startDate: 'январь 2026',  periodicity: 'ежемесячно',   growth: 5 },
        { name: 'Связь и интернет',          amount: 8000,   startDate: 'январь 2026',  periodicity: 'ежемесячно',   growth: 3 },
        { name: 'Страхование',               amount: 100000, startDate: 'январь 2026',  periodicity: 'единовременно', growth: 0 },
        { name: 'Сертификация и лицензии',   amount: 80000,  startDate: 'февраль 2026', periodicity: 'единовременно', growth: 0 },
        { name: 'CRM и IT-системы',          amount: 15000,  startDate: 'апрель 2026',  periodicity: 'ежемесячно',   growth: 5 }
    ],
    F: [
        { position: 'CEO / Руководитель проекта', salary: 150000, count: 1, hireDate: 'январь 2026', growth: 10 },
        { position: 'Главный агроном',            salary: 120000, count: 1, hireDate: 'январь 2026', growth: 10 },
        { position: 'Работник фермы',             salary: 70000,  count: 2, hireDate: 'январь 2026', growth: 8  },
        { position: 'Менеджер по продажам',       salary: 90000,  count: 1, hireDate: 'март 2026',   growth: 10 },
        { position: 'Курьер',                     salary: 65000,  count: 1, hireDate: 'апрель 2026', growth: 8  },
        { position: 'Маркетолог / SMM',           salary: 80000,  count: 1, hireDate: 'июнь 2026',   growth: 10 }
    ],
    G: { creditPercent: 60, subsidyPercent: 0, equityPercent: 40, creditRate: 12 }
};

function loadFromStorage() {
    const saved = localStorage.getItem('investmentProject');
    if (saved !== null) {
        projectData = JSON.parse(saved);
    }
}

function saveToStorage() {
    localStorage.setItem('investmentProject', JSON.stringify(projectData));
}

const CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP', 'JPY', 'ВЫКЛ.'];

function currencyLabel() {
    const c = projectData.A?.currency || 'RUB';
    return c === 'ВЫКЛ.' ? '' : c;
}

function thouLabel() {
    const cur = currencyLabel();
    return cur ? `тыс. ${cur}` : 'тыс.';
}

function fmtMoney(v) {
    if (v === '' || v === null || v === undefined) return '';
    const n = parseFloat(String(v).replace(/[\s\u00A0]/g, '').replace(',', '.'));
    if (isNaN(n)) return '';
    return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

function parseMoney(s) {
    if (s === '' || s === null || s === undefined) return '';
    const n = parseFloat(String(s).replace(/[\s\u00A0]/g, '').replace(',', '.'));
    return isNaN(n) ? '' : n;
}

function moneyFocus(el) {
    const v = parseMoney(el.value);
    el.value = v !== '' ? String(v) : '';
    el.select();
}

function moneyBlur(el, section, idx, key) {
    const parsed = parseMoney(el.value);
    el.value = parsed !== '' ? fmtMoney(parsed) : '';
    if (section !== undefined) updateField(section, idx, key, parsed);
}

const SECTION_TITLES = {
    A: 'Общие данные о проекте',
    B: 'Средства производства',
    E: 'Продукты и услуги',
    C1: 'Прямые затраты',
    C2: 'Косвенные затраты',
    D: 'Административно-хозяйственные расходы',
    F: 'Персонал',
    G: 'Финансирование'
};

// ── Planning range validation ──────────────────────────────────────────────────

function getPlanningRange() {
    const startStr = projectData.A?.startDate;
    const horizon  = parseInt(projectData.A?.horizon) || 6;
    if (!startStr) return null;
    const parts = startStr.trim().toLowerCase().split(/[\.\s]+/);
    if (parts.length < 2) return null;
    const m = RUSSIAN_MONTHS_MAP[parts[0]];
    const y = parseInt(parts[1]);
    if (m === undefined || isNaN(y)) return null;
    return {
        start:   new Date(y, m, 1),
        end:     new Date(y + horizon - 1, 11, 31),
        endYear: y + horizon - 1,
        endLabel: `декабрь ${y + horizon - 1}`
    };
}

function validateDateInRange(dateStr) {
    if (!dateStr) return true;
    const range = getPlanningRange();
    if (!range) return true;
    const parts = dateStr.trim().toLowerCase().split(/[\.\s]+/);
    if (parts.length < 2) return true;
    const m = RUSSIAN_MONTHS_MAP[parts[0]];
    const y = parseInt(parts[1]);
    if (m === undefined || isNaN(y)) return true;
    const d = new Date(y, m, 1);
    if (d < range.start || d > range.end) {
        showToast(
            `Дата «${dateStr}» выходит за горизонт планирования (${projectData.A.startDate} — ${range.endLabel})`,
            'error'
        );
        return false;
    }
    return true;
}

function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position:fixed;bottom:28px;right:28px;z-index:9999;
            padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;
            box-shadow:0 8px 24px rgba(0,0,0,0.18);transition:opacity 0.3s;font-family:inherit;
        `;
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = 'white';
    toast.style.opacity = '1';
    toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

function setActiveNav(section) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const active = document.querySelector(`.nav-btn[data-section="${section}"]`);
    if (active) active.classList.add('active');
    const title = document.getElementById('pageTitle');
    if (title) title.textContent = SECTION_TITLES[section] || section;
}

function renderSection(section) {
    const content = document.getElementById('content');
    setActiveNav(section);

    if (section === 'A') {
        content.innerHTML = `
            <div class="form-grid">
                <div class="form-group full">
                    <label>Название проекта</label>
                    <input id="a1" value="${projectData.A.name || ''}" placeholder="Введите название проекта"
                        oninput="autoSaveA('name', this.value)">
                </div>
                <div class="form-group full">
                    <label>Описание (до 400 символов)</label>
                    <textarea id="a2" maxlength="400" rows="4" placeholder="Краткое описание проекта"
                        oninput="updateDescCounter(); autoSaveA('description', this.value)">${projectData.A.description || ''}</textarea>
                    <div class="desc-counter-row">
                        <div class="desc-counter-bar"><div class="desc-counter-fill" id="descFill"></div></div>
                        <span id="descCount">0 / 400</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Горизонт планирования (лет)</label>
                    <input id="a3" type="number" value="${projectData.A.horizon || 6}" min="1" max="20"
                        oninput="autoSaveA('horizon', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Регион реализации</label>
                    <input id="a7" value="${projectData.A.region || 'Россия'}"
                        oninput="autoSaveA('region', this.value)">
                </div>
                <div class="form-group">
                    <label>Дата начала проекта</label>
                    <div class="month-picker-wrap">
                        <input id="a4" readonly placeholder="май 2026"
                            value="${projectData.A.startDate || 'май 2026'}"
                            onclick="openMonthPicker('a4','startDate')">
                        <div id="picker-a4" class="month-picker-popup" style="display:none"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Первая продажа</label>
                    <div class="month-picker-wrap">
                        <input id="a5" readonly placeholder="август 2026"
                            value="${projectData.A.firstSale || 'август 2026'}"
                            onclick="openMonthPicker('a5','firstSale')">
                        <div id="picker-a5" class="month-picker-popup" style="display:none"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Валюта</label>
                    <div class="custom-select-wrap" id="csel-wrap-a8">
                        <div class="custom-select-trigger" id="csel-a8"
                             data-section="A" data-idx="0" data-key="currency"
                             data-mode="currency" data-value="${projectData.A.currency || 'RUB'}"
                             onclick="openCustomSelect('a8',this)">
                            <span class="csel-label">${projectData.A.currency || 'RUB'}</span>${CSEL_CHEVRON}
                        </div>
                        <div id="csel-popup-a8" class="custom-select-popup" style="display:none"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Остаток ДС на старте</label>
                    <input id="a6" type="text" inputmode="numeric"
                        value="${fmtMoney(projectData.A.cashStart || 0)}"
                        onfocus="moneyFocus(this)"
                        oninput="autoSaveA('cashStart', parseMoney(this.value) || 0)"
                        onblur="this.value = fmtMoney(parseMoney(this.value) || 0)">
                </div>
            </div>
        `;
        updateDescCounter();
    } else if (SECTION_CONFIG[section]) {
        renderTableSection(section);
    } else if (section === 'G') {
        content.innerHTML = `
            <h2 class="section-main-title">Раздел G. Структура финансирования</h2>
            <p class="section-description">Размер финансирования будет рассчитан автоматически исходя из объективной потребности проекта в деньгах. Укажите процентное соотношение вложений исходя из принципа — возвратное или невозвратное финансирование будет использовано.</p>
            <div class="form-grid">
                <div class="form-group">
                    <label>Кредит (%)</label>
                    <input id="g1" type="number" value="${projectData.G.creditPercent || 50}" min="0" max="100"
                        oninput="autoSaveG('creditPercent', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Ставка по кредиту (%)</label>
                    <input id="g4" type="number" value="${projectData.G.creditRate || 9}" min="0"
                        oninput="autoSaveG('creditRate', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Собственный капитал (%)</label>
                    <input id="g3" type="number" value="${projectData.G.equityPercent || 50}" min="0" max="100"
                        oninput="autoSaveG('equityPercent', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Субсидии (%)</label>
                    <input id="g2" type="number" value="${projectData.G.subsidyPercent || 0}" min="0" max="100"
                        oninput="autoSaveG('subsidyPercent', parseFloat(this.value) || 0)">
                </div>
            </div>
            <div id="g-warning" class="section-warning" style="display:none;">
                ⚠️ Внимание. Общая сумма всех источников финансирования должна составлять 100%
            </div>
        `;
        ['g1','g2','g3'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', checkGSum);
        });
        checkGSum();
    }
}

function renderTableSection(section) {
    const config = SECTION_CONFIG[section];
    const data   = projectData[section] || [];
    const content = document.getElementById('content');

    const cols = typeof config.columns === 'function' ? config.columns(currencyLabel()) : config.columns;
    const headHtml = cols.map(c => `<th>${c}</th>`).join('');
    const rowsHtml = data.map((row, idx) => renderRowHtml(section, row, idx, config)).join('');

    content.innerHTML = `
        <h2 class="section-main-title">Раздел ${section}. ${config.title}</h2>
        <div class="table-wrapper">
            <table class="editable-table">
                <thead><tr>${headHtml}<th>Удалить</th></tr></thead>
                <tbody id="tbody-${section}">${rowsHtml}</tbody>
            </table>
        </div>
        <button class="btn-primary add-row-btn" onclick="addEmptyRow('${section}')">➕ Добавить строку</button>
    `;
}

function renderRowHtml(section, row, idx, config) {
    const cells = config.fields.map(field => {
        const val     = row[field.key] !== undefined ? row[field.key] : '';
        const safeVal = String(val).replace(/"/g, '&quot;');

        if (field.type === 'select') {
            const sId = `${section}-${idx}-${field.key}`;
            const displayVal = safeVal || (field.options && field.options[0]) || '';
            return `<td><div class="custom-select-wrap" id="csel-wrap-${sId}">
                <div class="custom-select-trigger" id="csel-${sId}"
                     data-section="${section}" data-idx="${idx}" data-key="${field.key}"
                     data-mode="" data-value="${safeVal}"
                     onclick="openCustomSelect('${sId}',this)">
                    <span class="csel-label">${displayVal}</span>${CSEL_CHEVRON}
                </div>
                <div id="csel-popup-${sId}" class="custom-select-popup" style="display:none"></div>
            </div></td>`;
        }

        if (field.type === 'product-select') {
            const sId = `${section}-${idx}-${field.key}`;
            const displayVal = safeVal || '— выберите продукт —';
            return `<td><div class="custom-select-wrap custom-select-product" id="csel-wrap-${sId}">
                <div class="custom-select-trigger" id="csel-${sId}"
                     data-section="${section}" data-idx="${idx}" data-key="${field.key}"
                     data-mode="product" data-value="${safeVal}"
                     onclick="openCustomSelect('${sId}',this)">
                    <span class="csel-label">${displayVal}</span>${CSEL_CHEVRON}
                </div>
                <div id="csel-popup-${sId}" class="custom-select-popup" style="display:none"></div>
            </div></td>`;
        }

        if (field.type === 'month') {
            const inputId = `mp-${section}-${idx}-${field.key}`;
            return `<td><div class="month-picker-wrap">
                <input id="${inputId}" readonly placeholder="мес. год" value="${safeVal}"
                    onclick="openMonthPicker('${inputId}','${field.key}','${section}',${idx})">
                <div id="picker-${inputId}" class="month-picker-popup" style="display:none"></div>
            </div></td>`;
        }

        if (field.type === 'money') {
            const displayVal = val !== '' ? fmtMoney(val) : '';
            return `<td><input type="text" inputmode="numeric" value="${displayVal}" placeholder="${field.placeholder || ''}"
                onfocus="moneyFocus(this)"
                onblur="moneyBlur(this,'${section}',${idx},'${field.key}')"></td>`;
        }

        return `<td><input type="${field.type}" value="${safeVal}" placeholder="${field.placeholder || ''}"
            oninput="updateField('${section}',${idx},'${field.key}',this.value)"></td>`;
    }).join('');

    return `<tr id="row-${section}-${idx}">${cells}<td><button class="btn-delete" onclick="deleteRow('${section}',${idx})">✕</button></td></tr>`;
}

function updateField(section, idx, key, value) {
    if (!projectData[section][idx]) return;
    const config = SECTION_CONFIG[section];
    const field  = config.fields.find(f => f.key === key);
    if (field && (field.type === 'number' || field.type === 'money')) {
        projectData[section][idx][key] = value === '' ? '' : parseFloat(String(value).replace(/[\s\u00A0]/g, '').replace(',', '.'));
    } else if (field && field.type === 'month') {
        projectData[section][idx][key] = monthInputToRussian(value);
    } else {
        projectData[section][idx][key] = value;
    }
    saveToStorage();
}

function addEmptyRow(section) {
    const config = SECTION_CONFIG[section];
    projectData[section].push(config.emptyRow());
    saveToStorage();

    const tbody = document.getElementById(`tbody-${section}`);
    const idx   = projectData[section].length - 1;
    const row   = projectData[section][idx];
    const tr    = document.createElement('tr');
    tr.id       = `row-${section}-${idx}`;
    tr.innerHTML = renderRowHtml(section, row, idx, config)
        .replace(/^<tr[^>]*>/, '').replace(/<\/tr>$/, '');
    tbody.appendChild(tr);

    const firstInput = tr.querySelector('input, select');
    if (firstInput) firstInput.focus();
}

function deleteRow(section, idx) {
    projectData[section].splice(idx, 1);
    saveToStorage();
    renderSection(section);
}

function autoSaveA(field, value) {
    if (!projectData.A) projectData.A = {};
    projectData.A[field] = value;
    saveToStorage();
}

function updateDescCounter() {
    const ta = document.getElementById('a2');
    const fill = document.getElementById('descFill');
    const count = document.getElementById('descCount');
    if (!ta || !fill || !count) return;
    const len = ta.value.length;
    const pct = (len / 400) * 100;
    fill.style.width = pct + '%';
    fill.style.background = pct < 70 ? 'var(--primary)' : pct < 90 ? '#f59e0b' : '#ef4444';
    count.textContent = `${len} / 400`;
    count.style.color = pct >= 90 ? '#ef4444' : 'var(--text-muted)';
}

function onCurrencyChange(val) {
    if (!projectData.A) projectData.A = {};
    projectData.A.currency = val;
    saveToStorage();
}

function checkGSum() {
    const credit = parseFloat(document.getElementById('g1')?.value) || 0;
    const subsidy = parseFloat(document.getElementById('g2')?.value) || 0;
    const equity = parseFloat(document.getElementById('g3')?.value) || 0;
    const warning = document.getElementById('g-warning');
    if (!warning) return;
    const sum = credit + subsidy + equity;
    warning.style.display = Math.abs(sum - 100) > 0.01 ? 'block' : 'none';
}

function autoSaveG(field, value) {
    if (!projectData.G) projectData.G = {};
    projectData.G[field] = value;
    saveToStorage();
}

// ── Chart ────────────────────────────────────────────────────────────────────

let mainChartInstance = null;

function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }

function renderKPI(result) {
    const npv    = parseFloat(result.npv);
    const loan   = parseFloat(result.requiredLoan) || 0;
    const kpiRow = document.getElementById('kpiRow');
    kpiRow.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">NPV</div>
            <div class="kpi-value ${npv >= 0 ? 'positive' : 'negative'}">${fmt(npv)}</div>
            <div class="kpi-sub">${thouLabel()} · ставка 16%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">IRR</div>
            <div class="kpi-value neutral">${typeof result.irr === 'number' ? result.irr.toFixed(2) : result.irr}%</div>
            <div class="kpi-sub">внутренняя норма доходности</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">PI</div>
            <div class="kpi-value ${parseFloat(result.pi) >= 1 ? 'positive' : 'negative'}">${result.pi}</div>
            <div class="kpi-sub">индекс рентабельности</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Срок окупаемости</div>
            <div class="kpi-value neutral">${result.paybackPeriod}</div>
            <div class="kpi-sub">простой срок</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Потребность в финансировании</div>
            <div class="kpi-value ${loan > 0 ? 'negative' : 'positive'}">${fmt(loan)}</div>
            <div class="kpi-sub">${thouLabel()} · расчётный кредит</div>
        </div>
    `;
}

function renderChart(result) {
    if (mainChartInstance) {
        mainChartInstance.destroy();
        mainChartInstance = null;
    }

    const isDark    = document.body.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#8b9ab0' : '#6b7280';
    const cardBg    = isDark ? '#1c1f2e' : '#ffffff';

    const bgPlugin = {
        id: 'chartBg',
        beforeDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            ctx.save();
            ctx.fillStyle = cardBg;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    const ctx = document.getElementById('mainChart').getContext('2d');
    mainChartInstance = new Chart(ctx, {
        type: 'bar',
        plugins: [bgPlugin],
        data: {
            labels: result.years.map(String),
            datasets: [
                {
                    label: 'Выручка',
                    data: result.revenue.map(Math.round),
                    backgroundColor: 'rgba(79,70,229,0.75)',
                    borderRadius: 5,
                    order: 2
                },
                {
                    label: 'Чистая прибыль',
                    data: result.netProfit.map(Math.round),
                    backgroundColor: 'rgba(16,185,129,0.75)',
                    borderRadius: 5,
                    order: 2
                },
                {
                    label: 'ДС накопл.',
                    data: result.cashCumulative.map(Math.round),
                    type: 'line',
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245,158,11,0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#f59e0b',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.35,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('ru-RU')} ${thouLabel()}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Inter', size: 12 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Inter', size: 12 },
                        callback: v => v.toLocaleString('ru-RU')
                    }
                }
            }
        }
    });

    document.getElementById('chartLegend').innerHTML = [
        { color: 'rgba(79,70,229,0.75)', label: 'Выручка' },
        { color: 'rgba(16,185,129,0.75)', label: 'Чистая прибыль' },
        { color: '#f59e0b',              label: 'ДС накопл.' }
    ].map(l => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${l.color}"></span>
            <span>${l.label}</span>
        </div>
    `).join('');
}

// ── Results table ────────────────────────────────────────────────────────────

const RESULT_ROWS = [
    { key: 'revenue',            label: 'Выручка',                    class: '' },
    { key: 'quantity',           label: 'Кол-во (ед)',                 class: '' },
    { key: 'directCosts',        label: 'Прямые затраты',              class: 'cost' },
    { key: 'indirectCosts',      label: 'Косвенные затраты',           class: 'cost' },
    { key: 'adminCosts',         label: 'АХР',                        class: 'cost' },
    { key: 'payroll',            label: 'ФОТ',                        class: 'cost' },
    { key: 'insurancePremiums',  label: 'Страховые взносы (30%)',      class: 'cost' },
    { key: 'ebitda',             label: 'EBITDA',                     class: 'ebitda' },
    { key: 'netProfit',          label: 'Чистая прибыль',              class: 'profit' },
    { key: 'investments',        label: 'Инвестиции',                  class: 'cost' },
    { key: 'financing',          label: 'Финансирование (займ)',        class: 'financing' },
    { key: 'principalRepayment', label: 'Погашение основного долга',   class: 'cost' },
    { key: 'interestRepayment',  label: 'Выплата процентов',           class: 'cost' },
    { key: 'cashCumulative',     label: 'ДС накопленные',              class: 'cash' }
];

function getRowClass(meta, value) {
    if (meta.class === 'profit' || meta.class === 'cash' || meta.class === 'ebitda') {
        return value >= 0 ? 'positive' : 'negative';
    }
    return '';
}

function renderResultsTable(result, transposed) {
    const resultsContent = document.getElementById('resultsContent');
    tableTransposed = !!transposed;

    const btnLabel = tableTransposed
        ? '↔ Строки ↔ Столбцы (сейчас: статьи→строки)'
        : '↕ Строки ↔ Столбцы (сейчас: годы→строки)';

    let tableHtml = '';

    if (!tableTransposed) {
        // Default: items as rows, years as columns
        const yearHeaders = result.years.map(y => `<th>${y}</th>`).join('');
        const bodyRows = RESULT_ROWS.map(meta => {
            const data = result[meta.key] || [];
            const cells = data.map((v, i) => {
                const rounded = Math.round(v);
                const cls = getRowClass(meta, rounded);
                return `<td class="${cls}">${fmt(rounded)}</td>`;
            }).join('');
            const rowCls = meta.class === 'ebitda' ? 'row-ebitda' : meta.class === 'profit' ? 'row-profit' : '';
            return `<tr class="${rowCls}"><td class="row-label">${meta.label}</td>${cells}</tr>`;
        }).join('');

        tableHtml = `
            <thead><tr><th>Статья / Год</th>${yearHeaders}</tr></thead>
            <tbody>${bodyRows}</tbody>
        `;
    } else {
        // Transposed: years as rows, items as columns
        const itemHeaders = RESULT_ROWS.map(m => `<th>${m.label}</th>`).join('');
        const bodyRows = result.years.map((year, i) => {
            const cells = RESULT_ROWS.map(meta => {
                const v = (result[meta.key] || [])[i] || 0;
                const rounded = Math.round(v);
                const cls = getRowClass(meta, rounded);
                return `<td class="${cls}">${fmt(rounded)}</td>`;
            }).join('');
            return `<tr><td class="row-label">${year}</td>${cells}</tr>`;
        }).join('');

        tableHtml = `
            <thead><tr><th>Год / Статья</th>${itemHeaders}</tr></thead>
            <tbody>${bodyRows}</tbody>
        `;
    }

    resultsContent.innerHTML = `
        <div class="table-toolbar">
            <button class="btn-secondary btn-sm" onclick="renderResultsTable(window._lastResult, ${!tableTransposed})">
                ⇄ Транспонировать таблицу
            </button>
        </div>
        <div class="table-wrapper">
            <table>${tableHtml}</table>
        </div>
    `;
}

// ── Calculate ────────────────────────────────────────────────────────────────

document.getElementById('calculateBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('calculateBtn');
    btn.textContent = '⏳ Расчёт...';
    btn.disabled = true;
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        const result = await response.json();

        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = '';

        window._lastResult = result;
        tableTransposed = false;
        const curDisp = document.getElementById('curLabelDisplay');
        if (curDisp) curDisp.textContent = thouLabel();
        renderKPI(result);
        renderChart(result);
        renderResultsTable(result, false);

        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Расчёт выполнен успешно');
    } catch (e) {
        showToast('Ошибка при расчёте', 'error');
    } finally {
        btn.textContent = '📈 Рассчитать проект';
        btn.disabled = false;
    }
});

// ── Nav ──────────────────────────────────────────────────────────────────────

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSection = btn.dataset.section;
        renderSection(currentSection);
    });
});

// ── Theme toggle ─────────────────────────────────────────────────────────────

document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const sunSvg  = `<svg id="themeIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const moonSvg = `<svg id="themeIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    document.getElementById('themeToggle').innerHTML = isDark
        ? `${sunSvg} Светлая тема`
        : `${moonSvg} Тёмная тема`;
    // Re-render chart with new theme colours
    if (window._lastResult) {
        renderChart(window._lastResult);
    }
});

// ── Excel export ─────────────────────────────────────────────────────────────

document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
    if (!window._lastResult) { showToast('Сначала выполните расчёт', 'error'); return; }
    const result = window._lastResult;
    const wb = XLSX.utils.book_new();

    // ── Palette ──────────────────────────────────────────────────
    const C = {
        PRIMARY:    '4F46E5',
        PRIMARY_LT: 'EEF2FF',
        HDR_BG:     'F0F2F7',
        TEXT:       '1A1D27',
        WHITE:      'FFFFFF',
        ALT:        'F8F9FB',
        BRD:        'D1D5DB',
        COST_BG:    'FFF7ED',
        GREEN_LT:   'ECFDF5',
        GREEN_TXT:  '065F46',
        BLUE_LT:    'EFF6FF',
        BLUE_TXT:   '1E40AF',
    };

    function mkBrd(rgb) {
        const s = { style: 'thin', color: { rgb } };
        return { top: s, bottom: s, left: s, right: s };
    }
    const brd     = mkBrd(C.BRD);
    const brdPrim = mkBrd(C.PRIMARY);

    function sTitle(c) {
        return {
            font:      { bold: true, sz: 12, color: { rgb: '404040' }, name: 'Calibri' },
            alignment: { vertical: 'center', horizontal: c === 0 ? 'left' : 'center' }
        };
    }
    function sHdr(c) {
        return {
            font:      { bold: true, sz: 10, color: { rgb: '404040' }, name: 'Calibri' },
            fill:      { fgColor: { rgb: 'EEECE1' }, patternType: 'solid' },
            alignment: { vertical: 'center', horizontal: c === 0 ? 'left' : 'center' }
        };
    }
    function sData(c, alt, fillRgb, textRgb, bold) {
        return {
            font:      { sz: 10, bold: !!bold, color: { rgb: textRgb || C.TEXT }, name: 'Calibri' },
            fill:      { fgColor: { rgb: fillRgb || (alt ? C.ALT : C.WHITE) }, patternType: 'solid' },
            border:    brd,
            alignment: { vertical: 'center', horizontal: c === 0 ? 'left' : 'right' }
        };
    }

    // accent map: { [dataRowIdx]: { fillRgb, textRgb, bold } }
    // numFmtCols: column indices (0-based) to apply #,##0 number format
    function addSheet(sheetName, titleText, headers, dataRows, colWidths, accentMap, numFmtCols) {
        const numCols = headers.length;
        const aoa = [
            [titleText, ...Array(numCols - 1).fill('')],
            [...headers],
            ...dataRows
        ];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        if (colWidths) ws['!cols'] = colWidths;
        ws['!rows'] = aoa.map((_, i) => ({ hpt: i === 0 ? 24 : i === 1 ? 18 : 16 }));

        for (let r = 0; r < aoa.length; r++) {
            for (let c = 0; c < numCols; c++) {
                const addr = XLSX.utils.encode_cell({ r, c });
                if (!ws[addr]) ws[addr] = { t: 's', v: '' };
                if (r === 0) {
                    ws[addr].s = sTitle(c);
                } else if (r === 1) {
                    ws[addr].s = sHdr(c);
                } else {
                    const di  = r - 2;
                    const alt = di % 2 !== 0;
                    const acc = accentMap && accentMap[di];
                    ws[addr].s = acc
                        ? sData(c, false, acc.fillRgb, acc.textRgb, acc.bold)
                        : sData(c, alt);
                    if (numFmtCols && numFmtCols.includes(c) && ws[addr].t === 'n') {
                        ws[addr].z = '#,##0';
                    }
                }
            }
        }
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const cur  = currencyLabel() || 'руб';
    const thou = thouLabel();

    // ── A: Общие данные ──────────────────────────────────────────
    addSheet(
        'A. Общие данные',
        'A. Общие данные о проекте',
        ['Параметр', 'Значение'],
        [
            ['Название проекта',             projectData.A?.name        || ''],
            ['Описание',                     projectData.A?.description || ''],
            ['Горизонт планирования (лет)',   projectData.A?.horizon     || ''],
            ['Регион реализации',             projectData.A?.region      || ''],
            ['Дата начала проекта',           projectData.A?.startDate   || ''],
            ['Первая продажа',                projectData.A?.firstSale   || ''],
            ['Остаток ДС на старте',          projectData.A?.cashStart   || 0],
            ['Валюта',                        projectData.A?.currency    || 'RUB']
        ],
        [{ wch: 32 }, { wch: 36 }],
        null, [1]
    );

    // ── B: Средства производства ─────────────────────────────────
    if (projectData.B?.length) {
        addSheet(
            'B. Средства производства',
            'B. Средства производства',
            ['Название', `Сумма (${cur})`, 'Дата покупки'],
            projectData.B.map(r => [r.name, r.amount, r.date]),
            [{ wch: 32 }, { wch: 18 }, { wch: 18 }],
            null, [1]
        );
    }

    // ── E: Продукты и услуги ─────────────────────────────────────
    if (projectData.E?.length) {
        addSheet(
            'E. Продукты и услуги',
            'E. Продукты и услуги',
            ['Продукт', `Цена (${cur})`, 'Кол-во/мес', 'Дата старта продаж', 'Рост % в год'],
            projectData.E.map(r => [r.product, r.price, r.quantity, r.startDate, r.growth]),
            [{ wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 16 }],
            null, [1, 2]
        );
    }

    // ── C1: Прямые затраты ───────────────────────────────────────
    if (projectData.C1?.length) {
        addSheet(
            'C1. Прямые затраты',
            'C1. Прямые затраты на единицу продукции',
            ['Продукт', 'Статья затрат', `Сумма на ед. (${cur})`, 'Рост %'],
            projectData.C1.map(r => [r.product, r.costItem, r.amountPerUnit, r.growth]),
            [{ wch: 30 }, { wch: 28 }, { wch: 22 }, { wch: 12 }],
            null, [2]
        );
    }

    // ── C2: Косвенные затраты ────────────────────────────────────
    if (projectData.C2?.length) {
        addSheet(
            'C2. Косвенные затраты',
            'C2. Косвенные производственные затраты',
            ['Название', `Сумма (${cur})`, 'Дата начала', 'Периодичность', 'Рост %'],
            projectData.C2.map(r => [r.name, r.amount, r.startDate, r.periodicity, r.growth]),
            [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 12 }],
            null, [1]
        );
    }

    // ── D: АХР ───────────────────────────────────────────────────
    if (projectData.D?.length) {
        addSheet(
            'D. АХР',
            'D. Административно-хозяйственные расходы',
            ['Название', `Сумма (${cur})`, 'Дата начала', 'Периодичность', 'Рост %'],
            projectData.D.map(r => [r.name, r.amount, r.startDate, r.periodicity, r.growth]),
            [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 12 }],
            null, [1]
        );
    }

    // ── F: Персонал ───────────────────────────────────────────────
    if (projectData.F?.length) {
        addSheet(
            'F. Персонал',
            'F. Персонал',
            ['Должность', `Оклад (${cur})`, 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
            projectData.F.map(r => [r.position, r.salary, r.count, r.hireDate, r.growth]),
            [{ wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 14 }],
            null, [1, 2]
        );
    }

    // ── G: Финансирование ─────────────────────────────────────────
    addSheet(
        'G. Финансирование',
        'G. Структура финансирования',
        ['Параметр', 'Значение'],
        [
            ['Кредит (%)',                   projectData.G?.creditPercent  || ''],
            ['Субсидии (%)',                 projectData.G?.subsidyPercent || ''],
            ['Собственный капитал (%)',      projectData.G?.equityPercent  || ''],
            ['Ставка по кредиту (%)',        projectData.G?.creditRate     || ''],
            [`Расчётный займ (${thou})`,     Number(result.requiredLoan) || 0]
        ],
        [{ wch: 34 }, { wch: 18 }],
        null, [1]
    );

    // ── Прогноз ───────────────────────────────────────────────────
    const forecastAccent = {};
    RESULT_ROWS.forEach((meta, i) => {
        if      (meta.class === 'ebitda')    forecastAccent[i] = { fillRgb: C.PRIMARY_LT, textRgb: C.PRIMARY,   bold: true  };
        else if (meta.class === 'profit')    forecastAccent[i] = { fillRgb: C.GREEN_LT,   textRgb: C.GREEN_TXT, bold: true  };
        else if (meta.class === 'cash')      forecastAccent[i] = { fillRgb: C.GREEN_LT,   textRgb: C.GREEN_TXT, bold: false };
        else if (meta.class === 'cost')      forecastAccent[i] = { fillRgb: C.COST_BG,    textRgb: C.TEXT,      bold: false };
        else if (meta.class === 'financing') forecastAccent[i] = { fillRgb: C.BLUE_LT,    textRgb: C.BLUE_TXT,  bold: false };
    });

    const yearCols       = result.years.map(() => ({ wch: 16 }));
    const numFmtYearCols = result.years.map((_, i) => i + 1);
    addSheet(
        'Прогноз',
        `Финансовый прогноз (${thou})`,
        ['Статья / Год', ...result.years.map(String)],
        RESULT_ROWS.map(meta => [meta.label, ...(result[meta.key] || []).map(v => Math.round(v))]),
        [{ wch: 34 }, ...yearCols],
        forecastAccent,
        numFmtYearCols
    );

    // ── Показатели ────────────────────────────────────────────────
    addSheet(
        'Показатели',
        'Ключевые показатели эффективности',
        ['Показатель', 'Значение', 'Единица'],
        [
            ['NPV (чистая приведённая стоимость)',  Number(result.npv) || 0, thou],
            ['IRR (внутренняя норма доходности)',   result.irr,           '%'],
            ['PI (индекс рентабельности)',           result.pi,            ''],
            ['Срок окупаемости',                    result.paybackPeriod, ''],
            ['Потребность в финансировании',         Number(result.requiredLoan) || 0, thou],
            ['Ставка дисконтирования',               '16',                '%'],
            ['Страховые взносы',                     '30',                '% от ФОТ']
        ],
        [{ wch: 42 }, { wch: 18 }, { wch: 18 }],
        {
            0: { fillRgb: C.GREEN_LT,   textRgb: C.GREEN_TXT, bold: true  },
            1: { fillRgb: C.PRIMARY_LT, textRgb: C.PRIMARY,   bold: true  },
            2: { fillRgb: C.PRIMARY_LT, textRgb: C.PRIMARY,   bold: false },
            3: { fillRgb: C.PRIMARY_LT, textRgb: C.PRIMARY,   bold: false },
            4: { fillRgb: C.BLUE_LT,    textRgb: C.BLUE_TXT,  bold: false },
        }
    );

    const filename = `${projectData.A?.name || 'project'}_results.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('Excel файл экспортирован');
});

// ── Month Picker ───────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
let _activePickerId = null;

// inputId      — id of the <input> element
// fieldKey     — data key to store value under
// tableSection — section letter (e.g. 'B'), undefined for section A
// tableIdx     — row index for table sections
function openMonthPicker(inputId, fieldKey, tableSection, tableIdx) {
    const popup = document.getElementById('picker-' + inputId);
    if (!popup) return;
    if (_activePickerId === inputId && popup.style.display !== 'none') {
        closeMonthPicker(); return;
    }
    closeMonthPicker();
    const input = document.getElementById(inputId);
    const parts = (input.value || '').trim().toLowerCase().split(/[\.\s]+/);
    let selMonth = -1, displayYear = new Date().getFullYear();
    if (parts.length >= 2) {
        const mi = RUSSIAN_MONTHS_MAP[parts[0]];
        const yr = parseInt(parts[1]);
        if (mi !== undefined) selMonth = mi;
        if (!isNaN(yr)) displayYear = yr;
    }
    popup.dataset.year         = displayYear;
    popup.dataset.selMonth     = selMonth;
    popup.dataset.fieldKey     = fieldKey;
    popup.dataset.tableSection = tableSection !== undefined ? tableSection : '';
    popup.dataset.tableIdx     = tableIdx     !== undefined ? tableIdx     : '';
    _renderPickerContent(popup, inputId, displayYear, selMonth);
    popup.style.display = 'block';
    // Position below the input using fixed viewport coordinates
    const rect = input.getBoundingClientRect();
    popup.style.top  = (rect.bottom + 6) + 'px';
    popup.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    _activePickerId = inputId;
}

function closeMonthPicker() {
    if (_activePickerId) {
        const p = document.getElementById('picker-' + _activePickerId);
        if (p) p.style.display = 'none';
        _activePickerId = null;
    }
}

function _renderPickerContent(popup, inputId, year, selMonth) {
    const months = MONTHS_SHORT.map((m, i) => `
        <button class="mp-month${i === selMonth ? ' mp-selected' : ''}"
            onclick="pickMonth('${inputId}',${year},${i})">${m}</button>`
    ).join('');
    popup.innerHTML = `
        <div class="mp-header">
            <button class="mp-nav" onclick="shiftPickerYear('${inputId}',-1)">&#8249;</button>
            <span class="mp-year">${year}</span>
            <button class="mp-nav" onclick="shiftPickerYear('${inputId}',1)">&#8250;</button>
        </div>
        <div class="mp-grid">${months}</div>`;
}

function shiftPickerYear(inputId, delta) {
    const popup = document.getElementById('picker-' + inputId);
    if (!popup) return;
    const year     = parseInt(popup.dataset.year) + delta;
    const selMonth = parseInt(popup.dataset.selMonth);
    popup.dataset.year = year;
    _renderPickerContent(popup, inputId, year, selMonth);
}

function pickMonth(inputId, year, monthIdx) {
    const popup = document.getElementById('picker-' + inputId);
    const input = document.getElementById(inputId);
    if (!input || !popup) return;
    const value = `${MONTHS_RU[monthIdx]} ${year}`;
    input.value = value;
    const ts = popup.dataset.tableSection;
    const ti = popup.dataset.tableIdx;
    const fk = popup.dataset.fieldKey;
    if (ts) {
        if (projectData[ts] && projectData[ts][parseInt(ti)] !== undefined) {
            projectData[ts][parseInt(ti)][fk] = value;
            saveToStorage();
        }
        validateDateInRange(value);
    } else {
        if (!projectData.A) projectData.A = {};
        projectData.A[fk] = value;
        saveToStorage();
        if (fk !== 'startDate') validateDateInRange(value);
    }
    closeMonthPicker();
}

// ── Custom Select ─────────────────────────────────────────────────────────────

let _activeSelectId = null;

const CSEL_CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>`;

function openCustomSelect(selectId, triggerEl) {
    if (_activeSelectId && _activeSelectId !== selectId) closeCustomSelect();
    if (_activeSelectId === selectId) { closeCustomSelect(); return; }

    const popup = document.getElementById('csel-popup-' + selectId);
    if (!popup) return;

    const section = triggerEl.dataset.section;
    const key     = triggerEl.dataset.key;
    const mode    = triggerEl.dataset.mode || '';
    const current = triggerEl.dataset.value || '';

    let options = [];

    if (mode === 'currency') {
        options = CURRENCIES.map(c => ({ value: c, label: c }));
    } else if (mode === 'product') {
        options = [{ value: '', label: '— выберите продукт —' }].concat(
            (projectData.E || []).map(p => {
                const n = String(p.product || '');
                return { value: n, label: n || '(без названия)' };
            })
        );
    } else if (section && SECTION_CONFIG[section]) {
        const field = SECTION_CONFIG[section].fields.find(f => f.key === key);
        if (field && field.options) {
            options = field.options.map(o => ({ value: o, label: o }));
        }
    }

    popup._cselOptions = options;
    popup.innerHTML = options.map((o, i) =>
        `<button class="custom-select-option${o.value === current ? ' csel-selected' : ''}"
            onclick="pickSelectOption('${selectId}',${i})">${o.label}</button>`
    ).join('');

    const rect = triggerEl.getBoundingClientRect();
    popup.style.top      = (rect.bottom + 4) + 'px';
    popup.style.left     = Math.min(rect.left, window.innerWidth - 230) + 'px';
    popup.style.minWidth = rect.width + 'px';
    popup.style.display  = 'block';
    _activeSelectId = selectId;
}

function closeCustomSelect() {
    if (_activeSelectId) {
        const p = document.getElementById('csel-popup-' + _activeSelectId);
        if (p) p.style.display = 'none';
        _activeSelectId = null;
    }
}

function pickSelectOption(selectId, optIdx) {
    const popup   = document.getElementById('csel-popup-' + selectId);
    const trigger = document.getElementById('csel-' + selectId);
    if (!popup || !trigger) return;

    const opt = (popup._cselOptions || [])[optIdx];
    if (!opt) return;

    const value   = opt.value;
    const section = trigger.dataset.section;
    const idx     = parseInt(trigger.dataset.idx || '0');
    const key     = trigger.dataset.key;
    const mode    = trigger.dataset.mode || '';

    const labelEl = trigger.querySelector('.csel-label');
    if (labelEl) labelEl.textContent = opt.label;
    trigger.dataset.value = value;

    if (mode === 'currency') {
        onCurrencyChange(value);
    } else if (section && section !== 'A') {
        updateField(section, idx, key, value);
    } else if (section === 'A') {
        projectData.A[key] = value;
        saveToStorage();
    }

    closeCustomSelect();
}

document.addEventListener('click', e => {
    if (_activePickerId && document.contains(e.target) && !e.target.closest('.month-picker-wrap')) {
        closeMonthPicker();
    }
    if (_activeSelectId && document.contains(e.target) && !e.target.closest('.custom-select-wrap')) {
        closeCustomSelect();
    }
});

// ── Export/Import project file ───────────────────────────────────────────────

document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
    const data = JSON.stringify(projectData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const name = (projectData.A?.name || 'project').replace(/[^\w\u0400-\u04FF\-]+/g, '_');
    const date = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = `${name}_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Файл данных сохранён');
});

document.getElementById('importJsonBtn')?.addEventListener('click', () => {
    document.getElementById('importJsonInput')?.click();
});

document.getElementById('importJsonInput')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (!parsed || typeof parsed !== 'object' || !parsed.A || typeof parsed.A !== 'object') {
                throw new Error('Invalid format');
            }
            if (!confirm('Загрузить данные из файла?\nТекущие данные проекта будут заменены.')) return;
            projectData = parsed;
            saveToStorage();
            renderSection(currentSection);
            showToast('Данные загружены из файла');
        } catch (err) {
            showToast('Ошибка: некорректный файл данных', 'error');
        }
    };
    reader.onerror = () => showToast('Ошибка чтения файла', 'error');
    reader.readAsText(file);
    e.target.value = '';
});

// ── Load demo data ────────────────────────────────────────────────────────────

document.getElementById('loadDemoBtn')?.addEventListener('click', () => {
    if (confirm('Заполнить все разделы демо-данными проекта «ВертФерм»?\nТекущие данные будут заменены.')) {
        projectData = JSON.parse(JSON.stringify(DEMO_DATA));
        saveToStorage();
        renderSection(currentSection);
        showToast('Демо-данные загружены');
    }
});

// ── Reset ─────────────────────────────────────────────────────────────────────

document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('Удалить все данные проекта?')) {
        const empty = { A: { name:'', description:'', horizon:6, region:'Россия', startDate:'', firstSale:'', cashStart:0, currency:'RUB' }, B:[], E:[], C1:[], C2:[], D:[], F:[], G:{ creditPercent:50, subsidyPercent:0, equityPercent:50, creditRate:9 } };
        localStorage.setItem('investmentProject', JSON.stringify(empty));
        location.reload();
    }
});

// ── Help modal ────────────────────────────────────────────────────────────────

function openHelpModal()  { document.getElementById('helpModal').style.display = 'flex'; }
function closeHelpModal() { document.getElementById('helpModal').style.display = 'none'; }
window.openHelpModal  = openHelpModal;
window.closeHelpModal = closeHelpModal;

document.getElementById('helpBtn')?.addEventListener('click', openHelpModal);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('helpModal')?.style.display === 'flex') {
        closeHelpModal();
    }
});

loadFromStorage();
renderSection('A');

// Show guide automatically on first visit
if (!localStorage.getItem('helpSeen')) {
    openHelpModal();
    localStorage.setItem('helpSeen', '1');
}
