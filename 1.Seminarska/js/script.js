/*jshint esversion: 6 */

let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let dateObj = new Date();
let month = dateObj.getMonth();
let currMonth = dateObj.getMonth();
let year = dateObj.getFullYear();
let currYear = dateObj.getFullYear();
let tDate = dateObj;
let stayOpen = false;
let pickedDate = '';
let table = _('cal');
let cal = _('calender');
let xhr = new XMLHttpRequest();
let fromTo = 'from';
var inputError = 0;
var inputSuccess = 0;

function createErrorElement(id) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div id="${id}.errorMsg" class="errorMessage">Obvezno polje</div>`;
    return wrapper;
}

let input = document.querySelectorAll('input[type="text"]');
var objekt = {};
input.forEach(elem => {
    objekt[elem.id] = 1;
});
function handleInput(e) {
    const target = e.target || e.srcElement;
    const elem = document.getElementById(target.id);
    if (!e.target.value) {
        objekt[target.id] = 1;
        const errorElement = createErrorElement(target.id);
        elem.insertAdjacentElement("afterend", errorElement);
        elem.classList.add("red-border");
    } else {
        objekt[target.id] = objekt[target.id] > 1 ? objekt[target.id] - 1 : 0;
        _(target.id + '.' + 'errorMsg') && _(target.id + '.' + 'errorMsg').remove();
        elem.classList.remove("red-border");
    }
    enableDisableButton();
}
input.forEach(obj => obj.oninput = handleInput);

_('search-flight').disabled = true;
_('search-flight').classList.add("disabled");

function enableDisableButton() {
    if (Object.values(objekt).every(elem => elem === 0)) {
        _('search-flight').disabled = false;
        _('search-flight').classList.remove("disabled");
    } else {
        _('search-flight').disabled = true;
        _('search-flight').classList.add("disabled");
    }
}


_('month').innerHTML = months[month];
_('year').innerHTML = year;
_('prev').addEventListener('click', () => trackMonth('prev'));
_('next').addEventListener('click', () => trackMonth('next'));
_('dep-from').addEventListener('focus', () => whichCityBox('from'));
_('dep-to').addEventListener('focus', () => whichCityBox('to'));
_('one-way').addEventListener('click', () => toggleReturnBox('one-way'));
_('return').addEventListener('click', () => toggleReturnBox('return'));
_('flight-form').addEventListener('submit', onSubmit);

_('leave-date').addEventListener('focus', showCalender);
_('leave-date').addEventListener('blur', hideCalender);
_('return-date').addEventListener('focus', showCalender);
_('return-date').addEventListener('blur', hideCalender);

function _(id) {
    return document.getElementById(id);
}

function addZero(d) {
    if (d < 10) return '0' + d;
    return d;
}

function convertDate(d) {
    let ts = new Date(d).toString();
    ts = ts.substr(0, 15);
    console.log(ts);
    return ts;
}

function onSubmit(e) {
    e.preventDefault();

    let form = this;
    let txt = '<h3>Izbrani let</h3>';
    let returnTrip = form.elements[0];
    let onewayTrip = form.elements[1];
    let departFrom = form.elements[2].value;
    let arrivingAt = form.elements[3].value;
    let leavingOn = form.elements[4].value;
    let returningOn = form.elements[5].value;
    let adults = form.elements[6].value;
    let children = form.elements[7].value;
    let classType = form.elements[8].value;


    if (returnTrip.checked === true) txt += '<p>To je <strong>Povratni</strong> polet.</p>';
    if (onewayTrip.checked === true) txt += '<p>To je <strong>Enosmerni</strong> polet.</p>';
    txt += '<p>Odhod bo <strong>' + convertDate(leavingOn) + '</strong> iz <strong>' + departFrom + '</strong>';
    if (returningOn.length > 1) {
        txt += '<p>Vračilo leta bo <strong>' + convertDate(returningOn) + '</strong> iz <strong>' + arrivingAt + '</strong></p>';
    } else {
        txt += ' pristanek bo <strong>' + arrivingAt + '</strong></p>';
    }
    txt += '<p>Letite s <strong>' + classType + '</strong> s <strong>' + adults + '</strong> odraslimi in <strong>' + children + '</strong> otrokom.</p>';

    _('confirm').style.opacity = 1;
    _('confirm').innerHTML = txt;
    //this.reset();
    sessionStorage.setItem('departFrom', departFrom);
    sessionStorage.setItem('arrivingAt', arrivingAt);
    sessionStorage.setItem('leavingOn', leavingOn);
    sessionStorage.setItem('returningOn', returningOn);
    sessionStorage.setItem('adults', adults);
    sessionStorage.setItem('children', children);
    sessionStorage.setItem('classType', classType);
}


function toggleReturnBox(btn) {
    let box1 = _('return-box');
    console.log(this.checked);
    if (btn == 'return') {
        box1.style.opacity = 1;
    }
    if (btn == 'one-way') {
        box1.style.opacity = 0;
    }
}

function whichCityBox(ft) {
    fromTo = ft;
}

function addFromCity(o) {
    _('dep-from').value = o.innerText;
    _('depart-res').style.display = 'none';
}

function addToCity(o) {
    _('dep-to').value = o.innerText;
    _('arrive-res').style.display = 'none';
}

function positionCalender(box) {
    let boxPos = _('search-form').getBoundingClientRect(),
        leaveBoxPos = _('leave-date').getBoundingClientRect(),
        returnBoxPos = _('return-date').getBoundingClientRect(),
        leaveTopPos = leaveBoxPos.top - boxPos.top,
        leaveLeftPos = leaveBoxPos.left - boxPos.left,
        returnTopPos = returnBoxPos.top - boxPos.top,
        returnLeftPos = returnBoxPos.left - boxPos.left;

    if (box === 'leave-date') {
        cal.style.top = (leaveTopPos + 32) + 'px';
        cal.style.left = (leaveLeftPos) + 'px';
    }
    if (box === 'return-date') {
        cal.style.top = (returnTopPos + 32) + 'px';
        cal.style.left = (returnLeftPos) + 'px';
    }
}

function showCalender() {
    cal.style.opacity = 1;
    cal.style.pointerEvents = 'auto';
    stayOpen = true;
    pickedDate = this.id;
    positionCalender(pickedDate);
}

function hideCalender() {
    if (!stayOpen) {
        cal.style.opacity = 0;
        cal.style.pointerEvents = 'none';
    }
}

function getCellDate() {
    let tds = document.querySelectorAll('tbody td'),
        i;
    for (i = 0; i < tds.length; i++) {
        let btn = tds[i];
        btn.addEventListener('click', fetchDate);
    }
}

function fetchDate() {
    let td = this.getAttribute('data-date');
    if (pickedDate == 'leave-date') {
        _('leave-date').value = td;
        objekt['leave-date'] = 0;
    }
    if (pickedDate == 'return-date') {
        _('return-date').value = td;
        objekt['return-date'] = 0;
    }
    enableDisableButton();
    stayOpen = false;
    hideCalender();
}

function trackMonth(dir) {
    if (dir == 'prev') month -= 1;
    if (dir == 'next') month += 1;
    if (month > 11) {
        month = 0;
        year += 1;
    }
    if (month < 0) {
        month = 11;
        year -= 1;
    }
    _('month').innerHTML = months[month];
    _('year').innerHTML = year;
    calender(month, year);
}

function calender(month, year) {

    let today = dateObj.getDate();
    let firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    let weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthLength = new Date(year, month + 1, 0).getDate();
    let html = '';
    let dd;

    // DAYS OF WEEK HEADER
    html += '<tr>';
    for (let i = 0; i < weekDays.length; i++) {
        html += '<td>' + weekDays[i] + '</td>';
    }
    html += '</tr>';

    // CALENDAR PART
    let count = 0; // count of table's <td> cells
    if (startDay !== 0) { // Leave these cells blank
        html += "<tr><td colspan='" + startDay + "'></td>";
        count = startDay;
    }
    for (let day = 1; day <= monthLength; day++) {

        if (count % 7 === 0) { // new table row
            html += "<tr>";
        }

        dd = addZero(year) + '/' + addZero(month + 1) + '/' + day;

        if (count < today && month == currMonth || year < currYear) {
            html += "<td class='closed' data-date=" + dd + ">" + day + "</td>";
        } else {
            html += "<td class='normal' data-date=" + dd + ">" + day + "</td>";
        }

        count++;
        if (count % 7 === 0) {
            html += "</tr>";
        }
    }
    const blankCells = 7 - count % 7;
    if (blankCells < 7) {
        html += "<td colspan='" + blankCells + "'></td></tr>";
    }

    table.innerHTML = html;

    getCellDate();
}

calender(month, year);
positionCalender('leave-date');

function showButton() {
    document.getElementById('showButton2').style.display = "block";
}
