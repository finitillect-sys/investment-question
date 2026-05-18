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

// Загрузка сохранённых данных из localStorage
function loadFromStorage() {
    const saved = localStorage.getItem('investmentProject');
    if (saved) {
        projectData = JSON.parse(saved);
    }
}

// Сохранение в localStorage
function saveToStorage() {
    localStorage.setItem('investmentProject', JSON.stringify(projectData));
}

// Отображение текущего раздела
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
    } else if (section === 'B') {
        renderTableSection('B', 'Средства производства', ['Название', 'Сумма (руб)', 'Дата покупки'], 
            `Формат: Название; Сумма; месяц.год<br>Пример: Станок; 300000; июнь.2026`);
    } else if (section === 'E') {
        renderTableSection('E', 'Продукты и услуги', ['Продукт', 'Цена (руб)', 'Кол-во/мес', 'Дата старта продаж', 'Рост % в год'],
            `Формат: Продукт; Цена; Кол-во; месяц.год; Рост%<br>Пример: Электросамокат; 25000; 100; август.2026; 24`);
    } else if (section === 'C1') {
        renderTableSection('C1', 'Прямые затраты на единицу продукции', ['Продукт', 'Статья затрат', 'Сумма на ед. (руб)', 'Рост %'],
            `Формат: Продукт; Статья; Сумма; Рост%<br>Пример: Юниор; Материалы; 8500; 10`);
    } else if (section === 'C2') {
        renderTableSection('C2', 'Косвенные производственные затраты', ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
            `Формат: Название; Сумма; месяц.год; периодичность; Рост%<br>Пример: Аренда; 50000; июль.2026; ежемесячно; 10`);
    } else if (section === 'D') {
        renderTableSection('D', 'Административно-хозяйственные затраты', ['Название', 'Сумма (руб)', 'Дата начала', 'Периодичность', 'Рост %'],
            `Формат: Название; Сумма; месяц.год; периодичность; Рост%<br>Пример: Реклама; 30000; июль.2026; ежемесячно; 5`);
    } else if (section === 'F') {
        renderTableSection('F', 'Персонал', ['Должность', 'Оклад (руб)', 'Кол-во', 'Дата найма', 'Рост ФОТ %'],
            `Формат: Должность; Оклад; Кол-во; месяц.год; Рост%<br>Пример: Токарь; 80000; 2; июнь.2026; 7`);
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

function renderTableSection(section, title, columns, instruction) {
    const data = projectData[section] || [];
    const content = document.getElementById('content');
    
    let tableHtml = '<table><thead><tr>';
    columns.forEach(col => tableHtml += `<th>${col}</th>`);
    tableHtml += '<th>Действия</th></tr></thead><tbody>';
    
    data.forEach((row, idx) => {
        tableHtml += '<tr>';
        Object.values(row).forEach(val => tableHtml += `<td>${val}</td>`);
        tableHtml += `<td><button onclick="deleteRow('${section}', ${idx})">❌</button></td>`;
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    
    content.innerHTML = `
        <h2>Раздел ${section}. ${title}</h2>
        <div class="form-group">
            <label>${instruction}</label>
            <textarea id="newRowInput" placeholder="Введите строку в формате..."></textarea>
            <button onclick="addRow('${section}')" class="btn-primary" style="margin-top:10px">➕ Добавить строку</button>
        </div>
        <h3>Текущие данные:</h3>
        ${tableHtml}
    `;
}

function addRow(section) {
    const input = document.getElementById('newRowInput');
    const line = input.value.trim();
    if (!line) return;
    
    const parts = line.split(';').map(p => p.trim());
    let newItem = {};
    
    if (section === 'B') {
        if (parts.length < 3) { alert('Ошибка: нужно 3 поля (Название; Сумма; Дата)'); return; }
        newItem = { name: parts[0], amount: parseFloat(parts[1]), date: parts[2] };
    } else if (section === 'E') {
        if (parts.length < 5) { alert('Ошибка: нужно 5 полей'); return; }
        newItem = { product: parts[0], price: parseFloat(parts[1]), quantity: parseFloat(parts[2]), startDate: parts[3], growth: parseFloat(parts[4]) };
    } else if (section === 'C1') {
        if (parts.length < 4) { alert('Ошибка: нужно 4 поля'); return; }
        newItem = { product: parts[0], costItem: parts[1], amountPerUnit: parseFloat(parts[2]), growth: parseFloat(parts[3]) };
    } else if (section === 'C2' || section === 'D') {
        if (parts.length < 5) { alert('Ошибка: нужно 5 полей'); return; }
        newItem = { name: parts[0], amount: parseFloat(parts[1]), startDate: parts[2], periodicity: parts[3], growth: parseFloat(parts[4]) };
    } else if (section === 'F') {
        if (parts.length < 5) { alert('Ошибка: нужно 5 полей'); return; }
        newItem = { position: parts[0], salary: parseFloat(parts[1]), count: parseFloat(parts[2]), hireDate: parts[3], growth: parseFloat(parts[4]) };
    }
    
    projectData[section].push(newItem);
    saveToStorage();
    renderSection(section);
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

// Расчёт проекта
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

// Навигация
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSection = btn.dataset.section;
        renderSection(currentSection);
    });
});

// Тёмная тема
document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// Экспорт CSV
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

// Сброс
document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('Удалить все данные?')) {
        localStorage.removeItem('investmentProject');
        location.reload();
    }
});

// Инициализация
loadFromStorage();
renderSection('A');