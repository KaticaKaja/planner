import './todos.scss';
import { DB, uid } from '../../core/db.js';
import Toastify from 'toastify-js';

export default function load() {
    const openWrapperBtn = document.querySelector('.open_wrapper'),
        addTodoBtn = document.querySelector('.add_todo_btn'),
        updateTodoBtn = document.querySelector('.update_todo_btn'),
        todoWrapper = document.querySelector('.todo_wrapper'),
        addTodoCloseBtn = document.querySelector('.close'),
        btnItem = document.querySelector('.item_btn'),
        inputItem = document.querySelector('.input_item'),
        list = document.querySelector('#list'),
        search = document.querySelector('#search'),
        sort = document.querySelector('#sort');

    let conditions = {
        search: {
            value: ''
        },
        sort: {
            value: ''
        }
    }

    update_list();

    openWrapperBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        todoWrapper.classList.toggle('active');
        wrapper_reset();
    });
    addTodoCloseBtn.addEventListener('click', () => {
        todoWrapper.classList.remove('active');
        wrapper_reset();
    });
    addTodoBtn.addEventListener('click', add_todo);
    updateTodoBtn.addEventListener('click', update_todo);
    btnItem.addEventListener('click', add_item);
    inputItem.addEventListener("keypress", (e) => {
        if (e.key === "Enter") add_item();
    });

    document.querySelector('#todos').addEventListener('click', (e) => {
        if (e.target !== openWrapperBtn && !todoWrapper.contains(e.target)) {
            todoWrapper.classList.remove("active");
            wrapper_reset();
        }
    });

    search.addEventListener('keyup', async(e) => {
        e.stopPropagation();
        conditions.search.value = e.target.value;
        update_list();
    });

    sort.addEventListener('change', async (e) => {
        e.stopPropagation();
        conditions.sort.value = e.target.value;
        update_list();
    });

    list.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
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
            return;
        }
        if (!e.target.matches('.delete') && e.target.closest('.todo')) {
            if (todoWrapper.classList.contains('active')) wrapper_reset();
            todoWrapper.classList.add('active');
            const wrapper_title = document.querySelector('.todo_title');
            const items_container = document.querySelector('.items_container');
            const title = document.querySelector('.wrapper_todo_header .title');
            const todo = await DB.get('todos', e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id, localStorage.getItem('user'));
            wrapper_title.value = todo.title;
            todo.items.forEach((item) => {
                items_container.innerHTML += `
                <input type="text" class="input_item" data-item-id="${item.id}" data-item-done="${item.done}" value="${item.text}"/>
            `;
            });

            title.innerHTML = 'Edit this todo';
            addTodoBtn.classList.remove('open');
            addTodoBtn.classList.add('close');
            updateTodoBtn.classList.remove('close');
            updateTodoBtn.classList.add('open');
            updateTodoBtn.dataset.id = todo.id;
            return;
        }

        if (e.target.matches('.delete')) {
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
            return;
        }
        if (!e.target.matches('.delete') && !e.target.closest('.note')) {
            todoWrapper.classList.remove("active");
            wrapper_reset();
        }
    });

    function wrapper_reset() {
        const wrapper_title = document.querySelector('.todo_title');
        wrapper_title.value = '';
        wrapper_title.classList.remove('error');
        const items_container = document.querySelector('.items_container');
        items_container.innerHTML = '';
        const title = document.querySelector('.wrapper_todo_header .title');
        title.innerHTML = 'New Todo';
        addTodoBtn.classList.remove('close');
        addTodoBtn.classList.add('open');
        updateTodoBtn.classList.remove('open');
        updateTodoBtn.classList.add('close');
    }

    function add_item() {
        const items_container = document.querySelector('.items_container');

        if (!inputItem.value) {
            inputItem.classList.add('error');
            return;
        } else inputItem.classList.remove('error');

        items_container.innerHTML += `
            <input type="text" class="input_item" data-item-id="${uid()}" data-item-done="${false}" value="${inputItem.value}"/>`;
            inputItem.value = '';
    }

    function add_todo() {
        const title = document.querySelector('.todo_title');
        const labels = document.querySelectorAll('.input_item');
        if (!title.value && todoWrapper.classList.contains('active')) title.classList.add('error');
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

        document.querySelector('.todo_title').value = '';
        document.querySelector('.items_container').innerHTML = '';
        todoWrapper.classList.remove('active');
        update_list();
    }

    async function update_todo(e) {
        const title = document.querySelector('.todo_title');
        const labels = document.querySelectorAll('.input_item');
        if (!title.value && todoWrapper.classList.contains('active')) title.classList.add('error');
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
            todoWrapper.classList.remove('active');
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

        document.querySelector('.todo_title').value = '';
        document.querySelector('.items_container').innerHTML = '';
        todoWrapper.classList.remove('active');
        update_list();
    }

    async function update_list() {
        let todos = await DB.getAll('todos', undefined, localStorage.getItem('user'));
        list.innerHTML = '';
        if (conditions.search.value) {
            todos = todos.filter((t) => t.title.includes(conditions.search.value) || t.items.some(i => i.text.includes(conditions.search.value)));
            console.log('todos', todos);
        }
        if (conditions.sort.value) {
            if (conditions.sort.value === 'newest') todos = todos.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (conditions.sort.value === 'oldest') todos = todos.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        if (conditions.search.value && todos.length === 0) {
            list.innerHTML = '<h2>No todos found with this search</h2>'
            return;
        }
        if (todos.length === 0) {
            list.innerHTML = '<h2>No todos found yet... start typing :)</h2>'
        }
        todos.forEach((t) => {
            let todoItems = t.items.map(item => `
                <div class="todo_item">
                    <input type="checkbox" id="item-${item.id}" data-todo-id="${t.id}" data-item-id="${item.id}" ${item.done ? 'checked' : ''}>
                    <label for="item-${item.id}">${item.text}</label>
                </div>
            `).join('');
            const hours = t.timestamp.getHours();
            const minutes = t.timestamp.getMinutes();
            list.innerHTML += `
            <div class="todo" data-id="${t.id}">
                <div class="todo_header">
                    <span class="title">${t.title}</span>
                    <i data-id="${t.id}" class="fas fa-trash delete"></i>
                </div>
                <div class="todo_body">
                    ${todoItems}
                </div>
                <div class="todo_footer">
                    <span class="timestamp">${t.timestamp.toString().split(' ')[0]}, ${t.timestamp.getDate()}. ${t.timestamp.getMonth() + 1}. ${t.timestamp.getFullYear()}. at ${hours < 10 ? '0' +  hours: hours}:${minutes < 10 ? '0' +  minutes: minutes}</span>
                </div>
            </div>`;
        });
    }
}
