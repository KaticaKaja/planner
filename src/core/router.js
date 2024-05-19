const ROUTES = {
    404: '/src/components/404/404',
    '/': '/src/components/home/home',
    '/calendar': '/src/components/calendar/calendar',
    '/login': '/src/components/login/login',
    '/register': '/src/components/register/register',
    '/notes': '/src/components/notes/notes',
    '/todos': '/src/components/todos/todos',
    '/finance': '/src/components/finance/finance'
};

export function route(event) {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    handleLocation();
};

export function navigate(page) {
    window.history.pushState({}, '', page);
    handleLocation();
}

async function handleLocation() {
    const path = window.location.pathname;
    const route = ROUTES[path] || ROUTES[404];
    const html = await fetch(route + '.html').then((data) => data.text());
    document.getElementById('content').innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
