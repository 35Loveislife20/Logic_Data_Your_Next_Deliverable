let salary = 0;
let expenses = [];
let nextId = 0;

const colors = ['#1F6F54', '#C68A2E', '#A6472B', '#3B5B7C', '#7A5C8E', '#5C7A4A', '#B0555F', '#2F8F8A'];

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

const money = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const save = () => localStorage.setItem('cashFlow', JSON.stringify({ salary, expenses, nextId }));

function render() {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = salary - total;

    displaySalary.textContent = salary === 0 ? '' : money(salary);
    displayExpenses.textContent = expenses.length === 0 ? '' : money(total);
    displayBalance.textContent = salary === 0 ? '' : money(balance);
    displayBalance.classList.toggle('negative', balance < 0);

    const warning = salary > 0 && (balance < 0 || balance < salary * .1);

    alertBanner.textContent = balance < 0
        ? 'Warning: Your expenses have gone over your salary!'
        : 'Warning: Balance is below 10% of your salary!';

    alertBanner.classList.toggle('hidden', !warning);

    expenseListEl.innerHTML = expenses.length
        ? expenses.map(e => `<li class="expense-item"><span class="dot" style="background:${e.color}"></span><span class="expense-item-name">${e.name}</span><span class="expense-item-amount">${money(e.amount)}</span><button class="remove-btn" data-id="${e.id}">×</button></li>`).join('')
        : '<li class="empty-state">No expenses yet — add one to get started.</li>';

    expenseLegendEl.innerHTML = expenses.length
        ? expenses.map(e => `<li><span class="dot" style="background:${e.color}"></span>${e.name}</li>`).join('')
        : '<li class="empty-state">Colours appear here once you add expenses.</li>';

    chart.data.labels = expenses.map(e => e.name);
    chart.data.datasets[0].data = expenses.map(e => e.amount);
    chart.data.datasets[0].backgroundColor = expenses.map(e => e.color);
    chart.update();

    chartCanvas.classList.toggle('hidden', !expenses.length);
    chartEmpty.classList.toggle('hidden', !!expenses.length);
}

const chart = new Chart(chartCanvas.getContext('2d'), {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        }
    }
});

setSalaryBtn.onclick = () => {
    const value = Number(salaryInput.value);

    if (!Number.isFinite(value) || value <= 0) {
        salaryError.classList.remove('hidden');
        return;
    }

    salaryError.classList.add('hidden');

    salary += value;

    salaryInput.value = '';

    save();
    render();
};

addExpenseBtn.onclick = () => {
    const name = expenseNameInput.value.trim();
    const amount = Number(expenseAmountInput.value);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
        expenseError.textContent = "Please fill all fields correctly.";
        expenseError.classList.remove('hidden');
        return;
    }

    const currentTotalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const remainingBalance = salary - currentTotalExpenses;

    if (amount > remainingBalance) {
        expenseError.textContent = `Insufficient balance! You only have ${money(remainingBalance)} left.`;
        expenseError.classList.remove('hidden');
        return;
    }

    expenseError.classList.add('hidden');

    const old = expenses.find(e => e.name.toLowerCase() === name.toLowerCase());

    if (old) {
        old.amount += amount;
    } else {
        expenses.push({
            id: nextId,
            name,
            amount,
            color: colors[nextId++ % colors.length]
        });
    }

    expenseNameInput.value = '';
    expenseAmountInput.value = '';

    save();
    render();
};

expenseListEl.onclick = e => {
    const btn = e.target.closest('.remove-btn');

    if (!btn) return;

    expenses = expenses.filter(
        x => x.id !== Number(btn.dataset.id)
    );

    save();
    render();
};

salaryInput.onkeydown = e => {
    if (e.key === 'Enter') setSalaryBtn.click();
};

[expenseNameInput, expenseAmountInput].forEach(x => {
    x.onkeydown = e => {
        if (e.key === 'Enter') addExpenseBtn.click();
    };
});

localStorage.removeItem('cashFlow');

salary = 0;
expenses = [];
nextId = 0;

render();
