require('dotenv').config();
const express = require('express');

// Services
const RedisMemory = require('./memory/redis');
const SupabaseMemory = require('./memory/mongo'); // Renamed but keeping same path for compatibility
const OpenAIService = require('./services/openai');
const OpenRouterService = require('./services/openrouter');

// Bots
const CoordinatorBot = require('./bots/coordinator');
const SaraBot = require('./bots/sara');
const AmirBot = require('./bots/amir');
const LalehBot = require('./bots/laleh');
const NavidBot = require('./bots/navid');
const NedaBot = require('./bots/neda');

class PetMagixSystem {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.services = {};
    this.bots = {};
  }

  async initialize() {
    console.log('🚀 Starting PetMagix AI Team...');

    // Initialize services
    this.services.redis = new RedisMemory();
    this.services.supabase = new SupabaseMemory();
    this.services.mongo = this.services.supabase; // Alias for compatibility
    this.services.openai = new OpenAIService();
    this.services.openrouter = new OpenRouterService();

    await this.services.redis.connect();
    await this.services.supabase.connect();

    // Initialize bots
    this.initializeBots();

    // Setup web server
    this.setupServer();

    // First-run team briefing
    await this.runTeamBriefing();

    console.log('✅ PetMagix AI Team ready!');
  }

  initializeBots() {
    const botConfigs = [
      { name: 'coordinator', token: process.env.COORDINATOR_BOT_TOKEN, class: CoordinatorBot },
      { name: 'sara', token: process.env.SARA_BOT_TOKEN, class: SaraBot },
      { name: 'amir', token: process.env.AMIR_BOT_TOKEN, class: AmirBot },
      { name: 'laleh', token: process.env.LALEH_BOT_TOKEN, class: LalehBot },
      { name: 'navid', token: process.env.NAVID_BOT_TOKEN, class: NavidBot },
      { name: 'neda', token: process.env.NEDA_BOT_TOKEN, class: NedaBot }
    ];

    for (const config of botConfigs) {
      if (config.token) {
        this.services.bots = this.bots; // Pass bots to services
        this.bots[config.name] = new config.class(config.token, this.services);
        console.log(`✅ ${config.name} bot initialized`);
      } else {
        console.warn(`⚠️ No token for ${config.name} bot`);
      }
    }
  }

  setupServer() {
    this.app.use(express.json());

    // Health check for Railway keep-alive
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'PetMagix AI Team',
        bots: Object.keys(this.bots)
      });
    });

    // Webhook endpoint
    this.app.post('/webhook/:botId', (req, res) => {
      res.sendStatus(200);
    });

    this.app.listen(this.port, () => {
      console.log(`🌐 Server running on port ${this.port}`);
    });
  }

  async runTeamBriefing() {
    try {
      const companyProfile = require('./config/company-profile.json');
      const roles = require('./config/roles.json');
      
      await this.services.mongo.initializeTeamBriefing(companyProfile, roles);
      
      // Send briefing to group
      if (this.bots.coordinator && process.env.GROUP_CHAT_ID) {
        await this.bots.coordinator.bot.sendMessage(
          process.env.GROUP_CHAT_ID,
          '🎯 PetMagix AI Team briefing complete!\n\n' +
          '✅ Company profile loaded\n' +
          '✅ Agent personalities initialized\n' +
          '✅ FeedMagix context distributed\n\n' +
          'Your AI team is ready to help grow PetMagix! 🐾\n\n' +
          'Try: @sara create Instagram campaign\n' +
          'Or: Sara, what\'s our marketing strategy?'
        );
      }
    } catch (error) {
      console.error('Team briefing failed:', error);
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down PetMagix system...');
    
    // Stop all bots
    for (const [name, bot] of Object.entries(this.bots)) {
      try {
        if (bot.bot && bot.bot.stopPolling) {
          await bot.bot.stopPolling();
        }
        console.log(`✅ ${name} bot stopped`);
      } catch (error) {
        console.error(`Error stopping ${name}:`, error);
      }
    }

    // Close services
    await this.services.redis.close();
    await this.services.supabase.close();
    console.log('✅ All services closed');
  }
}

// Initialize system
const system = new PetMagixSystem();

// Graceful shutdown
process.on('SIGINT', async () => {
  await system.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await system.shutdown();
  process.exit(0);
});

// Start system
system.initialize().catch(error => {
  console.error('❌ Failed to start PetMagix system:', error);
  process.exit(1);
});