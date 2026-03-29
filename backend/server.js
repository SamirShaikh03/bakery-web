/**
 * Sweet Delights Bakery - Backend API Server
 * 
 * A simple Express.js server providing REST APIs for:
 * - Products catalog (CRUD operations)
 * - Orders management
 * - Contact form submissions
 * - Admin authentication
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

// In-memory customer sessions for demo purposes
const CUSTOMER_SESSIONS = new Map();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions for file operations
function readJsonFile(filePath, defaultValue = []) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

function normalizeEmail(email = '') {
    return String(email).trim().toLowerCase();
}

function createPasswordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash = '') {
    const [salt, expectedHash] = String(storedHash).split(':');
    if (!salt || !expectedHash) {
        return false;
    }
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    if (expectedHash.length !== computedHash.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(computedHash, 'hex'));
}

function getCustomerPublicProfile(customer) {
    return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        createdAt: customer.createdAt,
        lastLoginAt: customer.lastLoginAt || null
    };
}

function extractCustomerToken(req) {
    const authorization = req.headers.authorization || '';
    if (authorization.startsWith('Bearer ')) {
        return authorization.slice(7).trim();
    }
    const headerToken = req.headers['x-customer-token'];
    return headerToken ? String(headerToken).trim() : '';
}

function getAuthenticatedCustomer(req) {
    const token = extractCustomerToken(req);
    if (!token) {
        return null;
    }
    const customerId = CUSTOMER_SESSIONS.get(token);
    if (!customerId) {
        return null;
    }
    const customers = readJsonFile(CUSTOMERS_FILE);
    return customers.find(c => c.id === customerId) || null;
}

// =============================================
// PRODUCTS API
// =============================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

// GET all products
app.get('/api/products', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const { category, search } = req.query;
    
    let filteredProducts = products;
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
    }
    
    res.json({
        success: true,
        count: filteredProducts.length,
        data: filteredProducts
    });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    res.json({
        success: true,
        data: product
    });
});

// POST create new product
app.post('/api/products', (req, res) => {
    const { name, description, price, category, image, available = true } = req.body;
    
    if (!name || !price || !category) {
        return res.status(400).json({
            success: false,
            error: 'Name, price, and category are required'
        });
    }
    
    const products = readJsonFile(PRODUCTS_FILE);
    
    const newProduct = {
        id: uuidv4(),
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        image: image || 'assets/placeholder.jpg',
        available,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    const updatedProduct = {
        ...products[index],
        ...req.body,
        id: products[index].id,
        updatedAt: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    writeJsonFile(PRODUCTS_FILE, products);
    
    res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
    });
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    const deleted = products.splice(index, 1)[0];
    writeJsonFile(PRODUCTS_FILE, products);
    
    res.json({
        success: true,
        message: 'Product deleted successfully',
        data: deleted
    });
});

// =============================================
// ORDERS API
// =============================================

// GET all orders
app.get('/api/orders', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const { status, date } = req.query;
    
    let filteredOrders = orders;
    
    if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    
    if (date) {
        filteredOrders = filteredOrders.filter(o => 
            o.createdAt.startsWith(date)
        );
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
        success: true,
        count: filteredOrders.length,
        data: filteredOrders
    });
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const order = orders.find(o => o.id === req.params.id);
    
    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    res.json({
        success: true,
        data: order
    });
});

// POST create new order
app.post('/api/orders', (req, res) => {
    const { items, customerName, address, phone, email, notes } = req.body;
    const authenticatedCustomer = getAuthenticatedCustomer(req);

    const finalCustomerName = customerName || (authenticatedCustomer ? authenticatedCustomer.name : 'Guest');
    const finalAddress = address || (authenticatedCustomer ? authenticatedCustomer.address : '');
    const finalPhone = phone || (authenticatedCustomer ? authenticatedCustomer.phone : '');
    const finalEmail = email || (authenticatedCustomer ? authenticatedCustomer.email : '');

    console.log('📥 Incoming order payload:', {
        itemCount: Array.isArray(items) ? items.length : 0,
        customerName: finalCustomerName,
        phone: finalPhone,
        hasAddress: Boolean(finalAddress),
        isAuthenticated: Boolean(authenticatedCustomer)
    });
    
    if (!items || !items.length || !finalAddress || !finalPhone) {
        return res.status(400).json({
            success: false,
            error: 'Items, address, and phone are required'
        });
    }
    
    const orders = readJsonFile(ORDERS_FILE);
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        items,
        customerId: authenticatedCustomer ? authenticatedCustomer.id : null,
        customerName: finalCustomerName,
        address: finalAddress,
        phone: finalPhone,
        email: finalEmail,
        notes: notes || '',
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeJsonFile(ORDERS_FILE, orders);

    console.log('✅ Order stored successfully:', {
        id: newOrder.id,
        total: newOrder.total,
        status: newOrder.status,
        createdAt: newOrder.createdAt
    });
    
    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder
    });
});

// PUT update order status
app.put('/api/orders/:id', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    const updatedOrder = {
        ...orders[index],
        ...req.body,
        id: orders[index].id,
        updatedAt: new Date().toISOString()
    };
    
    orders[index] = updatedOrder;
    writeJsonFile(ORDERS_FILE, orders);
    
    res.json({
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder
    });
});

// DELETE order
app.delete('/api/orders/:id', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    const deleted = orders.splice(index, 1)[0];
    writeJsonFile(ORDERS_FILE, orders);
    
    res.json({
        success: true,
        message: 'Order deleted successfully',
        data: deleted
    });
});

// =============================================
// CONTACT FORM API
// =============================================

// POST contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message, subject } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required'
        });
    }
    
    const contacts = readJsonFile(CONTACTS_FILE);
    
    const newContact = {
        id: uuidv4(),
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Inquiry',
        message,
        status: 'unread',
        createdAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    writeJsonFile(CONTACTS_FILE, contacts);
    
    res.status(201).json({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: { id: newContact.id }
    });
});

// GET all contact submissions (for admin)
app.get('/api/contact', (req, res) => {
    const contacts = readJsonFile(CONTACTS_FILE);
    
    // Sort by date (newest first)
    contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
        success: true,
        count: contacts.length,
        data: contacts
    });
});

// =============================================
// ADMIN AUTHENTICATION
// =============================================

// =============================================
// CUSTOMER AUTHENTICATION
// =============================================

app.post('/api/customer-auth/signup', (req, res) => {
    const { name, email, password, phone = '', address = '' } = req.body;

    const sanitizedName = String(name || '').trim();
    const sanitizedEmail = normalizeEmail(email);
    const sanitizedPassword = String(password || '');

    if (!sanitizedName || !sanitizedEmail || !sanitizedPassword) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and password are required'
        });
    }

    if (sanitizedPassword.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
        });
    }

    const customers = readJsonFile(CUSTOMERS_FILE);
    const alreadyExists = customers.some(customer => normalizeEmail(customer.email) === sanitizedEmail);

    if (alreadyExists) {
        return res.status(409).json({
            success: false,
            error: 'An account with this email already exists'
        });
    }

    const newCustomer = {
        id: `CUS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        name: sanitizedName,
        email: sanitizedEmail,
        phone: String(phone || '').trim(),
        address: String(address || '').trim(),
        passwordHash: createPasswordHash(sanitizedPassword),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    writeJsonFile(CUSTOMERS_FILE, customers);

    const token = `cust_${Date.now()}_${crypto.randomBytes(12).toString('hex')}`;
    CUSTOMER_SESSIONS.set(token, newCustomer.id);

    res.status(201).json({
        success: true,
        message: 'Signup successful',
        data: {
            token,
            customer: getCustomerPublicProfile(newCustomer),
            expiresIn: '24h'
        }
    });
});

app.post('/api/customer-auth/login', (req, res) => {
    const { email, password } = req.body;

    const sanitizedEmail = normalizeEmail(email);
    const sanitizedPassword = String(password || '');

    if (!sanitizedEmail || !sanitizedPassword) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }

    const customers = readJsonFile(CUSTOMERS_FILE);
    const customerIndex = customers.findIndex(c => normalizeEmail(c.email) === sanitizedEmail);

    if (customerIndex === -1 || !verifyPassword(sanitizedPassword, customers[customerIndex].passwordHash)) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }

    customers[customerIndex].lastLoginAt = new Date().toISOString();
    customers[customerIndex].updatedAt = new Date().toISOString();
    writeJsonFile(CUSTOMERS_FILE, customers);

    const token = `cust_${Date.now()}_${crypto.randomBytes(12).toString('hex')}`;
    CUSTOMER_SESSIONS.set(token, customers[customerIndex].id);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            token,
            customer: getCustomerPublicProfile(customers[customerIndex]),
            expiresIn: '24h'
        }
    });
});

app.get('/api/customer-auth/me', (req, res) => {
    const customer = getAuthenticatedCustomer(req);
    if (!customer) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized customer session'
        });
    }

    res.json({
        success: true,
        data: getCustomerPublicProfile(customer)
    });
});

app.post('/api/customer-auth/logout', (req, res) => {
    const token = extractCustomerToken(req);
    if (token) {
        CUSTOMER_SESSIONS.delete(token);
    }

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Demo credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'demo123'
};

// POST admin login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required'
        });
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Generate a simple session token (in production, use JWT or proper sessions)
        const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                username,
                expiresIn: '24h'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// =============================================
// DASHBOARD STATISTICS
// =============================================

// GET dashboard stats
app.get('/api/stats', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const products = readJsonFile(PRODUCTS_FILE);
    const contacts = readJsonFile(CONTACTS_FILE);
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    res.json({
        success: true,
        data: {
            totalProducts: products.length,
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            pendingOrders,
            completedOrders,
            totalRevenue,
            todayRevenue,
            unreadContacts: contacts.filter(c => c.status === 'unread').length
        }
    });
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🍰 Sweet Delights Bakery API Server                        ║
║                                                               ║
║   Server running at: http://localhost:${PORT}                   ║
║                                                               ║
║   API Endpoints:                                              ║
║   • GET/POST/PUT/DELETE  /api/products                        ║
║   • GET/POST/PUT/DELETE  /api/orders                          ║
║   • GET/POST             /api/contact                         ║
║   • POST                 /api/customer-auth/signup            ║
║   • POST                 /api/customer-auth/login             ║
║   • GET                  /api/customer-auth/me                ║
║   • POST                 /api/customer-auth/logout            ║
║   • POST                 /api/auth/login                      ║
║   • GET                  /api/stats                           ║
║   • GET                  /api/health                          ║
║                                                               ║
║   Demo Admin: username=admin, password=demo123                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
