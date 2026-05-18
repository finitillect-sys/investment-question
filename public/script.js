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
            { key: 'name', type: 'text', placeholder: 'Станок ЧПУ' },
            { key: 'amount', type: 'number', placeholder: '300000' },
            { key: 'date', type: 'month' }
        ],
        emptyRow: () => ({ name: '', amount: '', date: '' })
    },
    E: {
        title: 'Продукты и услуги',
        columns: ['Продукт', 'Цена (руб)', 'Кол-во/мес', 'Дата старта продаж', 'Рост % в год'],
        fields: [
            { key: 'product', type: 'text', placeholder: 'Электросамокат' },
            { key: 'price', type: 'number', placeholder: '25000' },
            { key: 'quantity', type: 'number', placeholder: '100' },
            { key: 'startDate', type: 'month' },
            { key: 'growth', type: 'number', placeholder: '24' }
        ],
        emptyRow: () => ({ product: '', price: '', quantity: '', startDate: '', growth: '' })
    },
    C1: {
        title: 'Прямые затраты на единицу продукции',
        columns: ['Продукт', 'Статья затрат', 'Сумма на ед. (руб)', 'Рост %'],
        fields: [
            { key: 'product', type: 'text', placeholder: 'Электросамокат' },
            { key: 'costItem', type: 'text', placeholder: 'Материалы' },
            { key: 'amountPerUnit', type: 'number', placeholder: '8500' },
            { key: 'growth', type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ product: '', costItem: '', amountPerUnit: '', growth: '' })
    },
    C2: {
        title: 'Косвенные производственные затраты',
        columns: ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name', type: 'text', placeholder: 'Аренда' },
            { key: 'amount', type: 'number', placeholder: '50000' },
            { key: 'startDate', type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год'] },
            { key: 'growth', type: 'number', placeholder: '10' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    D: {
        title: 'Административно-хозяйственные затраты',
        columns: ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
        fields: [
            { key: 'name', type: 'text', placeholder: 'Реклама' },
            { key: 'amount', type: 'number', placeholder: '30000' },
            { key: 'startDate', type: 'month' },
            { key: 'periodicity', type: 'select', options: ['ежемесячно', 'ежеквартально', 'раз в год'] },
            { key: 'growth', type: 'number', placeholder: '5' }
        ],
        emptyRow: () => ({ name: '', amount: '', startDate: '', periodicity: 'ежемесячно', growth: '' })
    },
    F: {
        title: 'Персонал',
        columns: ['Должность', 'Оклад (руб)', 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
        fields: [
            { key: 'position', type: 'text', placeholder: 'Токарь' },
            { key: 'salary', type: 'number', placeholder: '80000' },
            { key: 'count', type: 'number', placeholder: '2' },
            { key: 'hireDate', type: 'month' },
            { key: 'growth', type: 'number', placeholder: '7' }
        ],
        emptyRow: () => ({ position: '', salary: '', count: '', hireDate: '', growth: '' })
    }
};

function loadFromStorage() {
    const saved = localStorage.getItem('investmentProject');
    if (saved) {
        projectData = JSON.parse(saved);
    }
}

function saveToStorage() {
    localStorage.setItem('investmentProject', JSON.stringify(projectData));
}

function renderSection(section) {
    const content = document.getElementById('content');

    if (section === 'A') {
        content.innerHTML = `
            <h2>Раздел A. Общие данные о проекте</h2>
            <div class="form-group"><label>Название проекта</label><input id="a1" value="${projectData.A.name || ''}"></div>
            <div class="form-group"><label>Описание (до 100 символов)</label><input id="a2" value="${projectData.A.description || ''}"></div>
            <div class="form-group"><label>Горизонт планирования (лет)</label><input id="a3" type="number" value="${projectData.A.horizon || 6}"></div>
            <div class="form-group"><label>Дата начала проекта (месяц.год)</label><input id="a4" value="${projectData.A.startDate || 'май 2026'}"></div>
            <div class="form-group"><label>Первая продажа (месяц.год)</label><input id="a5" value="${projectData.A.firstSale || 'август 2026'}"></div>
            <div class="form-group"><label>Остаток ДС на старте (руб)</label><input id="a6" type="number" value="${projectData.A.cashStart || 0}"></div>
            <div class="form-group"><label>Регион реализации</label><input id="a7" value="${projectData.A.region || 'Россия'}"></div>
            <button onclick="saveSectionA()" class="btn-primary">Сохранить раздел A</button>
        `;
    } else if (SECTION_CONFIG[section]) {
        renderTableSection(section);
    } else if (section === 'G') {
        content.innerHTML = `
            <h2>Раздел G. Финансирование</h2>
            <div class="form-group"><label>Кредит (%)</label><input id="g1" type="number" value="${projectData.G.creditPercent || 50}"></div>
            <div class="form-group"><label>Субсидии (%)</label><input id="g2" type="number" value="${projectData.G.subsidyPercent || 0}"></div>
            <div class="form-group"><label>Собственный капитал (%)</label><input id="g3" type="number" value="${projectData.G.equityPercent || 50}"></div>
            <div class="form-group"><label>Ставка по кредиту (%)</label><input id="g4" type="number" value="${projectData.G.creditRate || 9}"></div>
            <button onclick="saveSectionG()" class="btn-primary">Сохранить раздел G</button>
        `;
    }
}

function renderTableSection(section) {
    const config = SECTION_CONFIG[section];
    const data = projectData[section] || [];
    const content = document.getElementById('content');

    let headHtml = config.columns.map(c => `<th>${c}</th>`).join('');

    let rowsHtml = data.map((row, idx) => renderRowHtml(section, row, idx, config)).join('');

    content.innerHTML = `
        <h2>Раздел ${section}. ${config.title}</h2>
        <div class="table-wrapper">
            <table class="editable-table">
                <thead><tr>${headHtml}<th>Удалить</th></tr></thead>
                <tbody id="tbody-${section}">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
        <button class="btn-primary add-row-btn" onclick="addEmptyRow('${section}')">➕ Добавить строку</button>
    `;
}

function renderRowHtml(section, row, idx, config) {
    const cells = config.fields.map(field => {
        const val = row[field.key] !== undefined ? row[field.key] : '';
        const safeVal = String(val).replace(/"/g, '&quot;');

        if (field.type === 'select') {
            const opts = field.options.map(o =>
                `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`
            ).join('');
            return `<td><select onchange="updateField('${section}', ${idx}, '${field.key}', this.value)">${opts}</select></td>`;
        }

        if (field.type === 'month') {
            const inputVal = russianToMonthInput(safeVal);
            return `<td><input type="month" value="${inputVal}"
                onchange="updateField('${section}', ${idx}, '${field.key}', this.value)"></td>`;
        }

        return `<td><input type="${field.type}" value="${safeVal}" placeholder="${field.placeholder || ''}"
            oninput="updateField('${section}', ${idx}, '${field.key}', this.value)"></td>`;
    }).join('');

    return `<tr id="row-${section}-${idx}">${cells}<td><button class="btn-delete" onclick="deleteRow('${section}', ${idx})">✕</button></td></tr>`;
}

function updateField(section, idx, key, value) {
    if (!projectData[section][idx]) return;
    const config = SECTION_CONFIG[section];
    const field = config.fields.find(f => f.key === key);
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
    const idx = projectData[section].length - 1;
    const row = projectData[section][idx];
    const tr = document.createElement('tr');
    tr.id = `row-${section}-${idx}`;
    tr.innerHTML = renderRowHtml(section, row, idx, config).replace(/^<tr[^>]*>/, '').replace(/<\/tr>$/, '');
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
        name: document.getElementById('a1').value,
        description: document.getElementById('a2').value,
        horizon: parseInt(document.getElementById('a3').value),
        startDate: document.getElementById('a4').value,
        firstSale: document.getElementById('a5').value,
        cashStart: parseFloat(document.getElementById('a6').value),
        region: document.getElementById('a7').value
    };
    saveToStorage();
    alert('Раздел A сохранён');
}

function saveSectionG() {
    projectData.G = {
        creditPercent: parseFloat(document.getElementById('g1').value),
        subsidyPercent: parseFloat(document.getElementById('g2').value),
        equityPercent: parseFloat(document.getElementById('g3').value),
        creditRate: parseFloat(document.getElementById('g4').value)
    };
    saveToStorage();
    alert('Раздел G сохранён');
}

document.getElementById('calculateBtn')?.addEventListener('click', async () => {
    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    const result = await response.json();

    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');

    resultsContent.innerHTML = `
        <h3>Итоги по годам (тыс. руб.)</h3>
        <table><thead><tr>
            <th>Год</th><th>Выручка</th><th>Кол-во</th><th>Прямые затраты</th><th>Косвенные</th><th>АХР</th><th>ФОТ</th><th>Чистая прибыль</th><th>ДС накопл.</th>
        </tr></thead><tbody>
        ${result.years.map((year, i) => `
            <tr>
                <td>${year}</td>
                <td>${Math.round(result.revenue[i])}</td>
                <td>${Math.round(result.quantity[i])}</td>
                <td>${Math.round(result.directCosts[i])}</td>
                <td>${Math.round(result.indirectCosts[i])}</td>
                <td>${Math.round(result.adminCosts[i])}</td>
                <td>${Math.round(result.payroll[i])}</td>
                <td>${Math.round(result.netProfit[i])}</td>
                <td>${Math.round(result.cashCumulative[i])}</td>
            </tr>
        `).join('')}
        </tbody></table>

        <h3>Инвестиционные показатели (ставка 16%)</h3>
        <p>NPV: ${result.npv} тыс. руб.</p>
        <p>IRR: ${result.irr}%</p>
        <p>PI: ${result.pi}</p>
        <p>Срок окупаемости: ${result.paybackPeriod}</p>
    `;

    resultsDiv.style.display = 'block';
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSection = btn.dataset.section;
        renderSection(currentSection);
    });
});

document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
    const resultsContent = document.getElementById('resultsContent');
    const table = resultsContent?.querySelector('table');
    if (!table) {
        alert('Сначала выполните расчёт проекта');
        return;
    }

    let csv = '';
    table.querySelectorAll('tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('th, td')).map(cell => `"${cell.textContent.trim()}"`);
        csv += cells.join(';') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.A?.name || 'project'}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
});

document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('Удалить все данные?')) {
        localStorage.removeItem('investmentProject');
        location.reload();
    }
});

loadFromStorage();
renderSection('A');
