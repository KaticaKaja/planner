import './index.scss';
import "toastify-js/src/toastify.css"

import { DB } from './src/core/db.js';
import './src/core/router.js';
import './src/core/domchanges.js';

DB.init();

document.addEventListener('DOMContentLoaded', () => {
    loading();
});

function loading() {
    let loadingOverlay = document.getElementById('loading');
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        // document.querySelector('header').style.visibility = 'visible';
        document.querySelector('main').style.visibility = 'visible';
        document.querySelector('main').style.opacity = '1';
        document.querySelector('footer').style.visibility = 'visible';
        document.querySelector('footer').style.transform = "translateY(0)";
    }, 500);
}
