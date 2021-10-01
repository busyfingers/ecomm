const express = require('express');
const multer = require('multer');
const csrf = require('csurf');

const { handleErrors, requireAuth } = require('./middlewares');
const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const csrfProtection = csrf();

router.get('/admin/products', csrfProtection, requireAuth, async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productsIndexTemplate({ products, csrfToken: req.csrfToken() }));
});

router.get('/admin/products/new', csrfProtection, requireAuth, (req, res) => {
  res.send(productsNewTemplate({ errors: null, csrfToken: req.csrfToken() }));
});

// Using multer (upload.single('image')) also puts the form fields into req.body.
// bodyparser can't put the values into req.body work because the form has encoding multipart/form-data.
// Therefore, the multer middleware needs to be placed before the validators or the validation will fail because the properties on req.body is not available.
router.post(
  '/admin/products/new',
  requireAuth,
  upload.single('image'),
  csrfProtection,
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate, (req, res) => {
    return { csrfToken: req.csrfToken() };
  }),
  async (req, res) => {
    let image = '';
    if (req.file) {
      image = req.file.buffer.toString('base64');
    }
    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });

    res.redirect('/admin/products');
  }
);

router.get(
  '/admin/products/:id/edit',
  csrfProtection,
  requireAuth,
  async (req, res) => {
    const product = await productsRepo.getOne(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.send(
      productsEditTemplate({
        errors: null,
        product,
        csrfToken: req.csrfToken()
      })
    );
  }
);

router.post(
  '/admin/products/:id/edit',
  requireAuth,
  upload.single('image'),
  csrfProtection,
  [requireTitle, requirePrice],
  handleErrors(productsEditTemplate, async req => {
    const product = await productsRepo.getOne(req.params.id);
    return { product, csrfToken: req.csrfToken() };
  }),
  async (req, res) => {
    const changes = req.body;

    if (req.file) {
      changes.image = req.file.buffer.toString('base64');
    }

    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);

router.post(
  '/admin/products/:id/delete',
  requireAuth,
  csrfProtection,
  async (req, res) => {
    await productsRepo.delete(req.params.id);

    res.redirect('/admin/products');
  }
);

module.exports = router;
