import { makeTX, uid } from '../../core/db';
import './register.scss';
export default function load() {
    console.log('REGISTEER', document.getElementsByClassName('routing'));

    document.register.addEventListener('submit', (ev) => {
        ev.preventDefault();
        //one of the form buttons was clicked

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

        let tx = makeTX('users', 'readwrite');

        tx.oncomplete = (ev) => {
            console.log(ev);
            //buildList()
        };

        let store = tx.objectStore('users');
        let request = store.add(user);

        request.onsuccess = (ev) => {
            console.log('successfully added an object');
        };
        request.onerror = (err) => {
            console.log('error in request to add');
        };
    });
}

