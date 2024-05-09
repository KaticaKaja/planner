import './calendar.scss';
import { DB, uid } from '../../core/db.js';

export default async function load() {

    const calendar = document.querySelector('.calendar'),
        date = document.querySelector('.date'),
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
    function initCalendar() {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const prevDays = prevLastDay.getDate();
        const lastDate = lastDay.getDate();
        const day = firstDay.getDay();
        const nextDays = 7 - lastDay.getDay() - 1;

        date.innerHTML = months[month] + ' ' + year;

        let days = '';

        for (let x = day; x > 0; x--) {
            days += `<div class='day prev-date'>${prevDays - x + 1}</div>`;
        }

        for (let i = 1; i <= lastDate; i++) {
            //check if event is present on that day
            let event = false;
            getEvents();
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
                activeDay = i;
                getActiveDay(i);
                updateEvents(i);
                if (event) {
                    days += `<div class='day today active event'>${i}</div>`;
                } else {
                    days += `<div class='day today active'>${i}</div>`;
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
            days += `<div class='day next-date'>${j}</div>`;
        }
        daysContainer.innerHTML = days;
        addListener();
    }

    //function to add month and year on prev and next button
    function prevMonth() {
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        initCalendar();
    }

    function nextMonth() {
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        initCalendar();
    }

    prev.addEventListener('click', prevMonth);
    next.addEventListener('click', nextMonth);
    todayBtn.addEventListener('click', () => {
        today = new Date();
        month = today.getMonth();
        year = today.getFullYear();
        initCalendar();
    });

    //function to add active on day
    function addListener() {
        const days = document.querySelectorAll('.day');
        days.forEach((day) => {
            day.addEventListener('click', (e) => {
                getActiveDay(e.target.innerHTML);
                updateEvents(Number(e.target.innerHTML));
                activeDay = Number(e.target.innerHTML);
                //remove active
                days.forEach((day) => {
                    day.classList.remove('active');
                });
                //if clicked prev-date or next-date switch to that month
                if (e.target.classList.contains('prev-date')) {
                    prevMonth();
                    //add active to clicked day afte month is change
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
                    nextMonth();
                    //add active to clicked day afte month is changed
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
        alert('Invalid Date');
    }

    //function get active day day name and date and update eventday eventdate
    function getActiveDay(date) {
        const day = new Date(year, month, date);
        const dayName = day.toString().split(' ')[0];
        eventDay.innerHTML = dayName;
        eventDate.innerHTML = date + ' ' + months[month] + ' ' + year;
    }

    //function update events when a day is active
    function updateEvents(date) {
        let events = '';
        eventsArr.forEach((event) => {
            if (
                Number(date) === event.day &&
                month + 1 === event.month &&
                year === event.year
            ) {
                events += `<div class='event'>
                                <div class='title'>
                                    <i class='fas fa-circle'></i>
                                    <h4 class='event-title'>${event.title}</h4>
                                    <i data-id="${event.id}" data-day="${event.day}" class='delete-event-btn fas fa-trash-can'></i>
                                </div>
                                <div class='event-time'>
                                <span class='event-time'>${event.time}</span>
                                </div>
                            </div>`;
            }
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

    document.addEventListener('click', (e) => {
        if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
            addEventWrapper.classList.remove("active");
        }
    });

    //function to add event to eventsArr
    addEventSubmit.addEventListener('click', () => {
        const eventTitle = addEventTitle.value;
        const eventTimeFrom = addEventFrom.value;
        const eventTimeTo = addEventTo.value;
        if (eventTitle === '' || eventTimeFrom === '' || eventTimeTo === '') {
            alert('Please fill all the fields');
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
            alert('Event already added');
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
            month: month + 1,
            year: year,
            title: newEvent.title,
            time: newEvent.time
        });
        DB.add('events', {
            id: id,
            day: activeDay,
            month: month + 1,
            year: year,
            title: newEvent.title,
            time: newEvent.time
        }, localStorage.getItem('user'));

        // await getEvents();

        addEventWrapper.classList.remove('active');
        addEventTitle.value = '';
        addEventFrom.value = '';
        addEventTo.value = '';
        updateEvents(activeDay);
        //select active day and add event class if not added
        const activeDayEl = document.querySelector('.day.active');
        if (!activeDayEl.classList.contains('event')) {
            activeDayEl.classList.add('event');
        }
    });

    //function to delete event when clicked on event
    eventsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.delete-event-btn')) {
            const day = Number(e.target.dataset.day);
            const id = e.target.dataset.id;
            const activeDayEl = document.querySelector('.day.active');
            DB.delete('events', id, localStorage.getItem('user')).then(() => {
                getEvents().then(() => {
                    updateEvents(day);
                    if (!eventsArr.some((e) => e.day === day)) activeDayEl.classList.remove('event');
                });
            });
        }
    });

    //function to get events from local storage
    async function getEvents() {
        eventsArr = await DB.getAll('events', undefined, localStorage.getItem('user')).catch((err) => console.log('ERROR on getAll events'));
    }

}
