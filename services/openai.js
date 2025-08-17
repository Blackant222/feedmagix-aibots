const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    // Cost-optimized model routing - NANO for most tasks!
    selectModel(task, agentId, messageType = 'text') {
        // Voice message transcription
        if (messageType === 'voice') {
            return 'gpt-4o-mini-transcribe'; // $0.003/minute - cheapest transcription
        }

        // TTS only when explicitly requested
        if (task.includes('voice') || task.includes('audio') || task.includes('speak')) {
            return 'gpt-4o-mini-tts'; // $0.015/minute
        }

        // Image generation only when explicitly requested
        if (task.includes('image') || task.includes('picture') || task.includes('visual') ||
            task.includes('make the image') || task.includes('create image')) {
            return 'gpt-image-1';
        }

        // Web search only for research agents and when needed
        if ((agentId === 'neda' || task.includes('search') || task.includes('research') ||
            task.includes('find') || task.includes('trends')) && agentId !== 'amir') {
            return 'gpt-4o-search-preview-2025-03-11';
        }

        // DEFAULT: Always use NANO (cheapest) for everything else
        return 'gpt-5-nano-2025-08-07';
    }

    async generateResponse(agentId, message, context = {}, messageType = 'text') {
        const model = this.selectModel(message, agentId, messageType);

        try {
            // Handle voice transcription
            if (messageType === 'voice') {
                return await this.transcribeVoice(message);
            }

            // Handle image generation
            if (model === 'gpt-image-1') {
                return await this.generateImage(message, agentId);
            }

            // Handle TTS
            if (model === 'gpt-4o-mini-tts') {
                return await this.generateAudio(message, agentId);
            }

            // Regular chat completion
            const response = await this.client.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: this.buildSystemPrompt(agentId, context) },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: model === 'gpt-5-nano-2025-08-07' ? 500 : 800 // Shorter for nano to save costs
            });

            console.log(`💰 Used ${model} for ${agentId}: ${message.substring(0, 50)}...`);
            return response.choices[0].message.content;
        } catch (error) {
            console.error(`OpenAI Error for ${agentId} with ${model}:`, error);
            return this.getFallback(agentId);
        }
    }

    buildSystemPrompt(agentId, context) {
        const roles = require('../config/roles.json');
        const agent = roles[agentId];

        return `You are ${agent.name} (${agent.emoji}), ${agent.role} at PetMagix.

PERSONALITY: ${agent.personality}
SPECIALIZATION: ${agent.specialization || 'General support'}

COMPANY CONTEXT: ${JSON.stringify(context.companyProfile || {}, null, 2)}

RULES:
- Stay in character with your personality
- Use Persian/English as appropriate for your role  
- Keep responses concise but helpful (max 150 words for cost efficiency)
- Reference your expertise when relevant
- Collaborate with team members when needed
- Only use expensive models (search/image/audio) when explicitly requested

CURRENT CONTEXT: ${JSON.stringify(context.conversation || {}, null, 2)}`;
    }

    async transcribeVoice(audioFile) {
        try {
            const response = await this.client.audio.transcriptions.create({
                file: audioFile,
                model: 'gpt-4o-mini-transcribe'
            });
            return response.text;
        } catch (error) {
            console.error('Voice transcription error:', error);
            return "متأسفم، نتوانستم پیام صوتی را تشخیص دهم. لطفاً متن بفرستید.";
        }
    }

    async generateImage(prompt, agentId) {
        try {
            const response = await this.client.images.generate({
                model: 'gpt-image-1',
                prompt: `${prompt} - Professional, pet-friendly, PetMagix brand style`,
                n: 1,
                size: '1024x1024'
            });
            return `🎨 Image created: ${response.data[0].url}`;
        } catch (error) {
            console.error('Image generation error:', error);
            return "متأسفم، نتوانستم تصویر بسازم. لطفاً دوباره تلاش کنید.";
        }
    }

    async generateAudio(text, agentId) {
        try {
            const response = await this.client.audio.speech.create({
                model: 'gpt-4o-mini-tts',
                voice: 'alloy',
                input: text
            });
            return `🗣️ Audio generated: ${response.url}`;
        } catch (error) {
            console.error('TTS error:', error);
            return text; // Fallback to text
        }
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

module.exports = OpenAIService;