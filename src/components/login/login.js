import './login.scss';
import { state } from '../../core/state.js';
export default function load() {
    loadState();
    document.login.addEventListener('change', getValue);
}

function loadState() {
    document.getElementById('username').value = state.login.user?.username || '';
    document.getElementById('password').value = state.login.user?.password || '';
}

function getValue() {
    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    let user = {
        username,
        password
    };

    state.login.user = user;

    return user;
}
