import loadCalendar from '../pages/calendar/calendar';
import loadHome from '../pages/home/home';
import loadLogin from '../pages/login/login';
import loadRegister from '../pages/register/register';
import { route } from './router';

const targetNode = document.getElementById('content');
const config = { childList: true, subtree: true };

const callback = () => {
    console.log('MUTATION');
    document.querySelectorAll('[data-route]').forEach((r) => {
        if (!r) return;
        r.addEventListener('click', route);
    });
    if (window.location.pathname === '/login') {
        loadLogin();
    }
    if (window.location.pathname === '/register') {
        loadRegister();
    }
    if (window.location.pathname === '/calendar') {
        loadCalendar();
    }
    if (window.location.pathname === '/') {
        console.log('HOME');
        loadHome();
    }

};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);


// if (window.location.pathname === '/login') {
    //     loadScript('./src/pages/login/login.js', function () {
    //         console.log('LOGIN LOADED');
    //         console.log(Array.prototype.slice.call(document.scripts).map((s) => s.src));
    //         console.log(Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']));
    //         // removeStyle();
    //         // addStyle('./src/pages/login/login.scss');
    //     });
    // }
    // if (window.location.pathname === '/register') {
    //     loadScript('./src/pages/register/register.js', function () {
    //         console.log('REGISTER LOADED');
    //         console.log(Array.prototype.slice.call(document.scripts).map((s) => s.src));
    //         console.log(Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']));
    //         // removeStyle();
    //         // addStyle('./src/pages/login/login.scss');
    //     });
    // }
    // if (window.location.pathname === '/home') {
    //     loadScript('./src/pages/home/home.js', function () {
    //         console.log('HOME LOADED');
    //         // deloadScripts();
    //     });
    // }
    // if (window.location.pathname === '/notes') {
    //     loadScript('./src/pages/notes/notes.js', function () {
    //         console.log('NOTES LOADED');
    //         // deloadScripts();
    //     });
    // }
    // if (window.location.pathname === '/calendar') {
    //     loadScript('./src/pages/calendar/calendar.js', function () {
    //         console.log('CALENDAR LOADED');
    //         // deloadScripts();
    //     });
    // }
