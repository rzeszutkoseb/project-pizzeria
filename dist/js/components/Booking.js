// src/js/components/Booking.js
import { select, templates, classNames, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = null;
    thisBooking.booked = {};

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.initTables();
    thisBooking.initSubmit();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam   = settings.db.dateEndParamKey   + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      bookings:      settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        return Promise.all([
          allResponses[0].json(),
          allResponses[1].json(),
          allResponses[2].json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

   makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = (typeof hour === 'number') ? hour : utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

   updateDOM(){
    const thisBooking = this;

    const date = thisBooking.datePicker.value;
    const hour = thisBooking.hourPicker.value; 

    let allAvailable = false;

    if(
      typeof thisBooking.booked[date] == 'undefined' ||
      typeof thisBooking.booked[date][hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      table.classList.remove(classNames.booking.tableBooked);

      if(!allAvailable && thisBooking.booked[date][hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);

      
        if(thisBooking.selectedTable === tableId){
          table.classList.remove(classNames.booking.tableSelected);
          thisBooking.selectedTable = null;
        }
      }
    }
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount  = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker   = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker   = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables       = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form         = thisBooking.dom.wrapper.querySelector('.booking-form');
    thisBooking.dom.phone        = thisBooking.dom.form.querySelector('input[name="phone"]');
    thisBooking.dom.address      = thisBooking.dom.form.querySelector('input[name="address"]');
    thisBooking.dom.starters     = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]');
    thisBooking.dom.floor        = thisBooking.dom.wrapper.querySelector('.floor-plan');
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget  = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker         = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker         = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.resetSelected();
      thisBooking.updateDOM();
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      thisBooking.resetSelected();
      thisBooking.updateDOM();
    });
    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.resetSelected();
      thisBooking.updateDOM();
    });
    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.resetSelected();
      thisBooking.updateDOM();
    });
  }

  initTables(){
    const thisBooking = this;

    thisBooking.dom.wrapper.addEventListener('click', function(event){
      const clickedTable = event.target.closest(select.booking.tables);
      if(!clickedTable) {
        return;
      }

      if(clickedTable.classList.contains(classNames.booking.tableBooked)){
        alert('This table is already booked.');
        return;
      }

      const tableIdStr = clickedTable.getAttribute(settings.booking.tableIdAttribute);
      const tableId = tableIdStr ? parseInt(tableIdStr) : null;

      if(thisBooking.selectedTable === tableId){
        clickedTable.classList.remove('selected');
        thisBooking.selectedTable = null;
        return;
      }

      const prevSelected = thisBooking.dom.wrapper.querySelector('.table.selected');
      if(prevSelected){
        prevSelected.classList.remove('selected');
      }

      clickedTable.classList.add('selected');
      thisBooking.selectedTable = tableId;
    });
  }

  resetSelected(){
    const thisBooking = this;
    const prevSelected = thisBooking.dom.wrapper.querySelector('.table.selected');
    if(prevSelected){
      prevSelected.classList.remove('selected');
    }
    thisBooking.selectedTable = null;
  }

  initSubmit(){
    const thisBooking = this;

    if(thisBooking.dom.form){
      thisBooking.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisBooking.sendBooking();
      });
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const starters = [];
    const starterChecks = thisBooking.dom.form.querySelectorAll('input[name="starter"]:checked');
    starterChecks.forEach(function(input){
      starters.push(input.value);
    });

    const payload = {
      date: thisBooking.datePicker.value,
      
      hour: utils.numberToHour(thisBooking.hourPicker.value),
      table: thisBooking.selectedTable !== null ? thisBooking.selectedTable : null,
      duration: parseInt(thisBooking.hoursAmountWidget.value),
      ppl: parseInt(thisBooking.peopleAmountWidget.value),
      starters: starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(res){ return res.json(); })
      .then(function(){
      
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
        thisBooking.resetSelected();
      });
  }
}

export default Booking;
