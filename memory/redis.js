const Redis = require('redis');

class RedisMemory {
  constructor() {
    this.client = null;
  }

  async connect() {
    // Support both URL format and individual credentials
    if (process.env.REDIS_URL) {
      this.client = Redis.createClient({ url: process.env.REDIS_URL });
    } else {
      // Fallback to individual credentials for Redis Cloud
      this.client = Redis.createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });
    }
    
    this.client.on('error', err => console.log('Redis Client Error', err));
    await this.client.connect();
    console.log('✅ Redis connected');
  }

  async set(key, value, ttl = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async saveContext(chatId, context) {
    await this.set(`context:${chatId}`, context, 86400); // 24h
  }

  async getContext(chatId) {
    return await this.get(`context:${chatId}`) || { messages: [] };
  }

  async setConversationContext(userId, context) {
    await this.set(`conversation:${userId}`, context, 86400); // 24h
  }

  async getConversationContext(userId) {
    return await this.get(`conversation:${userId}`) || {};
  }

  async checkRateLimit(userId, limit = 30) {
    const key = `rate:${userId}`;
    const current = await this.client.get(key);
    
    if (!current) {
      await this.client.setEx(key, 60, '1');
      return true;
    }
    
    if (parseInt(current) >= limit) return false;
    
    await this.client.incr(key);
    return true;
  }

  async close() {
    if (this.client) await this.client.quit();
  }
}

module.exports = RedisMemory;