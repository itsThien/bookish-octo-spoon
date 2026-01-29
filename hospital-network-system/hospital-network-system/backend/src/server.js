import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Hospital Network Management System (HNMS)                   ║
║                                                               ║
║   Server running on: http://localhost:${PORT}                 ║
║   API Documentation: http://localhost:${PORT}/api/docs        ║
║   Environment: ${process.env.NODE_ENV || 'development'}       ║
║                                                               ║
║   Ready to accept requests!                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
