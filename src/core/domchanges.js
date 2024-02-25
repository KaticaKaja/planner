import loadCalendar from '../components/calendar/calendar';
import loadHome from '../components/home/home';
import loadLogin from '../components/login/login';
import loadRegister from '../components/register/register';
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
    //     loadScript('./src/components/login/login.js', function () {
    //         console.log('LOGIN LOADED');
    //         console.log(Array.prototype.slice.call(document.scripts).map((s) => s.src));
    //         console.log(Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']));
    //         // removeStyle();
    //         // addStyle('./src/components/login/login.scss');
    //     });
    // }
    // if (window.location.pathname === '/register') {
    //     loadScript('./src/components/register/register.js', function () {
    //         console.log('REGISTER LOADED');
    //         console.log(Array.prototype.slice.call(document.scripts).map((s) => s.src));
    //         console.log(Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']));
    //         // removeStyle();
    //         // addStyle('./src/components/login/login.scss');
    //     });
    // }
    // if (window.location.pathname === '/home') {
    //     loadScript('./src/components/home/home.js', function () {
    //         console.log('HOME LOADED');
    //         // deloadScripts();
    //     });
    // }
    // if (window.location.pathname === '/notes') {
    //     loadScript('./src/components/notes/notes.js', function () {
    //         console.log('NOTES LOADED');
    //         // deloadScripts();
    //     });
    // }
    // if (window.location.pathname === '/calendar') {
    //     loadScript('./src/components/calendar/calendar.js', function () {
    //         console.log('CALENDAR LOADED');
    //         // deloadScripts();
    //     });
    // }
