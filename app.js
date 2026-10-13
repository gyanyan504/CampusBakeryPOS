// Scenario 2: Campus Bakery POS - Hard-coded Product Catalog
const products = [
    { id: 1, name: "Pandesal (pack of 5)", price: 25.00 },
    { id: 2, name: "Ensaymada", price: 20.00 },
    { id: 3, name: "Spanish Bread", price: 15.00 },
    { id: 4, name: "Chocolate Cupcake", price: 30.00 },
    { id: 5, name: "Loaf Bread", price: 55.00 },
    { id: 6, name: "Brewed Coffee (cup)", price: 25.00 }
];

// Target DOM Elements
const productGrid = document.getElementById("product-grid");

// Function to render the product list dynamically into the UI
function renderProductList() {
    productGrid.innerHTML = ""; // Clear existing grid items

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

// Handler for 'Add to Cart' button click (scaffold for Step 3)
function addToCart(productId) {
    const selectedItem = products.find(p => p.id === productId);
    if (selectedItem) {
        console.log(`[Event] Added to Cart: ${selectedItem.name} — ₱${selectedItem.price.toFixed(2)}`);
    }
}

// Initial invocation to render catalog when page loads
renderProductList();