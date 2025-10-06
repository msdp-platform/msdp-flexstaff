import sequelize from '../config/database';
import { User } from '../models/User';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create test worker
    const workerPassword = await bcrypt.hash('password123', 10);
    const workerUser = await User.create({
      email: 'worker@test.com',
      phone: '07700900001',
      passwordHash: workerPassword,
      role: 'worker',
      status: 'active',
      emailVerified: true,
    });

    await Worker.create({
      userId: workerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'GB',
    });

    console.log('✅ Test worker created: worker@test.com / password123');

    // Create test employer
    const employerPassword = await bcrypt.hash('password123', 10);
    const employerUser = await User.create({
      email: 'employer@test.com',
      phone: '07700900002',
      passwordHash: employerPassword,
      role: 'employer',
      status: 'active',
      emailVerified: true,
    });

    await Employer.create({
      userId: employerUser.id,
      companyName: 'Test Company Ltd',
      industry: 'hospitality',
      city: 'London',
      postcode: 'EC1A 1BB',
      country: 'GB',
    });

    console.log('✅ Test employer created: employer@test.com / password123');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@test.com',
      phone: '07700900003',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });

    console.log('✅ Test admin created: admin@test.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
