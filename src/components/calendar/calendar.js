import './calendar.scss';
import { DB, uid } from '../../core/db.js';
import { navigate } from '../../core/router';
import Toastify from 'toastify-js';

export default async function load() {

    if (localStorage.getItem('isLoggedIn') === null) {
        navigate('/login');
        Toastify({
            text: "You need to sign in first!",
            duration: 3000,
            close: true,
            className: 'toastify',
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        return;
    }

    const date = document.querySelector('.date'),
        daysContainer = document.querySelector('.days'),
        prev = document.querySelector('.prev'),
        next = document.querySelector('.next'),
        todayBtn = document.querySelector('.today-btn'),
        gotoBtn = document.querySelector('.goto-btn'),
        dateInput = document.querySelector('.date-input'),
        eventDay = document.querySelector('.event-day'),
        eventDate = document.querySelector('.event-date'),
        eventsContainer = document.querySelector('.events'),
        addEventBtn = document.querySelector('.add-event'),
        addEventWrapper = document.querySelector('.add-event-wrapper'),
        addEventCloseBtn = document.querySelector('.close'),
        addEventTitle = document.querySelector('.event-name'),
        addEventFrom = document.querySelector('.event-time-from'),
        addEventTo = document.querySelector('.event-time-to'),
        addEventSubmit = document.querySelector('.add-event-btn');

    let today = new Date();
    let activeDay;
    let month = today.getMonth();
    let year = today.getFullYear();
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    let eventsArr = [];

    await getEvents();
    initCalendar();

    //function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
    function initCalendar(clickedDate = undefined) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const prevDays = prevLastDay.getDate();
        const lastDate = lastDay.getDate();
        const day = firstDay.getDay();
        const nextDays = 7 - lastDay.getDay() - 1;
        let prevMonth = month;
        let nextMonth = month + 2;

        date.innerHTML = months[month] + ' ' + year;

        let days = '';

        for (let x = day; x > 0; x--) {
            prevMonth = month;
            let event = false;
            let skip = false;
            eventsArr.forEach((eventObj) => {
                if (
                    eventObj.day === (prevDays - x + 1) &&
                    eventObj.month === prevMonth &&
                    eventObj.year === year
                ) {
                    event = true;
                    if (event) {
                        days += `<div data-month='${prevMonth - 1}' class='day event prev-date'>${prevDays - x + 1}</div>`;
                        skip = true;
                    }
                }
            });
            if (skip) continue;
            days += `<div data-month='${prevMonth - 1}' class='day prev-date'>${prevDays - x + 1}</div>`;
        }

        for (let i = 1; i <= lastDate; i++) {
            //check if event is present on that day
            let event = false;
            eventsArr.forEach((eventObj) => {
                if (
                    eventObj.day === i &&
                    eventObj.month === month + 1 &&
                    eventObj.year === year
                ) {
                    event = true;
                }
            });
            if (
                i === new Date().getDate() &&
                year === new Date().getFullYear() &&
                month === new Date().getMonth()
            ) {
                activeDay = clickedDate || i;
                getActiveDay(clickedDate || i);
                updateEvents(clickedDate || i);
                if (event) {
                    days += `<div class='day today event'>${i}</div>`;
                } else {
                    days += `<div class='day today'>${i}</div>`;
                }
            } else {
                if (event) {
                    days += `<div class='day event'>${i}</div>`;
                } else {
                    days += `<div class='day '>${i}</div>`;
                }
            }
        }

        for (let j = 1; j <= nextDays; j++) {
            let event = false;
            let skip = false;
            eventsArr.forEach((eventObj) => {
                if (
                    eventObj.day === j &&
                    eventObj.month === nextMonth &&
                    eventObj.year === year
                ) {
                    event = true;
                    if (event) {
                        days += `<div data-month='${nextMonth - 1}' class='day event next-date'>${j}</div>`;
                        skip = true;
                    }
                }
            });
            if (skip) continue;
            days += `<div data-month='${nextMonth - 1}' class='day next-date'>${j}</div>`;
        }
        daysContainer.innerHTML = days;
        addListener();
    }

    //function to add month and year on prev and next button
    function prevMonth(clickedDate = undefined) {
        if (typeof clickedDate !== 'string') clickedDate = undefined;
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        initCalendar(clickedDate);
    }

    function nextMonth(clickedDate = undefined) {
        if (typeof clickedDate !== 'string') clickedDate = undefined;
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        initCalendar(clickedDate);
    }

    prev.addEventListener('click', prevMonth);
    next.addEventListener('click', nextMonth);
    todayBtn.addEventListener('click', () => {
        dateInput.value = '';
        today = new Date();
        activeDay = today.getDate();
        month = today.getMonth();
        year = today.getFullYear();
        initCalendar();
    });
    dateInput.addEventListener('input', (e) => {
        dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
        if (dateInput.value.length === 2) {
            dateInput.value += '/';
        }
        if (dateInput.value.length > 7) {
            dateInput.value = dateInput.value.slice(0, 7);
        }
        if (e.inputType === 'deleteContentBackward') {
            if (dateInput.value.length === 3) {
                dateInput.value = dateInput.value.slice(0, 2);
            }
        }
    });

    gotoBtn.addEventListener('click', gotoDate);

    function gotoDate() {
        const dateArr = dateInput.value.split('/');
        if (dateArr.length === 2) {
            if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
                month = dateArr[0] - 1;
                year = dateArr[1];
                initCalendar();
                return;
            }
        }
        Toastify({
            text: "Invalid date.",
            duration: 3000,
            close: true,
            className: 'toastify',
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
            }
        }).showToast();
    }

    //function to add active on day
    function addListener() {
        const days = document.querySelectorAll('.day');
        days.forEach((day) => {
            day.addEventListener('click', (e) => {
                getActiveDay(e.target.innerHTML, Number(e.target.dataset.month) || undefined);
                updateEvents(Number(e.target.innerHTML), Number(e.target.dataset.month) || undefined);
                activeDay = Number(e.target.innerHTML);
                //remove active
                days.forEach((day) => {
                    day.classList.remove('active');
                });
                //if clicked prev-date or next-date switch to that month
                if (e.target.classList.contains('prev-date')) {
                    prevMonth(e.target.innerHTML);
                    //add active to clicked day after month is changed
                    setTimeout(() => {
                        //add active where no prev-date or next-date
                        const days = document.querySelectorAll('.day');
                        days.forEach((day) => {
                            if (
                                !day.classList.contains('prev-date') &&
                                day.innerHTML === e.target.innerHTML
                            ) {
                                day.classList.add('active');
                            }
                        });
                    }, 100);
                } else if (e.target.classList.contains('next-date')) {
                    nextMonth(e.target.innerHTML);
                    setTimeout(() => {
                        const days = document.querySelectorAll('.day');
                        days.forEach((day) => {
                            if (
                                !day.classList.contains('next-date') &&
                                day.innerHTML === e.target.innerHTML
                            ) {
                                day.classList.add('active');
                            }
                        });
                    }, 100);
                } else {
                    e.target.classList.add('active');
                }
            });
        });
    }

    //function get active day day name and date and update eventday eventdate
    function getActiveDay(date, m = undefined) {
        const day = new Date(year, m || month, date);
        const dayName = day.toString().split(' ')[0];
        eventDay.innerHTML = dayName;
        eventDate.dataset.month = Number(m);
        eventDate.innerHTML = date + ' ' + months[Number(m) || month] + ' ' + year;
    }

    //function update events when a day is active
    function updateEvents(date, m = undefined) {
        let events = '';
        const arranged = eventsArr.filter((event) => Number(date) === event.day &&
            (!m && (month + 1 === event.month) || m === event.month) &&
            year === event.year).sort((a, b) => Number(a.time.split('-')[0].split(':')[0]) - Number(b.time.split('-')[0].split(':')[0]));;
        arranged.forEach((event) => {
            events += `<div class='event'>
                            <div class='ev_content'>
                                <div class='title'>
                                    <i class='fas fa-circle'></i>
                                    <h4 class='event-title'>${event.title}</h4>
                                </div>
                                <div class='event-time'>
                                    <span class='event-time'>${event.time}</span>
                                </div>
                            </div>
                            <i data-id="${event.id}" data-day="${event.day}" class='delete-event-btn fas fa-trash-can'></i>
                        </div>`;
        });
        if (events === '') {
            events = `<div class='no-event'>
                        <h3>No Events</h3>
                    </div>`;
        }
        eventsContainer.innerHTML = events;
    }

    //function to add event
    addEventBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addEventWrapper.classList.toggle('active');
    });

    addEventCloseBtn.addEventListener('click', () => {
        addEventWrapper.classList.remove('active');
    });

    document.querySelector('#calendar').addEventListener('click', (e) => {
        if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
            addEventWrapper.classList.remove("active");
        }
    });

    //function to add event
    addEventSubmit.addEventListener('click', () => {
        const eventTitle = addEventTitle.value;
        const eventTimeFrom = addEventFrom.value;
        const eventTimeTo = addEventTo.value;
        if (eventTitle === '' || eventTimeFrom === '' || eventTimeTo === '') {
            Toastify({
                text: "Please fill all the fields.",
                duration: 3000,
                close: true,
                className: 'toastify',
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            return;
        }

        //check if event is already added
        let eventExist = false;
        eventsArr.forEach((event) => {
            if (
                event.day === activeDay &&
                event.month === month + 1 &&
                event.year === year
            ) {
                if (event.title === eventTitle) {
                    eventExist = true;
                }
            }
        });
        if (eventExist) {
            Toastify({
                text: "Event already added.",
                duration: 3000,
                close: true,
                className: 'toastify',
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, rgb(204, 0, 0), rgb(200 130 130))",
                }
            }).showToast();
            return;
        }
        const newEvent = {
            title: eventTitle,
            time: eventTimeFrom + ' - ' + eventTimeTo,
        };

        const id = uid();

        eventsArr.push({
            id: id,
            day: activeDay,
            month: Number(eventDate.dataset.month) || month + 1,
            year: year,
            title: newEvent.title,
            time: newEvent.time
        });
        DB.add('events', {
            id: id,
            day: activeDay,
            month: Number(eventDate.dataset.month) || month + 1,
            year: year,
            title: newEvent.title,
            time: newEvent.time
        }, localStorage.getItem('user'));

        addEventWrapper.classList.remove('active');
        addEventTitle.value = '';
        addEventFrom.value = '';
        addEventTo.value = '';
        updateEvents(activeDay, Number(eventDate.dataset.month) || month + 1);
        //select active day and add event class if not added
        const activeDayEl = document.querySelector('.day.active') || document.querySelector('.today');
        if (!activeDayEl.classList.contains('event')) {
            activeDayEl.classList.add('event');
        }
    });

    //function to delete event when clicked on event
    eventsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.delete-event-btn')) {
            const day = Number(e.target.dataset.day);
            const id = e.target.dataset.id;
            const activeDayEl = document.querySelector('.day.active') || document.querySelector('.today');
            DB.delete('events', id, localStorage.getItem('user')).then(() => {
                getEvents().then(() => {
                    updateEvents(day);
                    if (!eventsArr.some((e) => e.day === day)) activeDayEl.classList.remove('event');
                });
            });
        }
    });

    async function getEvents() {
        eventsArr = await DB.getAll('events', undefined, localStorage.getItem('user'));
    }

}
