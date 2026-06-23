import express from 'express';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Queue from '../models/Queue.js';
import Analytics from '../models/Analytics.js';
import { protect, roleProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate next token number
// e.g., A101, A102...
const getNextToken = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count orders placed today
  const count = await Order.countDocuments({
    createdAt: { $gte: today },
  });
  
  const tokenNum = 101 + count;
  return `A${tokenNum}`;
};

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Student)
router.post('/', protect, roleProtect(['student']), async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in the order cart' });
  }

  try {
    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and price for each item
    for (const item of items) {
      const food = await Food.findById(item.foodId);
      if (!food) {
        return res.status(404).json({ message: `Food item not found: ${item.name}` });
      }

      if (!food.availability || food.stock < item.quantity) {
        return res.status(400).json({ message: `Item out of stock or insufficient: ${food.name}` });
      }

      // Deduct stock
      food.stock -= item.quantity;
      if (food.stock <= 0) {
        food.availability = false;
      }
      await food.save();

      totalAmount += food.price * item.quantity;
      orderItems.push({
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
      });
    }

    const tokenNumber = await getNextToken();

    // Create Order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      tokenNumber,
      totalAmount,
      status: 'Pending',
    });

    // Calculate queue settings
    // Count active items currently in the queue
    const activeQueuesCount = await Queue.countDocuments({
      status: { $in: ['Waiting', 'Serving'] },
    });

    // Each order ahead adds ~3 minutes, baseline 5 mins
    const estimatedTime = 5 + activeQueuesCount * 3;

    // Create Queue entry
    const queue = await Queue.create({
      orderId: order._id,
      position: activeQueuesCount + 1,
      estimatedTime,
      status: 'Waiting',
    });

    // Update Daily Analytics
    const todayStr = new Date().toISOString().slice(0, 10);
    let analytics = await Analytics.findOne({ date: todayStr });
    if (!analytics) {
      analytics = new Analytics({ date: todayStr });
    }
    analytics.orders += 1;
    analytics.revenue += totalAmount;
    
    // Simple hourly calculation for Peak hour peak
    const currentHour = new Date().getHours();
    const ampm = currentHour < 12 ? 'AM' : 'PM';
    const displayHour = currentHour <= 12 ? currentHour : currentHour - 12;
    analytics.peakHour = `${displayHour || 12} ${ampm}`;
    await analytics.save();

    // Emit live update via Socket.io if attached
    if (req.io) {
      req.io.emit('orderCreated', { order, queue });
      // Fetch and emit refreshed full queue updates to all clients
      const freshQueue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
        .populate('orderId')
        .sort({ position: 1 });
      req.io.emit('queueUpdate', freshQueue);
    }

    res.status(201).json({ order, queue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get orders (Student sees their history; Vendor/Admin sees all)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'student') {
      orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Vendor sees all orders (active ones first)
      orders = await Order.find()
        .populate('userId', 'name email collegeId')
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/status
// @access  Private (Vendor, Admin)
router.put('/status', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: 'Order ID and Status are required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Update corresponding Queue item based on transition
    const queueItem = await Queue.findOne({ orderId });

    if (queueItem) {
      if (status === 'Preparing') {
        queueItem.status = 'Serving';
        await queueItem.save();
      } else if (status === 'Completed' || status === 'Rejected') {
        queueItem.status = 'Done';
        queueItem.position = 0;
        queueItem.estimatedTime = 0;
        await queueItem.save();

        // Re-calculate positions for all remaining items in queue
        const activeQueues = await Queue.find({
          status: { $in: ['Waiting', 'Serving'] },
        }).sort({ position: 1 });

        for (let i = 0; i < activeQueues.length; i++) {
          activeQueues[i].position = i + 1;
          activeQueues[i].estimatedTime = 5 + i * 3;
          await activeQueues[i].save();
        }
      }
    }

    // Trigger real-time notifications
    if (req.io) {
      req.io.emit('orderStatusChanged', { orderId, status });
      
      // Send refreshed queue
      const freshQueue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
        .populate('orderId')
        .sort({ position: 1 });
      req.io.emit('queueUpdate', freshQueue);
    }

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
