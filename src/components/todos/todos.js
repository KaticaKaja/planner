import './todos.scss';
import { DB, uid } from '../../core/db.js';
import Toastify from 'toastify-js';

export default function load() {
    const openAddTodoBtn = document.querySelector('.add-todo'),
        addTodoBtn = document.querySelector('.add-todo-btn'),
        updateTodoBtn = document.querySelector('.update-todo-btn'),
        addTodoWrapper = document.querySelector('.add-todo-wrapper'),
        addTodoCloseBtn = document.querySelector('.close'),
        btn_item = document.querySelector('.item_btn'),
        input_item = document.querySelector('.input_item');

    openAddTodoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addTodoWrapper.classList.toggle('active');
        wrapper_reset();
    });
    addTodoCloseBtn.addEventListener('click', () => {
        addTodoWrapper.classList.remove('active');
        wrapper_reset();
    });
    addTodoBtn.addEventListener('click', add_todo);
    updateTodoBtn.addEventListener('click', update_todo);
    btn_item.addEventListener('click', add_item);
    input_item.addEventListener("keypress", (e) => {
        if (e.key === "Enter") add_item();
    });

    document.querySelector('#todos').addEventListener('click', (e) => {
        if (e.target !== openAddTodoBtn && !addTodoWrapper.contains(e.target)) {
            addTodoWrapper.classList.remove("active");
            wrapper_reset();
        }
    });

    update_list();

    function wrapper_reset() {
        const wrapper_title = document.querySelector('.todo-title');
        wrapper_title.value = '';
        wrapper_title.classList.remove('error');
        const items_container = document.querySelector('.items_container');
        items_container.innerHTML = '';
        const title = document.querySelector('.add-todo-header .title');
        title.innerHTML = 'New Todo';
        const add_btn = document.querySelector('.add-todo-footer .add-todo-btn');
        add_btn.style.display = 'block';
        const btn = document.querySelector('.add-todo-footer .update-todo-btn');
        btn.style.display = 'none';
    }

    function add_item() {
        const input_item = document.querySelector('.input_item');
        const items_container = document.querySelector('.items_container');

        if (!input_item.value) {
            input_item.classList.add('error');
            return;
        } else input_item.classList.remove('error');

        items_container.innerHTML += `
            <input type="text" class="input_item" data-item-id="${uid()}" data-item-done="${false}" value="${input_item.value}"/>`;
        input_item.value = '';
    }

    function add_todo() {
        const title = document.querySelector('.todo-title');
        const labels = document.querySelectorAll('.input_item');
        if (!title.value && addTodoWrapper.classList.contains('active')) title.classList.add('error');
        else title.classList.remove('error');
        if (!title.value) return;
        const items = Array.from(labels).map(l => {
            if (!l.value) return;
            return {
                id: l.dataset.itemId,
                text: l.value,
                done: l.dataset.itemDone === 'true' ? true : false
            };
        }).filter(item => item !== null && item !== undefined);

        if (items.length === 0) {
            Toastify({
                text: "Please enter at least one todo item",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            return;
        };

        const todo = {
            id: uid(),
            title: title.value,
            items: items,
            timestamp: new Date()
        }

        DB.add('todos', todo, localStorage.getItem('user')).then(() => {
            Toastify({
                text: 'Todo added succesfully',
                duration: 2000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
        });

        document.querySelector('.todo-title').value = '';
        document.querySelector('.items_container').innerHTML = '';
        addTodoWrapper.classList.remove('active');
        update_list();
    }

    async function update_todo(e) {
        const title = document.querySelector('.todo-title');
        const labels = document.querySelectorAll('.input_item');
        if (!title.value && addTodoWrapper.classList.contains('active')) title.classList.add('error');
        else title.classList.remove('error');
        if (!title.value) return;
        const items = Array.from(labels).map(l => {
            if (!l.value) return;
            return {
                id: l.dataset.itemId,
                text: l.value,
                done: l.dataset.itemDone === 'true' ? true : false
            };
        }).filter(item => item !== null && item !== undefined);
        console.log('items', items);
        if (items.length === 0) {
            Toastify({
                text: "Please enter at least one todo item",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            return;
        };

        const alltodos = await DB.getAll('todos', undefined, localStorage.getItem('user'));
        if (!alltodos.find((n) => n.id === e.target.dataset.id)) {
            Toastify({
                text: "You deleted this todo. This todo no longer exists.",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            wrapper_reset();
            addTodoWrapper.classList.remove('active');
            return;
        }

        const todo = {
            id: e.target.dataset.id,
            title: title.value,
            items: items,
            timestamp: new Date()
        }

        DB.update('todos', todo, localStorage.getItem('user')).then(() => {
            Toastify({
                text: 'Todo updated succesfully',
                duration: 2000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
        });

        document.querySelector('.todo-title').value = '';
        document.querySelector('.items_container').innerHTML = '';
        addTodoWrapper.classList.remove('active');
        update_list();
    }

    async function update_list() {
        const list = document.querySelector('#list');
        const todos = await DB.getAll('todos', undefined, localStorage.getItem('user'));
        list.innerHTML = '';
        if (todos.length === 0) {
            list.innerHTML = '<h2>No todos found yet... start typing :)</h2>'
        }
        todos.forEach((t) => {
            let todoItems = t.items.map(item => `
                <div class="todo-item">
                    <input type="checkbox" id="item-${item.id}" data-todo-id="${t.id}" data-item-id="${item.id}" ${item.done ? 'checked' : ''}>
                    <label for="item-${item.id}">${item.text}</label>
                </div>
            `).join('');
            list.innerHTML += `
            <div class="todo" data-id="${t.id}">
                <div class="todo-header">
                    <span class="title">${t.title}</span>
                    <i data-id="${t.id}" class="fas fa-trash delete"></i>
                </div>
                <div class="todo-body">
                    ${todoItems}
                </div>
                <div class="todo-footer">
                    <span class="timestamp">${t.timestamp.toString().split(' ')[0]}, ${t.timestamp.getDate()}. ${t.timestamp.getMonth() + 1}. ${t.timestamp.getFullYear()}.</span>
                </div>
            </div>`;
        });

        const todos_el = document.querySelectorAll('.todo');
        todos_el.forEach((t) => {
            t.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
                if (addTodoWrapper.classList.contains('active')) wrapper_reset(); // addTodoWrapper is shaking, try to fix
                addTodoWrapper.classList.add('active');
                const wrapper_title = document.querySelector('.todo-title');
                const items_container = document.querySelector('.items_container');
                const title = document.querySelector('.add-todo-header .title');
                const add_btn = document.querySelector('.add-todo-footer .add-todo-btn');
                const btn = document.querySelector('.add-todo-footer .update-todo-btn');
                const todo = await DB.get('todos', e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id, localStorage.getItem('user'));
                wrapper_title.value = todo.title;
                todo.items.forEach((item) => {
                    items_container.innerHTML += `
                    <input type="text" class="input_item" data-item-id="${item.id}" data-item-done="${item.done}" value="${item.text}"/>
                `;
                });

                title.innerHTML = 'Edit this todo';
                add_btn.style.display = 'none';
                btn.style.display = 'block';
                btn.dataset.id = todo.id;
            });
        });

        const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
        checkboxes.forEach((cb) => {
            cb.addEventListener('change', async (e) => {
                const todoId = e.target.dataset.todoId;
                const itemId = e.target.dataset.itemId;
                const done = e.target.checked;

                const todo = await DB.get('todos', todoId, localStorage.getItem('user'));

                const updated_todo = {
                    id: todo.id,
                    title: todo.title,
                    items: todo.items.map((item) => {
                        if (item.id === itemId) return { ...item, done: done };
                        else return item
                    }),
                    timestamp: new Date()
                }

                DB.update('todos', updated_todo, localStorage.getItem('user'));
            });
        })

        const deleteTodoBtns = document.querySelectorAll('.delete');
        deleteTodoBtns.forEach((b) => {
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                DB.delete('todos', e.target.dataset.id, localStorage.getItem('user')).then(() => {
                    Toastify({
                        text: 'Todo deleted succesfully',
                        duration: 2000,
                        close: true,
                        gravity: "top", // `top` or `bottom`
                        position: "center", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                          background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();
                });
                update_list();
            });
        });
    }
}
