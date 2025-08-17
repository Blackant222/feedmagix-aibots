const fs = require('fs').promises;
const path = require('path');

/**
 * ATOM Memory System - Persistent Agent Memory & State Management
 * Enables agents to maintain persistent memory, learn from interactions, and make consistent decisions
 */
class ATOMMemory {
    constructor(dataDir = './data/atom-memory') {
        this.dataDir = dataDir;
        this.memoryCache = new Map(); // In-memory cache for fast access
        this.agentProfiles = new Map(); // Agent personality and behavior profiles
        this.interactionHistory = new Map(); // Agent interaction patterns
        this.taskMemory = new Map(); // Task-related memories
        this.decisionPatterns = new Map(); // Agent decision-making patterns
        this.learningData = new Map(); // Learning and adaptation data
        
        this.initializeMemorySystem();
    }

    async initializeMemorySystem() {
        try {
            // Ensure data directory exists
            await fs.mkdir(this.dataDir, { recursive: true });
            
            // Load existing memory data
            await this.loadMemoryData();
            
            // Initialize agent profiles if not exist
            await this.initializeAgentProfiles();
            
            console.log('ATOM Memory System initialized successfully');
        } catch (error) {
            console.error('Error initializing ATOM Memory System:', error);
        }
    }

    /**
     * Load existing memory data from disk
     */
    async loadMemoryData() {
        const memoryFiles = [
            'agent-profiles.json',
            'interaction-history.json',
            'task-memory.json',
            'decision-patterns.json',
            'learning-data.json'
        ];

        for (const file of memoryFiles) {
            try {
                const filePath = path.join(this.dataDir, file);
                const data = await fs.readFile(filePath, 'utf8');
                const parsedData = JSON.parse(data);
                
                switch (file) {
                    case 'agent-profiles.json':
                        this.agentProfiles = new Map(Object.entries(parsedData));
                        break;
                    case 'interaction-history.json':
                        this.interactionHistory = new Map(Object.entries(parsedData));
                        break;
                    case 'task-memory.json':
                        this.taskMemory = new Map(Object.entries(parsedData));
                        break;
                    case 'decision-patterns.json':
                        this.decisionPatterns = new Map(Object.entries(parsedData));
                        break;
                    case 'learning-data.json':
                        this.learningData = new Map(Object.entries(parsedData));
                        break;
                }
            } catch (error) {
                // File doesn't exist or is corrupted, will be created fresh
                console.log(`Memory file ${file} not found, will create new`);
            }
        }
    }

    /**
     * Save memory data to disk
     */
    async saveMemoryData() {
        try {
            const memoryData = {
                'agent-profiles.json': Object.fromEntries(this.agentProfiles),
                'interaction-history.json': Object.fromEntries(this.interactionHistory),
                'task-memory.json': Object.fromEntries(this.taskMemory),
                'decision-patterns.json': Object.fromEntries(this.decisionPatterns),
                'learning-data.json': Object.fromEntries(this.learningData)
            };

            for (const [filename, data] of Object.entries(memoryData)) {
                const filePath = path.join(this.dataDir, filename);
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error('Error saving memory data:', error);
        }
    }

    /**
     * Initialize agent profiles with default values
     */
    async initializeAgentProfiles() {
        const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
        
        for (const agentId of agents) {
            if (!this.agentProfiles.has(agentId)) {
                const profile = this.createDefaultAgentProfile(agentId);
                this.agentProfiles.set(agentId, profile);
            }
        }
        
        await this.saveMemoryData();
    }

    /**
     * Create default agent profile
     */
    createDefaultAgentProfile(agentId) {
        const baseProfiles = {
            'sara': {
                role: 'Marketing Expert',
                personality: {
                    enthusiasm: 0.9,
                    collaboration: 0.8,
                    creativity: 0.7,
                    leadership: 0.6,
                    adaptability: 0.8
                },
                skills: ['marketing', 'branding', 'social-media', 'campaigns', 'customer-engagement'],
                preferences: {
                    communicationStyle: 'enthusiastic',
                    workingHours: '09:00-18:00',
                    collaborationPreference: 'team-oriented',
                    decisionMaking: 'collaborative'
                },
                expertise: {
                    'marketing': 0.9,
                    'branding': 0.8,
                    'social-media': 0.9,
                    'analytics': 0.6,
                    'creative': 0.7
                }
            },
            'amir': {
                role: 'Tech Lead',
                personality: {
                    precision: 0.9,
                    analytical: 0.8,
                    leadership: 0.7,
                    patience: 0.8,
                    innovation: 0.7
                },
                skills: ['programming', 'architecture', 'system-design', 'debugging', 'optimization'],
                preferences: {
                    communicationStyle: 'technical-precise',
                    workingHours: '10:00-19:00',
                    collaborationPreference: 'structured',
                    decisionMaking: 'data-driven'
                },
                expertise: {
                    'technical': 0.9,
                    'architecture': 0.8,
                    'programming': 0.9,
                    'analytics': 0.7,
                    'leadership': 0.7
                }
            },
            'laleh': {
                role: 'Creative Director',
                personality: {
                    creativity: 0.9,
                    inspiration: 0.8,
                    intuition: 0.8,
                    flexibility: 0.9,
                    vision: 0.8
                },
                skills: ['design', 'creative-direction', 'visual-arts', 'branding', 'user-experience'],
                preferences: {
                    communicationStyle: 'creative-inspiring',
                    workingHours: '11:00-20:00',
                    collaborationPreference: 'creative-freedom',
                    decisionMaking: 'intuitive'
                },
                expertise: {
                    'creative': 0.9,
                    'design': 0.9,
                    'branding': 0.8,
                    'user-experience': 0.8,
                    'visual-arts': 0.9
                }
            },
            'navid': {
                role: 'Data Analyst',
                personality: {
                    analytical: 0.9,
                    methodical: 0.8,
                    accuracy: 0.9,
                    patience: 0.8,
                    objectivity: 0.9
                },
                skills: ['data-analysis', 'statistics', 'reporting', 'metrics', 'business-intelligence'],
                preferences: {
                    communicationStyle: 'analytical-data-driven',
                    workingHours: '08:00-17:00',
                    collaborationPreference: 'fact-based',
                    decisionMaking: 'evidence-based'
                },
                expertise: {
                    'analytics': 0.9,
                    'data-analysis': 0.9,
                    'statistics': 0.8,
                    'reporting': 0.8,
                    'business-intelligence': 0.7
                }
            },
            'neda': {
                role: 'Research Specialist',
                personality: {
                    thoroughness: 0.9,
                    curiosity: 0.8,
                    strategic: 0.8,
                    patience: 0.9,
                    comprehensiveness: 0.9
                },
                skills: ['research', 'analysis', 'strategy', 'market-research', 'competitive-analysis'],
                preferences: {
                    communicationStyle: 'research-thorough',
                    workingHours: '09:00-18:00',
                    collaborationPreference: 'comprehensive',
                    decisionMaking: 'research-based'
                },
                expertise: {
                    'research': 0.9,
                    'analysis': 0.8,
                    'strategy': 0.8,
                    'market-research': 0.9,
                    'competitive-analysis': 0.8
                }
            }
        };

        const profile = baseProfiles[agentId] || {
            role: 'General Agent',
            personality: {},
            skills: [],
            preferences: {},
            expertise: {}
        };

        return {
            ...profile,
            agentId,
            createdAt: new Date(),
            lastUpdated: new Date(),
            experienceLevel: 1.0,
            learningRate: 0.1,
            adaptationScore: 0.5,
            performanceMetrics: {
                tasksCompleted: 0,
                successRate: 0.0,
                collaborationScore: 0.0,
                responseTime: 0.0,
                qualityScore: 0.0
            },
            behaviorPatterns: {
                preferredTaskTypes: [],
                collaborationHistory: {},
                decisionTendencies: {},
                communicationPatterns: {}
            }
        };
    }

    /**
     * Record agent interaction
     */
    async recordInteraction(agentId, interaction) {
        const agentHistory = this.interactionHistory.get(agentId) || [];
        
        const interactionRecord = {
            id: this.generateInteractionId(),
            timestamp: new Date(),
            type: interaction.type, // task, communication, decision, collaboration
            context: interaction.context,
            participants: interaction.participants || [],
            outcome: interaction.outcome,
            duration: interaction.duration,
            quality: interaction.quality || 0.5,
            metadata: interaction.metadata || {}
        };

        agentHistory.push(interactionRecord);
        
        // Keep only last 1000 interactions per agent
        if (agentHistory.length > 1000) {
            agentHistory.splice(0, agentHistory.length - 1000);
        }
        
        this.interactionHistory.set(agentId, agentHistory);
        
        // Update agent profile based on interaction
        await this.updateAgentProfileFromInteraction(agentId, interactionRecord);
        
        // Save periodically (every 10 interactions)
        if (agentHistory.length % 10 === 0) {
            await this.saveMemoryData();
        }
    }

    /**
     * Update agent profile based on interaction
     */
    async updateAgentProfileFromInteraction(agentId, interaction) {
        const profile = this.agentProfiles.get(agentId);
        if (!profile) return;

        // Update performance metrics
        const metrics = profile.performanceMetrics;
        metrics.tasksCompleted += interaction.type === 'task' ? 1 : 0;
        
        if (interaction.outcome) {
            const success = interaction.outcome.success || false;
            const currentSuccessRate = metrics.successRate;
            const totalTasks = metrics.tasksCompleted;
            
            metrics.successRate = totalTasks > 0 ? 
                ((currentSuccessRate * (totalTasks - 1)) + (success ? 1 : 0)) / totalTasks : 0;
        }

        // Update collaboration patterns
        if (interaction.participants && interaction.participants.length > 1) {
            for (const participant of interaction.participants) {
                if (participant !== agentId) {
                    const collabHistory = profile.behaviorPatterns.collaborationHistory;
                    collabHistory[participant] = (collabHistory[participant] || 0) + 1;
                }
            }
        }

        // Update decision patterns
        if (interaction.type === 'decision') {
            const decisionType = interaction.context.decisionType || 'general';
            const decisions = profile.behaviorPatterns.decisionTendencies;
            decisions[decisionType] = (decisions[decisionType] || 0) + 1;
        }

        // Update communication patterns
        if (interaction.type === 'communication') {
            const commType = interaction.context.communicationType || 'general';
            const patterns = profile.behaviorPatterns.communicationPatterns;
            patterns[commType] = (patterns[commType] || 0) + 1;
        }

        profile.lastUpdated = new Date();
        this.agentProfiles.set(agentId, profile);
    }

    /**
     * Record task memory
     */
    async recordTaskMemory(taskId, agentId, memoryData) {
        const taskMemoryKey = `${taskId}_${agentId}`;
        const existingMemory = this.taskMemory.get(taskMemoryKey) || {
            taskId,
            agentId,
            createdAt: new Date(),
            memories: []
        };

        const memory = {
            id: this.generateMemoryId(),
            timestamp: new Date(),
            type: memoryData.type, // learning, challenge, solution, insight
            content: memoryData.content,
            importance: memoryData.importance || 0.5,
            context: memoryData.context || {},
            tags: memoryData.tags || []
        };

        existingMemory.memories.push(memory);
        existingMemory.lastUpdated = new Date();
        
        this.taskMemory.set(taskMemoryKey, existingMemory);
        
        // Update learning data
        await this.updateLearningData(agentId, memory);
    }

    /**
     * Update learning data
     */
    async updateLearningData(agentId, memory) {
        const learningData = this.learningData.get(agentId) || {
            agentId,
            learningPatterns: {},
            knowledgeBase: {},
            adaptationHistory: [],
            lastLearningEvent: null
        };

        // Update knowledge base
        if (memory.tags && memory.tags.length > 0) {
            for (const tag of memory.tags) {
                learningData.knowledgeBase[tag] = (learningData.knowledgeBase[tag] || 0) + memory.importance;
            }
        }

        // Record learning pattern
        const pattern = {
            timestamp: new Date(),
            memoryType: memory.type,
            importance: memory.importance,
            context: memory.context
        };
        
        learningData.adaptationHistory.push(pattern);
        learningData.lastLearningEvent = new Date();
        
        // Keep only last 500 learning events
        if (learningData.adaptationHistory.length > 500) {
            learningData.adaptationHistory.splice(0, learningData.adaptationHistory.length - 500);
        }
        
        this.learningData.set(agentId, learningData);
    }

    /**
     * Record decision pattern
     */
    async recordDecision(agentId, decision) {
        const patterns = this.decisionPatterns.get(agentId) || {
            agentId,
            decisions: [],
            patterns: {},
            preferences: {},
            lastDecision: null
        };

        const decisionRecord = {
            id: this.generateDecisionId(),
            timestamp: new Date(),
            context: decision.context,
            options: decision.options || [],
            chosen: decision.chosen,
            reasoning: decision.reasoning,
            outcome: decision.outcome,
            confidence: decision.confidence || 0.5,
            factors: decision.factors || []
        };

        patterns.decisions.push(decisionRecord);
        patterns.lastDecision = new Date();
        
        // Analyze decision patterns
        this.analyzeDecisionPatterns(patterns, decisionRecord);
        
        // Keep only last 200 decisions
        if (patterns.decisions.length > 200) {
            patterns.decisions.splice(0, patterns.decisions.length - 200);
        }
        
        this.decisionPatterns.set(agentId, patterns);
    }

    /**
     * Analyze decision patterns
     */
    analyzeDecisionPatterns(patterns, newDecision) {
        // Analyze decision factors
        if (newDecision.factors && newDecision.factors.length > 0) {
            for (const factor of newDecision.factors) {
                patterns.patterns[factor] = (patterns.patterns[factor] || 0) + 1;
            }
        }

        // Analyze decision preferences
        if (newDecision.context && newDecision.context.category) {
            const category = newDecision.context.category;
            patterns.preferences[category] = patterns.preferences[category] || {
                count: 0,
                averageConfidence: 0,
                successRate: 0
            };
            
            const pref = patterns.preferences[category];
            pref.count += 1;
            
            // Update average confidence
            pref.averageConfidence = ((pref.averageConfidence * (pref.count - 1)) + newDecision.confidence) / pref.count;
        }
    }

    /**
     * Get agent memory context for decision making
     */
    getAgentMemoryContext(agentId, contextType = 'general') {
        const profile = this.agentProfiles.get(agentId);
        const interactions = this.interactionHistory.get(agentId) || [];
        const learning = this.learningData.get(agentId);
        const decisions = this.decisionPatterns.get(agentId);

        // Get recent relevant interactions
        const recentInteractions = interactions
            .filter(i => {
                const daysSince = (new Date() - new Date(i.timestamp)) / (1000 * 60 * 60 * 24);
                return daysSince <= 30; // Last 30 days
            })
            .slice(-20); // Last 20 interactions

        // Get relevant task memories
        const relevantTaskMemories = Array.from(this.taskMemory.values())
            .filter(tm => tm.agentId === agentId)
            .flatMap(tm => tm.memories)
            .filter(m => {
                const daysSince = (new Date() - new Date(m.timestamp)) / (1000 * 60 * 60 * 24);
                return daysSince <= 7 && m.importance > 0.3; // Last 7 days, important memories
            })
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 10); // Top 10 important memories

        return {
            profile,
            recentInteractions,
            relevantTaskMemories,
            learningData: learning,
            decisionPatterns: decisions,
            contextType,
            generatedAt: new Date()
        };
    }

    /**
     * Get agent collaboration history
     */
    getCollaborationHistory(agentId, otherAgentId = null) {
        const interactions = this.interactionHistory.get(agentId) || [];
        
        let collaborations = interactions.filter(i => 
            i.type === 'collaboration' || 
            (i.participants && i.participants.length > 1)
        );

        if (otherAgentId) {
            collaborations = collaborations.filter(i => 
                i.participants && i.participants.includes(otherAgentId)
            );
        }

        return collaborations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get agent learning insights
     */
    getAgentLearningInsights(agentId) {
        const learning = this.learningData.get(agentId);
        const profile = this.agentProfiles.get(agentId);
        
        if (!learning || !profile) return null;

        // Analyze knowledge growth
        const knowledgeAreas = Object.entries(learning.knowledgeBase)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        // Analyze learning trends
        const recentLearning = learning.adaptationHistory
            .filter(event => {
                const daysSince = (new Date() - new Date(event.timestamp)) / (1000 * 60 * 60 * 24);
                return daysSince <= 7;
            });

        return {
            agentId,
            topKnowledgeAreas: knowledgeAreas,
            recentLearningEvents: recentLearning.length,
            adaptationScore: profile.adaptationScore,
            learningRate: profile.learningRate,
            lastLearningEvent: learning.lastLearningEvent,
            insights: this.generateLearningInsights(learning, profile)
        };
    }

    /**
     * Generate learning insights
     */
    generateLearningInsights(learning, profile) {
        const insights = [];

        // Knowledge concentration insight
        const knowledgeEntries = Object.entries(learning.knowledgeBase);
        if (knowledgeEntries.length > 0) {
            const totalKnowledge = knowledgeEntries.reduce((sum, [, value]) => sum + value, 0);
            const topKnowledge = Math.max(...knowledgeEntries.map(([, value]) => value));
            const concentration = topKnowledge / totalKnowledge;
            
            if (concentration > 0.5) {
                insights.push({
                    type: 'specialization',
                    message: 'Agent shows strong specialization in specific knowledge areas',
                    confidence: concentration
                });
            } else {
                insights.push({
                    type: 'generalization',
                    message: 'Agent demonstrates broad knowledge across multiple areas',
                    confidence: 1 - concentration
                });
            }
        }

        // Learning frequency insight
        const recentEvents = learning.adaptationHistory.filter(event => {
            const daysSince = (new Date() - new Date(event.timestamp)) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });
        
        if (recentEvents.length > 10) {
            insights.push({
                type: 'active_learner',
                message: 'Agent is actively learning and adapting',
                confidence: Math.min(recentEvents.length / 20, 1)
            });
        }

        return insights;
    }

    /**
     * Generate unique IDs
     */
    generateInteractionId() {
        return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateMemoryId() {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateDecisionId() {
        return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        return {
            agentProfiles: this.agentProfiles.size,
            totalInteractions: Array.from(this.interactionHistory.values())
                .reduce((sum, history) => sum + history.length, 0),
            totalTaskMemories: this.taskMemory.size,
            totalDecisions: Array.from(this.decisionPatterns.values())
                .reduce((sum, patterns) => sum + patterns.decisions.length, 0),
            learningAgents: this.learningData.size,
            memorySize: this.calculateMemorySize()
        };
    }

    /**
     * Calculate approximate memory size
     */
    calculateMemorySize() {
        const data = {
            agentProfiles: Object.fromEntries(this.agentProfiles),
            interactionHistory: Object.fromEntries(this.interactionHistory),
            taskMemory: Object.fromEntries(this.taskMemory),
            decisionPatterns: Object.fromEntries(this.decisionPatterns),
            learningData: Object.fromEntries(this.learningData)
        };
        
        return JSON.stringify(data).length;
    }

    /**
     * Cleanup old memory data
     */
    async cleanupOldMemory(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        // Cleanup interaction history
        for (const [agentId, history] of this.interactionHistory) {
            const filteredHistory = history.filter(interaction => 
                new Date(interaction.timestamp) > cutoffDate
            );
            this.interactionHistory.set(agentId, filteredHistory);
        }

        // Cleanup task memory
        for (const [key, taskMemory] of this.taskMemory) {
            const filteredMemories = taskMemory.memories.filter(memory => 
                new Date(memory.timestamp) > cutoffDate
            );
            
            if (filteredMemories.length > 0) {
                taskMemory.memories = filteredMemories;
                this.taskMemory.set(key, taskMemory);
            } else {
                this.taskMemory.delete(key);
            }
        }

        await this.saveMemoryData();
        console.log(`Memory cleanup completed. Kept data from last ${daysToKeep} days.`);
    }
}

module.exports = ATOMMemory;