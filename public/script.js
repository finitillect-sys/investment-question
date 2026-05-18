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
        columns: ['Название', 'Сумма (руб)', 'Дата покупки'],
        fields: [
            { key: 'name',   type: 'text',   placeholder: 'Станок ЧПУ' },
            { key: 'amount', type: 'number', placeholder: '300000' },
            { key: 'date',   type: 'month' }
        ],
        emptyRow: () => ({ name: '', amount: '', date: '' })
    },
    E: {
        title: 'Продукты и услуги',
        columns: ['Продукт', 'Цена (руб)', 'Кол-во/мес', 'Дата старта продаж', 'Рост % в год'],
        fields: [
            { key: 'product',   type: 'text',   placeholder: 'Электросамокат' },
            { key: 'price',     type: 'number', placeholder: '25000' },
            { key: 'quantity',  type: 'number', placeholder: '100' },
            { key: 'startDate', type: 'month' },
            { key: 'growth',    type: 'number', placeholder: '24' }
        ],
        emptyRow: () => ({ product: '', price: '', quantity: '', startDate: '', growth: '' })
    },
    C1: {
        title: 'Прямые затраты на единицу продукции',
        columns: ['Продукт', 'Статья затрат', 'Сумма на ед. (руб)', 'Рост %'],
        fields: [
            { key: 'product',      type: 'product-select' },
            { key: 'costItem',     type: 'text',   placeholder: 'Материалы' },
            { key: 'amountPerUnit', type: 'number', placeholder: '8500' },
            { key: 'growth',       type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ product: '', costItem: '', amountPerUnit: '', growth: '' })
    },
    C2: {
        title: 'Косвенные производственные затраты',
        columns: ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name',        type: 'text',   placeholder: 'Аренда' },
            { key: 'amount',      type: 'number', placeholder: '50000' },
            { key: 'startDate',   type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год'] },
            { key: 'growth',      type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    D: {
        title: 'Административно-хозяйственные затраты',
        columns: ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name',        type: 'text',   placeholder: 'Реклама' },
            { key: 'amount',      type: 'number', placeholder: '30000' },
            { key: 'startDate',   type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год'] },
            { key: 'growth',      type: 'number', placeholder: '5' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    F: {
        title: 'Персонал',
        columns: ['Должность', 'Оклад (руб)', 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
        fields: [
            { key: 'position', type: 'text',   placeholder: 'Токарь' },
            { key: 'salary',   type: 'number', placeholder: '80000' },
            { key: 'count',    type: 'number', placeholder: '2' },
            { key: 'hireDate', type: 'month' },
            { key: 'growth',   type: 'number', placeholder: '7' }
        ],
        emptyRow: () => ({ position: '', salary: '', count: '', hireDate: '', growth: '' })
    }
};

function loadFromStorage() {
    const saved = localStorage.getItem('investmentProject');
    if (saved) projectData = JSON.parse(saved);
}

function saveToStorage() {
    localStorage.setItem('investmentProject', JSON.stringify(projectData));
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
                    <input id="a1" value="${projectData.A.name || ''}" placeholder="Введите название проекта">
                </div>
                <div class="form-group full">
                    <label>Описание (до 100 символов)</label>
                    <input id="a2" value="${projectData.A.description || ''}" placeholder="Краткое описание проекта">
                </div>
                <div class="form-group">
                    <label>Горизонт планирования (лет)</label>
                    <input id="a3" type="number" value="${projectData.A.horizon || 6}" min="1" max="20">
                </div>
                <div class="form-group">
                    <label>Регион реализации</label>
                    <input id="a7" value="${projectData.A.region || 'Россия'}">
                </div>
                <div class="form-group">
                    <label>Дата начала проекта</label>
                    <input id="a4" value="${projectData.A.startDate || 'май 2026'}" placeholder="май 2026">
                </div>
                <div class="form-group">
                    <label>Первая продажа</label>
                    <input id="a5" value="${projectData.A.firstSale || 'август 2026'}" placeholder="август 2026">
                </div>
                <div class="form-group">
                    <label>Остаток ДС на старте (руб)</label>
                    <input id="a6" type="number" value="${projectData.A.cashStart || 0}">
                </div>
            </div>
            <div class="save-btn-row">
                <button onclick="saveSectionA()" class="btn-primary">Сохранить</button>
            </div>
        `;
    } else if (SECTION_CONFIG[section]) {
        renderTableSection(section);
    } else if (section === 'G') {
        content.innerHTML = `
            <h2 class="section-main-title">Раздел G. Структура финансирования</h2>
            <p class="section-description">Размер финансирования будет рассчитан автоматически исходя из объективной потребности проекта в деньгах. Укажите процентное соотношение вложений исходя из принципа — возвратное или невозвратное финансирование будет использовано.</p>
            <div class="form-grid">
                <div class="form-group">
                    <label>Кредит (%)</label>
                    <input id="g1" type="number" value="${projectData.G.creditPercent || 50}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Субсидии (%)</label>
                    <input id="g2" type="number" value="${projectData.G.subsidyPercent || 0}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Собственный капитал (%)</label>
                    <input id="g3" type="number" value="${projectData.G.equityPercent || 50}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Ставка по кредиту (%)</label>
                    <input id="g4" type="number" value="${projectData.G.creditRate || 9}" min="0">
                </div>
            </div>
            <div class="save-btn-row">
                <button onclick="saveSectionG()" class="btn-primary">Сохранить</button>
            </div>
        `;
    }
}

function renderTableSection(section) {
    const config = SECTION_CONFIG[section];
    const data   = projectData[section] || [];
    const content = document.getElementById('content');

    const headHtml = config.columns.map(c => `<th>${c}</th>`).join('');
    const rowsHtml = data.map((row, idx) => renderRowHtml(section, row, idx, config)).join('');

    content.innerHTML = `
        <h2>Раздел ${section}. ${config.title}</h2>
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
            const opts = field.options.map(o =>
                `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`
            ).join('');
            return `<td><select onchange="updateField('${section}',${idx},'${field.key}',this.value)">${opts}</select></td>`;
        }

        if (field.type === 'product-select') {
            const products = projectData.E || [];
            const emptyOpt = `<option value="" ${!val ? 'selected' : ''}>— выберите продукт —</option>`;
            const opts = products.map(p => {
                const pName = String(p.product || '').replace(/"/g, '&quot;');
                return `<option value="${pName}" ${pName === safeVal ? 'selected' : ''}>${pName || '(без названия)'}</option>`;
            }).join('');
            return `<td><select class="product-select" onchange="updateField('${section}',${idx},'${field.key}',this.value)">${emptyOpt}${opts}</select></td>`;
        }

        if (field.type === 'month') {
            const inputVal = russianToMonthInput(safeVal);
            return `<td><input type="month" value="${inputVal}"
                onchange="updateField('${section}',${idx},'${field.key}',this.value)"></td>`;
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
    if (field && field.type === 'number') {
        projectData[section][idx][key] = value === '' ? '' : parseFloat(value);
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

function saveSectionA() {
    projectData.A = {
        name:        document.getElementById('a1').value,
        description: document.getElementById('a2').value,
        horizon:     parseInt(document.getElementById('a3').value),
        startDate:   document.getElementById('a4').value,
        firstSale:   document.getElementById('a5').value,
        cashStart:   parseFloat(document.getElementById('a6').value),
        region:      document.getElementById('a7').value
    };
    saveToStorage();
    showToast('Раздел A сохранён');
}

function saveSectionG() {
    projectData.G = {
        creditPercent:  parseFloat(document.getElementById('g1').value),
        subsidyPercent: parseFloat(document.getElementById('g2').value),
        equityPercent:  parseFloat(document.getElementById('g3').value),
        creditRate:     parseFloat(document.getElementById('g4').value)
    };
    saveToStorage();
    showToast('Раздел G сохранён');
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
            <div class="kpi-sub">тыс. руб. · ставка 16%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">IRR</div>
            <div class="kpi-value neutral">${result.irr}%</div>
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
            <div class="kpi-sub">тыс. руб. · расчётный кредит</div>
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
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('ru-RU')} тыс. руб.`
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
    document.getElementById('themeToggle').textContent = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
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

    function addSheet(name, aoa, colWidths) {
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        if (colWidths) ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, name);
    }

    // ── A: Общие данные ──────────────────────────────────────────
    addSheet('A. Общие данные', [
        ['Параметр', 'Значение'],
        ['Название проекта',        projectData.A?.name        || ''],
        ['Описание',                projectData.A?.description || ''],
        ['Горизонт планирования',   projectData.A?.horizon     || ''],
        ['Регион реализации',       projectData.A?.region      || ''],
        ['Дата начала проекта',     projectData.A?.startDate   || ''],
        ['Первая продажа',          projectData.A?.firstSale   || ''],
        ['Остаток ДС на старте',    projectData.A?.cashStart   || 0]
    ], [{ wch: 28 }, { wch: 30 }]);

    // ── B: Средства производства ─────────────────────────────────
    if (projectData.B?.length) {
        addSheet('B. Средства производства', [
            ['Название', 'Сумма (руб)', 'Дата покупки'],
            ...projectData.B.map(r => [r.name, r.amount, r.date])
        ], [{ wch: 28 }, { wch: 14 }, { wch: 16 }]);
    }

    // ── E: Продукты и услуги ─────────────────────────────────────
    if (projectData.E?.length) {
        addSheet('E. Продукты и услуги', [
            ['Продукт', 'Цена (руб)', 'Кол-во/мес', 'Дата старта', 'Рост % в год'],
            ...projectData.E.map(r => [r.product, r.price, r.quantity, r.startDate, r.growth])
        ], [{ wch: 26 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }]);
    }

    // ── C1: Прямые затраты ───────────────────────────────────────
    if (projectData.C1?.length) {
        addSheet('C1. Прямые затраты', [
            ['Продукт', 'Статья затрат', 'Сумма на ед. (руб)', 'Рост %'],
            ...projectData.C1.map(r => [r.product, r.costItem, r.amountPerUnit, r.growth])
        ], [{ wch: 26 }, { wch: 22 }, { wch: 20 }, { wch: 10 }]);
    }

    // ── C2: Косвенные затраты ────────────────────────────────────
    if (projectData.C2?.length) {
        addSheet('C2. Косвенные затраты', [
            ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
            ...projectData.C2.map(r => [r.name, r.amount, r.startDate, r.periodicity, r.growth])
        ], [{ wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 }]);
    }

    // ── D: АХР ───────────────────────────────────────────────────
    if (projectData.D?.length) {
        addSheet('D. АХР', [
            ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
            ...projectData.D.map(r => [r.name, r.amount, r.startDate, r.periodicity, r.growth])
        ], [{ wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 }]);
    }

    // ── F: Персонал ───────────────────────────────────────────────
    if (projectData.F?.length) {
        addSheet('F. Персонал', [
            ['Должность', 'Оклад (руб)', 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
            ...projectData.F.map(r => [r.position, r.salary, r.count, r.hireDate, r.growth])
        ], [{ wch: 26 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 12 }]);
    }

    // ── G: Финансирование ─────────────────────────────────────────
    addSheet('G. Финансирование', [
        ['Параметр', 'Значение'],
        ['Кредит (%)',            projectData.G?.creditPercent  || ''],
        ['Субсидии (%)',          projectData.G?.subsidyPercent || ''],
        ['Собственный капитал (%)', projectData.G?.equityPercent || ''],
        ['Ставка по кредиту (%)', projectData.G?.creditRate     || ''],
        ['Расчётный займ (тыс. руб.)', result.requiredLoan      || 0]
    ], [{ wch: 30 }, { wch: 16 }]);

    // ── Прогноз: статьи в строках, годы в столбцах ───────────────
    const forecastYearCols = result.years.map(y => ({ wch: 16 }));
    const forecastHeader = ['Статья / Год', ...result.years];
    const forecastRows = RESULT_ROWS.map(meta => {
        const vals = (result[meta.key] || []).map(v => Math.round(v));
        return [meta.label, ...vals];
    });
    addSheet('Прогноз (тыс. руб.)', [forecastHeader, ...forecastRows],
        [{ wch: 30 }, ...forecastYearCols]);

    // ── Показатели ────────────────────────────────────────────────
    addSheet('Показатели', [
        ['Показатель', 'Значение', 'Единица'],
        ['NPV',                       result.npv,          'тыс. руб.'],
        ['IRR',                       result.irr,          '%'],
        ['PI (индекс рентабельности)', result.pi,          ''],
        ['Срок окупаемости',           result.paybackPeriod, ''],
        ['Потребность в финансировании', result.requiredLoan, 'тыс. руб.'],
        ['Ставка дисконтирования',     '16',               '%'],
        ['Страховые взносы',           '30',               '% от ФОТ']
    ], [{ wch: 32 }, { wch: 16 }, { wch: 16 }]);

    const filename = `${projectData.A?.name || 'project'}_results.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('Excel файл экспортирован');
});

// ── Reset ─────────────────────────────────────────────────────────────────────

document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('Удалить все данные проекта?')) {
        localStorage.removeItem('investmentProject');
        location.reload();
    }
});

loadFromStorage();
renderSection('A');
