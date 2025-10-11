let cart = [];
let activeBlogTrigger = null;

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
    cartSection.classList.add('show');
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
    document.getElementById('cart-section').classList.remove('show');
}

function clearCart() {
    cart = [];
    showCart();
}

function checkout() {
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
    const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order object
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total: total,
        address: address,
        phone: phone
    };

    // Save to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show confirmation
    alert(`Order placed successfully!\nOrder ID: ${orderId}\nAddress: ${address}\nPhone: ${phone}\nItems: ${cart.map(item => `${item.name} (x${item.quantity})`).join(', ')}\nTotal: ₹${total.toFixed(2)}`);

    // Clear cart and form
    cart = [];
    document.getElementById('address').value = '';
    document.getElementById('phone').value = '';
    showCart();
    hideCart();
}

// Function to handle order button click and open cart
function order(itemName) {
    addToCart(itemName, 0, 1); // Placeholder price, update with actual logic if needed
    showCart();
}

// Add at the end of your JavaScript file

// Search Functionality
function searchProducts() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const products = document.querySelectorAll('.product');
    
    products.forEach(product => {
        const title = product.querySelector('h3').textContent.toLowerCase();
        product.style.display = title.includes(searchInput) ? 'block' : 'none';
    });
}

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
function buildCake() {
    const size = document.getElementById('cake-size');
    const flavor = document.getElementById('cake-flavor');
    const message = document.getElementById('cake-message');
    const result = document.getElementById('cake-result');

    if (!size || !flavor || !result) return;

    const selectedSize = size.value;
    const selectedFlavor = flavor.value;

    if (!selectedSize || !selectedFlavor) {
        result.textContent = 'Please choose both a cake size and flavor to see pricing.';
        result.classList.add('is-error');
        return;
    }

    let basePrice = 0;
    switch (selectedSize) {
        case '6 inch':
            basePrice = 720;
            break;
        case '8 inch':
            basePrice = 1040;
            break;
        case '10 inch':
            basePrice = 1460;
            break;
        default:
            basePrice = 0;
    }

    const flavorPremium = {
        Chocolate: 120,
        Vanilla: 80,
        'Red Velvet': 160
    };

    let totalPrice = basePrice + (flavorPremium[selectedFlavor] || 0);

    if (message && message.value.trim().length > 24) {
        totalPrice += 120;
    }

    result.textContent = `Estimated price: ₹${totalPrice.toLocaleString('en-IN')} (includes custom décor)`;
    result.classList.remove('is-error');
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
        const pixelsPerSecond = 52;
        const trackWidth = track.scrollWidth;
        const duration = Math.max(26, trackWidth / pixelsPerSecond);
        track.style.setProperty('--review-speed', `${duration}s`);
        track.style.setProperty('--review-speed-mobile', `${Math.max(duration + 8, 34)}s`);
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

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            searchProducts();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
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
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const navToggleOpenLabel = navToggle ? navToggle.getAttribute('aria-label') || 'Open navigation' : 'Open navigation';
    const navToggleCloseLabel = 'Close navigation';
    let lastFocusedTrigger = null;
    let focusableItems = [];

    const MENU_ANIMATION_MS = 280;

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

    if (mobileMenuLinks) {
        mobileMenuLinks.addEventListener('click', event => {
            const target = event.target;
            if (target && (target.closest('a') || target.closest('button'))) {
                setMenuState(false);
            }
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('is-active')) {
            setMenuState(false);
        }
    });

    initBlogModal();
    initReviewMarquee();
});