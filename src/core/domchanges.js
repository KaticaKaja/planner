import loadCalendar from '../components/calendar/calendar';
import loadHome from '../components/home/home';
import loadLogin from '../components/login/login';
import loadRegister from '../components/register/register';
import loadFinance from '../components/finance/finance';
import loadNotes from '../components/notes/notes';
import loadTodos from '../components/todos/todos';
import { route } from './router';

const targetNode = document.getElementById('content');
const config = { childList: true };

const callback = () => {
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
    if (window.location.pathname === '/finance') {
        loadFinance();
    }
    if (window.location.pathname === '/notes') {
        loadNotes();
    }
    if (window.location.pathname === '/todos') {
        loadTodos();
    }
    if (window.location.pathname === '/') {
        loadHome();
    }

};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);
