import './home.scss';
import { navigate } from '../../core/router';
import { DB } from '../../core/db.js';
import Toastify from 'toastify-js';

export default function load() {
    showAuthOrNoAuth();
}

function showAuthOrNoAuth() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('auth').classList.remove('noshow');
        document.getElementById('auth').classList.add('show');
        document.getElementById('noauth').classList.remove('show');
        document.getElementById('noauth').classList.add('noshow');
        if (localStorage.getItem('user')) document.getElementById('user').innerText = localStorage.getItem('user').charAt(0).toUpperCase() + localStorage.getItem('user').slice(1);
        document.getElementById('logout').addEventListener('click', logout);
        upcomingEventToastify();
    } else {
        document.getElementById('auth').classList.remove('show');
        document.getElementById('auth').classList.add('noshow');
        document.getElementById('noauth').classList.remove('noshow');
        document.getElementById('noauth').classList.add('show');
    }
}

async function upcomingEventToastify() {
    const events = await DB.getAll('events', undefined, localStorage.getItem('user'));
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const hour = today.getHours();

    events.forEach((event) => {
        if (event.month === month) {
            if (event.day === date) {
                if (event.time.split('-')[0].split(':')[0] > hour) {
                    Toastify({
                        text: "You have an upcoming event today!" + '\n"' + event.title + '" is due today at ' + event.time.split('-')[0],
                        duration: 5000,
                        close: true,
                        gravity: "top", // `top` or `bottom`
                        position: "center", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                          background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();
                }
            }
        }
    });
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
    console.log('User logged out successfully');
}
