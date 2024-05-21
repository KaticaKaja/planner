import './notes.scss';
import { DB, uid } from '../../core/db.js';
import Toastify from 'toastify-js';

export default function load() {
    const openAddNoteBtn = document.querySelector('.add-note'),
        addNoteBtn = document.querySelector('.add-note-btn'),
        addNoteWrapper = document.querySelector('.add-note-wrapper'),
        addNoteCloseBtn = document.querySelector('.close'),
        list = document.querySelector('#list'),
        search = document.getElementById('search'),
        sort = document.getElementById('sort');

    update_list();

    openAddNoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addNoteWrapper.classList.toggle('active');
        wrapper_reset();
    });

    addNoteBtn.addEventListener('click', add_note);

    addNoteCloseBtn.addEventListener('click', () => {
        addNoteWrapper.classList.remove('active');
        wrapper_reset();
    });

    document.querySelector('#notes').addEventListener('click', (e) => {
        if (e.target !== openAddNoteBtn && !addNoteWrapper.contains(e.target)) {
            addNoteWrapper.classList.remove("active");
            wrapper_reset();
        }
    });

    search.addEventListener('keyup', async(e) => {
        const notesDB = await DB.getAll('notes', undefined, localStorage.getItem('user'));
        const filtered = notesDB.filter((n) => (e.target.value !== '') && n.title.includes(e.target.value) || n.text.includes(e.target.value));

        list.innerHTML = '';
        filtered.forEach((n) => {
        const hours = n.timestamp.getHours();
        const minutes = n.timestamp.getMinutes();
        list.innerHTML +=
        `<div class="note" data-id="${n.id}">
            <div class="note-header">
                <span class="title">${n.title}</span>
                <i data-id="${n.id}" class="fas fa-trash delete"></i>
            </div>
            <div class="note-body">${n.text}</div>
            <div class="note-footer"><span class="timestamp">${n.timestamp.toString().split(' ')[0]}, ${n.timestamp.getDate()}. ${n.timestamp.getMonth() + 1}. ${n.timestamp.getFullYear()}. at ${hours < 10 ? '0' +  hours: hours}:${minutes < 10 ? '0' +  minutes: minutes}</span></div>
        </div>`});
    });

    sort.addEventListener('change', (e) => {
        e.stopPropagation();
        console.log('promenija se', e.target.value);
    });

    function wrapper_reset() {
        const wrapper_title = document.querySelector('.note-title');
        wrapper_title.value = '';
        wrapper_title.classList.remove('error');
        const wrapper_text = document.querySelector('.note-text');
        wrapper_text.value = '';
        wrapper_text.classList.remove('error');
        const title = document.querySelector('.add-note-header .title');
        title.innerHTML = 'New Note';
        const add_btn = document.querySelector('.add-note-footer .add-note-btn');
        add_btn.style.display = 'block';
        const btn = document.querySelector('.add-note-footer .update-note-btn');
        btn.style.display = 'none';
    }

    function add_note() {
        const title = document.querySelector('.note-title');
        const text = document.querySelector('.note-text');
        if (!title.value && addNoteWrapper.classList.contains('active')) title.classList.add('error');
        else title.classList.remove('error');
        if (!text.value && addNoteWrapper.classList.contains('active')) text.classList.add('error');
        else text.classList.remove('error');

        if (!title.value || !text.value) return;

        const note = {
            id: uid(),
            title: title.value,
            text: text.value,
            timestamp: new Date()
        }

        DB.add('notes', note, localStorage.getItem('user')).then(() => {
            Toastify({
                text: 'Note added succesfully',
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

        document.querySelector('.note-title').value = '';
        document.querySelector('.note-text').value = '';
        addNoteWrapper.classList.remove('active');
        update_list();
    }

    list.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!e.target.matches('.delete') && e.target.closest('.note')) {
            addNoteWrapper.classList.add('active');
            const wrapper_title = document.querySelector('.note-title');
            const wrapper_text = document.querySelector('.note-text');
            const title = document.querySelector('.add-note-header .title');
            const add_btn = document.querySelector('.add-note-footer .add-note-btn');
            const btn = document.querySelector('.add-note-footer .update-note-btn');
            const note = await DB.get('notes', e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id, localStorage.getItem('user'));
            wrapper_title.value = note.title;
            wrapper_text.value = note.text;
            title.innerHTML = 'Edit this note';
            add_btn.style.display = 'none';
            btn.style.display = 'block';
            btn.dataset.id = note.id;
            return;
        }
        if (e.target.matches('.delete')) {
            DB.delete('notes', e.target.dataset.id, localStorage.getItem('user')).then(() => {
                Toastify({
                    text: 'Note deleted succesfully',
                    duration: 2000,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
                search.value = '';
            });
            update_list();
            return;
        }
        if (!e.target.matches('.delete') && !e.target.closest('.note')) {
            addNoteWrapper.classList.remove("active");
            wrapper_reset();
        }
    })

    async function update_list() {
        const notes = await DB.getAll('notes', undefined, localStorage.getItem('user'));
        list.innerHTML = '';
        if (notes.length === 0) {
            list.innerHTML = '<h2>No notes found yet... start typing :)</h2>'
        }
        notes.forEach((n) => {
            const hours = n.timestamp.getHours();
            const minutes = n.timestamp.getMinutes();
            list.innerHTML += `
            <div class="note" data-id="${n.id}">
                <div class="note-header">
                    <span class="title">${n.title}</span>
                    <i data-id="${n.id}" class="fas fa-trash delete"></i>
                </div>
                <div class="note-body">${n.text}</div>
                <div class="note-footer"><span class="timestamp">${n.timestamp.toString().split(' ')[0]}, ${n.timestamp.getDate()}. ${n.timestamp.getMonth() + 1}. ${n.timestamp.getFullYear()}. at ${hours < 10 ? '0' +  hours: hours}:${minutes < 10 ? '0' +  minutes: minutes}</span></div>
            </div>`;
        });
    }

    const update_btn = document.querySelector('.add-note-footer .update-note-btn');
    update_btn.addEventListener('click', update_note);

    async function update_note(e) {
        e.stopPropagation();
        const wrapper_title = document.querySelector('.note-title');
        const wrapper_text = document.querySelector('.note-text');
        if (!wrapper_title.value && addNoteWrapper.classList.contains('active')) wrapper_title.classList.add('error');
        else wrapper_title.classList.remove('error');
        if (!wrapper_text.value && addNoteWrapper.classList.contains('active')) wrapper_text.classList.add('error');
        else wrapper_text.classList.remove('error');

        if (!wrapper_title.value || !wrapper_text.value) return;
        const updated_note = {
            id: e.target.dataset.id,
            title: wrapper_title.value,
            text: wrapper_text.value,
            timestamp: new Date()
        }
        const allnotes = await DB.getAll('notes', undefined, localStorage.getItem('user'));
        if (!allnotes.find((n) => n.id === e.target.dataset.id)) {
            Toastify({
                text: "You deleted this note. This note no longer exists.",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            wrapper_title.value = '';
            wrapper_text.value = '';
            addNoteWrapper.classList.remove('active');
            return;
        }

        DB.update('notes', updated_note, localStorage.getItem('user')).then(() => {
            Toastify({
                text: 'Note updated succesfully',
                duration: 2000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
            return;
        });

        wrapper_title.value = '';
        wrapper_text.value = '';
        addNoteWrapper.classList.remove('active');
        update_list();
    }
}
