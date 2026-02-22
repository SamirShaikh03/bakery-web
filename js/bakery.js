let cart = [];
let activeBlogTrigger = null;
const productIndex = [];
const mobileCategoryQuery = window.matchMedia('(max-width: 768px)');
const CATEGORY_PREVIEW_LIMIT = { desktop: 8, mobile: 4 };
let isSearchActive = false;

const API_BASE_URL = window.BAKERY_API_URL || localStorage.getItem('bakeryApiBaseUrl') || 'http://localhost:3000';

function buildApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

async function postJsonWithTimeout(url, payload, timeoutMs = 9000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        const data = await response.json();
        return { ok: response.ok, data };
    } finally {
        window.clearTimeout(timer);
    }
}

function addToCart(itemName, price, quantity) {
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        if (existingItem.quantity < 3) {
            existingItem.quantity += quantity;
        } else {
            alert('Maximum quantity of 3 reached for ' + itemName);
        }
    } else {
        cart.push({ name: itemName, price: price, quantity: quantity });
    }
    showCart();
}

function updateQuantity(itemName, change) {
    const item = cart.find(item => item.name === itemName);
    if (item) {
        item.quantity = Math.min(3, Math.max(1, item.quantity + change));
        if (item.quantity === 0) {
            cart = cart.filter(i => i.name !== itemName);
        }
    }
    showCart();
}

function showCart() {
    const cartSection = document.getElementById('cart-section');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartSection || !cartItems || !cartTotal) {
        return;
    }

    cartSection.classList.add('show');
    cartSection.setAttribute('aria-hidden', 'false');
    document.body.dataset.cart = 'open';
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.innerHTML = '';
    } else {
        cart.forEach(item => {
            cartItems.innerHTML += `
                <div class="cart-item">
                    <span>${item.name} - ₹${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)" ${item.quantity >= 3 ? 'disabled' : ''}>+</button>
                    </div>
                </div>`;
        });
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.innerHTML = `Total: ₹${total.toFixed(2)}`;
    }
}

function hideCart() {
    const cartSection = document.getElementById('cart-section');
    if (!cartSection) {
        return;
    }

    cartSection.classList.remove('show');
    cartSection.setAttribute('aria-hidden', 'true');
    delete document.body.dataset.cart;
}

function clearCart() {
    cart = [];
    showCart();
}

async function checkout() {
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (!address || !phone) {
        alert('Please fill in all fields.');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    // Generate a simple order ID
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order object
    const order = {
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        customerName: 'Website Customer',
        address: address,
        phone: phone,
        notes: ''
    };

    // Send order to backend API
    console.log('📦 Placing order to API:', buildApiUrl('/api/orders'));

    try {
        const { ok, data } = await postJsonWithTimeout(buildApiUrl('/api/orders'), order);

        if (ok && data && data.success) {
            console.log('✅ Order placed successfully:', data.data);

            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(data.data);
            localStorage.setItem('orders', JSON.stringify(orders));

            alert(`🎉 Order placed successfully!\n\nOrder ID: ${data.data.id}\nAddress: ${address}\nPhone: ${phone}\nItems: ${cart.map(item => `${item.name} (x${item.quantity})`).join(', ')}\nTotal: ₹${data.data.total.toFixed(2)}`);

            cart = [];
            document.getElementById('address').value = '';
            document.getElementById('phone').value = '';
            showCart();
            hideCart();
            return;
        }

        const serverError = data && data.error ? data.error : 'Order API returned an unexpected response.';
        console.error('❌ Order failed:', serverError);
        alert(`Failed to place order on server: ${serverError}`);
    } catch (error) {
        console.error('❌ Network/API error:', error);

        const localOrder = {
            id: orderId,
            date: new Date().toISOString(),
            items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
            total: total,
            address: address,
            phone: phone,
            status: 'pending (offline)'
        };

        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(localOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        alert(`⚠️ Backend unavailable - Order saved locally!\n\nOrder ID: ${orderId}\nAddress: ${address}\nPhone: ${phone}\nTotal: ₹${total.toFixed(2)}\n\nSet API base using localStorage key bakeryApiBaseUrl if your backend runs on a different URL.`);

        cart = [];
        document.getElementById('address').value = '';
        document.getElementById('phone').value = '';
        showCart();
        hideCart();
    }
}

// Function to handle order button click and open cart
function order(itemName) {
    addToCart(itemName, 0, 1); // Placeholder price, update with actual logic if needed
    showCart();
}

function buildProductIndex() {
    productIndex.length = 0;
    const products = document.querySelectorAll('.product');
    products.forEach(product => {
        const titleElement = product.querySelector('h3');
        if (!titleElement) return;
        const name = titleElement.textContent.trim();
        const categorySection = product.closest('.category-section');
        const categoryId = categorySection ? categorySection.id : null;
        productIndex.push({
            name,
            nameLower: name.toLowerCase(),
            element: product,
            categoryId
        });
    });
}

function getDefaultCategoryId() {
    const defaultTab = document.querySelector('.category-tab[data-category]');
    return defaultTab ? defaultTab.dataset.category : null;
}

function setActiveCategory(categoryId) {
    const categories = document.querySelectorAll('.category-section');
    const tabs = document.querySelectorAll('.category-tab');
    let matchFound = false;

    categories.forEach(category => {
        const isMatch = category.id === categoryId;
        category.classList.toggle('active', isMatch);
        if (isMatch) {
            matchFound = true;
        }
    });

    tabs.forEach(tab => {
        const tabCategory = tab.dataset.category;
        tab.classList.toggle('active', tabCategory === categoryId);
    });

    return matchFound;
}

function resetProductVisibility() {
    document.querySelectorAll('.product').forEach(product => {
        product.style.display = '';
    });
}

function clearSearchSuggestions() {
    const suggestions = document.getElementById('search-suggestions');
    if (!suggestions) return;
    suggestions.innerHTML = '';
    suggestions.classList.remove('is-visible');
}

function updateSearchSuggestions(query) {
    const suggestions = document.getElementById('search-suggestions');
    const searchInput = document.getElementById('search-input');
    if (!suggestions || !searchInput) return;

    suggestions.innerHTML = '';

    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) {
        suggestions.classList.remove('is-visible');
        return;
    }

    const normalized = trimmedQuery.toLowerCase();
    const matches = productIndex
        .filter(item => item.nameLower.includes(normalized))
        .slice(0, 6);

    if (!matches.length) {
        suggestions.classList.remove('is-visible');
        return;
    }

    matches.forEach(item => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'search-suggestion';
        option.role = 'option';
        option.textContent = item.name;
        option.addEventListener('mousedown', event => {
            event.preventDefault();
            searchInput.value = item.name;
            clearSearchSuggestions();
            searchProducts({ forceCategoryId: item.categoryId, scrollToSection: true, suppressSuggestions: true });
            searchInput.focus();
            requestAnimationFrame(() => {
                const length = searchInput.value.length;
                searchInput.setSelectionRange(length, length);
            });
        });
        suggestions.appendChild(option);
    });

    suggestions.classList.add('is-visible');
}

function scrollToSectionWithOffset(target) {
    if (!target) return;
    const nav = document.querySelector('nav');
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const offset = navHeight + 16;
    const destination = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, destination), behavior: 'smooth' });
}

function scrollToProductsSection() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        scrollToSectionWithOffset(productsSection);
    }
}

function getProductPreviewLimit() {
    return mobileCategoryQuery.matches ? CATEGORY_PREVIEW_LIMIT.mobile : CATEGORY_PREVIEW_LIMIT.desktop;
}

function ensureCategoryToggle(section) {
    let toggle = section.querySelector('.category-toggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'category-toggle';
        toggle.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', () => {
            const expanded = section.dataset.expanded === 'true';
            section.dataset.expanded = expanded ? 'false' : 'true';
            toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            applyProductPreviewLimits();
        });
        section.appendChild(toggle);
    }
    return toggle;
}

function applyProductPreviewLimits() {
    const sections = document.querySelectorAll('.category-section');
    if (!sections.length) return;
    const limit = getProductPreviewLimit();

    sections.forEach(section => {
        const productsGrid = section.querySelector('.products');
        if (!productsGrid) return;
        const cards = Array.from(productsGrid.querySelectorAll('.product'));
        const toggle = ensureCategoryToggle(section);

        if (isSearchActive) {
            cards.forEach(card => card.classList.remove('is-collapsed'));
            toggle.hidden = true;
            return;
        }

        const expanded = section.dataset.expanded === 'true';

        if (cards.length <= limit) {
            cards.forEach(card => card.classList.remove('is-collapsed'));
            toggle.hidden = true;
            section.dataset.expanded = 'false';
            toggle.setAttribute('aria-expanded', 'false');
            return;
        }

        toggle.hidden = false;
        cards.forEach((card, index) => {
            const shouldCollapse = !expanded && index >= limit;
            card.classList.toggle('is-collapsed', shouldCollapse);
        });
        toggle.textContent = expanded ? 'Show fewer treats' : `View all ${cards.length} items`;
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
}

function scrollActiveCategoryTab(categoryId) {
    if (window.innerWidth > 768) {
        return;
    }
    const activeTab = document.querySelector(`.category-tab[data-category="${categoryId}"]`);
    if (activeTab && typeof activeTab.scrollIntoView === 'function') {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

// Search Functionality
function searchProducts(options = {}) {
    const { forceCategoryId = null, scrollToSection = false, suppressSuggestions = false } = options;
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    if (!productIndex.length) {
        buildProductIndex();
    }

    const queryRaw = searchInput.value || '';
    const query = queryRaw.trim().toLowerCase();
    isSearchActive = query.length > 0;
    document.body.classList.toggle('is-searching-products', isSearchActive);

    let firstMatchCategoryId = null;

    productIndex.forEach(item => {
        const isMatch = !query || item.nameLower.includes(query);
        item.element.style.display = isMatch ? '' : 'none';
        if (isMatch && !firstMatchCategoryId) {
            firstMatchCategoryId = item.categoryId;
        }
    });

    if (suppressSuggestions) {
        clearSearchSuggestions();
    } else {
        updateSearchSuggestions(query);
    }

    const categories = document.querySelectorAll('.category-section');
    const visibilityMap = {};
    categories.forEach(category => {
        const hasVisible = Array.from(category.querySelectorAll('.product')).some(product => product.style.display !== 'none');
        visibilityMap[category.id] = hasVisible;
    });

    if (query) {
        const targetCategoryId = forceCategoryId || firstMatchCategoryId;
        categories.forEach(category => {
            const shouldShow = visibilityMap[category.id] && (!targetCategoryId || category.id === targetCategoryId);
            category.classList.toggle('active', shouldShow);
        });

        const tabs = document.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            const tabCategory = tab.dataset.category;
            const shouldActivate = tabCategory ? (visibilityMap[tabCategory] && (!targetCategoryId || tabCategory === targetCategoryId)) : false;
            tab.classList.toggle('active', !!shouldActivate);
        });
    } else {
    resetProductVisibility();
    clearSearchSuggestions();
        const defaultCategoryId = getDefaultCategoryId();
        if (defaultCategoryId) {
            setActiveCategory(defaultCategoryId);
        }
    }

    if (scrollToSection) {
        scrollToProductsSection();
    }

    applyProductPreviewLimits();
}

// Category Switching - Global function for inline onclick handlers
function showCategory(event, categoryId) {
    // Prevent default behavior
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!categoryId) {
        console.warn('showCategory called without categoryId');
        return;
    }

    // Clear any active search
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim() !== '') {
        searchInput.value = '';
        resetProductVisibility();
        clearSearchSuggestions();
    }

    isSearchActive = false;
    document.body.classList.remove('is-searching-products');

    // Get all category sections and tabs
    const allCategories = document.querySelectorAll('.category-section');
    const allTabs = document.querySelectorAll('.category-tab');
    
    // Remove active class from ALL categories
    allCategories.forEach(function(cat) {
        cat.classList.remove('active');
    });
    
    // Remove active class from ALL tabs
    allTabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    // Add active class to the selected category
    const targetCategory = document.getElementById(categoryId);
    if (targetCategory) {
        targetCategory.classList.add('active');
    }
    
    // Add active class to the corresponding tab
    const targetTab = document.querySelector('.category-tab[data-category="' + categoryId + '"]');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Apply preview limits
    applyProductPreviewLimits();
    
    // Scroll tab into view on mobile
    scrollActiveCategoryTab(categoryId);

    // Scroll to the category section
    if (targetCategory) {
        scrollToSectionWithOffset(targetCategory);
    }
}

// Make showCategory globally accessible
window.showCategory = showCategory;

function openOfferModal(type) {
    closeActiveOfferModal();

    const modal = document.getElementById(`${type}-modal`);
    if (!modal) {
        console.error(`Modal not found: ${type}-modal`);
        return false;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.dataset.offerModal = 'open';
    document.body.style.overflow = 'hidden';

    const panel = modal.querySelector('.offer-modal__panel');
    if (panel) {
        requestAnimationFrame(() => panel.focus());
    }
    
    return false;
}

function closeOfferModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (!modal) {
        return;
    }

    const wasOpen = modal.classList.contains('is-open');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (wasOpen) {
        const status = modal.querySelector('.offer-modal__status');
        if (status) {
            status.textContent = '';
        }

        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }

        delete document.body.dataset.offerModal;
        document.body.style.overflow = '';
    }
}

function submitGiftBox(event) {
    event.preventDefault();

    const form = event.target;
    const size = form.boxSize.value;
    const quantity = Math.max(1, Math.min(3, parseInt(form.quantity.value, 10) || 1));
    const message = form.message.value.trim();
    const addonInputs = form.querySelectorAll('input[name="addon"]:checked');
    const statusEl = document.getElementById('giftbox-status');

    const sizeMap = {
        classic: 1899,
        deluxe: 2199,
        royal: 2899
    };

    const addonPrices = {
        sparkles: 99,
        nuts: 149,
        tea: 129
    };

    const addonLabels = {
        sparkles: 'Sparkler candles',
        nuts: 'Assorted nut cluster',
        tea: 'Masala chai sachets'
    };

    const selectedAddons = Array.from(addonInputs, input => input.value);
    const addonTotal = selectedAddons.reduce((total, addon) => total + (addonPrices[addon] || 0), 0);
    const basePrice = sizeMap[size] || sizeMap.classic;
    const totalPrice = basePrice + addonTotal;

    const capitalizedSize = size.charAt(0).toUpperCase() + size.slice(1);
    const notes = message ? ` · Message: ${message}` : '';
    const addonsText = selectedAddons.length
        ? ` · Add-ons: ${selectedAddons.map(addon => addonLabels[addon] || addon).join(', ')}`
        : '';

    addToCart(`Festive Gift Box (${capitalizedSize})`, totalPrice, quantity);

    if (statusEl) {
        statusEl.textContent = `✓ Added ${quantity} box${quantity > 1 ? 'es' : ''} to your cart${notes}${addonsText}.`;
    }

    form.reset();

    setTimeout(() => {
        closeOfferModal('giftbox');
        if (statusEl) {
            statusEl.textContent = '';
        }
    }, 900);

    return false;
}

function submitDiwaliCollection(event) {
    event.preventDefault();

    const form = event.target;
    const collection = form.collection.value;
    const quantity = Math.max(1, Math.min(3, parseInt(form.quantity.value, 10) || 1));
    const delivery = form.delivery.value;
    const notes = form.notes.value.trim();
    const statusEl = document.getElementById('diwali-status');

    const collectionMap = {
        radiance: { label: 'Radiance Mithai Box', price: 1299 },
        royal: { label: 'Royal Dry Fruit Hamper', price: 1699 },
        lumina: { label: 'Lumina Dessert Platter', price: 2299 }
    };

    const selected = collectionMap[collection] || collectionMap.radiance;
    const summary = `Delivery: ${delivery.replace(/^./, char => char.toUpperCase())}${notes ? ` · Notes: ${notes}` : ''}`;

    addToCart(selected.label, selected.price, quantity);

    if (statusEl) {
        statusEl.textContent = `✓ Added ${quantity} ${selected.label}${quantity > 1 ? 's' : ''} to your cart. ${summary}`;
    }

    form.reset();

    setTimeout(() => {
        closeOfferModal('diwali');
        if (statusEl) {
            statusEl.textContent = '';
        }
    }, 900);

    return false;
}

function closeActiveOfferModal() {
    ['giftbox', 'diwali', 'seasonal'].forEach(closeOfferModal);
}

// Alias seasonal modal to diwali modal functionality
function openSeasonalModal() {
    return openOfferModal('diwali');
}

// Override openOfferModal to handle 'seasonal' as alias for 'diwali'
const originalOpenOfferModal = openOfferModal;
openOfferModal = function(type) {
    if (type === 'seasonal') {
        type = 'diwali';
    }
    return originalOpenOfferModal(type);
};

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.dataset.offerModal === 'open') {
        closeActiveOfferModal();
    }
});

// Order Tracking
function trackOrder() {
    const orderId = document.getElementById('order-id').value;
    const statusDiv = document.getElementById('tracking-status');
    const statuses = ['Order Confirmed', 'Preparing', 'Ready for Pickup', 'Delivered'];
    
    // Simulate order status (replace with actual tracking logic)
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    statusDiv.textContent = `Status: ${randomStatus}`;
}

// Custom Cake Builder
let customCakeDetails = null;

function buildCake() {
    const size = document.getElementById('cake-size');
    const flavor = document.getElementById('cake-flavor');
    const frosting = document.getElementById('cake-frosting');
    const message = document.getElementById('cake-message');
    const result = document.getElementById('cake-result');
    const orderBtn = document.getElementById('order-custom-cake');

    if (!size || !flavor || !result) return;

    const selectedSize = size.value;
    const selectedFlavor = flavor.value;
    const selectedFrosting = frosting ? frosting.value : 'Buttercream';

    if (!selectedSize || !selectedFlavor) {
        result.textContent = 'Please choose both a cake size and flavor to see pricing.';
        result.classList.add('is-error');
        if (orderBtn) orderBtn.style.display = 'none';
        return;
    }

    // Enhanced pricing for all sizes
    let basePrice = 0;
    const sizeMap = {
        '4 inch': 450, '5 inch': 600, '6 inch': 720, '7 inch': 900,
        '8 inch': 1040, '9 inch': 1280, '10 inch': 1460, '12 inch': 1800,
        '14 inch': 2200, 'half-sheet': 2800, 'full-sheet': 4200,
        '6+8': 2000, '8+10': 2800, '6+8+10': 4500,
        'cupcakes-dozen': 720, 'mini-assortment': 850
    };
    basePrice = sizeMap[selectedSize] || 720;

    // Enhanced flavor premiums
    const flavorPremium = {
        'Chocolate': 120, 'Vanilla': 80, 'Red Velvet': 160,
        'Lemon': 140, 'Matcha': 180, 'Coffee': 150,
        'Strawberry': 130, 'Pistachio': 200, 'Mango': 170,
        'Salted Caramel': 160, 'Hazelnut': 190, 'Coconut': 140,
        'Earl Grey': 150, 'Vegan Chocolate': 200
    };

    let totalPrice = basePrice + (flavorPremium[selectedFlavor] || 100);

    // Message surcharge
    if (message && message.value.trim().length > 24) {
        totalPrice += 120;
    }

    // Store details for ordering
    customCakeDetails = {
        name: `Custom ${selectedFlavor} Cake (${selectedSize})`,
        size: selectedSize,
        flavor: selectedFlavor,
        frosting: selectedFrosting,
        message: message ? message.value.trim() : '',
        price: totalPrice
    };

    result.textContent = `Estimated price: ₹${totalPrice.toLocaleString('en-IN')} (includes custom décor)`;
    result.classList.remove('is-error');
    
    // Show order button
    if (orderBtn) {
        orderBtn.style.display = 'inline-flex';
    }
}

function orderCustomCake() {
    if (!customCakeDetails) {
        alert('Please calculate the price first!');
        return;
    }

    // Build detailed description
    let description = `${customCakeDetails.size} | ${customCakeDetails.flavor} flavor | ${customCakeDetails.frosting} frosting`;
    if (customCakeDetails.message) {
        description += ` | Message: "${customCakeDetails.message}"`;
    }

    // Add to cart
    addToCart(customCakeDetails.name, customCakeDetails.price, 1);

    // Show confirmation
    const result = document.getElementById('cake-result');
    if (result) {
        result.textContent = `✓ Custom cake added to cart! (₹${customCakeDetails.price.toLocaleString('en-IN')})`;
        result.classList.remove('is-error');
    }

    // Reset form after 2 seconds
    setTimeout(() => {
        const form = document.querySelector('.builder-form');
        if (form) form.reset();
        customCakeDetails = null;
        const orderBtn = document.getElementById('order-custom-cake');
        if (orderBtn) orderBtn.style.display = 'none';
        if (result) result.textContent = '';
    }, 2000);
}

// Blog modal helpers
function openBlog(postId) {
    const modal = document.getElementById('blog-modal');
    if (!modal) return;

    const post = document.getElementById(postId);
    if (!post) return;

    const modalTitle = modal.querySelector('#modal-title');
    const modalMeta = modal.querySelector('#modal-meta');
    const modalBody = modal.querySelector('#modal-body');

    const postTitle = post.querySelector('.post-title');
    const postMeta = post.querySelector('.post-meta');
    const postBody = post.querySelector('.post-body');

    if (modalTitle) {
        modalTitle.textContent = postTitle ? postTitle.textContent.trim() : '';
    }

    if (modalMeta) {
        modalMeta.innerHTML = postMeta ? postMeta.innerHTML : '';
    }

    if (modalBody) {
        modalBody.innerHTML = postBody ? postBody.innerHTML : '';
    }

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');

    document.body.dataset.blogModal = 'open';
    document.body.style.overflow = 'hidden';

    const panel = modal.querySelector('.modal-panel');
    if (panel) {
        panel.focus();
    }
}

function closeBlog() {
    const modal = document.getElementById('blog-modal');
    if (!modal || modal.hidden) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;

    delete document.body.dataset.blogModal;
    document.body.style.overflow = '';

    if (activeBlogTrigger) {
        activeBlogTrigger.focus();
        activeBlogTrigger = null;
    }
}

function initBlogModal() {
    const modal = document.getElementById('blog-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('[data-blog-trigger]');
    if (!triggers.length) return;

    triggers.forEach(trigger => {
        trigger.addEventListener('click', event => {
            event.preventDefault();
            const postId = trigger.getAttribute('data-blog-trigger');
            if (!postId) return;
            activeBlogTrigger = trigger;
            openBlog(postId);
        });
    });

    const closeElements = modal.querySelectorAll('[data-blog-close]');
    closeElements.forEach(element => {
        element.addEventListener('click', closeBlog);
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeBlog();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeBlog();
        }
    });
}

function initReviewMarquee() {
    const track = document.querySelector('.review-track');
    if (!track) return;

    const marquee = track.parentElement;
    if (!marquee) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        marquee.classList.add('marquee-static');
        return;
    }

    if (track.dataset.marqueeInitialized === 'true') {
        return;
    }
    track.dataset.marqueeInitialized = 'true';

    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;

    const ensureFilled = () => {
        const marqueeWidth = marquee.offsetWidth;
        let totalWidth = track.scrollWidth;
        let safety = 0;

        while (totalWidth < marqueeWidth * 2 && safety < 4) {
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });
            totalWidth = track.scrollWidth;
            safety += 1;
        }
    };

    const updateDuration = () => {
        const pixelsPerSecond = 90;
        const trackWidth = track.scrollWidth;
        const duration = Math.max(12, trackWidth / pixelsPerSecond);
        track.style.setProperty('--review-speed', `${duration}s`);
        track.style.setProperty('--review-speed-mobile', `${Math.max(duration + 4, 16)}s`);
    };

    ensureFilled();
    updateDuration();

    let resizeThrottle;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeThrottle);
        resizeThrottle = window.setTimeout(() => {
            ensureFilled();
            updateDuration();
        }, 180);
    });
}

// Add loading animation to elements
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('loading');
    });

    const cartSection = document.getElementById('cart-section');
    if (cartSection) {
        cartSection.setAttribute('aria-hidden', 'true');
    }

    buildProductIndex();
    const defaultCategoryId = getDefaultCategoryId();
    if (defaultCategoryId) {
        setActiveCategory(defaultCategoryId);
    }
    applyProductPreviewLimits();

    // Add event listeners to category tabs for more reliable switching
    const categoryTabs = document.querySelectorAll('.category-tab[data-category]');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            event.preventDefault();
            const categoryId = this.dataset.category;
            if (categoryId) {
                showCategory(event, categoryId);
            }
        });
    });

    let previewResizeTimer = null;
    const handlePreviewResize = () => {
        window.clearTimeout(previewResizeTimer);
        previewResizeTimer = window.setTimeout(() => {
            applyProductPreviewLimits();
        }, 120);
    };

    window.addEventListener('resize', handlePreviewResize);
    if (typeof mobileCategoryQuery.addEventListener === 'function') {
        mobileCategoryQuery.addEventListener('change', () => applyProductPreviewLimits());
    } else if (typeof mobileCategoryQuery.addListener === 'function') {
        mobileCategoryQuery.addListener(applyProductPreviewLimits);
    }

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            searchProducts({ scrollToSection: true, suppressSuggestions: true });
            searchInput.focus();
        });

        searchInput.addEventListener('input', () => {
            searchProducts();
        });

        searchInput.addEventListener('focus', () => {
            updateSearchSuggestions(searchInput.value.trim().toLowerCase());
        });

        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                searchInput.value = '';
                resetProductVisibility();
                clearSearchSuggestions();
                isSearchActive = false;
                applyProductPreviewLimits();
                if (defaultCategoryId) {
                    setActiveCategory(defaultCategoryId);
                }
            }
        });
    }

    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) {
        document.addEventListener('click', event => {
            if (!event.target.closest('.search-group')) {
                clearSearchSuggestions();
            }
        });
    }

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('dragstart', event => {
            const homepageUrl = window.location.href.split('#')[0];
            event.dataTransfer.setData('text/uri-list', homepageUrl);
            event.dataTransfer.setData('text/plain', homepageUrl);
        });
    }

    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = mobileMenu ? mobileMenu.querySelector('.mobile-menu__overlay') : null;
    const mobileMenuLinks = mobileMenu ? mobileMenu.querySelector('.mobile-menu__links') : null;
    const menuDismissTriggers = mobileMenu ? mobileMenu.querySelectorAll('[data-menu-dismiss]') : [];
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const navToggleOpenLabel = navToggle ? navToggle.getAttribute('aria-label') || 'Open navigation' : 'Open navigation';
    const navToggleCloseLabel = 'Close navigation';
    let lastFocusedTrigger = null;
    let focusableItems = [];

    const MENU_ANIMATION_MS = 360;

    const setMenuState = isOpen => {
        if (!mobileMenu || !navToggle) return;
        navToggle.classList.toggle('is-active', isOpen);
        if (isOpen) {
            mobileMenu.hidden = false;
            requestAnimationFrame(() => {
                mobileMenu.classList.add('is-active');
            });
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', navToggleCloseLabel);
            lastFocusedTrigger = document.activeElement;
            focusableItems = Array.from(mobileMenu.querySelectorAll(focusableSelector));
            const firstFocusable = focusableItems[0];
            if (firstFocusable) {
                firstFocusable.focus();
            }
            document.addEventListener('keydown', handleMenuKeydown, true);
            document.body.classList.add('menu-open');
        } else {
            mobileMenu.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', navToggleOpenLabel);
            document.body.classList.remove('menu-open');
            window.setTimeout(() => {
                mobileMenu.hidden = true;
                if (lastFocusedTrigger) {
                    lastFocusedTrigger.focus();
                } else if (navToggle) {
                    navToggle.focus();
                }
            }, MENU_ANIMATION_MS);
            document.removeEventListener('keydown', handleMenuKeydown, true);
        }
    };

    const handleMenuKeydown = event => {
        if (!mobileMenu || !mobileMenu.classList.contains('is-active')) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            setMenuState(false);
            return;
        }
        if (event.key === 'Tab' && focusableItems.length) {
            const first = focusableItems[0];
            const last = focusableItems[focusableItems.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    };

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('is-active');
            setMenuState(!isOpen);
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => setMenuState(false));
    }

    if (menuDismissTriggers.length) {
        menuDismissTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => setMenuState(false));
        });
    }

    if (mobileMenuLinks) {
        mobileMenuLinks.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (link) {
                setMenuState(false);
                return;
            }
            const cartButton = event.target.closest('.mobile-menu__cart');
            if (cartButton) {
                setMenuState(false);
            }
        });
    }

    const navElement = document.querySelector('nav');
    const getNavOffset = () => {
        if (!navElement) return 0;
        const navPosition = window.getComputedStyle(navElement).position;
        if (navPosition === 'fixed' || navPosition === 'sticky') {
            return navElement.getBoundingClientRect().height + 12;
        }
        return 0;
    };

    document.addEventListener('click', event => {
        if (event.defaultPrevented) return;
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const hash = link.getAttribute('href');
        if (!hash || hash === '#' || hash === '#!' || link.hasAttribute('data-blog-trigger')) {
            return;
        }

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();

        const offset = getNavOffset();
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: 'smooth'
        });

        if (history.pushState) {
            if (window.location.hash !== hash) {
                history.pushState(null, '', hash);
            } else {
                history.replaceState(null, '', hash);
            }
        } else {
            window.location.hash = hash;
        }

        if (mobileMenu && mobileMenu.classList.contains('is-active')) {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('is-active')) {
            setMenuState(false);
        }
    });

    initBlogModal();
    initReviewMarquee();
});