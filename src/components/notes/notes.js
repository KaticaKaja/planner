import './notes.scss';
import { DB, uid } from '../../core/db.js';
import Toastify from 'toastify-js';

export default function load() {
    const openWrapperBtn = document.querySelector('.open_wrapper'),
        addNoteBtn = document.querySelector('.add_note_btn'),
        noteWrapper = document.querySelector('.note_wrapper'),
        closeWrapperBtn = document.querySelector('.close'),
        updateNoteBtn = document.querySelector('.wrapper_note_footer .update_note_btn'),
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
        noteWrapper.classList.toggle('active');
        wrapper_reset();
    });

    addNoteBtn.addEventListener('click', add_note);

    updateNoteBtn.addEventListener('click', update_note);

    closeWrapperBtn.addEventListener('click', () => {
        noteWrapper.classList.remove('active');
        wrapper_reset();
    });

    document.querySelector('#notes').addEventListener('click', (e) => {
        if (e.target !== openWrapperBtn && !noteWrapper.contains(e.target)) {
            noteWrapper.classList.remove("active");
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
        if (!e.target.matches('.delete') && e.target.closest('.note')) {
            noteWrapper.classList.add('active');
            const wrapper_title = document.querySelector('.note_title');
            const wrapper_text = document.querySelector('.note_text');
            const title = document.querySelector('.wrapper_note_header .title');
            const note = await DB.get('notes', e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id, localStorage.getItem('user'));
            wrapper_title.value = note.title;
            wrapper_text.value = note.text;
            title.innerHTML = 'Edit this note';
            addNoteBtn.classList.remove('open');
            addNoteBtn.classList.add('close');
            updateNoteBtn.classList.remove('close');
            updateNoteBtn.classList.add('open');
            updateNoteBtn.dataset.id = note.id;
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
            });
            update_list();
            return;
        }
        if (!e.target.matches('.delete') && !e.target.closest('.note')) {
            noteWrapper.classList.remove("active");
            wrapper_reset();
        }
    })

    function wrapper_reset() {
        const wrapper_title = document.querySelector('.note_title');
        wrapper_title.value = '';
        wrapper_title.classList.remove('error');
        const wrapper_text = document.querySelector('.note_text');
        wrapper_text.value = '';
        wrapper_text.classList.remove('error');
        const title = document.querySelector('.wrapper_note_header .title');
        title.innerHTML = 'New Note';
        addNoteBtn.classList.remove('close');
        addNoteBtn.classList.add('open');
        updateNoteBtn.classList.remove('open');
        updateNoteBtn.classList.add('close');
    }

    function add_note() {
        const title = document.querySelector('.note_title');
        const text = document.querySelector('.note_text');
        if (!title.value && noteWrapper.classList.contains('active')) title.classList.add('error');
        else title.classList.remove('error');
        if (!text.value && noteWrapper.classList.contains('active')) text.classList.add('error');
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

        document.querySelector('.note_title').value = '';
        document.querySelector('.note_text').value = '';
        noteWrapper.classList.remove('active');
        update_list();
    }

    async function update_list() {
        let notes = await DB.getAll('notes', undefined, localStorage.getItem('user'));
        list.innerHTML = '';
        if (conditions.search.value) {
            notes = notes.filter((n) => (conditions.value !== '') && n.title.includes(conditions.search.value) || n.text.includes(conditions.search.value));
        }
        if (conditions.sort.value) {
            if (conditions.sort.value === 'newest') notes = notes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (conditions.sort.value === 'oldest') notes = notes.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        if (conditions.search.value && notes.length === 0) {
            list.innerHTML = '<h2>No notes found with this search</h2>'
            return;
        }
        if (notes.length === 0) {
            list.innerHTML = '<h2>No notes found yet... start typing :)</h2>'
            return;
        }
        notes.forEach((n) => {
            const hours = n.timestamp.getHours();
            const minutes = n.timestamp.getMinutes();
            list.innerHTML += `
            <div class="note" data-id="${n.id}">
                <div class="note_header">
                    <span class="title">${n.title}</span>
                    <i data-id="${n.id}" class="fas fa-trash delete"></i>
                </div>
                <div class="note_body">${n.text}</div>
                <div class="note_footer"><span class="timestamp">${n.timestamp.toString().split(' ')[0]}, ${n.timestamp.getDate()}. ${n.timestamp.getMonth() + 1}. ${n.timestamp.getFullYear()}. at ${hours < 10 ? '0' +  hours: hours}:${minutes < 10 ? '0' +  minutes: minutes}</span></div>
            </div>`;
        });
    }

    async function update_note(e) {
        e.stopPropagation();
        const wrapper_title = document.querySelector('.note_title');
        const wrapper_text = document.querySelector('.note_text');
        if (!wrapper_title.value && noteWrapper.classList.contains('active')) wrapper_title.classList.add('error');
        else wrapper_title.classList.remove('error');
        if (!wrapper_text.value && noteWrapper.classList.contains('active')) wrapper_text.classList.add('error');
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
            noteWrapper.classList.remove('active');
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
        noteWrapper.classList.remove('active');
        update_list();
    }
}
