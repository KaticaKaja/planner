import { DB, uid } from '../../core/db.js';
import './register.scss';
import { state } from '../../core/state.js';
import Toastify from 'toastify-js'
import { navigate } from '../../core/router.js';

export default function load() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        navigate('/');
        Toastify({
            text: "You are already logged in!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        return;
    }
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
async function validatedUser(ev) {
    let users = [];
    let username = document.getElementById('username').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let confirmpassword = document.getElementById('confirmpassword').value.trim();
    let failed = false;

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
        failed = true;
    } else {
        try {
            users = await DB.getAll('users')
        } catch (error) {
            Toastify({
                text: "There was an error on our end, try again later.",
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            console.log('[' + error.name + '] ' + error.message);
        }
        if (users.some((u) => u.email === user.email)) {
            setTimeout(() => document.getElementById('email').classList.add('error'));
            Toastify({
                text: "This user already exists. Try login, click here",
                duration: 3000,
                destination: "/login",
                newWindow: false,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
            delete state.register.user;
            failed = true;
        } else document.getElementById('email').classList.remove('error');
        if (users.some((u) => u.username === user.username)) {
            document.querySelector('#username').nextElementSibling.nextElementSibling.innerHTML = 'This username is taken';
            document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
            failed = true;
        } else document.querySelector('#username').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (email && !emailRegex.test(user.email)) {
        document.querySelector('#email').nextElementSibling.nextElementSibling.innerHTML = 'Invalid email.';
        document.querySelector('#email').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
        failed = true;
    } else {
        document.querySelector('#email').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (password && !passwordRegex.test(user.password)) {
        document.querySelector('#password').nextElementSibling.nextElementSibling.innerHTML = 'Invalid password. Min length 8 characters, at least one letter, one digit, and one special character from the set @$!%^&*()_+={}[\]:;<>,.?~\\/-]';
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
        failed = true;
    } else {
        document.querySelector('#password').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }
    if (user.password !== user.confirmpassword) {
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.innerHTML = 'Passwords do not match.';
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.style.maxHeight = '130px';
        failed = true;
    } else {
        document.querySelector('#confirmpassword').nextElementSibling.nextElementSibling.style.maxHeight = '0';
    }

    // if user deletes everything from the field, show that it's a required field
    if (ev) {
        if (!ev.target.value) document.getElementById(ev.target.id).classList.add('error');
        else document.getElementById(ev.target.id).classList.remove('error');
    }

    user.failed = failed;
    user.id = uid();
    return user;
}

async function onRegister(ev) {
    ev.preventDefault();
    let user = await validatedUser();
    if (!requiredFields(user)) return;
    delete state.register.user;
    delete user.failed;
    DB.add('users', user).then((ev) => {
        Toastify({
            text: "You are successfully registered!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    }).catch((err) => {
        console.log('Error on user add event: '+ err);
        Toastify({
            text: "Try again later, there was a problem on our end.",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
            }
        }).showToast();
    });
    navigate('/login');
}

function requiredFields(user) {
    // check required fields
    if (!user) return false;
    if (!user.username) document.getElementById('username').classList.add('error');
    else document.getElementById('username').classList.remove('error');
    if (!user.email) document.getElementById('email').classList.add('error');
    else document.getElementById('email').classList.remove('error');
    if (!user.password) document.getElementById('password').classList.add('error');
    else document.getElementById('password').classList.remove('error');
    if (!user.confirmpassword) document.getElementById('confirmpassword').classList.add('error');
    else document.getElementById('confirmpassword').classList.remove('error');
    if (!user.username || !user.email || !user.password || !user.confirmpassword || user.failed) return false;
    return true;
}
