const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const app     = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ── INIT TABLES
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT, price INTEGER, tag TEXT,
      rating REAL, available BOOLEAN,
      img TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS cart (
      cart_id BIGINT PRIMARY KEY,
      product_id INTEGER, name TEXT,
      price INTEGER, img TEXT, quantity INTEGER
    );
    CREATE TABLE IF NOT EXISTS orders (
      id BIGINT PRIMARY KEY,
      order_date TEXT, status TEXT,
      items TEXT, total REAL,
      customer_name TEXT, address TEXT
    );
  `);

  // Seed products if empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(rows[0].count) === 0) {
    const defaultProducts = [
      { name: 'Enchanted Flowers', price: 999, tag: 'SALE', rating: 4.8, available: true, img: 'assets/images/EnchantedFlowers.jpg', description: 'A magical bouquet of enchanted blooms.' },
      { name: 'Purple Lilies', price: 449, tag: 'NEW', rating: 4.5, available: true, img: 'assets/images/PurpleLilies.jpg', description: 'Elegant purple lilies fresh from our garden.' },
      { name: 'Lily Bloom', price: 899, tag: 'NEW', rating: 4.7, available: true, img: 'assets/images/LilyBloom.jpg', description: 'A full and gorgeous lily bloom arrangement.' },
      { name: 'Rose', price: 1000, tag: 'NEW', rating: 4.9, available: true, img: 'assets/images/Rose.jpg', description: 'Classic red roses, the timeless symbol of love.' },
      { name: 'Tangled', price: 799, tag: 'NEW', rating: 4.6, available: true, img: 'assets/images/Tangled.jpg', description: 'A beautifully tangled mix of wildflowers.' },
      { name: 'Sunflower', price: 399, tag: 'SALE', rating: 4.4, available: true, img: 'assets/images/Sunflower.jpg', description: 'Bright and cheerful sunflowers.' },
      { name: 'Blue Lilies', price: 499, tag: 'SALE', rating: 4.7, available: true, img: 'assets/images/BlueLilies.jpg', description: 'Rare and stunning blue lilies.' },
      { name: '2BY2 BOUQUET', price: 199, tag: 'SALE', rating: 4.3, available: true, img: 'assets/images/2by2Bouquet.jpg', description: 'A cute 2x2 mini bouquet.' },
      { name: 'Money BOUQUET', price: 399, tag: 'NEW', rating: 4.6, available: true, img: 'assets/images/MoneyBouquet.jpg', description: 'A creative bouquet with bills.' },
      { name: 'Chocolate Bouquet', price: 299, tag: 'SALE', rating: 4.5, available: true, img: 'assets/images/ChocolateBouquet.jpg', description: 'Delicious chocolate in a bouquet.' }
    ];
    for (const p of defaultProducts) {
      await pool.query(
        'INSERT INTO products (name, price, tag, rating, available, img, description) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [p.name, p.price, p.tag, p.rating, p.available, p.img, p.description]
      );
    }
  }
}

initDB().catch(console.error);

// ── HEALTH CHECK
app.get('/', (req, res) => res.json({ status: 'Craft by Mika API is running!' }));

// ── PRODUCTS
app.get('/products', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products');
  res.json({ success: true, data: rows });
});
app.get('/products/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: rows[0] });
});
app.post('/products', async (req, res) => {
  const { name, price, tag, rating, available, img, description } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO products (name,price,tag,rating,available,img,description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [name, price, tag, rating, available, img, description]
  );
  res.status(201).json({ success: true, data: rows[0] });
});
app.put('/products/:id', async (req, res) => {
  const { name, price, tag, rating, available, img, description } = req.body;
  const { rows } = await pool.query(
    'UPDATE products SET name=$1,price=$2,tag=$3,rating=$4,available=$5,img=$6,description=$7 WHERE id=$8 RETURNING *',
    [name, price, tag, rating, available, img, description, req.params.id]
  );
  res.json({ success: true, data: rows[0] });
});
app.delete('/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
  res.json({ success: true, message: 'Deleted' });
});

// ── CART
app.get('/cart', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM cart');
  res.json({ success: true, data: rows });
});
app.post('/cart', async (req, res) => {
  const { productId, name, price, img, quantity = 1 } = req.body;
  const existing = await pool.query('SELECT * FROM cart WHERE product_id=$1', [productId]);
  if (existing.rows[0]) {
    const updated = await pool.query(
      'UPDATE cart SET quantity=quantity+$1 WHERE product_id=$2 RETURNING *',
      [quantity, productId]
    );
    return res.json({ success: true, data: updated.rows[0] });
  }
  const { rows } = await pool.query(
    'INSERT INTO cart (cart_id,product_id,name,price,img,quantity) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [Date.now(), productId, name, price, img || '', quantity]
  );
  res.status(201).json({ success: true, data: rows[0] });
});
app.delete('/cart/:productId', async (req, res) => {
  await pool.query('DELETE FROM cart WHERE product_id=$1', [req.params.productId]);
  res.json({ success: true, message: 'Removed' });
});
app.delete('/cart', async (req, res) => {
  await pool.query('DELETE FROM cart');
  res.json({ success: true, message: 'Cleared' });
});

// ── ORDERS
app.get('/orders', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders');
  res.json({ success: true, data: rows });
});
app.post('/orders', async (req, res) => {
  const { items, total, customer_name, address } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO orders (id,order_date,status,items,total,customer_name,address) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [Date.now(), new Date().toISOString(), 'pending', JSON.stringify(items), total, customer_name, address]
  );
  res.status(201).json({ success: true, data: rows[0] });
});
app.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  const { rows } = await pool.query(
    'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  res.json({ success: true, data: rows[0] });
});

// ── START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Craft by Mika API running on port ${PORT}`));