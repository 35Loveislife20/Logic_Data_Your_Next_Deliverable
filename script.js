let salary = 0;
let expenses = [];

const salaryInput = document.getElementById("salaryInput");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");

const displaySalary = document.getElementById("displaySalary");
const displayExpenses = document.getElementById("displayExpenses");
const displayBalance = document.getElementById("displayBalance");

const expenseList = document.getElementById("expenseList");
const alertBanner = document.getElementById("alertBanner");

let chart;

// Salary
document.getElementById("setSalaryBtn").onclick = () => {
    salary = Number(salaryInput.value);

    if (salary <= 0) {
        document.getElementById("salaryError").classList.remove("hidden");
        return;
    }

    document.getElementById("salaryError").classList.add("hidden");
    update();
    salaryInput.value = "";
};

// Add Expense
document.getElementById("addExpenseBtn").onclick = () => {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);

    if (!name || amount <= 0) {
        document.getElementById("expenseError").classList.remove("hidden");
        return;
    }

    document.getElementById("expenseError").classList.add("hidden");

    expenses.push({
        name: name,
        amount: amount
    });

    expenseName.value = "";
    expenseAmount.value = "";

    update();
};

// Update everything
function update() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = salary - total;

    displaySalary.textContent = `₹${salary}`;
    displayExpenses.textContent = `₹${total}`;
    displayBalance.textContent = `₹${balance}`;

    expenseList.innerHTML = "";

    expenses.forEach((expense, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${expense.name} - ₹${expense.amount}
            <button onclick="deleteExpense(${index})">Delete</button>
        `;

        expenseList.appendChild(li);
    });

    // Warning
    if (salary > 0 && balance <= salary * 0.1) {
        alertBanner.classList.remove("hidden");
    } else {
        alertBanner.classList.add("hidden");
    }

    updateChart();
}

// Delete expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    update();
}

// Chart
function updateChart() {
    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("expenseChart"), {
        type: "pie",
        data: {
            labels: expenses.map(e => e.name),
            datasets: [{
                data: expenses.map(e => e.amount)
            }]
        }
    });
}