import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Food from './models/Food.js';
import Analytics from './models/Analytics.js';
import Order from './models/Order.js';
import Queue from './models/Queue.js';

dotenv.config();

const foods = [
  {
    name: 'Veg Burger',
    category: 'Snacks',
    price: 60,
    stock: 25,
    availability: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Masala Dosa',
    category: 'Breakfast',
    price: 80,
    stock: 15,
    availability: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pav Bhaji',
    category: 'Snacks',
    price: 90,
    stock: 20,
    availability: true,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cold Coffee',
    category: 'Drinks',
    price: 50,
    stock: 40,
    availability: true,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ginger Chai',
    category: 'Drinks',
    price: 15,
    stock: 100,
    availability: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Special Veg Thali',
    category: 'Lunch',
    price: 120,
    stock: 30,
    availability: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Hakka Noodles',
    category: 'Lunch',
    price: 100,
    stock: 18,
    availability: true,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cheese Sandwich',
    category: 'Breakfast',
    price: 55,
    stock: 2,
    availability: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Food.deleteMany();
    await Analytics.deleteMany();
    await Order.deleteMany();
    await Queue.deleteMany();

    console.log('Cleared existing database collections.');

    // Seed Users
    const users = await User.create([
      {
        name: 'Roshni Rai',
        email: 'roshni@queueless.com',
        password: 'password123',
        role: 'student',
        collegeId: 'STU-2026-105',
      },
      {
        name: 'Ramesh Chef',
        email: 'vendor@queueless.com',
        password: 'password123',
        role: 'vendor',
        collegeId: 'VND-2026-001',
      },
      {
        name: 'System Admin',
        email: 'admin@queueless.com',
        password: 'password123',
        role: 'admin',
        collegeId: 'ADM-2026-001',
      },
    ]);
    console.log('Successfully seeded Student, Vendor, and Admin users.');

    // Seed Food Items
    await Food.create(foods);
    console.log('Successfully seeded Food items menu.');

    // Seed Historical Analytics (Past 5 Days)
    const baseDate = new Date();
    const analyticsList = [];
    
    for (let i = 5; i > 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const orderCount = isWeekend ? 18 + Math.floor(Math.random() * 10) : 210 + Math.floor(Math.random() * 60);
      const revenue = orderCount * 70; // average order price ~70 INR

      analyticsList.push({
        date: dateStr,
        orders: orderCount,
        revenue,
        peakHour: '12 PM',
      });
    }

    await Analytics.create(analyticsList);
    console.log('Successfully seeded historical sales analytics data.');

    console.log('Database Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
