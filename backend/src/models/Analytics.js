import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      unique: true,
    },
    orders: {
      type: Number,
      required: true,
      default: 0,
    },
    revenue: {
      type: Number,
      required: true,
      default: 0,
    },
    peakHour: {
      type: String,
      default: '12 PM',
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
