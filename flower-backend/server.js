// ============================================================
// CRAFT BY MIKA — Backend API Server
// Node.js + Express
// PORT: 3000
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// PRODUCTS DATA
// ─────────────────────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: 'Enchanted Flowers',
    price: 999,
    tag: 'SALE',
    rating: 4.8,
    available: true,
    img: 'assets/images/EnchantedFlowers.jpg',
    description: 'A magical bouquet of enchanted blooms that will leave anyone spellbound.'
  },
  {
    id: 2,
    name: 'Purple Lilies',
    price: 449,
    tag: 'NEW',
    rating: 4.5,
    available: true,
    img: 'assets/images/PurpleLilies.jpg',
    description: 'Elegant purple lilies fresh from our garden.'
  },
  {
    id: 3,
    name: 'Lily Bloom',
    price: 899,
    tag: 'NEW',
    rating: 4.7,
    available: true,
    img: 'assets/images/LilyBloom.jpg',
    description: 'A full and gorgeous lily bloom arrangement.'
  },
  {
    id: 4,
    name: 'Rose',
    price: 1000,
    tag: 'NEW',
    rating: 4.9,
    available: true,
    img: 'assets/images/Rose.jpg',
    description: 'Classic red roses, the timeless symbol of love.'
  },
  {
    id: 5,
    name: 'Tangled',
    price: 799,
    tag: 'NEW',
    rating: 4.6,
    available: true,
    img: 'assets/images/Tangled.jpg',
    description: 'A beautifully tangled mix of wildflowers.'
  },
  {
    id: 6,
    name: 'Sunflower',
    price: 399,
    tag: 'SALE',
    rating: 4.4,
    available: true,
    img: 'assets/images/Sunflower.jpg',
    description: 'Bright and cheerful sunflowers to light up any room.'
  },
  {
    id: 7,
    name: 'Blue Lilies',
    price: 499,
    tag: 'SALE',
    rating: 4.7,
    available: true,
    img: 'assets/images/BlueLilies.jpg',
    description: 'Rare and stunning blue lilies for a unique gift.'
  },
  {
    id: 8,
    name: '2BY2 BOUQUET',
    price: 199,
    tag: 'SALE',
    rating: 4.3,
    available: true,
    img: 'assets/images/2by2Bouquet.jpg',
    description: 'A cute 2x2 mini bouquet perfect for small gestures.'
  },
  {
    id: 9,
    name: 'Money BOUQUET',
    price: 399,
    tag: 'NEW',
    rating: 4.6,
    available: true,
    img: 'assets/images/MoneyBouquet.jpg',
    description: 'A creative bouquet arranged with bills — perfect for graduations!'
  },
  {
    id: 10,
    name: 'Chocolate Bouquet',
    price: 299,
    tag: 'SALE',
    rating: 4.5,
    available: true,
    img: 'assets/images/ChocolateBouquet.jpg',
    description: 'Delicious chocolate arranged in a beautiful bouquet.'
  }
];

// ─────────────────────────────────────────────────────────────
// CART (in-memory store)
// ─────────────────────────────────────────────────────────────
let cart = [];

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

// GET /products — return all products
app.get('/products', (req, res) => {
  console.log('[GET] /products — returning', products.length, 'products');
  res.json({ success: true, data: products });
});

// GET /products/:id — return single product
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// GET /cart — return current cart
app.get('/cart', (req, res) => {
  console.log('[GET] /cart — returning', cart.length, 'items');
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({ success: true, data: cart, total });
});

// POST /cart — add item to cart
app.post('/cart', (req, res) => {
  const { productId, name, price, img, quantity = 1 } = req.body;

  if (!productId || !name || price === undefined) {
    return res.status(400).json({ success: false, message: 'productId, name, and price are required' });
  }

  // Check if item already in cart
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    console.log(`[POST] /cart — updated qty for "${name}" → qty: ${existing.quantity}`);
    return res.json({ success: true, message: 'Cart updated', data: existing });
  }

  const cartItem = {
    cartId:    Date.now(),
    productId,
    name,
    price,
    img:       img || '',
    quantity,
    addedAt:   new Date().toISOString()
  };

  cart.push(cartItem);
  console.log(`[POST] /cart — added "${name}" to cart (${cart.length} items total)`);
  res.status(201).json({ success: true, message: 'Item added to cart', data: cartItem });
});

// DELETE /cart/:productId — remove item from cart
app.delete('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const before = cart.length;
  cart = cart.filter(item => item.productId !== productId);
  if (cart.length === before) {
    return res.status(404).json({ success: false, message: 'Item not found in cart' });
  }
  res.json({ success: true, message: 'Item removed from cart' });
});

// DELETE /cart — clear entire cart
app.delete('/cart', (req, res) => {
  cart = [];
  res.json({ success: true, message: 'Cart cleared' });
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🌸  CRAFT BY MIKA — API Server  🌸     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   Running at: http://localhost:${PORT}       ║`);
  console.log('║                                          ║');
  console.log('║   GET  /products                         ║');
  console.log('║   GET  /products/:id                     ║');
  console.log('║   GET  /cart                             ║');
  console.log('║   POST /cart                             ║');
  console.log('║   DELETE /cart/:productId                ║');
  console.log('║   DELETE /cart                           ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});