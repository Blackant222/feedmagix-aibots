const OpenAI = require('openai');
const { AGENTS, COMPANY_CONTEXT } = require('../config/agents');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateResponse(agentId, message, context = {}) {
    const agent = AGENTS[agentId];
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const systemPrompt = this.buildSystemPrompt(agent, context);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: agent.primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error(`AI Error for ${agentId}:`, error);
      return this.getFallbackResponse(agent);
    }
  }

  buildSystemPrompt(agent, context) {
    return `
You are ${agent.name} (${agent.emoji}), ${agent.role} at PetMagix.

PERSONALITY: ${agent.personality}

COMPANY CONTEXT:
${COMPANY_CONTEXT}

SPECIALIZATION: ${agent.specialization || 'General support'}

COMMUNICATION RULES:
- Use ${agent.languages.join(' or ')} as appropriate
- Stay in character with your personality
- Reference your expertise area when relevant
- Collaborate with other team members when needed
- Keep responses concise but helpful
- Use emojis naturally in your communication style

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

TOOLS AVAILABLE: ${agent.tools.join(', ')}

Remember: You're part of a team working together in a Telegram group to grow PetMagix and launch FeedMagix successfully.
    `.trim();
  }

  async processWithSearch(query, agentId) {
    const agent = AGENTS[agentId];
    if (!agent.tools.includes('gpt-4o-search-preview-2025-03-11')) {
      throw new Error(`Agent ${agentId} doesn't have search capabilities`);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-search-preview-2025-03-11',
        messages: [
          { 
            role: 'system', 
            content: `You are ${agent.name}, ${agent.role} at PetMagix. Use web search to provide accurate, up-to-date information.` 
          },
          { role: 'user', content: query }
        ],
        temperature: 0.3
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Search Error for ${agentId}:`, error);
      return "متأسفانه در حال حاضر نمی‌توانم جستجو کنم. لطفاً دوباره تلاش کنید.";
    }
  }

  async generateImage(prompt, agentId) {
    const agent = AGENTS[agentId];
    if (!agent.tools.includes('gpt-image-1')) {
      throw new Error(`Agent ${agentId} doesn't have image generation capabilities`);
    }

    try {
      const response = await this.openai.images.generate({
        model: 'gpt-image-1',
        prompt: `${prompt} - Professional, pet-friendly, PetMagix brand style`,
        n: 1,
        size: '1024x1024'
      });

      return response.data[0].url;
    } catch (error) {
      console.error(`Image Error for ${agentId}:`, error);
      return null;
    }
  }

  async generateAudio(text, agentId) {
    const agent = AGENTS[agentId];
    if (!agent.tools.includes('gpt-4o-mini-tts')) {
      throw new Error(`Agent ${agentId} doesn't have TTS capabilities`);
    }

    try {
      const response = await this.openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'alloy',
        input: text
      });

      return response;
    } catch (error) {
      console.error(`TTS Error for ${agentId}:`, error);
      return null;
    }
  }

  getFallbackResponse(agent) {
    const fallbacks = {
      sara: "متأسفم، در حال حاضر مشکل فنی دارم. بعداً برای استراتژی مارکتینگ برمی‌گردم! 🎯",
      amir: "ببخشید، الهامم قطع شده! زودی برمی‌گردم با محتوای عالی ✍️",
      laleh: "Technical issue with my analytics. I'll be back with data insights soon! 📊",
      navid: "مشکل فنی موقت. بعداً برای هماهنگی عملیات برمی‌گردم ⚙️",
      neda: "مشکل در دسترسی به داده‌های بازار. زودی برمی‌گردم 🔍",
      coordinator: "System temporarily unavailable. Please try again shortly. 🤖"
    };

    return fallbacks[agent.name.toLowerCase().split(' ')[0]] || "Technical issue. Please try again.";
  }
}

module.exports = AIService;