import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedTime: {
      type: Number,
      required: true,
      default: 5, // in minutes
    },
    status: {
      type: String,
      enum: ['Waiting', 'Serving', 'Done'],
      default: 'Waiting',
    },
  },
  {
    timestamps: true,
  }
);

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
