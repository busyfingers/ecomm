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
    req.session.cartId = cart.id;
  } else {
    cart = await cartsRepo.getOne(req.session.cartId);

    const existingItem = cart.items.find(
      item => item.id === req.body.productId
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    await cartsRepo.update(cart.id, {
      items: cart.items
    });
  }

  res.redirect('/cart');
});

router.get('/cart', async (req, res) => {
  let cart;

  if (!req.session.cartId) {
    cart = await createCart({ items: [] });
    req.session.cartId = cart.id;
  }

  cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    item.product = await productsRepo.getOne(item.id);
  }

  res.send(cartShowTemplate({ items: cart.items }));
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

createCart = async content => {
  return await cartsRepo.create(content);
};

module.exports = router;
