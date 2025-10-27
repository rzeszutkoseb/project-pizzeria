import { select, classNames, settings, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.dom = {};
      thisCart.dom.wrapper = element;

      thisCart.getElements();
      thisCart.initActions();
    }

    getElements(){
      const thisCart = this;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form    = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone   = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

       thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();        
        thisCart.sendOrder();          
      });
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;
      let subtotalPrice = 0;

      for (const cartProduct of thisCart.products){
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }

      if (totalNumber > 0){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        thisCart.subtotalPrice = subtotalPrice;   
        thisCart.totalNumber   = totalNumber;     

        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        for (const elem of thisCart.dom.totalPrice){
          elem.innerHTML = thisCart.totalPrice;
        }
        thisCart.dom.totalNumber.innerHTML = totalNumber;
      } else {
        thisCart.totalPrice = 0;
        thisCart.subtotalPrice = 0;               
        thisCart.totalNumber   = 0; 

        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.subtotalPrice.innerHTML = 0;
        for (const elem of thisCart.dom.totalPrice){
          elem.innerHTML = 0;
        }
        thisCart.dom.totalNumber.innerHTML = 0;
      }
    }

    remove(cartProduct){
      const thisCart = this;

      cartProduct.dom.wrapper.remove();
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address:       thisCart.dom.address.value,
        phone:         thisCart.dom.phone.value,
        totalPrice:    thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber:   thisCart.totalNumber,
        deliveryFee:   (thisCart.totalNumber > 0 ? settings.cart.defaultDeliveryFee : 0),
        products:      [],
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(response => response.json())
        .then(parsedResponse => {
          console.log('Order response:', parsedResponse);
        });
    }
  }
export default Cart;