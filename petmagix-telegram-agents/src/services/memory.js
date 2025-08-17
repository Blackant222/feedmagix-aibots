const Redis = require('redis');
const { MongoClient } = require('mongodb');

class MemoryService {
  constructor() {
    this.redis = null;
    this.mongodb = null;
    this.db = null;
  }

  async initialize() {
    // Initialize Redis for short-term memory
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL
    });
    await this.redis.connect();

    // Initialize MongoDB for persistent memory
    this.mongodb = new MongoClient(process.env.MONGODB_URI);
    await this.mongodb.connect();
    this.db = this.mongodb.db('petmagix_agents');
  }

  // Short-term memory (Redis - 24 hours)
  async setShortTerm(key, value, ttl = 86400) {
    await this.redis.setEx(key, ttl, JSON.stringify(value));
  }

  async getShortTerm(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  // Conversation context
  async saveConversationContext(chatId, context) {
    const key = `conv:${chatId}`;
    await this.setShortTerm(key, context, 86400); // 24 hours
  }

  async getConversationContext(chatId) {
    const key = `conv:${chatId}`;
    return await this.getShortTerm(key) || { messages: [], participants: [] };
  }

  // Agent memory
  async saveAgentMemory(agentId, memory) {
    await this.db.collection('agent_memory').updateOne(
      { agentId },
      { 
        $set: { 
          ...memory, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  async getAgentMemory(agentId) {
    return await this.db.collection('agent_memory').findOne({ agentId });
  }

  // Task tracking
  async saveTask(taskId, task) {
    await this.db.collection('tasks').updateOne(
      { taskId },
      { 
        $set: { 
          ...task, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  async getTask(taskId) {
    return await this.db.collection('tasks').findOne({ taskId });
  }

  async getActiveTasks(agentId) {
    return await this.db.collection('tasks').find({ 
      assignedTo: agentId, 
      status: { $in: ['pending', 'in_progress'] } 
    }).toArray();
  }

  // Company knowledge base
  async saveKnowledge(category, key, value) {
    await this.db.collection('knowledge').updateOne(
      { category, key },
      { 
        $set: { 
          value, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  async getKnowledge(category, key = null) {
    if (key) {
      return await this.db.collection('knowledge').findOne({ category, key });
    }
    return await this.db.collection('knowledge').find({ category }).toArray();
  }

  // Rate limiting
  async checkRateLimit(userId, limit = 30) {
    const key = `rate:${userId}`;
    const current = await this.redis.get(key);
    
    if (!current) {
      await this.redis.setEx(key, 60, '1');
      return true;
    }
    
    if (parseInt(current) >= limit) {
      return false;
    }
    
    await this.redis.incr(key);
    return true;
  }

  async close() {
    if (this.redis) await this.redis.quit();
    if (this.mongodb) await this.mongodb.close();
  }
}

module.exports = MemoryService;