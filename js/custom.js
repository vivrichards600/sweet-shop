function init() {

    // Init cookies and WebSQL to demo
    InitCookie(); 
    InitWebSQL();
    
    // get cart
    getCart();

    // get cart details
    getCartDetails()
}

function InitCookie() {
    document.cookie = "EmailAddress=BloggsJ1@gmail.com";
}

function InitWebSQL() {
    var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024); 

    db.transaction(function (tx) { 
    tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)'); 
    tx.executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")'); 
    tx.executeSql('INSERT INTO LOGS (id, log) VALUES (2, "logmsg")'); 
    }); 
}

$(document).ready(function() {
    $(".addItem").click(function(event) {

        // if product already in cart then we need to increase quantity!
        if(localStorage.getItem(event.target.dataset.id) != null) {
            var currentQuantity = JSON.parse(localStorage.getItem(event.target.dataset.id)).quantity;
            
            var updatedProductJSON={"id":event.target.dataset.id, "name":event.target.dataset.name, "price":event.target.dataset.price, "quantity":currentQuantity + 1};
            localStorage.setItem(event.target.dataset.id, JSON.stringify(updatedProductJSON));
        } else {
            // add item to cart
            var productJSON={"id":event.target.dataset.id, "name":event.target.dataset.name, "price":event.target.dataset.price, "quantity":1};
            localStorage.setItem(event.target.dataset.id, JSON.stringify(productJSON));
        }

          getCart();

          
    });
});

function displayCartNotification(sweet) {
    var nav = document.getElementsByClassName('messageContainer');
    var notification = "<div class='alert alert-success alert-dismissible fade show' role='alert'><strong>Basket Updated!</strong> " + sweet + " added to basket.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times</span></button></div>";
    nav[0].innerHTML += notification;
    
}

function getCart(){
    // Update car with number of items
    var cartItems = 0;
    var keys = Object.keys(localStorage);
    keys.forEach(function(key){
      var currentItem = JSON.parse(localStorage[key]);
      cartItems = +cartItems +  +currentItem.quantity ;
    });

    document.getElementsByClassName('badge')[0].innerHTML = parseInt(cartItems);
    
    try {
        document.getElementsByClassName('cart-items')[0].innerHTML = cartItems;
        
        document.getElementsByClassName('badge')[0].innerHTML = cartItems;
        document.getElementsByClassName('badge')[1].innerHTML = cartItems;

        
        document.getElementsByClassName('badge-pill')[0].innerHTML = cartItems;
      }
      catch(error) {
        // do nowt  
    }
}

function getCartDetails() {
    try {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2
          })

        var subTotal = "";
        var basketItems="";

        var keys = Object.keys(localStorage);
        keys.forEach(function(key){
          var currentItem = JSON.parse(localStorage[key]);

          basketItems += "<li class='list-group-item d-flex justify-content-between lh-condensed'><div><h6 class='my-0'>" + currentItem.name + "</h6><small class='text-muted'>x " + currentItem.quantity + "</small><br><a class='small' href='javascript:removeItem(" + currentItem.id + ");'>Delete Item</a></div><span class='text-muted'>" + formatter.format(currentItem.price) + "</span></li>";
          subTotal = +subTotal + (+currentItem.price * currentItem.quantity);
        });

       document.getElementById('basketItems').innerHTML = basketItems;
      
        var totalWithShipping = subTotal;
        if(document.getElementById('exampleRadios2').checked) {
            var shippingCost = document.getElementById('exampleRadios2').value;
            totalWithShipping = subTotal + shippingCost;   
        }
        
        var orderTotal = "<li class='list-group-item d-flex justify-content-between'><span>Total (GBP)</span><strong>" + formatter.format(totalWithShipping) + "</strong></li>";
        document.getElementById('basketItems').innerHTML += orderTotal;

      }
      catch(error) {
        // do nowt  
    }
}

function removeItem(itemId){
    localStorage.removeItem(itemId);
    
    getCart();
    getCartDetails();
}

function emptyCart() {
    //var txt;
    var r = confirm("Are you sure you want to empty your basket?");
    if (r == true) {
        localStorage.clear();
        getCart();
        getCartDetails();
    } else {
      // user cancelled - do nothing
    }
  }