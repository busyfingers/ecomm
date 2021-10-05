const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

router.post('/cart/products', async (req, res) => {
  let cart;

  if (!req.session.cartId) {
    cart = await createCart({
      items: [{ id: req.body.productId, quantity: 1 }]
    });
    req.session.cartId = cart._id.toString();
  } else {
    cart = await ensureCart(req);

    const existingItem = cart.items.find(
      item => item.id === req.body.productId
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    await cartsRepo.update(req.session.cartId, {
      items: cart.items
    });
  }
  res.redirect('/cart');
});

router.get('/cart', async (req, res) => {
  let cart;

  if (!req.session.cartId) {
    cart = await initCart(req);
  } else {
    cart = await ensureCart(req, true);
  }

  for (let item of cart.items) {
    item.product = await productsRepo.getOne(item.id);
  }

  res.send(cartShowTemplate({ items: cart.items || [] }));
});

router.post('/cart/products/delete', async (req, res) => {
  const idToRemove = req.body.itemId;

  if (!idToRemove || !req.session.cartId) {
    return res.redirect('/cart');
  }

  const cart = await cartsRepo.getOne(req.session.cartId);
  cart.items = cart.items.filter(item => item.id !== idToRemove);
  await cartsRepo.update(req.session.cartId, { items: cart.items });

  res.redirect('/cart');
});

router.post('/cart/products/edit', async (req, res) => {
  const idToEdit = req.body.itemId;

  if (!idToEdit || !req.session.cartId) {
    return res.redirect('/cart');
  }

  const cart = await cartsRepo.getOne(req.session.cartId);
  const item = cart.items.find(item => item.id === idToEdit);

  if (item) {
    item.quantity = parseInt(req.body.quantity) || item.quantity;
    await cartsRepo.update(req.session.cartId, { items: cart.items });
  }

  res.redirect('/cart');
});

ensureCart = async (req, empty) => {
  let cart = await cartsRepo.getOne(req.session.cartId);

  if (!cart) {
    const content = empty
      ? { items: [] }
      : {
          items: [{ id: req.body.productId, quantity: 1 }]
        };
    cart = await createCart(content);
    req.session.cartId = cart._id.toString();
  }

  return cart;
};

createCart = async content => {
  return await cartsRepo.create(content);
};

initCart = async req => {
  const cart = await createCart({ items: [] });
  req.session.cartId = cart._id.toString();

  return cart;
};

module.exports = router;
