# Sweet Delights Bakery

![Bakery Banner](assets/banner-img.png)

A modern, responsive bakery website featuring an elegant product catalog, interactive shopping cart, custom cake builder, blog section, admin portal, and backend API. Built with vanilla HTML, CSS, and JavaScript for optimal performance and accessibility.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache2.0-yellow.svg)](LICENSE)
![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?logo=node.js&logoColor=white)

---

## Features

### Core Functionality
- **Dynamic Product Catalog** – Browse 40+ bakery items across categories (cakes, pastries, cookies, breads, desserts, beverages)
- **Interactive Shopping Cart** – Add, remove, and adjust quantities (max 3 per item) with live total calculation
- **Real-time Search** – Instant product filtering with category-aware search and live suggestions
- **Order Tracking** – Track your order status with order ID lookup
- **Custom Cake Builder** – Interactive form to design personalized cakes (flavor, size, frosting, toppings, message)

### Admin Portal
- **Secure Login** – Session-based authentication with demo credentials
- **Demo Access** – Username: `admin` | Password: `demo123`
- **Dashboard** – View orders, manage products, and track statistics
- **Quick Access** – Admin portal button conveniently located below the navbar

### User Experience
- **Responsive Design** – Mobile-first approach with hamburger navigation, optimized layouts for phones, tablets, and desktops
- **Beautiful Animations** – Smooth transitions, hover effects, and scroll animations
- **Green Theme** – Elegant green gradient navbar and footer design
- **Accessible Navigation** – ARIA-compliant mobile menu with focus trap, keyboard navigation (ESC to close), and screen-reader support
- **Hero Section** – Eye-catching landing with bakery highlights, CTAs, and featured product card
- **Seasonal Offers** – Rotating promotional banners with special discounts
- **Customer Reviews** – Testimonial section showcasing customer feedback

### Content & Engagement
- **Blog Section** – Modal-based blog posts with baking tips, recipes, and stories
- **About Section** – Company history, founders, and values
- **Location Finder** – Embedded Google Maps for store locations
- **Contact Form** – Email, phone, and social media links
- **Draggable Logo** – Fun interactive logo element

### Technical Highlights
- **Vanilla JS** – No frameworks, lightweight, and fast
- **CSS Grid & Flexbox** – Modern layout system with mobile breakpoints
- **CSS Animations** – Custom keyframe animations (slideIn, fadeIn, pulse, glow)
- **Font Awesome Icons** – Scalable vector icons throughout
- **Smooth Scroll** – Native `scroll-behavior: smooth` for anchor links
- **LocalStorage** – Cart and order persistence
- **Backend API** – Node.js/Express REST API for products, orders, and authentication

---

## Live Demo

```
https://samirshaikh03.github.io/bakery-web/
```

---

## Screenshots

### Desktop View
![Desktop Hero](assets/desktop-view.png)
*Elegant hero section with featured product and CTAs*

### Custom Cake Builder
![Cake Builder](assets/cake-builder.png)
*Interactive form to design personalized cakes*

### Admin Portal
![Admin Portal](assets/admin-portal.png)
*Powerful back‑office interface for managing products, orders, customers, and site content.*

---

## Tech Stack

------------------------------------------------------------------------------
|         Technology          |                   Purpose                    |
|-----------------------------|----------------------------------------------|
| **HTML5**                   | Semantic markup with ARIA roles              |
| **CSS3**                    | Custom properties, Grid, Flexbox, animations |
| **JavaScript (ES6+)**       | DOM manipulation, event handling, cart logic |
| **Node.js/Express**         | Backend REST API server                      |
| **Font Awesome 6.6.0**      | Icon library                                 |
| **Google Fonts (Georgia)**  | Typography                                   |
------------------------------------------------------------------------------

---

## Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 16+ (for backend)
- (Optional) A local server for testing (VS Code Live Server, Python HTTP server, etc.)

### Frontend Only
Simply open `index.html` in your browser or use a local server.

### With Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The API server will run at `http://localhost:3000`

---

## Project Structure

```
Bakery_Website/
├── index.html                     # Main HTML file
├── admin.html                     # Admin portal with login
├── css/
│   ├── bakery.css                 # Main styles (4000+ lines)
│   └── admin.css                  # Admin dashboard styles
├── js/
│   └── bakery.js                  # Core functionality (1100+ lines)
├── backend/                       # Node.js API server
│   ├── server.js                  # Express server
│   ├── package.json               # Dependencies
│   ├── README.md                  # API documentation
│   └── data/                      # JSON data storage
│       ├── products.json          # Products database
│       ├── orders.json            # Orders database
│       └── contacts.json          # Contact submissions
├── assets/                        # Product images, logos, icons
│   ├── Sweet_Delight_logo.png
│   ├── Sweet_Delight_icon.png
│   ├── Chocolate_cake.webp
│   └── ... (40+ product images)
├── LICENSE                        # Apache 2.0 License
├── README.md                      # Project documentation
└── .gitignore                     # Git ignore rules
```

---

## Usage Guide

### For Customers

1. **Browse Products**
   - Scroll to the "Our Products" section or click `Products` in the nav
   - Use the search bar to filter items by name or category

2. **Add to Cart**
   - Click `Order Now` on any product
   - Adjust quantities using `+` / `-` buttons (max 3 per item)
   - View cart total and proceed to checkout

3. **Design a Custom Cake**
   - Click `Design a Custom Cake` in the hero section
   - Select flavor, size, frosting, toppings, and add a message
   - Submit the form to receive a quote

4. **Track Orders**
   - Enter your order ID in the "Track Your Order" section
   - View real-time status updates

5. **Read Blog Posts**
   - Scroll to the "From Our Kitchen" blog section
   - Click on any post to open the modal reader

### For Developers

- **Cart Logic:** See `addToCart()`, `updateQuantity()`, `showCart()` in `js/bakery.js`
- **Search:** `searchProducts()` filters products by name and category attributes
- **Mobile Menu:** `setMenuState()` manages focus trap, ESC handling, and ARIA states
- **Custom Cake Form:** `submitCakeOrder()` captures form data (extend for backend API)

---

## Features Roadmap

- [x] Backend integration (Node.js/Express)
- [x] Admin dashboard for product/order management
- [x] Beautiful animations and effects
- [x] User authentication (login/signup for customers)
- [ ] Payment gateway (Stripe, Razorpay)
- [ ] Email notifications for orders
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA) features
- [ ] Database integration (MongoDB/PostgreSQL)

---

## 🖥️ Backend API

The backend provides REST APIs for managing the bakery's operations:

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/products` | GET, POST, PUT, DELETE | Product catalog CRUD |
| `/api/orders` | GET, POST, PUT, DELETE | Order management |
| `/api/contact` | GET, POST | Contact form submissions |
| `/api/customer-auth/signup` | POST | Customer signup |
| `/api/customer-auth/login` | POST | Customer login |
| `/api/customer-auth/me` | GET | Get logged-in customer profile |
| `/api/customer-auth/logout` | POST | Customer logout |
| `/api/auth/login` | POST | Admin authentication |
| `/api/stats` | GET | Dashboard statistics |

### Demo Credentials
- **Username:** `admin`
- **Password:** `demo123`

For detailed API documentation, see [backend/README.md](backend/README.md)

---

---

## Bug Reports & Feature Requests

Found a bug or have a feature idea?

1. Check [existing issues](https://github.com/your-username/Bakery_Website/issues)
2. If not found, [open a new issue](https://github.com/SamirShaikh03/Bakery_Website/issues/new)
3. Include:
   - Browser/OS version
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)

---

## License

This project is licensed under the **Apache 2.0 License** – see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this project freely, just keep the copyright notice.

---

## Acknowledgments

- **Font Awesome** – Icon library ([fontawesome.com](https://fontawesome.com))
- **Google Fonts** – Typography
- **Unsplash / Pexels** – Product imagery inspiration (replace with actual credits if using specific images)
- **Community** – Thanks to all contributors and users!

---

## Project Stats

- **Lines of Code:** ~10,000+
- **Product Images:** 40+
- **Categories:** 6 (Cakes, Pastries, Breads, Savory, Desserts, Beverages)
- **Responsive Breakpoints:** 900px, 768px, 600px, 480px
- **CSS Animations:** 10+ custom keyframe animations
- **API Endpoints:** 5 main routes with full CRUD support

---

<div align="center">

**Made with ❤️ and 🍰 by Samir Shaikh **

⭐ Star this repo if you found it helpful!

[Report Bug](https://github.com/samirshaikh03/Bakery_Website/issues) · [Request Feature](https://github.com/samirshaikh03/Bakery_Website/issues) · [View Demo](https://samirshaikh03.github.io/Bakery_Website/)

</div>
