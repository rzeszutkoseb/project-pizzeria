import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initMenu: function () {
    const thisApp = this;

    for (const productData of thisApp.data.products) {
      new Product(productData.id, productData);
    }
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      thisApp.cart.add(event.detail.product);
    });
  },

  initPages: function(){
  const thisApp = this;

  thisApp.pages = document.querySelector(select.containerOf.pages).children;
  thisApp.navLinks = document.querySelectorAll(select.nav.links);

  function activateFromHash(){
    const idFromHash = window.location.hash.replace('#','');
    let pageMatchingHash = thisApp.pages[0].id; // domyślnie pierwsza sekcja

    for(const page of thisApp.pages){
      if(page.id === idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);
  }

  // aktywacja przy starcie
  activateFromHash();

  // klik w linki menu
  for(const link of thisApp.navLinks){
    link.addEventListener('click', function(evt){
      evt.preventDefault();
      const id = this.getAttribute('href').replace('#','');
      thisApp.activatePage(id);
      window.location.hash = '#' + id;
    });
  }

  // >>> NOWE: reaguj na zmianę hasha (np. klik w boxy na Home)
  window.addEventListener('hashchange', activateFromHash);
},

  activatePage: function(pageId){
    const thisApp = this;

    for(const page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    for(const link of thisApp.navLinks){
      const href = link.getAttribute('href').replace('#','');
      link.classList.toggle(classNames.nav.active, href === pageId);
    }
  },

  initBooking: function(){
    const thisApp = this;
    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
  },

  initHome: function(){
    const thisApp = this;
    const homeElem = document.querySelector('#home');
    thisApp.home = new Home(homeElem);
  },

init: function () {
  const thisApp = this;

  
  thisApp.initPages();

  
  thisApp.initHome();

  
  thisApp.initData();
  thisApp.initCart();
  thisApp.initBooking();
},
};

app.init();
