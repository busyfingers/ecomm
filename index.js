const express = require('express');
const cookieSession = require('cookie-session');

const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();

app.use(express.static('public'));
// body-parser is deprecated and moved into express since v4.16
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    keys: ['38Hsd981+okljde<tm1xNzf3']
  })
);
app.use(authRouter);
app.use(adminProductsRouter);
app.use(productsRouter);
app.use(cartsRouter);

app.listen(3000, () => {
  console.log('Listening');
});
