var ACCOUNT_STORAGE_KEY = 'sweetShopLoggedInEmail';
var DEFAULT_ACCOUNT_EMAIL = 'twoorders@sweetshop.local';
var ALLOWED_LOGIN_EMAILS = [
    'oneorder@sweetshop.local',
    'twoorders@sweetshop.local',
    'fiveorders@sweetshop.local'
];
var demoAccountsByPrefix = {
    twoorders: {
        displayName: 'Two Orders Customer',
        favouriteSweet: 'Bon Bons',
        suggestedSweet: 'Dolly Mixture',
        basketMessage: 'This account has 2 previous orders.',
        orders: [
            { number: '#1048', date: '11th Feb 2026', description: 'Rhubarb and Custards x 2', total: 3.2, items: 2, month: 'February' },
            { number: '#1182', date: '6th Mar 2026', description: 'Cherry Lips x 1<br>Foam Shrimps x 2', total: 4.1, items: 3, month: 'March' }
        ]
    },
    fiveorders: {
        displayName: 'Five Orders Customer',
        favouriteSweet: 'Chocolate Cups',
        suggestedSweet: 'Chocolate Beans',
        basketMessage: 'This account has 5 previous orders.',
        orders: [
            { number: '#1031', date: '29th Jan 2026', description: 'Chocolate Cups x 5', total: 8.0, items: 5, month: 'January' },
            { number: '#1108', date: '16th Feb 2026', description: 'Cola Cubes x 3', total: 3.9, items: 3, month: 'February' },
            { number: '#1175', date: '18th Mar 2026', description: 'Peanut Brittle x 2<br>Chocolate Cups x 3', total: 9.5, items: 5, month: 'March' },
            { number: '#1246', date: '12th Apr 2026', description: 'Bon Bons x 4', total: 5.2, items: 4, month: 'April' },
            { number: '#1314', date: '28th Apr 2026', description: 'Mint Humbugs x 4', total: 5.6, items: 4, month: 'April' }
        ]
    },
    oneorder: {
        displayName: 'One Order Customer',
        favouriteSweet: 'Sherbert Straws',
        suggestedSweet: 'Sherbert Fountains',
        basketMessage: 'This account has 1 previous order.',
        orders: [
            { number: '#1277', date: '22nd Mar 2026', description: 'Sherbet Straws x 4<br>Jazzies x 2', total: 5.1, items: 6, month: 'March' }
        ]
    },
    guest: {
        displayName: 'Guest Customer',
        favouriteSweet: 'Swansea Mixture',
        suggestedSweet: 'Jellies',
        basketMessage: 'This is the default demo account for any other email prefix.',
        orders: [
            { number: '#1002', date: '8th Jan 2026', description: 'Swansea Mixture x 1', total: 1.5, items: 1, month: 'January' },
            { number: '#1139', date: '27th Feb 2026', description: 'Jelly Babies x 2', total: 3.4, items: 2, month: 'February' },
            { number: '#1261', date: '20th Mar 2026', description: 'Chocolate Cups x 2<br>Swansea Mixture x 1', total: 4.7, items: 3, month: 'March' }
        ]
    }
};

function init() {

    // Init cookies and WebSQL to demo
    InitCookie();

    renderAccountPage();
    
    // get cart
    getCart();

    // get cart details
    getCartDetails()

    // Randomise best selling sweets
    RandomiseBestSellingSweets()
}

function InitCookie() {
    if (document.cookie.indexOf('EmailAddress=') === -1) {
        document.cookie = 'EmailAddress=' + DEFAULT_ACCOUNT_EMAIL;
    }
}

function getEmailPrefix(emailAddress) {
    if (!emailAddress || emailAddress.indexOf('@') === -1) {
        return 'guest';
    }

    return emailAddress.split('@')[0].trim().toLowerCase();
}

function getStoredAccountEmail() {
    return sessionStorage.getItem(ACCOUNT_STORAGE_KEY) || DEFAULT_ACCOUNT_EMAIL;
}

function setStoredAccountEmail(emailAddress) {
    sessionStorage.setItem(ACCOUNT_STORAGE_KEY, emailAddress);
    document.cookie = 'EmailAddress=' + emailAddress;
}

function getAccountData(emailAddress) {
    var prefix = getEmailPrefix(emailAddress);
    var account = demoAccountsByPrefix[prefix] || demoAccountsByPrefix.guest;

    return {
        email: emailAddress,
        prefix: prefix,
        displayName: account.displayName,
        favouriteSweet: account.favouriteSweet,
        suggestedSweet: account.suggestedSweet,
        basketMessage: account.basketMessage,
        orders: account.orders
    };
}

function isAllowedLoginEmail(emailAddress) {
    return ALLOWED_LOGIN_EMAILS.indexOf(emailAddress) !== -1;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2
    }).format(amount);
}

function renderAccountPage() {
    var accountEmail = document.getElementById('accountEmail');
    if (!accountEmail) {
        return;
    }

    var accountData = getAccountData(getStoredAccountEmail());
    var orderCount = accountData.orders.length;
    var totalSpent = accountData.orders.reduce(function(total, order) {
        return total + order.total;
    }, 0);
    var totalItems = accountData.orders.reduce(function(total, order) {
        return total + order.items;
    }, 0);

    accountEmail.textContent = accountData.email;
    document.getElementById('accountGreeting').textContent = accountData.displayName;
    document.getElementById('accountOrderCount').textContent = String(orderCount);
    document.getElementById('accountFavouriteSweet').textContent = accountData.favouriteSweet;
    document.getElementById('accountSuggestedSweet').textContent = accountData.suggestedSweet;
    document.getElementById('accountTotalSpend').textContent = formatCurrency(totalSpent);
    document.getElementById('accountNotes').textContent = accountData.basketMessage;

    var transactionsBody = document.getElementById('transactionsBody');
    transactionsBody.innerHTML = accountData.orders.map(function(order) {
        return '<tr><th scope="row">' + order.number + '</th><td>' + order.date + '</td><td>' + order.description + '</td><td>' + order.total.toFixed(2) + '</td></tr>';
    }).join('');

    renderOrderChart(accountData.orders, totalItems);
}

function renderOrderChart(orders, totalItems) {
    var chartCanvas = document.getElementById('transactionChart');
    if (!chartCanvas || typeof Chart === 'undefined') {
        return;
    }

    var monthTotals = {};
    orders.forEach(function(order) {
        if (!monthTotals[order.month]) {
            monthTotals[order.month] = 0;
        }

        monthTotals[order.month] += order.items;
    });

    var labels = Object.keys(monthTotals);
    var values = labels.map(function(label) {
        return monthTotals[label];
    });
    var chartColours = [
        { background: 'rgba(255, 99, 132, 0.35)', border: 'rgba(255, 99, 132, 0.65)' },
        { background: 'rgba(54, 162, 235, 0.35)', border: 'rgba(54, 162, 235, 0.65)' },
        { background: 'rgba(255, 206, 86, 0.35)', border: 'rgba(255, 206, 86, 0.65)' },
        { background: 'rgba(75, 192, 192, 0.35)', border: 'rgba(75, 192, 192, 0.65)' },
        { background: 'rgba(153, 102, 255, 0.35)', border: 'rgba(153, 102, 255, 0.65)' }
    ];
    var backgroundColours = labels.map(function(label, index) {
        return chartColours[index % chartColours.length].background;
    });
    var borderColours = labels.map(function(label, index) {
        return chartColours[index % chartColours.length].border;
    });

    if (window.transactionChartInstance) {
        window.transactionChartInstance.destroy();
    }

    window.transactionChartInstance = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Items ordered (' + totalItems + ' total)',
                data: values,
                backgroundColor: backgroundColours,
                borderColor: borderColours,
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        precision: 0
                    }
                }]
            }
        }
    });
}

$(document).ready(function() {
    var loginForm = $('form.needs-validation');
    if (loginForm.length === 0 || $('#exampleInputEmail').length === 0 || $('#exampleInputPassword').length === 0) {
        return;
    }

    var emailInput = $('#exampleInputEmail');
    var emailFeedback = $('.invalid-email');

    emailInput.on('input', function() {
        this.setCustomValidity('');
        emailFeedback.text('Please enter a valid email address.');
    });

    loginForm.on('submit', function(event) {
        var emailAddress = emailInput.val().trim().toLowerCase();
        var password = $('#exampleInputPassword').val();
        var validEmail = emailAddress.length > 3 && emailAddress.includes('@');
        var validPassword = password.length > 0;
        var allowedEmail = isAllowedLoginEmail(emailAddress);

        if (!validEmail || !allowedEmail) {
            event.preventDefault();
            event.stopPropagation();
            emailInput[0].setCustomValidity('Use one of the demo email addresses shown in the tooltip.');
            emailFeedback.text('Use one of the demo email addresses shown in the tooltip.');
            this.classList.add('was-validated');
            return;
        }

        if (validEmail && validPassword) {
            event.preventDefault();
            setStoredAccountEmail(emailAddress);
            window.location.href = '00efc23d-b605-4f31-b97b-6bb276de447e.html';
        }
    });
});

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