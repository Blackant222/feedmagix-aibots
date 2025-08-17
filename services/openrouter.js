const axios = require('axios');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  async generateResponse(message, model = 'openai/gpt-3.5-turbo') {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter Error:', error);
      return "Sorry, I'm having technical difficulties. Please try again.";
    }
  }

  // Fallback for when OpenAI quota is exceeded
  async fallbackResponse(agentId, message) {
    const prompt = `You are ${agentId} from PetMagix team. Respond briefly to: ${message}`;
    return await this.generateResponse(prompt);
  }
}

module.exports = OpenRouterService;