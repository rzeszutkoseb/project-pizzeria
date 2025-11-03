/* global Flickity */
// src/js/components/Home.js
import { templates } from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initShortcuts();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.home();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.home__carousel');
  }

  initCarousel(){
    const thisHome = this;
    if(!thisHome.dom.carousel) return;

    // nie twórz zmiennej, żeby ESLint nie krzyczał o no-unused-vars
    new Flickity(thisHome.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: 3000,
      pauseAutoPlayOnHover: true,
      pageDots: true,
      prevNextButtons: false,
      imagesLoaded: true,
      adaptiveHeight: true,
    });
  }

  initShortcuts(){
    const thisHome = this;
    thisHome.dom.wrapper.addEventListener('click', function(e){
      const box = e.target.closest('.home__box');
      if(!box) return;
      const href = box.getAttribute('href');
      if(href){
        window.location.hash = href;
      }
    });
  }
}

export default Home;
