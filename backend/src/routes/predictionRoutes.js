import express from 'express';
import { protect, roleProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get AI Demand predictions from Python server
// @route   GET /api/prediction
// @access  Private (Vendor, Admin)
router.get('/', protect, roleProtect(['vendor', 'admin']), async (req, res) => {
  const pythonServiceUrl = `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/prediction`;

  try {
    const response = await fetch(pythonServiceUrl);
    if (!response.ok) {
      throw new Error(`AI Service returned status code ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.warn(`[AI Warning] Python AI service offline. Serving fallback simulated predictions. Error: ${error.message}`);
    
    // Resilient fallback logic when Python service is not running
    // This allows the vendor dashboard to always work gracefully.
    const expectedOrders = 285;
    const totalDayOrders = 680;
    const recommendation = "Prepare 25% Extra Meals. Anticipating lunch rush between 12:30 PM and 1:30 PM due to standard weekday campus schedules.";
    
    const peakHours = [
      { hour: '8 AM', orders: 12 },
      { hour: '9 AM', orders: 48 },
      { hour: '10 AM', orders: 20 },
      { hour: '11 AM', orders: 18 },
      { hour: '12 PM', orders: 98 },
      { hour: '1 PM', orders: 142 },
      { hour: '2 PM', orders: 45 },
      { hour: '3 PM', orders: 15 },
      { hour: '4 PM', orders: 22 },
      { hour: '5 PM', orders: 52 },
      { hour: '6 PM', orders: 48 },
      { hour: '7 PM', orders: 18 }
    ];

    const popularItemsPrediction = [
      { name: "🍔 Veg Burger", predictedCount: 125 },
      { name: "🍛 Masala Dosa", predictedCount: 88 },
      { name: "🌯 Paneer Roll", predictedCount: 72 },
      { name: "☕ Cold Coffee", predictedCount: 110 },
      { name: "🍵 Chai", predictedCount: 140 }
    ];

    res.json({
      tomorrowLunchRush: {
        expectedOrders,
        totalDayOrders,
        recommendation,
        details: "High likelihood of campus rush at 1 PM with ~142 orders (Resilient AI Mock)."
      },
      peakHours,
      popularItemsPrediction
    });
  }
});

export default router;
