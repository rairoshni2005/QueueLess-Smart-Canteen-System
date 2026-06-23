import express from 'express';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect, roleProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Submit feedback for a completed order
// @route   POST /api/feedback
// @access  Private (Student)
router.post('/', protect, roleProtect(['student']), async (req, res) => {
  const { orderId, foodId, rating, comment } = req.body;

  if (!orderId || !rating) {
    return res.status(400).json({ message: 'Order ID and rating are required.' });
  }

  try {
    // Verify order belongs to this user and is completed
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.status !== 'Completed') {
      return res.status(400).json({ message: 'You can only rate completed orders.' });
    }

    // Check if already reviewed this order
    const existing = await Feedback.findOne({ orderId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted feedback for this order.' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      orderId,
      foodId: foodId || null,
      rating,
      comment: comment || '',
    });

    // Award 10 points for submitting feedback
    const user = await User.findById(req.user._id);
    user.points = (user.points || 0) + 10;

    // Badge unlock: "Critic" badge at 5 reviews
    const reviewCount = await Feedback.countDocuments({ userId: req.user._id });
    if (reviewCount >= 5 && !user.badges.includes('Food Critic')) {
      user.badges.push('Food Critic');
    }
    await user.save();

    res.status(201).json({ feedback, points: user.points, badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get all feedback for vendor dashboard
// @route   GET /api/feedback
// @access  Private (Vendor, Admin)
router.get('/', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .populate('foodId', 'name category')
      .sort({ createdAt: -1 })
      .limit(50);

    // Compute average rating
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = feedbacks.length ? (totalRating / feedbacks.length).toFixed(1) : 0;

    res.json({ feedbacks, avgRating, totalCount: feedbacks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get my points and badges
// @route   GET /api/feedback/rewards
// @access  Private (Student)
router.get('/rewards', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name points badges');
    const orderCount = await Order.countDocuments({ userId: req.user._id, status: 'Completed' });
    const feedbackCount = await Feedback.countDocuments({ userId: req.user._id });
    res.json({ user, stats: { orderCount, feedbackCount } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
