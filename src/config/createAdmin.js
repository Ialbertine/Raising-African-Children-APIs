const readline = require('readline');
const { sequelize, testConnection } = require('./database');
const { Admin } = require('../models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createFirstAdmin = async () => {
  try {
    console.log('Testing database connection...\n');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Cannot create admin. Please fix database connection.');
      process.exit(1);
    }

    console.log('\nCreate First Admin Account\n');
    
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 characters): ');

    if (!firstName || !lastName || !email || !password) {
      console.error('\nAll fields are required!');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\nPassword must be at least 8 characters long!');
      process.exit(1);
    }

    console.log('\nCreating admin account...');
    
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      isActive: true
    });
    
    console.log('\nAdmin account created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', `${admin.firstName} ${admin.lastName}`);
    console.log('\nYou can now login with these credentials!');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\nFailed to create admin:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('This email is already registered!');
    }
    
    rl.close();
    process.exit(1);
  }
};

createFirstAdmin();