/* Cash-Flow Tracker — app logic */

// ---- State ----
let salary = 0;
let expenses = []; // { id, name, amount, color }
let nextId = 0;

const CHART_COLORS = [
    '#1F6F54', '#C68A2E', '#A6472B', '#3B5B7C',
    '#7A5C8E', '#5C7A4A', '#B0555F', '#2F8F8A'
];

// ---- DOM references ----
const salaryInput = document.getElementById('salaryInput');
const setSalaryBtn = document.getElementById('setSalaryBtn');
const salaryError = document.getElementById('salaryError');

const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expenseError = document.getElementById('expenseError');

const displaySalary = document.getElementById('displaySalary');
const displayExpenses = document.getElementById('displayExpenses');
const displayBalance = document.getElementById('displayBalance');
const alertBanner = document.getElementById('alertBanner');

const expenseListEl = document.getElementById('expenseList');
const expenseLegendEl = document.getElementById('expenseLegend');
const chartCanvas = document.getElementById('expenseChart');
const chartEmpty = document.getElementById('chartEmpty');

// ---- Helpers ----
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Chart setup ----
const expenseChart = new Chart(chartCanvas.getContext('2d'), {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: '#FFFFFF',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (item) => ` ${item.label}: ${formatCurrency(item.raw)}`
                }
            }
        }
    }
});

// ---- Render ----
function renderAll() {
    renderSummary();
    renderExpenseList();
    renderLegend();
    renderChart();
}

function renderSummary() {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = salary - totalExpenses;

    displaySalary.textContent = formatCurrency(salary);
    displayExpenses.textContent = formatCurrency(totalExpenses);
    displayBalance.textContent = formatCurrency(balance);
    displayBalance.classList.toggle('negative', balance < 0);

    const overBudget = salary > 0 && balance < 0;
    const lowBalance = salary > 0 && balance >= 0 && balance < salary * 0.1;

    alertBanner.textContent = overBudget
        ? 'Warning: Your expenses have gone over your salary!'
        : 'Warning: Balance is below 10% of your salary!';
    alertBanner.classList.toggle('hidden', !(overBudget || lowBalance));
}

function renderExpenseList() {
    if (expenses.length === 0) {
        expenseListEl.innerHTML = '<li class="empty-state">No expenses yet — add one to get started.</li>';
        return;
    }
    expenseListEl.innerHTML = expenses.map((e) => `
    <li class="expense-item">
      <span class="dot" style="background:${e.color}"></span>
      <span class="expense-item-name">${escapeHtml(e.name)}</span>
      <span class="expense-item-amount">${formatCurrency(e.amount)}</span>
      <button class="remove-btn" data-id="${e.id}" aria-label="Remove ${escapeHtml(e.name)}">×</button>
    </li>
  `).join('');
}

function renderLegend() {
    if (expenses.length === 0) {
        expenseLegendEl.innerHTML = '<li class="empty-state">Colours appear here once you add expenses.</li>';
        return;
    }
    expenseLegendEl.innerHTML = expenses.map((e) => `
    <li><span class="dot" style="background:${e.color}"></span>${escapeHtml(e.name)}</li>
  `).join('');
}

function renderChart() {
    expenseChart.data.labels = expenses.map((e) => e.name);
    expenseChart.data.datasets[0].data = expenses.map((e) => e.amount);
    expenseChart.data.datasets[0].backgroundColor = expenses.map((e) => e.color);
    expenseChart.update();

    const hasData = expenses.length > 0;
    chartCanvas.classList.toggle('hidden', !hasData);
    chartEmpty.classList.toggle('hidden', hasData);
}

// ---- Events ----
setSalaryBtn.addEventListener('click', () => {
    const value = parseFloat(salaryInput.value);
    if (isNaN(value) || value <= 0) {
        salaryError.classList.remove('hidden');
        return;
    }
    salaryError.classList.add('hidden');
    salary = value;
    salaryInput.value = '';
    renderAll();
});

addExpenseBtn.addEventListener('click', () => {
    const name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);

    if (!name || isNaN(amount) || amount <= 0) {
        expenseError.classList.remove('hidden');
        return;
    }
    expenseError.classList.add('hidden');

    const existing = expenses.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.amount += amount;
    } else {
        expenses.push({ id: nextId, name, amount, color: CHART_COLORS[nextId % CHART_COLORS.length] });
        nextId++;
    }

    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    renderAll();
});

expenseListEl.addEventListener('click', (event) => {
    const btn = event.target.closest('.remove-btn');
    if (!btn) return;
    expenses = expenses.filter((e) => e.id !== Number(btn.dataset.id));
    renderAll();
});

[salaryInput].forEach((el) => el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setSalaryBtn.click();
}));
[expenseNameInput, expenseAmountInput].forEach((el) => el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addExpenseBtn.click();
}));

// ---- Init ----
renderAll();