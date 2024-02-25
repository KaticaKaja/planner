const ROUTES = {
    404: '/src/components/404/404',
    '/': '/src/components/home/home',
    '/calendar': '/src/components/calendar/calendar',
    '/login': '/src/components/login/login',
    '/register': '/src/components/register/register',
    '/notes': '/src/components/notes/notes',
    '/todo': '/src/components/todo/todo',
    '/finance': '/src/components/finance/finance'
};

export function route(event) {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    handleLocation();
};

async function handleLocation() {
    const path = window.location.pathname;
    const route = ROUTES[path] || ROUTES[404];
    const html = await fetch(route + '.html').then((data) => data.text());
    document.getElementById('content').innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();

// const DEFAULT_SCRIPTS = Array.prototype.slice.call(document.scripts).map((s) => s.src);
// const DEFAULT_STYLES = document.querySelectorAll('style');
// console.log(DEFAULT_STYLES);
// console.log('document', DEFAULT_SCRIPTS);
// export function loadScript(src, callback) {
//     if (existsScript(src)) return;
//     deloadScripts();
//     let script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = src;
//     script.type = 'module';
//     script.onload = callback; // Optional callback function

//     document.body.appendChild(script);
// }

// export function deloadScripts(exeption) {
//     //check if this should exists in order to remove unnecesery scripts
//     const new_scripts = Array.prototype.slice.call(document.scripts).map((s) => s.src);
//     const old_scripts_plus_current = DEFAULT_SCRIPTS;
//     console.log(old_scripts_plus_current);
//     const difference = new_scripts.filter(ns => !old_scripts_plus_current.includes(ns));

//     console.log('diff', difference);
//     difference.forEach(element => {
//         console.log('every element', element);
//         if (!element.includes(window.location.pathname)) {
//             console.log('za izbacivanje', srcScript(element));
//             document.body.removeChild(srcScript(element));
//             // console.log(styleTag(element)); //proveriti
//             console.log('new value scripts', Array.prototype.slice.call(document.scripts).map((s) => s.src))
//         }
//     });
// }

// function srcScript(src) {
//     const scriptElements = document.querySelectorAll('script');
//     for (const script of scriptElements) {
//         if (script.src === src) {
//             return script;
//         }
//     }
//     return null;
// }

// export function removeStyle() {
//     const old = Array.prototype.slice.call(DEFAULT_STYLES);
//     const extra = Array.prototype.slice.call(document.querySelectorAll('style'));
//     const diff =  extra.filter(es => !old.includes(es));
//     diff.forEach(element => {
//         console.log('every element', element);
//         if (!element.dataset['viteDevId'].includes(window.location.pathname)) {
//             if (element.dataset['viteDevId'].includes('index')) return;
//             console.log('za izbacivanje style', element);
//             element.remove();
//             // console.log(styleTag(element)); //proveriti
//             console.log('new value styles', document.querySelectorAll('style'));
//         }
//     });
// }

// export function addStyle(href) {
//     // const linkElement = document.createElement('link');
//     // linkElement.rel = 'stylesheet';
//     // linkElement.href = href;
//     // document.head.appendChild(linkElement);
//     console.log('ADD STYLE !!!!!!!!');
//     console.log('href', href.split('/')[href.split('/').length - 2]);
//     console.log(Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']).filter(s => s.includes(href.split('/')[href.split('/').length - 2])));
//     if (Array.prototype.slice.call(document.querySelectorAll('style')).map(s => s.dataset['viteDevId']).filter(s => s.includes(href.split('/')[href.split('/').length - 2])).length > 0) return;
//     const style = document.createElement('style');
//     style.setAttribute('type', 'text/css');
//     style.innerHTML = loadAndCompileSass(href);
//     console.log(loadAndCompileSass(href));

//     document.head.appendChild(style);

// }

// async function loadAndCompileSass(path) {
//     const scssContent = await fetch(path).then(response => response.text());

//     const result = sass.renderSync({ data: scssContent });
//     return result.css.toString();
// }

// function existsScript(src) {
//     let exists = false;
//     for (let index = 0; index < document.scripts.length; index++) {
//         const element = document.scripts[index];
//         const modsrc = src.split('/');
//         if (element.src.includes(modsrc[modsrc.length - 1])) exists = true;
//     }
//     return exists;
// }
