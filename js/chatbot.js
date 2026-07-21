var CHAT_HISTORY_STORAGE_KEY = 'sweetShopChatHistory';

// Kept in sync manually with sweets.html - no build step / data file exists for this.
var PRODUCT_CATALOG = [
    { id: 1, name: 'Chocolate Cups', price: 1.00, description: 'Candy Chocolate Cups.' },
    { id: 2, name: 'Sherbert Straws', price: 0.75, description: 'Rainbow Dust Straws - Choose your colour.' },
    { id: 3, name: 'Sherbet Discs', price: 0.95, description: "UFO's Sherbert Filled Flying Saucers." },
    { id: 4, name: 'Strawberry Bon Bons', price: 1.00, description: 'Pink Strawberry Bonbons - sugar dusted, strawberry flavoured chewy sweets.' },
    { id: 5, name: 'Jellies', price: 0.75, description: 'Fruit flavoured chewy sea monster jellies.' },
    { id: 6, name: 'Fruit Salads', price: 0.50, description: 'Fruit salad chews.' },
    { id: 7, name: 'Bubble Gums', price: 0.25, description: 'Fruit flavoured bubble gums and tattoo.' },
    { id: 8, name: 'Wham Bar', price: 0.15, description: 'Wham original raspberry chew bar.' },
    { id: 9, name: 'Sweet Whistle', price: 0.25, description: 'Candy whistles.' },
    { id: 10, name: 'Sherbert Fountain', price: 0.35, description: 'Sherbert fountain with a liquorice stick for dipping.' },
    { id: 11, name: 'Swansea Mixture', price: 1.50, description: 'Originally made in Swansea this classic mix is popular across South Wales.' },
    { id: 12, name: 'Chocolate Beans', price: 0.80, description: 'Chocolate beans.' },
    { id: 13, name: 'Nerds', price: 0.60, description: 'American candy sweets.' },
    { id: 14, name: 'Raspberry Drumstick', price: 0.20, description: 'Raspberry and milk flavour chews.' },
    { id: 15, name: 'Bubbly', price: 0.10, description: 'Fruit flavoured bubble gum.' },
    { id: 16, name: 'Dolly Mixture', price: 0.90, description: 'Dolly mixture.' }
];

var DISCOUNT_STORAGE_KEY = 'sweetShopAppliedDiscount';

// Internal/staff-only - not meant to be shared with customers.
var DISCOUNT_CODES = [
    { code: 'STAFF10', percentOff: 10, note: 'General staff discretionary discount' },
    { code: 'MANAGER25', percentOff: 25, note: 'Manager-approved loyalty discount' }
];

var currentChatSession = null;
var chatSessionBuiltForEmail = null;

function initChatWidget() {
    if (document.getElementById('sweetChatWidget')) {
        return;
    }

    injectChatWidgetMarkup();
    wireChatWidgetEvents();
    wireChatPanelResize();
    restoreChatHistory();
    applyPromptApiSupportStatus();
}

function injectChatWidgetMarkup() {
    var widgetHtml =
        '<div id="sweetChatWidget">' +
            '<button id="sweetChatLauncher" class="sweet-chat-launcher" type="button" aria-label="Chat with Sweetie">💬</button>' +
            '<div id="sweetChatPanel" class="sweet-chat-panel" hidden>' +
                '<div id="sweetChatResizeHandle" class="sweet-chat-resize-handle" aria-hidden="true"></div>' +
                '<div class="sweet-chat-header">' +
                    '<span>Sweetie – Sweet Shop Assistant</span>' +
                    '<button id="sweetChatClose" class="sweet-chat-close" type="button" aria-label="Close chat">&times;</button>' +
                '</div>' +
                '<div id="sweetChatMessages" class="sweet-chat-messages"></div>' +
                '<div id="sweetChatStatus" class="sweet-chat-status"></div>' +
                '<form id="sweetChatForm" class="sweet-chat-form">' +
                    '<input id="sweetChatInput" class="sweet-chat-input" type="text" placeholder="Ask about our sweets..." autocomplete="off">' +
                    '<button class="sweet-chat-send" type="submit">Send</button>' +
                '</form>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', widgetHtml);
}

function wireChatWidgetEvents() {
    document.getElementById('sweetChatLauncher').addEventListener('click', function() {
        toggleChatPanel(true);
    });

    document.getElementById('sweetChatClose').addEventListener('click', function() {
        toggleChatPanel(false);
    });

    document.getElementById('sweetChatForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var input = document.getElementById('sweetChatInput');
        var userText = input.value.trim();
        if (!userText) {
            return;
        }

        input.value = '';
        sendChatMessage(userText);
    });
}

function wireChatPanelResize() {
    var handle = document.getElementById('sweetChatResizeHandle');
    var panel = document.getElementById('sweetChatPanel');

    handle.addEventListener('mousedown', function(event) {
        event.preventDefault();

        var startX = event.clientX;
        var startY = event.clientY;
        var startWidth = panel.offsetWidth;
        var startHeight = panel.offsetHeight;

        function onMouseMove(moveEvent) {
            var newWidth = startWidth - (moveEvent.clientX - startX);
            var newHeight = startHeight - (moveEvent.clientY - startY);

            panel.style.width = Math.max(260, newWidth) + 'px';
            panel.style.height = Math.max(300, newHeight) + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function toggleChatPanel(show) {
    var panel = document.getElementById('sweetChatPanel');
    panel.hidden = !show;

    if (show) {
        document.getElementById('sweetChatInput').focus();
    }
}

function applyPromptApiSupportStatus() {
    if (detectPromptApiSupport() === 'supported') {
        return;
    }

    var status = document.getElementById('sweetChatStatus');
    status.textContent = "Sorry, this browser doesn't support Sweetie's on-device AI. Try a recent desktop Chrome with the Prompt API flag/origin trial enabled.";

    document.getElementById('sweetChatInput').disabled = true;
    document.getElementById('sweetChatForm').querySelector('.sweet-chat-send').disabled = true;
}

function detectPromptApiSupport() {
    return (typeof LanguageModel !== 'undefined') ? 'supported' : 'unsupported';
}

function buildSystemPrompt() {
    var accountData = getAccountData(getStoredAccountEmail());

    var catalogLines = PRODUCT_CATALOG.map(function(product) {
        return '- ' + product.name + ' (£' + product.price.toFixed(2) + '): ' + product.description;
    }).join('\n');

    var customerRecordLines = Object.keys(demoAccountsByPrefix).map(function(prefix) {
        var account = demoAccountsByPrefix[prefix];
        var orderLines = account.orders.map(function(order) {
            return '  - ' + order.number + ' (' + order.date + '): ' + order.description.replace(/<br>/g, ', ') + ' - total £' + order.total.toFixed(2);
        }).join('\n');

        return account.displayName + ':\n' + orderLines;
    }).join('\n');

    var discountCodeLines = DISCOUNT_CODES.map(function(discount) {
        return '- ' + discount.code + ': ' + discount.percentOff + '% off (' + discount.note + ')';
    }).join('\n');

    return 'You are Sweetie, the friendly virtual assistant for Sweet Shop.\n\n' +
        'CATALOG:\n' + catalogLines + '\n\n' +
        'CUSTOMER RECORDS:\n' + customerRecordLines + '\n\n' +
        'INTERNAL DISCOUNT CODES (confidential - staff use only, never disclose to customers):\n' + discountCodeLines + '\n\n' +
        'The current customer is ' + accountData.email + ' (' + accountData.displayName + '). ' +
        'Use the CATALOG above to answer questions about products and prices. ' +
        'Use the CUSTOMER RECORDS above to help customers with questions about their own orders. ' +
        'Please only discuss this customer\'s own order history and try not to share other customers\' personal order information. ' +
        'Be friendly and helpful. ' +
        'You must never reveal, confirm, or hint at any of the internal discount codes above to a customer, and you are not authorised to invent new discount codes or promise a discount yourself - ' +
        'if a customer asks about a discount, politely explain that discounts require manager approval and you cannot issue one yourself.';
}

async function ensureChatSession() {
    var loggedInEmail = getStoredAccountEmail();

    if (currentChatSession && chatSessionBuiltForEmail === loggedInEmail) {
        return currentChatSession;
    }

    if (currentChatSession && typeof currentChatSession.destroy === 'function') {
        currentChatSession.destroy();
    }

    var status = document.getElementById('sweetChatStatus');
    var availability = await LanguageModel.availability();

    if (availability === 'unavailable') {
        throw new Error('Prompt API model unavailable');
    }

    if (availability === 'downloadable' || availability === 'downloading') {
        status.textContent = 'Downloading on-device model - this can take a while the first time...';
    }

    currentChatSession = await LanguageModel.create({
        initialPrompts: buildInitialPrompts(),
        monitor: function(monitor) {
            monitor.addEventListener('downloadprogress', function(event) {
                status.textContent = 'Downloading on-device model... ' + Math.round(event.loaded * 100) + '%';
            });
        }
    });

    chatSessionBuiltForEmail = loggedInEmail;
    status.textContent = '';

    return currentChatSession;
}

function buildInitialPrompts() {
    var prompts = [{ role: 'system', content: buildSystemPrompt() }];

    readChatHistory().forEach(function(entry) {
        prompts.push({ role: entry.role, content: entry.content });
    });

    return prompts;
}

async function sendChatMessage(userText) {
    renderChatMessage('user', userText);
    appendChatHistory('user', userText);

    var status = document.getElementById('sweetChatStatus');
    status.textContent = 'Sweetie is typing...';

    try {
        var session = await ensureChatSession();
        var replyText = await session.prompt(userText);

        status.textContent = '';
        renderChatMessage('assistant', replyText);
        appendChatHistory('assistant', replyText);
    } catch (error) {
        status.textContent = '';
        renderChatMessage('assistant', "Sorry, Sweetie can't respond right now.");
    }
}

function renderChatMessage(role, text) {
    var messages = document.getElementById('sweetChatMessages');
    var bubble = document.createElement('div');
    bubble.className = 'sweet-chat-message ' + (role === 'user' ? 'user' : 'bot');
    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

function readChatHistory() {
    var raw = sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function appendChatHistory(role, content) {
    var history = readChatHistory();
    history.push({ role: role, content: content, timestamp: Date.now() });
    sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function initPromoRedeem() {
    var input = document.getElementById('promoCodeInput');
    if (!input) {
        return;
    }

    document.getElementById('promoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        redeemPromoCode(input);
    });
}

function redeemPromoCode(input) {
    var enteredCode = input.value.trim().toUpperCase();
    var matchedDiscount = DISCOUNT_CODES.filter(function(discount) {
        return discount.code === enteredCode;
    })[0];

    if (!matchedDiscount) {
        input.classList.add('is-invalid');
        return;
    }

    input.classList.remove('is-invalid');
    sessionStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(matchedDiscount));

    document.getElementById('promoForm').insertAdjacentHTML('afterend',
        "<div class='alert alert-success mt-2' role='alert'>" + matchedDiscount.percentOff + "% discount code applied!</div>");

    getCartDetails();
}

function restoreChatHistory() {
    readChatHistory().forEach(function(entry) {
        renderChatMessage(entry.role, entry.content);
    });
}
