import { makeTX, uid } from '../../core/db.js';
import './register.scss';
import { state } from '../../core/state.js';
import { navigate } from '../../core/router.js';
export default function load() {
    loadState();
    document.register.addEventListener('submit', onRegister);
    document.register.addEventListener('change', validatedUser);
}

function loadState() {
    document.getElementById('username').value = state.register.user?.username || '';
    document.getElementById('email').value = state.register.user?.email || '';
    document.getElementById('password').value = state.register.user?.password || '';
    document.getElementById('confirmpassword').value = state.register.user?.confirmpassword || '';
}
function validatedUser(ev) {
    console.log('CHANGE EVENT ON FORM', ev);
    let username = document.getElementById('username').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let confirmpassword = document.getElementById('confirmpassword').value.trim();

    let user = {
        username,
        email,
        password,
        confirmpassword,
    };

    state.register.user = user;

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%^&*()_+={}[\]:;<>,.?~\\/-])[\w@$!%^&*()_+={}[\]:;<>,.?~\\/-]{8,}$/; //at least one letter, one digit, and one special character from the set @$!%^&*()_+={}[\]:;<>,.?~\\/-]

    if (username && !usernameRegex.test(user.username)) {
        document.querySelector('#username').nextElementSibling.nextElementSibling.innerHTML = 'Invalid username. At least 3 characters, you can use letters, numbers and underscore';
        document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
    } else {
        document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (email && !emailRegex.test(user.email)) {
        document.querySelector('#email').nextElementSibling.nextElementSibling.innerHTML = 'Invalid email.';
        document.querySelector('#email').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
    } else {
        document.querySelector('#email').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (password && !passwordRegex.test(user.password)) {
        document.querySelector('#password').nextElementSibling.nextElementSibling.innerHTML = 'Invalid password. At least one letter, one digit, and one special character from the set @$!%^&*()_+={}[\]:;<>,.?~\\/-]';
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
    } else {
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (user.password !== user.confirmpassword) {
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.innerHTML = 'Passwords do not match.';
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
    } else {
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }

    // if user deletes everything from the field, show that it's a required field
    if (ev) {
        if (!ev.target.value) document.getElementById(ev.target.id).classList.add('error');
        else document.getElementById(ev.target.id).classList.remove('error');
    }

    user.id = uid();
    return user;
}

function onRegister(ev) {
    ev.preventDefault();
    let user = validatedUser();
    if (!requiredFields(user)) return;
    // check if there is a user with the same email or username (email and username are unique) !!!!!!

    // toast for successful registration and go to login
    // notifications.show({ type: 'success', position: 'topcenter', message: 'You are successfully registered, now login to your account', duration: 2000 , closable: false })
    delete state.register.user;
    addUser(user);
}

function requiredFields(user) {
    // check required fields
    if (!user.username) document.getElementById('username').classList.add('error');
    else document.getElementById('username').classList.remove('error');
    if (!user.email) document.getElementById('email').classList.add('error');
    else document.getElementById('email').classList.remove('error');
    if (!user.password) document.getElementById('password').classList.add('error');
    else document.getElementById('password').classList.remove('error');
    if (!user.confirmpassword) document.getElementById('confirmpassword').classList.add('error');
    else document.getElementById('confirmpassword').classList.remove('error');
    if (!user.username || !user.email || !user.password || !user.confirmpassword) return false;
    return true;
}

function addUser(user) {
    let tx = makeTX('users', 'readwrite');

    tx.oncomplete = (ev) => {
        console.log(ev);
    };

    let store = tx.objectStore('users');
    let request = store.add(user);

    request.onsuccess = (ev) => {
        console.log('successfully added new user');
        navigate('/login');
    };
    request.onerror = (err) => {
        console.log('error in request to add user');
        //toast for an error with indexedDB
    };
}
