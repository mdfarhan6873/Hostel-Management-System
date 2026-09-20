import path from 'path';

import mongoose from 'mongoose';
import { User } from '../lib/models/User';
import { hashPassword } from '../lib/auth';

async function seedAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const adminEmail = "superadmin@gecmunger.ac.in";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Super admin ${adminEmail} already exists!`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword("admin123");

    const superAdmin = await User.create({
      name: "Principal GEC Munger",
      email: adminEmail,
      mobile: "9999999999",
      password: hashedPassword,
      role: "superadmin",
      designation: "Principal",
      status: "ACTIVE",
    });

    console.log("Super admin seeded successfully:");
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedAdmin();
