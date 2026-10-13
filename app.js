// ==========================================
// 1. DATA STATE & CATALOG
// ==========================================
const products = [
    { id: 1, name: "Pandesal (pack of 5)", price: 25.00 },
    { id: 2, name: "Ensaymada", price: 20.00 },
    { id: 3, name: "Spanish Bread", price: 15.00 },
    { id: 4, name: "Chocolate Cupcake", price: 30.00 },
    { id: 5, name: "Loaf Bread", price: 55.00 },
    { id: 6, name: "Brewed Coffee (cup)", price: 25.00 }
];

// The shopping cart stores items as: { id, name, price, quantity }
let cart = [];

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const productGrid = document.getElementById("product-grid");
const cartItemsContainer = document.getElementById("cart-items");
const summaryCount = document.getElementById("summary-count");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");

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

// Requirement 1 & 9: Add product or increment quantity if duplicate
function addToCart(productId) {
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

    renderCart();
    updateOrderSummary();
}

// Requirement 3 & 4: Adjust quantity (+1 / -1) and prevent zero/negative values
function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    // If quantity reaches 0, remove item from cart
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    renderCart();
    updateOrderSummary();
}

// Requirement 5: Explicitly remove an item from the cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
    updateOrderSummary();
}

// ==========================================
// 5. CART & SUMMARY RENDERING
// ==========================================

// Requirement 2: Display name, unit price, quantity, and subtotal
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="placeholder-text">Cart is empty. Click "Add to Cart" on any product.</p>`;
        return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach(item => {
        // Formula: Subtotal = Unit Price × Quantity
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

// Requirement 6, 7 & 8: Update summary totals
function updateOrderSummary() {
    let totalItems = 0;
    let grandTotal = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        // Total Amount = Sum of All Item Subtotals
        grandTotal += (item.price * item.quantity);
    });

    summaryCount.textContent = totalItems;
    summarySubtotal.textContent = `₱${grandTotal.toFixed(2)}`;
    summaryTotal.textContent = `₱${grandTotal.toFixed(2)}`;
}

// Initialize on page load
renderProductList();