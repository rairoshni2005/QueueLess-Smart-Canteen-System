import express from 'express';
import Queue from '../models/Queue.js';
import { protect, roleProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get active food queue
// @route   GET /api/queue
// @access  Public
router.get('/', async (req, res) => {
  try {
    const queue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
      .populate({
        path: 'orderId',
        populate: {
          path: 'userId',
          select: 'name email collegeId',
        },
      })
      .sort({ position: 1 });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update active queue manual overrides
// @route   PUT /api/queue/update
// @access  Private (Vendor, Admin)
router.put('/update', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  const { queueId, position, estimatedTime, status } = req.body;

  try {
    const item = await Queue.findById(queueId);
    if (!item) {
      return res.status(404).json({ message: 'Queue tracking item not found' });
    }

    if (position !== undefined) item.position = position;
    if (estimatedTime !== undefined) item.estimatedTime = estimatedTime;
    if (status !== undefined) item.status = status;

    await item.save();

    if (req.io) {
      const freshQueue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
        .populate('orderId')
        .sort({ position: 1 });
      req.io.emit('queueUpdate', freshQueue);
    }

    res.json({ message: 'Queue updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
