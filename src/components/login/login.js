import './login.scss';
import { state } from '../../core/state.js';
import { navigate } from '../../core/router.js';
import { DB } from '../../core/db.js';
import Toastify from 'toastify-js'

export default function load() {
    loadState();
    document.login.addEventListener('change', getValue);
    document.login.addEventListener('submit', onLogin);
}

function loadState() {
    document.getElementById('username').value = state.login.user?.username || '';
    document.getElementById('password').value = state.login.user?.password || '';
}

async function getValue() {
    let users = [];
    let userDb = null;

    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    let user = {
        username,
        password
    };

    try {
        users = await DB.getAll('users')
    } catch (error) {
        console.error(error);
    }

    if (user.username && !users.some((u) => user.username === u.username)) {
        document.querySelector('#username').nextElementSibling.nextElementSibling.innerHTML = 'User not found.';
        document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
        return null;
    } else {
        document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '0';
        if (!user.username) {
            document.getElementById('username').classList.add('error');
            return null;
        } else document.getElementById('username').classList.remove('error');
    }
    if (user.password && !users.some((u) => user.password === u.password)) {
        document.querySelector('#password').nextElementSibling.nextElementSibling.innerHTML = 'Password is not correct.';
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
        return null;
    } else {
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '0';
        if (!user.password) {
            document.getElementById('password').classList.add('error');
            return null;
        } else document.getElementById('password').classList.remove('error');
    }

    userDb = users.find((u) => u.username === user.username && u.password === user.password);
    state.login.user = user;

    return userDb;
}

async function onLogin(ev) {
    ev.preventDefault();
    let user = await getValue();

    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        state.login.user = null;
        navigate('/');
        DB.init(user.username);

        Toastify({
            text: "You are successfully logged in!",
            duration: 3000,
            // destination: "https://github.com/apvarun/toastify-js",
            // newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        state.login.user = null;
    }
}
