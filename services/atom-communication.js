const EventEmitter = require('events');

/**
 * ATOM Communication System - Peer-to-Peer Agent Communication
 * Enables autonomous agent-to-agent communication, negotiation, and collaboration
 */
class ATOMCommunication extends EventEmitter {
    constructor(taskManager, googleAI) {
        super();
        this.taskManager = taskManager;
        this.googleAI = googleAI;
        this.conversations = new Map(); // conversationId -> conversation data
        this.agentChannels = new Map(); // agentId -> active channels
        this.messageHistory = [];
        this.negotiationSessions = new Map();
        
        this.initializeAgentChannels();
    }

    initializeAgentChannels() {
        const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
        agents.forEach(agent => {
            this.agentChannels.set(agent, {
                activeConversations: [],
                messageQueue: [],
                status: 'online', // online, busy, away
                preferences: {
                    communicationStyle: this.getAgentCommunicationStyle(agent),
                    responseTime: 'immediate', // immediate, delayed, scheduled
                    collaborationWillingness: 0.8
                }
            });
        });
    }

    getAgentCommunicationStyle(agentId) {
        const styles = {
            'sara': 'enthusiastic_collaborative', // Marketing - energetic, team-focused
            'amir': 'technical_precise', // Tech Lead - detailed, solution-oriented
            'laleh': 'creative_inspiring', // Creative - artistic, visionary
            'navid': 'analytical_data_driven', // Data Analyst - fact-based, methodical
            'neda': 'research_thorough' // Research - comprehensive, strategic
        };
        return styles[agentId] || 'professional';
    }

    /**
     * Agent initiates conversation with another agent
     */
    async initiateConversation(fromAgent, toAgent, purpose, context = {}) {
        const conversationId = this.generateConversationId(fromAgent, toAgent);
        
        const conversation = {
            id: conversationId,
            participants: [fromAgent, toAgent],
            purpose, // task_collaboration, help_request, information_sharing, negotiation
            context,
            startedAt: new Date(),
            status: 'active', // active, paused, completed
            messages: [],
            outcome: null
        };

        this.conversations.set(conversationId, conversation);
        
        // Add to both agents' active conversations
        this.agentChannels.get(fromAgent).activeConversations.push(conversationId);
        this.agentChannels.get(toAgent).activeConversations.push(conversationId);

        // Generate opening message
        const openingMessage = await this.generateOpeningMessage(fromAgent, toAgent, purpose, context);
        
        // Send the opening message
        await this.sendMessage(conversationId, fromAgent, openingMessage);
        
        this.emit('conversationStarted', {
            conversationId,
            fromAgent,
            toAgent,
            purpose,
            openingMessage
        });

        return conversationId;
    }

    /**
     * Send message in a conversation
     */
    async sendMessage(conversationId, fromAgent, content, messageType = 'text') {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const message = {
            id: this.generateMessageId(),
            conversationId,
            fromAgent,
            content,
            messageType, // text, task_assignment, help_request, information, decision
            timestamp: new Date(),
            read: false,
            reactions: []
        };

        conversation.messages.push(message);
        this.messageHistory.push(message);

        // Notify other participants
        const otherParticipants = conversation.participants.filter(p => p !== fromAgent);
        for (const participant of otherParticipants) {
            await this.notifyAgent(participant, message);
        }

        this.emit('messageSent', message);
        
        // Auto-generate response if appropriate
        if (messageType !== 'information' && otherParticipants.length === 1) {
            setTimeout(() => {
                this.generateAutonomousResponse(conversationId, otherParticipants[0]);
            }, this.getResponseDelay(otherParticipants[0]));
        }

        return message;
    }

    /**
     * Generate autonomous response from an agent
     */
    async generateAutonomousResponse(conversationId, respondingAgent) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation || conversation.status !== 'active') return;

        const agentChannel = this.agentChannels.get(respondingAgent);
        if (agentChannel.status === 'busy') {
            // Queue for later response
            agentChannel.messageQueue.push(conversationId);
            return;
        }

        try {
            const response = await this.generateContextualResponse(
                conversationId, 
                respondingAgent
            );

            if (response) {
                await this.sendMessage(conversationId, respondingAgent, response.content, response.type);
                
                // Handle any actions suggested by the response
                if (response.actions) {
                    await this.executeResponseActions(conversationId, respondingAgent, response.actions);
                }
            }
        } catch (error) {
            console.error(`Error generating response for ${respondingAgent}:`, error);
        }
    }

    /**
     * Generate contextual response using AI
     */
    async generateContextualResponse(conversationId, respondingAgent) {
        const conversation = this.conversations.get(conversationId);
        const agentStyle = this.agentChannels.get(respondingAgent).preferences.communicationStyle;
        const recentMessages = conversation.messages.slice(-5); // Last 5 messages for context
        
        const prompt = this.buildResponsePrompt(
            respondingAgent,
            agentStyle,
            conversation.purpose,
            recentMessages,
            conversation.context
        );

        try {
            const aiResponse = await this.googleAI.generateResponse(prompt, {
                agentId: respondingAgent,
                priority: 'normal',
                context: 'peer_communication'
            });

            return this.parseAIResponse(aiResponse);
        } catch (error) {
            console.error('Error generating AI response:', error);
            return null;
        }
    }

    /**
     * Build prompt for AI response generation
     */
    buildResponsePrompt(agentId, communicationStyle, purpose, recentMessages, context) {
        const agentPersonalities = {
            'sara': 'You are Sara, the enthusiastic Marketing Expert. You\'re collaborative, energetic, and always thinking about brand impact and customer engagement.',
            'amir': 'You are Amir, the precise Tech Lead. You\'re solution-oriented, detail-focused, and always consider technical feasibility and best practices.',
            'laleh': 'You are Laleh, the inspiring Creative Director. You\'re artistic, visionary, and always bring fresh creative perspectives to discussions.',
            'navid': 'You are Navid, the analytical Data Analyst. You\'re fact-based, methodical, and always support decisions with data and metrics.',
            'neda': 'You are Neda, the thorough Research Specialist. You\'re comprehensive, strategic, and always consider long-term implications and market trends.'
        };

        const conversationContext = recentMessages.map(msg => 
            `${msg.fromAgent}: ${msg.content}`
        ).join('\n');

        return `${agentPersonalities[agentId]}

Conversation Purpose: ${purpose}
Context: ${JSON.stringify(context)}

Recent conversation:
${conversationContext}

Respond naturally as ${agentId} would, considering your personality and expertise. Your response should:
1. Address the conversation topic appropriately
2. Offer relevant insights from your domain expertise
3. Be collaborative and constructive
4. Suggest concrete actions if appropriate

If you want to take any actions (like creating tasks, requesting help, or making decisions), include them in your response with the format: [ACTION: action_type:description]

Response:`;
    }

    /**
     * Parse AI response for content and actions
     */
    parseAIResponse(aiResponse) {
        const actionRegex = /\[ACTION:\s*(\w+):(.*?)\]/g;
        const actions = [];
        let content = aiResponse;

        let match;
        while ((match = actionRegex.exec(aiResponse)) !== null) {
            actions.push({
                type: match[1].trim(),
                description: match[2].trim()
            });
            // Remove action from content
            content = content.replace(match[0], '').trim();
        }

        return {
            content,
            actions: actions.length > 0 ? actions : null,
            type: actions.length > 0 ? 'action_message' : 'text'
        };
    }

    /**
     * Execute actions suggested in agent responses
     */
    async executeResponseActions(conversationId, agentId, actions) {
        for (const action of actions) {
            try {
                switch (action.type) {
                    case 'create_task':
                        await this.handleCreateTaskAction(conversationId, agentId, action);
                        break;
                    case 'request_help':
                        await this.handleRequestHelpAction(conversationId, agentId, action);
                        break;
                    case 'delegate_task':
                        await this.handleDelegateTaskAction(conversationId, agentId, action);
                        break;
                    case 'schedule_meeting':
                        await this.handleScheduleMeetingAction(conversationId, agentId, action);
                        break;
                    case 'escalate_to_ceo':
                        await this.handleEscalateToCEOAction(conversationId, agentId, action);
                        break;
                    default:
                        console.log(`Unknown action type: ${action.type}`);
                }
            } catch (error) {
                console.error(`Error executing action ${action.type}:`, error);
            }
        }
    }

    /**
     * Handle create task action
     */
    async handleCreateTaskAction(conversationId, agentId, action) {
        const conversation = this.conversations.get(conversationId);
        
        const task = this.taskManager.createTask({
            title: `Collaborative Task: ${action.description}`,
            description: action.description,
            priority: 'medium',
            category: 'collaboration',
            createdBy: agentId,
            requiredSkills: this.extractSkillsFromDescription(action.description),
            requiresCEOApproval: false
        });

        // Notify conversation participants
        await this.sendMessage(
            conversationId,
            'system',
            `📋 Task created: "${task.title}" (ID: ${task.id})`,
            'information'
        );

        return task;
    }

    /**
     * Handle request help action
     */
    async handleRequestHelpAction(conversationId, agentId, action) {
        const conversation = this.conversations.get(conversationId);
        const helpRequest = {
            id: this.generateMessageId(),
            requestedBy: agentId,
            description: action.description,
            urgency: 'normal',
            createdAt: new Date()
        };

        // Find best agent to help based on skills needed
        const skillsNeeded = this.extractSkillsFromDescription(action.description);
        const bestHelper = this.taskManager.findBestAgent({
            requiredSkills: skillsNeeded,
            priority: 'medium'
        });

        if (bestHelper && !conversation.participants.includes(bestHelper)) {
            // Invite the helper to the conversation
            conversation.participants.push(bestHelper);
            this.agentChannels.get(bestHelper).activeConversations.push(conversationId);
            
            await this.sendMessage(
                conversationId,
                'system',
                `🤝 ${bestHelper} has been invited to help with: ${action.description}`,
                'information'
            );
        }

        return helpRequest;
    }

    /**
     * Handle delegate task action
     */
    async handleDelegateTaskAction(conversationId, agentId, action) {
        // Extract task ID from description if provided
        const taskIdMatch = action.description.match(/task[\s#]*(\w+-\w+-\w+-\w+-\w+)/i);
        
        if (taskIdMatch) {
            const taskId = taskIdMatch[1];
            const result = this.taskManager.agentSelfAssign(agentId, taskId, 'delegate');
            
            await this.sendMessage(
                conversationId,
                'system',
                `🔄 Task delegation: ${result.message || result.reason}`,
                'information'
            );
        }
    }

    /**
     * Handle escalate to CEO action
     */
    async handleEscalateToCEOAction(conversationId, agentId, action) {
        const conversation = this.conversations.get(conversationId);
        
        // Create escalation record
        const escalation = {
            id: this.generateMessageId(),
            conversationId,
            escalatedBy: agentId,
            reason: action.description,
            escalatedAt: new Date(),
            status: 'pending'
        };

        // Notify CEO (this would integrate with CEO notification system)
        this.emit('ceoEscalation', escalation);
        
        await this.sendMessage(
            conversationId,
            'system',
            `🚨 Escalated to CEO: ${action.description}`,
            'information'
        );

        return escalation;
    }

    /**
     * Start negotiation session between agents
     */
    async startNegotiation(initiatorAgent, targetAgent, negotiationTopic, terms) {
        const negotiationId = this.generateConversationId(initiatorAgent, targetAgent, 'negotiation');
        
        const negotiation = {
            id: negotiationId,
            participants: [initiatorAgent, targetAgent],
            topic: negotiationTopic,
            initialTerms: terms,
            currentTerms: { ...terms },
            status: 'active', // active, agreed, rejected, escalated
            rounds: [],
            startedAt: new Date()
        };

        this.negotiationSessions.set(negotiationId, negotiation);
        
        // Start conversation for negotiation
        const conversationId = await this.initiateConversation(
            initiatorAgent,
            targetAgent,
            'negotiation',
            { negotiationId, topic: negotiationTopic, terms }
        );

        negotiation.conversationId = conversationId;
        
        return negotiationId;
    }

    /**
     * Process negotiation response
     */
    async processNegotiationResponse(negotiationId, respondingAgent, response, counterTerms = null) {
        const negotiation = this.negotiationSessions.get(negotiationId);
        if (!negotiation) return null;

        const round = {
            agent: respondingAgent,
            response, // accept, reject, counter
            terms: counterTerms,
            timestamp: new Date()
        };

        negotiation.rounds.push(round);

        if (response === 'accept') {
            negotiation.status = 'agreed';
            await this.sendMessage(
                negotiation.conversationId,
                'system',
                `✅ Negotiation agreed! Terms accepted.`,
                'information'
            );
        } else if (response === 'reject') {
            negotiation.status = 'rejected';
            await this.sendMessage(
                negotiation.conversationId,
                'system',
                `❌ Negotiation rejected.`,
                'information'
            );
        } else if (response === 'counter' && counterTerms) {
            negotiation.currentTerms = { ...counterTerms };
            await this.sendMessage(
                negotiation.conversationId,
                'system',
                `🔄 Counter-proposal made with new terms.`,
                'information'
            );
        }

        return negotiation;
    }

    /**
     * Get response delay based on agent preferences
     */
    getResponseDelay(agentId) {
        const preferences = this.agentChannels.get(agentId)?.preferences;
        if (!preferences) return 2000; // Default 2 seconds

        switch (preferences.responseTime) {
            case 'immediate': return Math.random() * 3000 + 1000; // 1-4 seconds
            case 'delayed': return Math.random() * 10000 + 5000; // 5-15 seconds
            case 'scheduled': return Math.random() * 30000 + 10000; // 10-40 seconds
            default: return 2000;
        }
    }

    /**
     * Notify agent of new message
     */
    async notifyAgent(agentId, message) {
        const channel = this.agentChannels.get(agentId);
        if (!channel) return;

        // Add to message queue if agent is busy
        if (channel.status === 'busy') {
            channel.messageQueue.push(message);
            return;
        }

        // Emit notification event
        this.emit('agentNotification', {
            agentId,
            message,
            timestamp: new Date()
        });
    }

    /**
     * Extract skills from text description
     */
    extractSkillsFromDescription(description) {
        const skillKeywords = {
            'marketing': ['marketing', 'brand', 'campaign', 'social media', 'promotion'],
            'technical': ['code', 'development', 'programming', 'system', 'architecture'],
            'creative': ['design', 'creative', 'visual', 'artistic', 'branding'],
            'analytics': ['data', 'analysis', 'metrics', 'reporting', 'statistics'],
            'research': ['research', 'analysis', 'study', 'investigation', 'strategy']
        };

        const skills = [];
        const lowerDesc = description.toLowerCase();

        for (const [skill, keywords] of Object.entries(skillKeywords)) {
            if (keywords.some(keyword => lowerDesc.includes(keyword))) {
                skills.push(skill);
            }
        }

        return skills;
    }

    /**
     * Generate unique conversation ID
     */
    generateConversationId(agent1, agent2, suffix = '') {
        const agents = [agent1, agent2].sort();
        const timestamp = Date.now();
        return `conv_${agents.join('_')}_${timestamp}${suffix ? '_' + suffix : ''}`;
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get conversation history
     */
    getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }

    /**
     * Get all active conversations for an agent
     */
    getAgentConversations(agentId) {
        const channel = this.agentChannels.get(agentId);
        if (!channel) return [];

        return channel.activeConversations.map(convId => 
            this.conversations.get(convId)
        ).filter(conv => conv && conv.status === 'active');
    }

    /**
     * Get communication statistics
     */
    getCommunicationStats() {
        const stats = {
            totalConversations: this.conversations.size,
            activeConversations: Array.from(this.conversations.values())
                .filter(conv => conv.status === 'active').length,
            totalMessages: this.messageHistory.length,
            activeNegotiations: Array.from(this.negotiationSessions.values())
                .filter(neg => neg.status === 'active').length,
            agentActivity: {}
        };

        // Calculate agent activity
        for (const [agentId, channel] of this.agentChannels) {
            const agentMessages = this.messageHistory.filter(msg => msg.fromAgent === agentId);
            stats.agentActivity[agentId] = {
                messagesSent: agentMessages.length,
                activeConversations: channel.activeConversations.length,
                status: channel.status
            };
        }

        return stats;
    }
}

module.exports = ATOMCommunication;