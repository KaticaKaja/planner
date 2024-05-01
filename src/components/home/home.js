import { navigate } from '../../core/router';
export default function load() {
    showAuthOrNoAuth();
}

function showAuthOrNoAuth() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        console.log('User is logged in');
        document.getElementById('auth').style.display = 'block';
        document.getElementById('noauth').style.display = 'none';
        // document.getElementById('header').innerHTML = '<button id="logout">Logout</button>';
        document.getElementById('logout').addEventListener('click', logout);
    } else {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('noauth').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    // document.getElementById('header').innerHTML = '';
    navigate('/login');
    console.log('User logged out successfully');
}
