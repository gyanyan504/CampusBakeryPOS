// ==========================================
// 1. DATA STATE & CATALOG (SCENARIO 2)
// ==========================================
const products = [
    { id: 1, name: "Pandesal (pack of 5)", price: 25.00 },
    { id: 2, name: "Ensaymada", price: 20.00 },
    { id: 3, name: "Spanish Bread", price: 15.00 },
    { id: 4, name: "Chocolate Cupcake", price: 30.00 },
    { id: 5, name: "Loaf Bread", price: 55.00 },
    { id: 6, name: "Brewed Coffee (cup)", price: 25.00 }
];

let cart = [];
let isOrderCompleted = false;
let orderCounter = 1001; // Auto-incrementing transaction sequence

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const productGrid = document.getElementById("product-grid");
const cartItemsContainer = document.getElementById("cart-items");
const summaryCount = document.getElementById("summary-count");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");

const amountPaidInput = document.getElementById("amount-paid");
const paymentError = document.getElementById("payment-error");
const paymentSuccess = document.getElementById("payment-success");
const changeDisplay = document.getElementById("change-display");
const confirmPayBtn = document.getElementById("confirm-pay-btn");
const receiptPreview = document.getElementById("receipt-preview");
const newOrderBtn = document.getElementById("new-order-btn");

// Reset error/success alerts when input changes
amountPaidInput.addEventListener("input", clearPaymentMessages);

// ==========================================
// 3. PRODUCT CATALOG RENDERING
// ==========================================
function renderProductList() {
    productGrid.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price-tag">₱${product.price.toFixed(2)}</p>
            <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;

        productGrid.appendChild(card);
    });
}

// ==========================================
// 4. CART OPERATIONS
// ==========================================
function addToCart(productId) {
    if (isOrderCompleted) {
        startNewOrder();
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const productToAdd = products.find(p => p.id === productId);
        if (productToAdd) {
            cart.push({
                id: productToAdd.id,
                name: productToAdd.name,
                price: productToAdd.price,
                quantity: 1
            });
        }
    }

    resetPaymentState();
    renderCart();
    updateOrderSummary();
}

function changeQuantity(productId, delta) {
    if (isOrderCompleted) return;

    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    resetPaymentState();
    renderCart();
    updateOrderSummary();
}

function removeFromCart(productId) {
    if (isOrderCompleted) return;

    cart = cart.filter(item => item.id !== productId);
    resetPaymentState();
    renderCart();
    updateOrderSummary();
}

// ==========================================
// 5. CART & SUMMARY RENDERING
// ==========================================
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="placeholder-text">Cart is empty. Click "Add to Cart" on any product.</p>`;
        return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;

        const row = document.createElement("div");
        row.classList.add("cart-item-row");

        row.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-unit-price">₱${item.price.toFixed(2)} each</div>
            </div>

            <div class="cart-item-controls">
                <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                <span class="cart-item-qty">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
            </div>

            <div class="cart-item-subtotal">₱${itemSubtotal.toFixed(2)}</div>

            <button class="remove-btn" title="Remove Item" onclick="removeFromCart(${item.id})">×</button>
        `;

        cartItemsContainer.appendChild(row);
    });
}

function getTotalAmount() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateOrderSummary() {
    let totalItems = 0;
    const grandTotal = getTotalAmount();

    cart.forEach(item => {
        totalItems += item.quantity;
    });

    summaryCount.textContent = totalItems;
    summarySubtotal.textContent = `₱${grandTotal.toFixed(2)}`;
    summaryTotal.textContent = `₱${grandTotal.toFixed(2)}`;
}

// ==========================================
// 6. PAYMENT VALIDATION & CHECKOUT
// ==========================================
function clearPaymentMessages() {
    paymentError.style.display = "none";
    paymentError.textContent = "";
    if (paymentSuccess) {
        paymentSuccess.style.display = "none";
        paymentSuccess.textContent = "";
    }
}

function resetPaymentState() {
    changeDisplay.textContent = "₱0.00";
    clearPaymentMessages();
}

function showPaymentError(message) {
    clearPaymentMessages();
    paymentError.textContent = message;
    paymentError.style.display = "block";
    changeDisplay.textContent = "₱0.00";
}

function processPayment() {
    clearPaymentMessages();

    // Guard: Prevent payment on empty cart
    if (cart.length === 0) {
        showPaymentError("Cart is empty. Please add items before paying.");
        return;
    }

    const rawInput = amountPaidInput.value.trim();
    const totalDue = getTotalAmount();

    // Guard: Blank, non-numeric, or negative amounts
    if (rawInput === "" || isNaN(rawInput) || parseFloat(rawInput) < 0) {
        showPaymentError("Please enter a valid payment amount.");
        return;
    }

    const amountPaid = parseFloat(rawInput);

    // Guard: Insufficient payment
    if (amountPaid < totalDue) {
        showPaymentError(`Insufficient payment. Please enter at least ₱${totalDue.toFixed(2)}.`);
        return;
    }

    // Compute change
    const change = amountPaid - totalDue;
    changeDisplay.textContent = `₱${change.toFixed(2)}`;

    // Display payment confirmation
    paymentSuccess.textContent = "Payment successful! Transaction complete.";
    paymentSuccess.style.display = "block";

    // Generate digital receipt with transaction reference
    generateReceipt(amountPaid, totalDue, change);

    // Lock transaction controls
    isOrderCompleted = true;
    newOrderBtn.style.display = "block";
    confirmPayBtn.disabled = true;
    amountPaidInput.disabled = true;
}

// ==========================================
// 7. RECEIPT GENERATION & TRANSACTION RESET
// ==========================================
function generateReceipt(amountPaid, totalDue, change) {
    const timestamp = new Date().toLocaleString();
    const txnRef = `TXN-${orderCounter++}`; // Unique reference per transaction

    let itemsHtml = "";
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        itemsHtml += `
            <div class="receipt-row">
                <span>${item.quantity}x ${item.name}</span>
                <span>₱${itemSubtotal.toFixed(2)}</span>
            </div>
        `;
    });

    receiptPreview.innerHTML = `
        <div class="receipt-text">
            <div class="receipt-center">
                <strong>CAMPUS BAKERY POS</strong><br>
                <span>Official Order Receipt</span><br>
                <span><strong>Ref #: ${txnRef}</strong></span><br>
                <span>${timestamp}</span>
            </div>
            <div class="receipt-divider"></div>
            ${itemsHtml}
            <div class="receipt-divider"></div>
            <div class="receipt-row">
                <strong>Total Due:</strong>
                <strong>₱${totalDue.toFixed(2)}</strong>
            </div>
            <div class="receipt-row">
                <span>Amount Paid:</span>
                <span>₱${amountPaid.toFixed(2)}</span>
            </div>
            <div class="receipt-row">
                <span>Change:</span>
                <span>₱${change.toFixed(2)}</span>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-center">
                <span>Thank you for supporting Campus Bakery!</span>
            </div>
        </div>
    `;
}

function startNewOrder() {
    cart = [];
    isOrderCompleted = false;

    // Reset controls
    amountPaidInput.value = "";
    amountPaidInput.disabled = false;
    confirmPayBtn.disabled = false;
    newOrderBtn.style.display = "none";

    // Reset UI state
    renderCart();
    updateOrderSummary();
    resetPaymentState();
    clearPaymentMessages();
    receiptPreview.innerHTML = `<p class="placeholder-text">Transaction receipt will be printed here after checkout.</p>`;
}

// Initialize on page load
renderProductList();