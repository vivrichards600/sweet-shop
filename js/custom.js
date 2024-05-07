function init() {

    // Init cookies and WebSQL to demo
    InitCookie();
    
    // get cart
    getCart();

    // get cart details
    getCartDetails()

    // Randomise best selling sweets
    RandomiseBestSellingSweets()
}

function InitCookie() {
    document.cookie = "EmailAddress=BloggsJ1@gmail.com";
}

$(document).ready(function() {
    $(".addItem").click(function(event) {

        // if product already in cart then we need to increase quantity!
        if(localStorage.getItem(event.target.dataset.id) != null) {
            const currentQuantity = JSON.parse(localStorage.getItem(event.target.dataset.id)).quantity;
            
            const updatedProductJSON={"id":event.target.dataset.id, "name":event.target.dataset.name, "price":event.target.dataset.price, "quantity":currentQuantity + 1};
            localStorage.setItem(event.target.dataset.id, JSON.stringify(updatedProductJSON));
        } else {
            // add item to cart
            const productJSON={"id":event.target.dataset.id, "name":event.target.dataset.name, "price":event.target.dataset.price, "quantity":1};
            localStorage.setItem(event.target.dataset.id, JSON.stringify(productJSON));
        }

          getCart();


    });
});

function displayCartNotification(sweet) {
    let nav = document.getElementsByClassName('messageContainer');
    const notification = "<div class='alert alert-success alert-dismissible fade show' role='alert'><strong>Basket Updated!</strong> " + sweet + " added to basket.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times</span></button></div>";
    nav[0].innerHTML += notification;
    
}

function getCart(){
    // Update car with number of items
    let cartItems = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(function(key){
      let currentItem = JSON.parse(localStorage[key]);
      cartItems = +cartItems +  +currentItem.quantity ;
    });

    document.getElementsByClassName('badge')[0].innerHTML = parseInt(cartItems);
   
    try {
        document.getElementsByClassName('badge-pill')[0].innerHTML = cartItems;
        document.getElementsByClassName('cart-items')[0].innerHTML = cartItems;
  
        document.getElementsByClassName('badge')[0].innerHTML = cartItems;
        document.getElementsByClassName('badge')[1].innerHTML = cartItems;
      }
      catch(error) {
        // do nowt  
    }
}

function getCartDetails() {
    try {
        console.log("Getting basket details");
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2
          })

        let subTotal = "";
        let basketItems="";

        const keys = Object.keys(localStorage);
        keys.forEach(function(key){
          let currentItem = JSON.parse(localStorage[key]);

          basketItems += "<li class='list-group-item d-flex justify-content-between lh-condensed'><div><h6 class='my-0'>" + currentItem.name + "</h6><small class='text-muted'>x " + currentItem.quantity + "</small><br><a class='small' href='javascript:removeItem(" + currentItem.id + ");'>Delete Item</a></div><span class='text-muted'>" + formatter.format(currentItem.price) + "</span></li>";
          subTotal = +subTotal + (+currentItem.price * currentItem.quantity);
        });

       document.getElementById('basketItems').innerHTML = basketItems;

        let totalWithShipping = subTotal;
        if(document.getElementById('exampleRadios2').checked) {
            const shippingCost = document.getElementById('exampleRadios2').value;
            totalWithShipping = subTotal + shippingCost;

        }

        const orderTotal = "<li class='list-group-item d-flex justify-content-between'><span>Total (GBP)</span><strong>" + formatter.format(totalWithShipping) + "</strong></li>";
        document.getElementById('basketItems').innerHTML += orderTotal;
      }
      catch(error) {
        // do nothing
    }
}

function removeItem(itemId){
    const userResponse = confirm("Are you sure you want to remove this item?");
    if (userResponse === true) {
        localStorage.removeItem(itemId);
        getCart();
        getCartDetails();
    } else {
        // user cancelled - do nothing
    }
}

function emptyBasket() {
    if (localStorage.length>0){
        const userResponse = confirm("Are you sure you want to empty your basket?");
        if (userResponse === true) {
            localStorage.clear();
            getCart();
            getCartDetails();
        } else {
            // user cancelled - do nothing
        }
    }

}

function emptyCart() {
    const userResponse = confirm("Are you sure you want to empty your basket?");
    if (userResponse === true) {
        localStorage.clear();
        getCart();
        getCartDetails();
    }
  }

function RandomiseBestSellingSweets(){
    const cards = $(".cards");
    for(let i = 0; i < cards.length; i++){
        const target = Math.floor(Math.random() * cards.length -1) + 1;
        const target2 = Math.floor(Math.random() * cards.length -1) +1;
        cards.eq(target).before(cards.eq(target2));
    }
}