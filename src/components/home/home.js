import './home.scss';
import { navigate } from '../../core/router';

export default function load() {
    showAuthOrNoAuth();
}

function showAuthOrNoAuth() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        console.log('User is logged in');
        document.getElementById('auth').classList.remove('noshow');
        document.getElementById('auth').classList.add('show');
        document.getElementById('noauth').classList.remove('show');
        document.getElementById('noauth').classList.add('noshow');
        if (localStorage.getItem('user')) document.getElementById('user').innerText = localStorage.getItem('user').charAt(0).toUpperCase() + localStorage.getItem('user').slice(1);
        document.getElementById('logout').addEventListener('click', logout);
    } else {
        document.getElementById('auth').classList.remove('show');
        document.getElementById('auth').classList.add('noshow');
        document.getElementById('noauth').classList.remove('noshow');
        document.getElementById('noauth').classList.add('show');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
    console.log('User logged out successfully');
}
