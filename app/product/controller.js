const fs = require('fs');
const path = require('path');
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');

async function index(req, res, next) {
  try {
    let {
      limit = 10,
      skip = 0,
      query = '',
      category = '',
      tags = [],
    } = req.query;
    let criteria = {};

    // buat query dengan criteria nama tertentu
    if (query.length) {
      criteria = {
        ...criteria,
        name: { $regex: `${query}`, $options: 'i' },
      };
    }

    // buat query dengan category tertentu
    if (category.length) {
      category = await Category.findOne({
        name: { $regex: `${category}` },
        $options: 'i',
      });
      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }

    // buat query dengan tags tertentu
    if (tags.length) {
      tags = await Tag.find({ name: { $in: tags } });
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }

    let products = await Product.find(criteria)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('category')
      .populate('tags');

    let filteredProducts = products.map(
      ({ _id, name, price, image_url, category, tags, ...product }) => {
        return { _id, name, price, image_url, category };
      }
    );

    return res.json(filteredProducts);
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: 'i' },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;

      let originalExt =
        req.file.originalname.split('.')[
          req.file.originalname.split('.').length - 1
        ];

      let filename = req.file.filename + '.' + originalExt;

      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);

      src.pipe(dest);

      src.on('end', async () => {
        let product = new Product({ ...payload, image_url: filename });
        let response = await product.save();
        return res.json(response);
      });

      src.on('error', async (err) => {
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.json(product);
    }
  } catch (error) {
    if (error && error.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error);
  }
}

async function update(req, res, next) {
  try {
    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: 'i' },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;

      let originalExt =
        req.file.originalname.split('.')[
          req.file.originalname.split('.').length - 1
        ];

      let filename = req.file.filename + '.' + originalExt;

      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);

      src.pipe(dest);

      src.on('end', async () => {
        let product = await Product.findOne({ _id: req.params.id });
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
        if (fs.existsSync(currentImage)) {
          fs.unlinkSync(currentImage);
        }
        product = await Product.findOneAndUpdate(
          { _id: req.params.id },
          { ...payload, image_url: filename },
          { new: true, runValidators: true }
        );
        return res.json(product);
      });

      src.on('error', async (err) => {
        next(err);
      });
    } else {
      let product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );

      await product.save();
      return res.json(product);
    }
  } catch (error) {
    if (error && error.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }

    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    let product = await Product.findOneAndDelete({ _id: req.params.id });
    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  update,
  store,
  destroy,
};
