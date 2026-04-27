const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── PRODUCTS (in-memory)
let products = [
  { id: 1, name: 'Enchanted Flowers', price: 999, tag: 'SALE', rating: 4.8, available: true, img: 'assets/images/EnchantedFlowers.jpg', description: 'A magical bouquet of enchanted blooms.' },
  { id: 2, name: 'Purple Lilies', price: 449, tag: 'NEW', rating: 4.5, available: true, img: 'assets/images/PurpleLilies.jpg', description: 'Elegant purple lilies fresh from our garden.' },
  { id: 3, name: 'Lily Bloom', price: 899, tag: 'NEW', rating: 4.7, available: true, img: 'assets/images/LilyBloom.jpg', description: 'A full and gorgeous lily bloom arrangement.' },
  { id: 4, name: 'Rose', price: 1000, tag: 'NEW', rating: 4.9, available: true, img: 'assets/images/Rose.jpg', description: 'Classic red roses, the timeless symbol of love.' },
  { id: 5, name: 'Tangled', price: 799, tag: 'NEW', rating: 4.6, available: true, img: 'assets/images/Tangled.jpg', description: 'A beautifully tangled mix of wildflowers.' },
  { id: 6, name: 'Sunflower', price: 399, tag: 'SALE', rating: 4.4, available: true, img: 'assets/images/Sunflower.jpg', description: 'Bright and cheerful sunflowers.' },
  { id: 7, name: 'Blue Lilies', price: 499, tag: 'SALE', rating: 4.7, available: true, img: 'assets/images/BlueLilies.jpg', description: 'Rare and stunning blue lilies.' },
  { id: 8, name: '2BY2 BOUQUET', price: 199, tag: 'SALE', rating: 4.3, available: true, img: 'assets/images/2by2Bouquet.jpg', description: 'A cute 2x2 mini bouquet.' },
  { id: 9, name: 'Money BOUQUET', price: 399, tag: 'NEW', rating: 4.6, available: true, img: 'assets/images/MoneyBouquet.jpg', description: 'A creative bouquet with bills.' },
  { id: 10, name: 'Chocolate Bouquet', price: 299, tag: 'SALE', rating: 4.5, available: true, img: 'assets/images/ChocolateBouquet.jpg', description: 'Delicious chocolate in a bouquet.' }
];

// ── CART & ORDERS (in-memory)
let cart   = [];
let orders = [];

// ── ROUTES

// Health check
app.get('/', (req, res) => res.json({ status: 'Craft by Mika API is running!' }));

// Products
app.get('/products', (req, res) => res.json({ success: true, data: products }));
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: product });
});
app.post('/products', (req, res) => {
  const product = { id: Date.now(), ...req.body };
  products.push(product);
  res.status(201).json({ success: true, data: product });
});
app.put('/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json({ success: true, data: products[idx] });
});
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true, message: 'Deleted' });
});

// Cart
app.get('/cart', (req, res) => res.json({ success: true, data: cart }));
app.post('/cart', (req, res) => {
  const { productId, name, price, img, quantity = 1 } = req.body;
  const existing = cart.find(i => i.productId === productId);
  if (existing) { existing.quantity += quantity; return res.json({ success: true, data: existing }); }
  const item = { cartId: Date.now(), productId, name, price, img: img || '', quantity };
  cart.push(item);
  res.status(201).json({ success: true, data: item });
});
app.delete('/cart/:productId', (req, res) => {
  cart = cart.filter(i => i.productId !== parseInt(req.params.productId));
  res.json({ success: true, message: 'Removed' });
});
app.delete('/cart', (req, res) => { cart = []; res.json({ success: true, message: 'Cleared' }); });

// Orders
app.get('/orders', (req, res) => res.json({ success: true, data: orders }));
app.post('/orders', (req, res) => {
  const order = { id: Date.now(), orderDate: new Date().toISOString(), status: 'pending', ...req.body };
  orders.push(order);
  res.status(201).json({ success: true, data: order });
});
app.put('/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  orders[idx] = { ...orders[idx], ...req.body };
  res.json({ success: true, data: orders[idx] });
});

// ── START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Craft by Mika API running on port ${PORT}`));