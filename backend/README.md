# Sweet Delights Bakery - Backend API

A simple Node.js/Express REST API server for the Sweet Delights Bakery website. This backend provides endpoints for managing products, orders, contact form submissions, and admin authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start at `http://localhost:3000`

## 📚 API Endpoints

### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products?category=cakes` | Filter products by category |
| GET | `/api/products?search=chocolate` | Search products |
| GET | `/api/products/:id` | Get single product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

#### Create Product Request Body
```json
{
  "name": "Chocolate Cake",
  "description": "Rich chocolate cake",
  "price": 1200,
  "category": "cakes",
  "image": "assets/chocolate-cake.jpg",
  "available": true
}
```

### Orders API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders?status=pending` | Filter by status |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |

#### Create Order Request Body
```json
{
  "items": [
    { "name": "Red Velvet Cake", "price": 1200, "quantity": 1 },
    { "name": "Croissant", "price": 120, "quantity": 2 }
  ],
  "customerName": "John Doe",
  "address": "123 Main Street, Mumbai",
  "phone": "9876543210",
  "email": "john@example.com",
  "notes": "Please deliver after 5 PM"
}
```

#### Order Status Values
- `pending` - New order received
- `processing` - Order being prepared
- `ready` - Ready for pickup/delivery
- `completed` - Order delivered
- `cancelled` - Order cancelled

### Contact Form API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact` | Get all submissions (admin) |

#### Contact Form Request Body
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "subject": "Custom Cake Inquiry",
  "message": "I would like to order a custom birthday cake..."
}
```

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |

#### Login Request Body
```json
{
  "username": "admin",
  "password": "demo123"
}
```

**Demo Credentials:**
- Username: `admin`
- Password: `demo123`

### Dashboard Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |

Returns:
```json
{
  "success": true,
  "data": {
    "totalProducts": 13,
    "totalOrders": 3,
    "todayOrders": 2,
    "pendingOrders": 1,
    "completedOrders": 1,
    "totalRevenue": 4760,
    "todayRevenue": 3080,
    "unreadContacts": 0
  }
}
```

## 📁 Project Structure

```
backend/
├── server.js          # Main application entry point
├── package.json       # Dependencies and scripts
├── data/
│   ├── products.json  # Products database
│   ├── orders.json    # Orders database
│   └── contacts.json  # Contact submissions
└── README.md          # This file
```

## 🗄️ Data Storage

This backend uses JSON files for data persistence (located in the `data/` directory). For production use, consider migrating to a proper database like MongoDB, PostgreSQL, or MySQL.

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |

### CORS

CORS is enabled by default to allow requests from any origin. For production, configure specific origins:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## 📝 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### List Response
```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

## 🧪 Testing with cURL

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cake","price":500,"category":"cakes"}'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"Cake","price":500,"quantity":1}],"address":"Mumbai","phone":"1234567890"}'
```

### Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}'
```

## 🔒 Security Notes

This is a demo backend and should not be used in production without:

1. **Proper Authentication**: Implement JWT tokens or session-based auth
2. **Input Validation**: Add comprehensive input sanitization
3. **Rate Limiting**: Prevent abuse with rate limiting
4. **HTTPS**: Use SSL/TLS in production
5. **Database**: Replace JSON files with a proper database
6. **Environment Variables**: Store secrets in environment variables
7. **Logging**: Add proper logging and monitoring

## 📄 License

MIT License - See the main project LICENSE file for details.

## 👨‍💻 Author

Sweet Delights Bakery Team

---

For questions or issues, please open an issue in the main project repository.
