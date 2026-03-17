const Category = require('../models/Category');

/**
 * Generate slug from name.
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * List all categories.
 */
const listCategories = async () => {
  return Category.find().sort({ name: 1 });
};

/**
 * Create a new category (admin).
 */
const createCategory = async ({ name, description }) => {
  const slug = generateSlug(name);

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    const error = new Error('Danh mục đã tồn tại');
    error.statusCode = 409;
    throw error;
  }

  return Category.create({ name, slug, description });
};

/**
 * Update a category (admin).
 */
const updateCategory = async (categoryId, updates) => {
  if (updates.name) {
    updates.slug = generateSlug(updates.name);
  }

  const category = await Category.findByIdAndUpdate(categoryId, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    const error = new Error('Danh mục không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return category;
};

/**
 * Delete a category (admin).
 */
const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    const error = new Error('Danh mục không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Đã xóa danh mục' };
};

/**
 * Find existing category by name (case-insensitive) or create a new one.
 */
const findOrCreate = async (name) => {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Case-insensitive search
  let category = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });

  if (!category) {
    const slug = generateSlug(trimmed);
    category = await Category.create({ name: trimmed, slug });
  }

  return category;
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  findOrCreate,
};
