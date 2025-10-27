/* global rangeSlider */

import BaseWidget from '../components/BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input  = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.initActions();
    thisWidget.renderValue();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.dom.input.setAttribute('min',  settings.hours.open);
    thisWidget.dom.input.setAttribute('max',  settings.hours.close);
    thisWidget.dom.input.setAttribute('step', 0.5);

    if (typeof rangeSlider !== 'undefined' && rangeSlider.create) {
      rangeSlider.create(thisWidget.dom.input);
    }

    // ustaw wartość początkową jako liczbę
    thisWidget.value = parseFloat(thisWidget.dom.input.value || settings.hours.open);
  }

  initActions(){
    const thisWidget = this;

    function update(){
      thisWidget.value = parseFloat(thisWidget.dom.input.value);
    }

    thisWidget.dom.input.addEventListener('input', update);
    thisWidget.dom.input.addEventListener('change', update);
  }

  // >>> KLUCZOWE: wewnętrzna wartość ma być liczbą
  parseValue(value){
    return parseFloat(value);
  }

  isValid(value){
    return (
      !isNaN(value) &&
      value >= settings.hours.open &&
      value <= settings.hours.close
    );
  }

  // >>> Konwersja na HH:MM tylko przy wyświetlaniu
  renderValue(){
    const thisWidget = this;
    if (thisWidget.dom.output) {
      thisWidget.dom.output.innerHTML = utils.numberToHour(thisWidget.value);
    }
  }
}

export default HourPicker;