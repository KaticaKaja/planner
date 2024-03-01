import { makeTX, uid } from '../../core/db.js';
import './register.scss';
import { state } from '../../core/state.js';
export default function load() {
    loadState();
    document.register.addEventListener('submit', validation);
    document.register.addEventListener('change', getValue);
}

function loadState() {
    document.getElementById('username').value = state.register.user?.username || '';
    document.getElementById('email').value = state.register.user?.email || '';
    document.getElementById('password').value = state.register.user?.password || '';
    document.getElementById('confirmpassword').value = state.register.user?.confirmpassword || '';
}
function getValue() {
    let username = document.getElementById('username').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let confirmpassword = document.getElementById('confirmpassword').value.trim();

    let user = {
        id: uid(),
        username,
        email,
        password,
        confirmpassword,
    };

    state.register.user = user;

    return user;
}

function validation(ev) {
    ev.preventDefault();

    addUser(getValue());
}

function addUser(user) {
    let tx = makeTX('users', 'readwrite');

    tx.oncomplete = (ev) => {
        console.log(ev);
    };

    let store = tx.objectStore('users');
    let request = store.add(user);

    request.onsuccess = (ev) => {
        console.debug('successfully added new user');
    };
    request.onerror = (err) => {
        console.err('error in request to add user');
    };
}
