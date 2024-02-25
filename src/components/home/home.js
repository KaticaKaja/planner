// import loadNotifications from "../../core/notifications";

export default function load() {
    // loadNotifications();
    console.log(document.querySelector('nav'))
    document.querySelector('nav').addEventListener('mouseover', () => {
        console.log('HOVER OVER NAV');
    });
}
