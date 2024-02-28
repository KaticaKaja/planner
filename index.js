import './index.scss';
import { DB } from './src/core/db.js';
import './src/core/router.js';
import './src/core/domchanges.js';

DB.init();

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        var loadingOverlay = document.getElementById('loading');
        loadingOverlay.style.display = 'none';
        document.querySelector('header').style.visibility = 'visible';
        document.querySelector('main').style.visibility = 'visible';
        document.querySelector('main').style.opacity = '1';
        document.querySelector('footer').style.visibility = 'visible';
        document.querySelector('footer').style.transform = "translateY(0)";
    }, 500);
});
