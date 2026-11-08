
// ==========================================
// 1. Add Background Images
// ==========================================

const container = document.querySelector(".img-container");

if (container) {
  const positions = ["top-0 left-0"];

  positions.forEach(position => {
    const img = document.createElement("img");

    img.src = "./src/assets/Exclude.png";
    img.alt = "Background decoration";
    img.className = `absolute h-70 w-full opacity-25 ${position}`;

    container.appendChild(img);
  });
}


// ==========================================
// 2. Search Products
// ==========================================

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const productCards = document.querySelectorAll(
  "#popularGrid .card, #specialGrid .card"
);

let noResults = document.getElementById("noResults");

if (!noResults) {
  noResults = document.createElement("p");
  noResults.id = "noResults";
  noResults.className =
    "hidden text-center text-gray-500 text-sm py-6";

  document.getElementById("popularGrid")
    ?.parentElement?.appendChild(noResults);
}

function searchProducts() {
  if (!searchInput) return;

  const searchValue = searchInput.value.trim().toLowerCase();

  let found = 0;

  productCards.forEach(card => {
    const name = card.querySelector(
      ".content span:first-child"
    )?.textContent.trim().toLowerCase() || "";

    const description = card.querySelector(
      ".btn_left"
    )?.textContent.trim().toLowerCase() || "";

    const matches =
      name.includes(searchValue) ||
      description.includes(searchValue);

    card.classList.toggle("hidden", !matches);

    if (matches) found++;
  });

  if (noResults) {
    noResults.textContent =
      found === 0 ? "No products found!" : "";

    noResults.classList.toggle("hidden", found !== 0);
  }
}

searchInput?.addEventListener("input", searchProducts);

searchForm?.addEventListener("submit", event => {
  event.preventDefault();

  searchProducts();

  document.getElementById("popular")?.scrollIntoView({
    behavior: "smooth"
  });
});


// ==========================================
// 3. Cart Elements
// ==========================================

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
  cart = [];
}

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");


// ==========================================
// 4. Update Cart
// ==========================================

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));

  const count = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (cartCount) {
    cartCount.textContent = count;
  }

  if (cartItems) {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="text-center py-10">
          <p class="text-gray-400 text-sm">
            Your cart is empty!
          </p>
        </div>
      `;
    } else {
      cart.forEach((item, index) => {
        const itemElement = document.createElement("div");

        itemElement.className =
          "flex gap-3 items-center border-b py-4";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.className =
          "w-16 h-16 object-cover rounded-lg";

        const details = document.createElement("div");
        details.className = "flex-1";

        const name = document.createElement("h3");
        name.className = "font-semibold";
        name.textContent = item.name;

        const type = document.createElement("p");
        type.className = "text-xs text-gray-500";
        type.textContent = item.type;

        const price = document.createElement("p");
        price.className = "text-[#FF902A] font-semibold";
        price.textContent = `${item.price}k`;

        const controls = document.createElement("div");
        controls.className = "flex items-center gap-3 mt-2";

        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.textContent = "−";

        decrease.addEventListener("click", () => {
          changeQuantity(index, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.type = "button";
        increase.textContent = "+";

        increase.addEventListener("click", () => {
          changeQuantity(index, 1);
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.className = "text-red-500 ml-auto";

        remove.addEventListener("click", () => {
          removeItem(index);
        });

        controls.append(
          decrease,
          quantity,
          increase,
          remove
        );

        details.append(name, type, price, controls);
        itemElement.append(img, details);

        cartItems.appendChild(itemElement);
      });
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartTotal) {
    cartTotal.textContent = `${total}k`;
  }

  // Enable or disable Order Now
  const orderNowButton = document.getElementById("orderNowBtn");

  if (orderNowButton) {
    orderNowButton.disabled = cart.length === 0;
  }
}


// ==========================================
// 5. Add Product To Cart
// ==========================================

function addToCart(product) {
  const existing = cart.find(item =>
    item.id === product.id &&
    item.type === product.type
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  // Update cart only
  // Do NOT open cart drawer here
  updateCart();

  showToast(`${product.name} added to cart!`);
}


// ==========================================
// 6. Change Quantity
// ==========================================

function changeQuantity(index, amount) {
  if (!cart[index]) return;

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCart();
}


// ==========================================
// 7. Remove Product
// ==========================================

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}


// ==========================================
// 8. Product Selection + Add To Cart
// ==========================================

productCards.forEach(card => {
  let selectedType = null;

  const buttons = card.querySelectorAll(".variant-btn");

  // Select Hot or Cold
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => {
        btn.classList.remove(
          "bg-[#FF902A]",
          "text-white"
        );
      });

      button.classList.add(
        "bg-[#FF902A]",
        "text-white"
      );

      selectedType = button.dataset.size;
    });
  });

  // Add to Cart
  const addButton = card.querySelector(".add-cart");

  if (!addButton) return;

  addButton.addEventListener("click", () => {
    if (buttons.length > 0 && !selectedType) {
      alert("Please select Hot or Cold first!");
      return;
    }

    const productName = card.querySelector(
      ".content span:first-child"
    )?.textContent.trim();

    const priceText = card.querySelector(
      ".content span:last-child"
    )?.textContent.trim();

    const price = parseFloat(
      priceText?.replace("k", "")
    );

    const image = card.querySelector("img")?.src;

    if (!productName || !Number.isFinite(price) || !image) {
      alert("Product information is incomplete!");
      return;
    }

    const product = {
      id: productName,
      name: productName,
      price: price,
      image: image,
      type: selectedType || "Regular"
    };

    // Add product without opening drawer
    addToCart(product);

    // Reset selection
    buttons.forEach(btn => {
      btn.classList.remove(
        "bg-[#FF902A]",
        "text-white"
      );
    });

    selectedType = null;
  });
});


// ==========================================
// 9. Open Cart - Navbar Icon Only
// ==========================================

document.getElementById("cartBtn")?.addEventListener("click", () => {
  cartDrawer?.classList.remove("hidden");
});


// ==========================================
// 10. Close Cart
// ==========================================

document.getElementById("closeCart")?.addEventListener("click", () => {
  cartDrawer?.classList.add("hidden");
});

document.getElementById("closeCartBg")?.addEventListener("click", () => {
  cartDrawer?.classList.add("hidden");
});


// ==========================================
// 11. Subscribe Form
// ==========================================

const subForm = document.getElementById("subForm");
const subEmail = document.getElementById("subEmail");
const subMsg = document.getElementById("subMsg");

subForm?.addEventListener("submit", event => {
  event.preventDefault();

  if (!subEmail?.value.trim()) return;

  if (subMsg) {
    subMsg.textContent = "Thank you for subscribing!";
  }

  subForm.reset();
});


// ==========================================
// 12. Checkout Elements
// ==========================================

const checkoutModal = document.getElementById("checkoutModal");
const orderNowBtn = document.getElementById("orderNowBtn");
const closeCheckout = document.getElementById("closeCheckout");

const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummary = document.getElementById("checkoutSummary");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutMessage = document.getElementById("checkoutMessage");
const confirmOrderBtn = document.getElementById("confirmOrderBtn");

// Replace with your real Formspree endpoint
const FORMSPREE_URL = "https://formspree.io/f/mjyyddrd";


// ==========================================
// 13. Render Checkout Summary
// ==========================================

function renderCheckoutSummary() {
  if (!checkoutSummary || !checkoutTotal) return;

  checkoutSummary.innerHTML = "";

  cart.forEach(item => {
    const row = document.createElement("div");

    row.className =
      "flex justify-between gap-3 text-sm";

    const productInfo = document.createElement("span");

    productInfo.className = "text-gray-600";

    productInfo.textContent =
      `${item.name} (${item.type}) x ${item.quantity}`;

    const productPrice = document.createElement("span");

    productPrice.className = "font-semibold";

    productPrice.textContent =
      `${item.price * item.quantity}k`;

    row.append(productInfo, productPrice);

    checkoutSummary.appendChild(row);
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  checkoutTotal.textContent = `${total}k`;
}


// ==========================================
// 14. Open Checkout
// ==========================================

orderNowBtn?.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  renderCheckoutSummary();

  cartDrawer?.classList.add("hidden");

  checkoutModal?.classList.remove("hidden");
  checkoutModal?.classList.add("flex");
});


// ==========================================
// 15. Close Checkout
// ==========================================

function closeCheckoutModal() {
  checkoutModal?.classList.add("hidden");
  checkoutModal?.classList.remove("flex");
}

closeCheckout?.addEventListener("click", closeCheckoutModal);

checkoutModal?.addEventListener("click", event => {
  if (event.target === checkoutModal) {
    closeCheckoutModal();
  }
});


// ==========================================
// 16. Toast Message
// ==========================================

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.remove(
    "translate-y-6",
    "opacity-0"
  );

  toast.classList.add(
    "translate-y-0",
    "opacity-100"
  );

  setTimeout(() => {
    toast.classList.add(
      "translate-y-6",
      "opacity-0"
    );

    toast.classList.remove(
      "translate-y-0",
      "opacity-100"
    );
  }, 3000);
}


// ==========================================
// 17. Submit Order - Formspree
// ==========================================

checkoutForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (cart.length === 0) {
    if (checkoutMessage) {
      checkoutMessage.textContent = "Your cart is empty!";
      checkoutMessage.className =
        "text-center text-sm text-red-500";
    }

    return;
  }

  if (FORMSPREE_URL.includes("YOUR_FORM_ID")) {
    if (checkoutMessage) {
      checkoutMessage.textContent =
        "Please configure your Formspree endpoint first.";

      checkoutMessage.className =
        "text-center text-sm text-red-500";
    }

    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const orderDetails = cart.map(item => ({
    product: item.name,
    type: item.type,
    quantity: item.quantity,
    unitPrice: `${item.price}k`,
    subtotal: `${item.price * item.quantity}k`
  }));

  const formData = new FormData(checkoutForm);

  formData.append(
    "order_summary",
    JSON.stringify(orderDetails, null, 2)
  );

  formData.append("total", `${total}k`);

  confirmOrderBtn.disabled = true;
  confirmOrderBtn.textContent = "Sending Order...";

  if (checkoutMessage) {
    checkoutMessage.textContent = "";
  }

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to send order");
    }

    // Clear cart after successful submission
    cart = [];

    updateCart();

    checkoutForm.reset();

    closeCheckoutModal();

    showToast("Your order has been placed successfully!");

  } catch (error) {
    console.error("Order submission error:", error);

    if (checkoutMessage) {
      checkoutMessage.textContent =
        "Something went wrong. Please try again.";

      checkoutMessage.className =
        "text-center text-sm text-red-500";
    }

  } finally {
    confirmOrderBtn.disabled = false;
    confirmOrderBtn.textContent = "Confirm Order";
  }
});


// ==========================================
// 18. Initial Render
// ==========================================

updateCart();
