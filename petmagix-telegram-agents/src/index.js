require('dotenv').config();
const express = require('express');
const PetMagixBotSystem = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'PetMagix AI Agents'
  });
});

// Webhook endpoint (for production deployment)
app.use(express.json());
app.post('/webhook/:botId', (req, res) => {
  // Handle webhook updates if needed
  res.sendStatus(200);
});

async function main() {
  try {
    console.log('🚀 Starting PetMagix AI Agent System...');
    
    // Validate environment variables
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'MONGODB_URI',
      'REDIS_URL',
      'GROUP_CHAT_ID',
      'CEO_USER_ID',
      'COORDINATOR_BOT_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      process.exit(1);
    }

    // Initialize bot system
    const botSystem = new PetMagixBotSystem();
    await botSystem.initialize();

    // Start web server
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log('✅ PetMagix AI Team is ready!');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await botSystem.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await botSystem.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start PetMagix AI system:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main();