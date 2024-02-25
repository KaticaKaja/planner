// import loadNotifications from "../../js/notifications";

export default function load() {
    // loadNotifications();
    console.log(document.querySelector('nav'))
    document.querySelector('nav').addEventListener('mouseover', () => {
        console.log('HOVER OVER NAV');
    });
}
