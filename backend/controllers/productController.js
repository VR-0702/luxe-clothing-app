const Product = require('../models/Product');
const Category = require('../models/Category');

// @route GET /api/products
// @access Public - supports search, filter, sort, pagination
const getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      sort = '-createdAt', page = 1, limit = 12,
      featured, size, color
    } = req.query;

    const query = { isActive: true };

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by category
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured filter
    if (featured === 'true') query.isFeatured = true;

    // Size/color filter (check variants)
    if (size) query['variants.size'] = size;
    if (color) query['variants.color'] = { $regex: color, $options: 'i' };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/:id
// @access Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/products/slug/:slug
// @access Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const {
      name, description, shortDescription, price, discountPrice,
      category, variants, tags, fabric, careInstructions, isFeatured
    } = req.body;

    // Handle multiple uploaded images
    const images = req.files
      ? req.files.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          alt: name,
          isPrimary: index === 0
        }))
      : [];

    // Parse variants if sent as JSON string
    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const product = await Product.create({
      name, description, shortDescription, price, discountPrice,
      category, variants: parsedVariants, tags: parsedTags,
      fabric, careInstructions, isFeatured, images
    });

    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, message: 'Product created!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Parse stringified fields
    if (updates.variants && typeof updates.variants === 'string') {
      updates.variants = JSON.parse(updates.variants);
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = JSON.parse(updates.tags);
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: updates.name || 'Product',
        isPrimary: false
      }));
      updates.$push = { images: { $each: newImages } };
      delete updates.images; // Don't overwrite existing
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/products/:id/review
// @access Private (customer)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    product.reviews.push({ user: req.user._id, rating, comment });

    // Recalculate average rating
    product.ratings.count = product.reviews.length;
    product.ratings.average = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/categories
// @access Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const category = await Category.create({ name, description, image, sortOrder });
    res.status(201).json({ success: true, message: 'Category created!', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/categories/:id
// @access Admin
const updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: 'Category updated!', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/categories/:id
// @access Admin
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts, getProduct, getProductBySlug,
  createProduct, updateProduct, deleteProduct, addReview,
  getCategories, createCategory, updateCategory, deleteCategory
};
