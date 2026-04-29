/*
  Project Title : ShopNest – E-Commerce Website
  File          : script.js
  Author        : Student Project – Experiment 7
  Date          : 2026-04-28
  Description   : All JavaScript logic — product rendering, cart management,
                  quantity controls, price calculations, checkout simulation,
                  and localStorage persistence (Bonus Task 7).
*/

/* =============================================
   1. PRODUCT DATA
   ============================================= */
const PRODUCTS = [
  {
    id: 1,
    name: "Ceramic Pour-Over Set",
    price: 1299,
    originalPrice: 1799,
    description: "Hand-thrown stoneware dripper with matching server. Brews a beautifully clean cup every morning.",
    emoji: "☕",
    tag: "Kitchen",
    isNew: true
  },
  {
    id: 2,
    name: "Merino Wool Throw",
    price: 2499,
    originalPrice: null,
    description: "Ultra-soft 100% merino wool blanket in natural undyed cream. Perfect weight for all seasons.",
    emoji: "🧣",
    tag: "Home",
    isNew: false
  },
  {
    id: 3,
    name: "Leather Field Notes Cover",
    price: 849,
    originalPrice: 999,
    description: "Vegetable-tanned leather cover for Field Notes notebooks. Gets better with every use.",
    emoji: "📒",
    tag: "Stationery",
    isNew: false
  },
  {
    id: 4,
    name: "Beeswax Pillar Candle",
    price: 549,
    originalPrice: null,
    description: "Pure beeswax with subtle honey scent. Burns 60+ hours cleanly with no synthetic fragrances.",
    emoji: "🕯️",
    tag: "Wellness",
    isNew: true
  },
  {
    id: 5,
    name: "Walnut Desk Organiser",
    price: 1899,
    originalPrice: 2299,
    description: "Solid walnut tray with three compartments. Keeps your workspace calm and clutter-free.",
    emoji: "🗂️",
    tag: "Office",
    isNew: false
  },
  {
    id: 6,
    name: "Linen Apron",
    price: 749,
    originalPrice: null,
    description: "Heavy-weight stonewashed linen with cross-back straps. No neck ties, no discomfort.",
    emoji: "👘",
    tag: "Kitchen",
    isNew: true
  }
];

/* =============================================
   2. CART STATE  (loaded from localStorage)
   ============================================= */
// cart = [ { id, name, price, emoji, quantity }, ... ]
let cart = loadCart();

/* =============================================
   3. UTILITY FUNCTIONS
   ============================================= */

/** Format number as Indian Rupee string */
function fmt(amount) {
  return "₹" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Save cart to localStorage */
function saveCart() {
  localStorage.setItem("shopnest_cart", JSON.stringify(cart));
}

/** Load cart from localStorage */
function loadCart() {
  try {
    const raw = localStorage.getItem("shopnest_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Calculate total number of items in cart */
function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** Calculate grand total price */
function cartGrandTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Show a brief toast notification */
function showToast(message) {
  // Remove any existing toast
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-dismiss after 2.4 s
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 2400);
}

/* =============================================
   4. RENDER PRODUCT GRID
   ============================================= */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  PRODUCTS.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.08}s`;

    card.innerHTML = `
      <div class="product-image-wrap">
        <span class="product-emoji">${product.emoji}</span>
        <span class="product-tag">${product.tag}</span>
        ${product.isNew ? '<span class="product-badge-new">New</span>' : ""}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <div class="product-price">
            ${fmt(product.price)}
            ${product.originalPrice ? `<span class="original">${fmt(product.originalPrice)}</span>` : ""}
          </div>
          <button class="btn btn-primary btn-add-cart" data-id="${product.id}">
            + Add to Cart
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Attach "Add to Cart" event listeners
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

/* =============================================
   5. CART LOGIC
   ============================================= */

/** Add a product to the cart (or increment quantity) */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.emoji} "${product.name}" added to cart`);

  // Bump the badge animation
  const badge = document.getElementById("cartBadge");
  badge.classList.remove("bump");
  void badge.offsetWidth; // reflow to restart animation
  badge.classList.add("bump");
}

/** Change quantity of a cart item (+1 / -1) */
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartUI();
}

/** Remove an item completely from the cart */
function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  showToast("Item removed from cart");
}

/** Clear the entire cart */
function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  saveCart();
  updateCartUI();
  showToast("Cart cleared");
}

/* =============================================
   6. RENDER CART UI (main section + drawer)
   ============================================= */
function updateCartUI() {
  renderCartSection();
  renderCartDrawer();
  updateBadge();
  updateCheckoutPreview();
}

/** Update the header cart badge count */
function updateBadge() {
  const count = cartItemCount();
  document.getElementById("cartBadge").textContent = count;
}

/** Render the main cart section on the page */
function renderCartSection() {
  const container = document.getElementById("cartItems");
  const emptyEl   = document.getElementById("cartEmpty");
  const summaryLines = document.getElementById("summaryLines");
  const totalEl   = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (cart.length === 0) {
    // Show empty state
    container.innerHTML = "";
    container.appendChild(emptyEl);
    summaryLines.innerHTML = "";
    totalEl.textContent = fmt(0);
    checkoutBtn.disabled = true;
    return;
  }

  // Remove empty placeholder if present
  if (emptyEl.parentNode === container) emptyEl.remove();

  container.innerHTML = "";
  summaryLines.innerHTML = "";

  cart.forEach(item => {
    // Cart row
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-img">${item.emoji}</div>
      <div class="cart-row-info">
        <div class="cart-row-name">${item.name}</div>
        <div class="cart-row-unit">${fmt(item.price)} each</div>
      </div>
      <div class="cart-row-controls">
        <div class="cart-row-subtotal">${fmt(item.price * item.quantity)}</div>
        <div class="qty-control">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-danger" data-remove="${item.id}">Remove</button>
      </div>
    `;
    container.appendChild(row);

    // Summary line
    const line = document.createElement("div");
    line.className = "summary-line";
    line.innerHTML = `
      <span>${item.name} × ${item.quantity}</span>
      <span>${fmt(item.price * item.quantity)}</span>
    `;
    summaryLines.appendChild(line);
  });

  totalEl.textContent = fmt(cartGrandTotal());
  checkoutBtn.disabled = false;

  // Quantity button listeners
  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id    = Number(btn.dataset.id);
      const delta = btn.dataset.action === "inc" ? 1 : -1;
      changeQty(id, delta);
    });
  });

  // Remove button listeners
  container.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.remove)));
  });
}

/** Render cart items inside the slide-in drawer */
function renderCartDrawer() {
  const body      = document.getElementById("drawerBody");
  const emptyMsg  = document.getElementById("drawerEmpty");
  const countSpan = document.getElementById("drawerCount");
  const totalEl   = document.getElementById("drawerTotal");
  const btn       = document.getElementById("drawerCheckoutBtn");

  const count = cartItemCount();
  countSpan.textContent = `(${count} item${count !== 1 ? "s" : ""})`;
  totalEl.textContent   = fmt(cartGrandTotal());
  btn.disabled          = count === 0;

  body.innerHTML = "";

  if (cart.length === 0) {
    body.appendChild(emptyMsg);
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "drawer-row";
    row.innerHTML = `
      <div class="drawer-row-img">${item.emoji}</div>
      <div class="drawer-row-info">
        <div class="drawer-row-name">${item.name}</div>
        <div class="drawer-row-meta">Qty: ${item.quantity} · ${fmt(item.price)} each</div>
      </div>
      <div class="drawer-row-price">${fmt(item.price * item.quantity)}</div>
    `;
    body.appendChild(row);
  });
}

/* =============================================
   7. CHECKOUT SECTION
   ============================================= */

/** Populate the order preview panel inside checkout */
function updateCheckoutPreview() {
  const list    = document.getElementById("checkoutItemList");
  const totalEl = document.getElementById("checkoutTotal");
  if (!list) return;

  list.innerHTML = "";
  cart.forEach(item => {
    const line = document.createElement("div");
    line.className = "checkout-item-line";
    line.innerHTML = `
      <span>${item.emoji} ${item.name} × ${item.quantity}</span>
      <span>${fmt(item.price * item.quantity)}</span>
    `;
    list.appendChild(line);
  });
  if (totalEl) totalEl.textContent = fmt(cartGrandTotal());
}

/** Show the checkout form section, hide cart */
function showCheckout() {
  document.getElementById("cart-section").style.display      = "none";
  document.getElementById("checkout-section").style.display  = "block";
  document.getElementById("confirmation-section").style.display = "none";
  updateCheckoutPreview();
  window.scrollTo({ top: document.getElementById("checkout-section").offsetTop - 80, behavior: "smooth" });
}

/** Go back to cart from checkout */
function showCart() {
  document.getElementById("cart-section").style.display      = "block";
  document.getElementById("checkout-section").style.display  = "none";
  document.getElementById("confirmation-section").style.display = "none";
  window.scrollTo({ top: document.getElementById("cart-section").offsetTop - 80, behavior: "smooth" });
}

/** Place order — validate, confirm, clear cart */
function placeOrder() {
  const name    = document.getElementById("custName").value.trim();
  const email   = document.getElementById("custEmail").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const phone   = document.getElementById("custPhone").value.trim();

  // Basic validation
  if (!name) {
    showToast("⚠️ Please enter your full name");
    document.getElementById("custName").focus();
    return;
  }

  // Build order summary text
  const orderLines = cart.map(
    item => `${item.emoji} ${item.name} × ${item.quantity} — ${fmt(item.price * item.quantity)}`
  ).join("\n");
  const total = cartGrandTotal();

  // Show confirmation screen
  document.getElementById("checkout-section").style.display  = "none";
  document.getElementById("confirmation-section").style.display = "flex";

  document.getElementById("confirmName").textContent =
    `Hi ${name}! Your order has been placed successfully.`;

  const orderId = "SN" + Date.now().toString().slice(-6);
  document.getElementById("confirmDetails").innerHTML = `
    <strong>Order ID:</strong> ${orderId}<br/>
    ${email   ? `<strong>Email:</strong> ${email}<br/>` : ""}
    ${address ? `<strong>Address:</strong> ${address}<br/>` : ""}
    ${phone   ? `<strong>Phone:</strong> ${phone}<br/>` : ""}
    <strong>Items:</strong><br/>${orderLines.replace(/\n/g, "<br/>")}
    <br/><strong>Grand Total:</strong> ${fmt(total)}
  `;

  window.scrollTo({ top: document.getElementById("confirmation-section").offsetTop - 80, behavior: "smooth" });

  // Clear cart and reset form
  clearCart();
  ["custName","custEmail","custAddress","custPhone"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

/** Reset everything back to product listing */
function shopAgain() {
  document.getElementById("cart-section").style.display         = "block";
  document.getElementById("checkout-section").style.display     = "none";
  document.getElementById("confirmation-section").style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =============================================
   8. CART DRAWER TOGGLE
   ============================================= */
function openDrawer() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

/* =============================================
   9. EVENT LISTENERS (DOM ready)
   ============================================= */
document.addEventListener("DOMContentLoaded", () => {

  // Render products
  renderProducts();

  // Initial cart render (from localStorage)
  updateCartUI();

  // Header cart toggle → open drawer
  document.getElementById("cartToggle").addEventListener("click", openDrawer);

  // Drawer close button
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);

  // Overlay click → close drawer
  document.getElementById("cartOverlay").addEventListener("click", closeDrawer);

  // Drawer checkout button → go to checkout section
  document.getElementById("drawerCheckoutBtn").addEventListener("click", () => {
    closeDrawer();
    showCheckout();
  });

  // Main cart section — Proceed to Checkout
  document.getElementById("checkoutBtn").addEventListener("click", showCheckout);

  // Main cart section — Clear Cart
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);

  // Checkout — Place Order
  document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);

  // Checkout — Back to Cart
  document.getElementById("backToCartBtn").addEventListener("click", showCart);

  // Confirmation — Shop Again
  document.getElementById("shopAgainBtn").addEventListener("click", shopAgain);

  // Keyboard: Escape closes drawer
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });
});
