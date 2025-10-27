  import {settings, select } from './settings.js';
  import Product from './components/Product.js';
  import Cart from './components/Cart.js';

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
          console.log('parsedResponse', parsedResponse);

          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });
    },

    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data', thisApp.data);

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

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      
      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
