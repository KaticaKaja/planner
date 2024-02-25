import './login.scss';
export default function load() {
    // if (document.getElementById('login')) {
        document.getElementById('username').addEventListener('click', showMe);
        // document.querySelector('h1').style.color = 'red';
    // }
}

function showMe() {
    console.log('clicked');
    // document.getElementById('continue').style.backgroundColor = 'blue';
}

console.log('');
