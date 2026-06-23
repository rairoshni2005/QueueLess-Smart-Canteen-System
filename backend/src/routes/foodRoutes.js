import express from 'express';
import Food from '../models/Food.js';
import { protect, roleProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foods = await Food.find(query);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single food item details
// @route   GET /api/foods/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private (Vendor, Admin)
router.post('/', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  const { name, category, price, stock, availability, image } = req.body;

  try {
    const food = await Food.create({
      name,
      category,
      price,
      stock: stock !== undefined ? stock : 50,
      availability: availability !== undefined ? availability : true,
      image: image || '',
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update food details
// @route   PUT /api/foods/:id
// @access  Private (Vendor, Admin)
router.put('/:id', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    food.name = req.body.name || food.name;
    food.category = req.body.category || food.category;
    food.price = req.body.price !== undefined ? req.body.price : food.price;
    food.stock = req.body.stock !== undefined ? req.body.stock : food.stock;
    food.availability = req.body.availability !== undefined ? req.body.availability : food.availability;
    food.image = req.body.image !== undefined ? req.body.image : food.image;

    // Auto-update availability based on stock
    if (food.stock <= 0) {
      food.availability = false;
    }

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private (Vendor, Admin)
router.delete('/:id', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await food.deleteOne();
    res.json({ message: 'Food item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
