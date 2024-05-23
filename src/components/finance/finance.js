import './finance.scss';
import { navigate } from '../../core/router';
import { DB, uid } from '../../core/db.js';
import Toastify from 'toastify-js';
import Chart from 'chart.js/auto';

export default function load() {
    const EXPENSE_CATEGORIES = ['entertainment', 'household', 'food', 'apparel', 'gift', 'social life', 'health', 'transport', 'subscriptions', 'bank(credit, provisions...)', 'other'];
    const INCOME_CATEGORIES = ['salary', 'side hustle', 'other'];
    const MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July',
                    'August', 'September', 'October', 'November', 'December'];

    if (localStorage.getItem('isLoggedIn') === null) {
        navigate('/login');
        Toastify({
            text: 'You need to sign in first!',
            duration: 3000,
            close: true,
            gravity: 'top', // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            }
        }).showToast();
        return;
    }

    check_balance();

    document.querySelector('.budget_balance_btn').addEventListener('click', starting_point);

    async function check_balance() {
        const financeAll = await DB.getAll('finance', undefined, localStorage.getItem('user'));
        const today = new Date();
        const balance_budget = financeAll.find((f) => f.month === MONTHS[today.getMonth()] && f.year === today.getFullYear());
        document.querySelector('.month').innerHTML =  MONTHS[today.getMonth()];
        if (!balance_budget) {
            document.getElementById('starting_point').classList.remove('noshow');
            document.getElementById('starting_point').classList.add('show');
            document.getElementById('your_finance').classList.add('noshow');
            document.getElementById('your_finance').classList.remove('show');
        } else {
            document.getElementById('your_finance').classList.remove('noshow');
            document.getElementById('your_finance').classList.add('show');
            document.getElementById('starting_point').classList.add('noshow');
            document.getElementById('starting_point').classList.remove('show');
            EXPENSE_CATEGORIES.forEach((c) => {
                document.querySelector('#form_expense .dropdown').innerHTML += `
                    <option value="${c}">${c}</option>
                `
            });
            INCOME_CATEGORIES.forEach((c) => {
                document.querySelector('#form_income .dropdown').innerHTML += `
                    <option value="${c}">${c}</option>
                `
            });

            document.querySelector('.budget').innerHTML = balance_budget.budget + '$';
            document.querySelector('.balance').innerHTML = balance_budget.balance + '$';
            updateHistory();
        }
    }

    function starting_point() {
        const balance = document.querySelector('#balance').value;
        const budget = document.querySelector('#budget').value;

        if (!balance || !budget) {
            Toastify({
                text: 'Please enter your desired monthly budget and your current balance.',
                duration: 3000,
                close: true,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: 'linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))',
                }
            }).showToast();
        } else {
            const today = new Date();
            DB.add('finance', {
                id: uid(),
                budget: Number(budget),
                balance: Number(balance),
                month: MONTHS[today.getMonth()],
                year: today.getFullYear()
            }, localStorage.getItem('user')).then(() => {
                check_balance();
            });
        }
    }

    async function updateHistory() {
        const financeAll = await DB.getAll('finance', undefined, localStorage.getItem('user'));
        const today = new Date();
        const list = document.querySelector('#list');
        const budget = document.querySelector('.budget');
        const balance = document.querySelector('.balance');
        const expense = document.querySelector('.expense');
        let expense_amount = 0;
        let income_amount = 0;
        const expenses_incomes = await DB.getAll('expense_income', undefined, localStorage.getItem('user'));
        const expenses = expenses_incomes.filter((ei) => ei.type === 'expense');
        const balance_budget = financeAll.find((f) => f.month === MONTHS[today.getMonth()] && f.year === today.getFullYear());
        expenses_incomes.sort((a, b) => b.timestamp - a.timestamp);
        list.innerHTML = '';
        if (expenses.length === 0) document.getElementById('toggle_history').style.display = 'none';
        else  document.getElementById('toggle_history').style.display = 'block';
        if (expenses_incomes.length === 0) list.previousElementSibling.innerHTML = 'No History';
        else list.previousElementSibling.innerHTML = 'History';
        expenses_incomes.forEach((ei) => {
            if (ei.type === 'expense') {
                list.innerHTML += `<li class="minus">
                                        <span>${ei.desc}</span><span>-$${ei.amount}</span>
                                        <button data-id=${ei.id} class="delete-btn">x</button>
                                    </li>`;
                expense_amount += Number(ei.amount);
            }else {
                list.innerHTML += `<li class="plus">
                                        <span>${ei.desc}</span><span>+$${ei.amount}</span>
                                        <button data-id=${ei.id} class="delete-btn">x</button>
                                    </li>`;
                income_amount +=  Number(ei.amount);
            }
            document.querySelectorAll('#list button').forEach((b) => {
                b.addEventListener('click', (e) => {
                    DB.delete('expense_income', e.target.dataset.id, localStorage.getItem('user'));
                    updateHistory();
                });
            })
        });
        expense.innerHTML = '-$'+ expense_amount;
        budget.innerHTML = '$' + (balance_budget.budget - expense_amount);
        balance.innerHTML = '$' + (balance_budget.balance + income_amount - expense_amount);
        if (balance_budget.budget - expense_amount < 0) {
            budget.classList.add('minus');
            budget.classList.remove('plus');
            setTimeout(() => {
                Toastify({
                    text: 'You are over your monthly budget!',
                    duration: 2000,
                    close: true,
                    gravity: 'top', // `top` or `bottom`
                    position: 'center', // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: 'linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))',
                    }
                }).showToast();
            }, 1000);
        } else {
            budget.classList.remove('minus');
            budget.classList.add('plus');
        }
        if (balance_budget.balance + income_amount - expense_amount < 0) {
            balance.classList.add('minus');
            balance.classList.remove('plus');
        } else {
            balance.classList.remove('minus');
            balance.classList.add('plus');
        }
    }

    document.querySelectorAll('.submit').forEach((s) => s.addEventListener('click', validate_form));

    function validate_form(e) {
        e.preventDefault();
        const form_id = e.target.form.id;
        const desc = document.querySelector(`#${form_id} .desc`);
        const category = document.querySelector(`#${form_id} .dropdown`);
        const selectedOption = category.options[category.selectedIndex].value;
        const amount = document.querySelector(`#${form_id} .amount`);

        if (!desc.value) desc.classList.add('error');
        else desc.classList.remove('error');
        if (!category.selectedIndex) category.classList.add('error');
        else category.classList.remove('error');
        if (!amount.value) amount.classList.add('error');
        else amount.classList.remove('error');

        if (!desc.value || category.selectedIndex === 0 || !amount.value) return;

        const today = new Date();
        const ei = {
            id: uid(),
            desc: desc.value,
            type: form_id.split('_')[1],
            category: selectedOption,
            amount: Number(amount.value),
            month: MONTHS[today.getMonth()],
            year: today.getFullYear(),
            timestamp: today
        };

        DB.add('expense_income', ei, localStorage.getItem('user'));
        desc.value = '';
        category.selectedIndex = 0;
        amount.value = '';

        Toastify({
            text: `${form_id.split('_')[1].replace(/^\w/, (c) => c.toUpperCase())} added succesfully`,
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();

        updateHistory();
    }

    document.getElementById('toggle_history').addEventListener('click', async (e) => {
        let mychart = null;
        const expenses_incomes = await DB.getAll('expense_income', undefined, localStorage.getItem('user'));
        const expenses = expenses_incomes.filter((ei) => ei.type === 'expense');
        if (!document.getElementById('graph').classList.contains('open')) {
            document.getElementById('list').classList.add('close');
            document.getElementById('graph').classList.add('open');
            document.getElementById('toggle_history').className = 'fas fa-list';
            mychart = new Chart(
                document.querySelector('.graph'),
                {
                  type: 'pie',
                  data: {
                    labels: expenses.map(ei => ei.category),
                    datasets: [
                      {
                        label: 'Expenses by category',
                        data: expenses.map(ei => ei.amount),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(60, 179, 113, 0.8)',
                            'rgba(255, 69, 0, 0.8)',
                            'rgba(255, 165, 0, 0.8)',
                            'rgba(128, 0, 128, 0.8)',
                            'rgba(0, 128, 0, 0.8)',
                            'rgba(128, 128, 0, 0.8)',
                            'rgba(255, 192, 203, 0.8)',
                            'rgba(255, 0, 255, 0.8)'

                          ],
                          hoverOffset: 4
                      }
                    ]
                  }
                }
            );
            document.getElementById('income_expense').classList.add('close');
            document.getElementById('graph').canvas = mychart.canvas;
        } else {
            document.getElementById('list').classList.remove('close');
            document.getElementById('graph').classList.remove('open');
            document.getElementById('income_expense').classList.remove('close');
            document.querySelector('#graph').innerHTML = '<canvas class="graph"></canvas>';
            mychart = null;
            document.getElementById('toggle_history').className = 'fas fa-chart-pie';
        }
    });
}
