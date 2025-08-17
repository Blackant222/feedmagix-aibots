const { GoogleGenerativeAI } = require('@google/generative-ai');

class GoogleAIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  // Cost-optimized model routing with latest Google models
  selectModel(task, agentId, priority = false) {
    // Ensure task is a string
    const taskStr = typeof task === 'string' ? task : String(task || '');
    
    // High priority tasks - use Gemini 2.5 Pro without search (not supported)
    if (priority || agentId === 'neda' || taskStr.includes('research') || taskStr.includes('search') || taskStr.includes('trends')) {
      return {
        model: 'gemini-2.5-pro',
        useSearch: false,
        config: {
          thinkingConfig: { thinkingBudget: -1 }
        }
      };
    }

    // Important agents - use Gemini 2.5 Flash without search (not supported)
    if (agentId === 'sara' || agentId === 'coordinator' || taskStr.includes('strategy') || taskStr.includes('plan')) {
      return {
        model: 'gemini-2.5-flash',
        useSearch: false,
        config: {
          thinkingConfig: { thinkingBudget: -1 }
        }
      };
    }

    // Regular tasks - use Gemini 2.0 Flash without search (not supported)
    return {
      model: 'gemini-2.0-flash',
      useSearch: false,
      config: {
        thinkingConfig: { thinkingBudget: -1 }
      }
    };
  }

  async generateResponse(agentId, message, context = {}, messageType = 'text') {
    const modelConfig = this.selectModel(message, agentId, context.priority);
    
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: modelConfig.model,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });

      const systemPrompt = this.buildSystemPrompt(agentId, context);
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

      const contents = [{
        role: 'user',
        parts: [{ text: fullPrompt }]
      }];

      let response;
      
      if (modelConfig.useSearch) {
        // Use search-enabled generation
        response = await model.generateContentStream({
          contents,
          tools: modelConfig.config.tools,
          toolConfig: { functionCallingConfig: { mode: 'AUTO' } }
        });
      } else {
        // Regular generation
        response = await model.generateContentStream({ contents });
      }

      let fullResponse = '';
      for await (const chunk of response.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullResponse += chunkText;
        }
      }

      console.log(`🤖 Used ${modelConfig.model} for ${agentId}: ${message.substring(0, 50)}...`);
      return fullResponse || this.getFallback(agentId);

    } catch (error) {
      console.error(`Google AI Error for ${agentId} with ${modelConfig.model}:`, error);
      return this.getFallback(agentId);
    }
  }

  buildSystemPrompt(agentId, context) {
    const roles = require('../config/roles.json');
    const agent = roles[agentId];
    
    return `You are ${agent.name} (${agent.emoji}), ${agent.role} at PetMagix.

PERSONALITY: ${agent.personality}
SPECIALIZATION: ${agent.specialization || 'General support'}

COMPANY CONTEXT: PetMagix is a Tehran-based pet care company building FeedMagix, an AI-powered pet food recommendation system. We're launching our micro-SaaS approach to become the go-to super app for pet owners.

RULES:
- Stay in character with your personality
- Use Persian/English as appropriate for your role  
- Keep responses concise but helpful (max 200 words)
- Reference your expertise when relevant
- Collaborate with team members when needed
- Use Google Search when you need current information
- Focus on PetMagix growth and FeedMagix launch

CURRENT CONTEXT: ${JSON.stringify(context.conversation || {}, null, 2)}`;
  }

  async generateImage(prompt, agentId) {
    // Google AI doesn't have image generation yet, fallback message
    return `🎨 Image generation requested: "${prompt}". I'll describe what this image should look like instead: A professional, pet-friendly visual for PetMagix that captures ${prompt}`;
  }

  async transcribeVoice(audioFile) {
    // Google AI voice transcription would go here
    // For now, return a helpful message
    return "متأسفم، در حال حاضر قابلیت تشخیص صوت در دسترس نیست. لطفاً پیام متنی ارسال کنید.";
  }

  getFallback(agentId) {
    const fallbacks = {
      sara: "🎯 مشکل فنی موقت. بعداً برای استراتژی مارکتینگ برمی‌گردم!",
      amir: "✍️ الهامم قطع شده! زودی با محتوای عالی برمی‌گردم",
      laleh: "📊 Technical issue. I'll be back with analytics soon!",
      navid: "⚙️ مشکل فنی موقت. بعداً برای هماهنگی برمی‌گردم",
      neda: "🔍 مشکل در دسترسی به داده‌ها. زودی برمی‌گردم",
      coordinator: "🤖 System temporarily unavailable. Please try again."
    };
    return fallbacks[agentId] || "Technical issue. Please try again.";
  }
}

module.exports = GoogleAIService;