const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;


app.use(express.json());

const productsRouter = express.Router();
app.use('/api/products', productsRouter);

let products = [
  {
    id: 1,
    title: 'Producto 1',
    description: 'Descripción del producto 1',
    code: 'ABC123',
    price: 20.99,
    status: true,
    stock: 50,
    category: 'Electrónica',
    thumbnails: ['url1', 'url2']
  },

];

productsRouter.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const limitedProducts = limit ? products.slice(0, limit) : products;
  res.json(limitedProducts);
});

productsRouter.get('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});


productsRouter.post('/', (req, res) => {
  const newProduct = {
    id: products.length + 1, 
    ...req.body
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === productId);

  if (index !== -1) {
    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;

    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

productsRouter.delete('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const index = products.findIndex((p) => p.id === productId);

  if (index !== -1) {
    const deletedProduct = products.splice(index, 1);
    res.json(deletedProduct);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});


const cartsRouter = express.Router();
app.use('/api/carts', cartsRouter);

const cartsPath = path.join(__dirname, 'carts.json');


cartsRouter.post('/', (req, res) => {
  const newCart = {
    id: generateUniqueId(),
    products: []
  };

  saveCart(newCart);
  res.status(201).json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const cart = loadCart(cartId);

  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});


cartsRouter.post('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const { productId, quantity } = req.body;

  const cart = loadCart(cartId);

  if (cart) {
    const existingProduct = cart.products.find((p) => p.productId === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    saveCart(cart);
    res.status(201).json(cart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});


function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


function saveCart(cart) {
  fs.writeFileSync(cartsPath, JSON.stringify(cart, null, 2));
}


function loadCart(cartId) {
  try {
    const cartData = fs.readFileSync(cartsPath, 'utf-8');
    const cart = JSON.parse(cartData);
    return cart.id === cartId ? cart : null;
  } catch (error) {
    return null;
  }
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
