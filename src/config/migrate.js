const { sequelize, testConnection } = require('./database');
const models = require('../models');

const migrate = async () => {
  try {
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Cannot proceed with migration. Please fix database connection.');
      process.exit(1);
    }
    
    console.log('\nStarting database migration...');
    console.log('This will create/update the following tables:');
    console.log('   - admins');
    console.log('   - blogs');
    console.log('   - blog_translations');
    console.log('   - contacts');
    console.log('   - testimonials\n');
    
    // Sync all models with alter: true to update existing tables
    await sequelize.sync({ alter: true });
    
    console.log('Database migration completed successfully!\n');
    console.log('Your database is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

// Run migration
migrate();