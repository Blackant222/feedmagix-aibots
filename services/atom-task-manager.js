const { v4: uuidv4 } = require('uuid');

/**
 * ATOM Task Manager - Autonomous Task-Oriented Multi-Agent Office
 * Handles task lifecycle, agent assignments, and autonomous collaboration
 */
class ATOMTaskManager {
    constructor() {
        this.tasks = new Map();
        this.agentWorkloads = new Map();
        this.taskHistory = [];
        this.ceoApprovalQueue = [];
        
        // Initialize agent workloads
        this.initializeAgents();
    }

    initializeAgents() {
        const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
        agents.forEach(agent => {
            this.agentWorkloads.set(agent, {
                currentTasks: [],
                completedTasks: 0,
                workloadScore: 0,
                specialties: this.getAgentSpecialties(agent),
                availability: 'available' // available, busy, offline
            });
        });
    }

    getAgentSpecialties(agentId) {
        const specialties = {
            'sara': ['marketing', 'social_media', 'brand_management', 'customer_engagement'],
            'amir': ['technical_development', 'system_architecture', 'code_review', 'devops'],
            'laleh': ['creative_design', 'visual_content', 'brand_identity', 'user_experience'],
            'navid': ['data_analysis', 'business_intelligence', 'performance_metrics', 'reporting'],
            'neda': ['research_development', 'market_analysis', 'innovation', 'strategic_planning']
        };
        return specialties[agentId] || [];
    }

    /**
     * Create a new task with autonomous assignment logic
     */
    createTask({
        title,
        description,
        priority = 'medium', // low, medium, high, critical
        category,
        requiredSkills = [],
        deadline = null,
        createdBy = 'coordinator',
        requiresCEOApproval = false,
        dependencies = []
    }) {
        const taskId = uuidv4();
        const task = {
            id: taskId,
            title,
            description,
            priority,
            category,
            requiredSkills,
            deadline,
            createdBy,
            createdAt: new Date(),
            status: 'pending', // pending, assigned, in_progress, review, completed, cancelled
            assignedTo: null,
            requiresCEOApproval,
            dependencies,
            subtasks: [],
            collaborators: [],
            progress: 0,
            estimatedHours: this.estimateTaskHours(priority, category),
            actualHours: 0,
            notes: [],
            escalationLevel: 0
        };

        this.tasks.set(taskId, task);
        
        // Auto-assign if not requiring CEO approval
        if (!requiresCEOApproval) {
            this.autonomousAssignment(taskId);
        } else {
            this.addToCEOApprovalQueue(taskId);
        }

        return task;
    }

    /**
     * Autonomous task assignment based on agent capabilities and workload
     */
    autonomousAssignment(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        // Find best agent based on skills, workload, and availability
        const bestAgent = this.findBestAgent(task);
        
        if (bestAgent) {
            this.assignTask(taskId, bestAgent);
            return bestAgent;
        }

        // If no single agent is perfect, create collaboration
        const collaborators = this.findCollaborativeTeam(task);
        if (collaborators.length > 0) {
            this.createCollaborativeTask(taskId, collaborators);
            return collaborators;
        }

        return null;
    }

    /**
     * Find the best agent for a task
     */
    findBestAgent(task) {
        let bestAgent = null;
        let bestScore = -1;

        for (const [agentId, workload] of this.agentWorkloads) {
            if (workload.availability === 'offline') continue;

            const score = this.calculateAgentScore(agentId, task, workload);
            
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agentId;
            }
        }

        return bestAgent;
    }

    /**
     * Calculate agent suitability score for a task
     */
    calculateAgentScore(agentId, task, workload) {
        let score = 0;

        // Skill match score (0-50 points)
        const skillMatch = this.calculateSkillMatch(workload.specialties, task.requiredSkills);
        score += skillMatch * 50;

        // Workload score (0-30 points) - lower workload = higher score
        const workloadScore = Math.max(0, 30 - workload.workloadScore);
        score += workloadScore;

        // Availability score (0-20 points)
        const availabilityScore = workload.availability === 'available' ? 20 : 
                                 workload.availability === 'busy' ? 10 : 0;
        score += availabilityScore;

        return score;
    }

    /**
     * Calculate skill match percentage
     */
    calculateSkillMatch(agentSkills, requiredSkills) {
        if (requiredSkills.length === 0) return 0.5; // neutral score
        
        const matches = requiredSkills.filter(skill => 
            agentSkills.some(agentSkill => 
                agentSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(agentSkill.toLowerCase())
            )
        );
        
        return matches.length / requiredSkills.length;
    }

    /**
     * Find collaborative team for complex tasks
     */
    findCollaborativeTeam(task) {
        const team = [];
        const requiredSkills = [...task.requiredSkills];
        
        // Find agents that cover different required skills
        for (const [agentId, workload] of this.agentWorkloads) {
            if (workload.availability === 'offline') continue;
            
            const agentSkills = workload.specialties;
            const coveredSkills = requiredSkills.filter(skill => 
                agentSkills.some(agentSkill => 
                    agentSkill.toLowerCase().includes(skill.toLowerCase())
                )
            );
            
            if (coveredSkills.length > 0) {
                team.push(agentId);
                // Remove covered skills from required list
                coveredSkills.forEach(skill => {
                    const index = requiredSkills.indexOf(skill);
                    if (index > -1) requiredSkills.splice(index, 1);
                });
            }
            
            // Stop if we have enough coverage or team is getting large
            if (requiredSkills.length === 0 || team.length >= 3) break;
        }
        
        return team;
    }

    /**
     * Assign task to specific agent
     */
    assignTask(taskId, agentId) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.assignedTo = agentId;
        task.status = 'assigned';
        task.assignedAt = new Date();

        // Update agent workload
        const workload = this.agentWorkloads.get(agentId);
        workload.currentTasks.push(taskId);
        workload.workloadScore += this.getTaskWeight(task);

        return true;
    }

    /**
     * Create collaborative task with multiple agents
     */
    createCollaborativeTask(taskId, collaborators) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.assignedTo = collaborators[0]; // Primary assignee
        task.collaborators = collaborators.slice(1); // Additional collaborators
        task.status = 'assigned';
        task.assignedAt = new Date();
        task.isCollaborative = true;

        // Update workloads for all collaborators
        collaborators.forEach(agentId => {
            const workload = this.agentWorkloads.get(agentId);
            workload.currentTasks.push(taskId);
            workload.workloadScore += this.getTaskWeight(task) / collaborators.length;
        });

        return true;
    }

    /**
     * Agent self-assigns a task or delegates to another agent
     */
    agentSelfAssign(agentId, taskId, action = 'take') {
        const task = this.tasks.get(taskId);
        if (!task) return { success: false, reason: 'Task not found' };

        if (action === 'take') {
            // Agent wants to take the task
            if (task.status !== 'pending') {
                return { success: false, reason: 'Task already assigned' };
            }

            const workload = this.agentWorkloads.get(agentId);
            if (workload.workloadScore > 80) {
                return { success: false, reason: 'Agent workload too high' };
            }

            this.assignTask(taskId, agentId);
            return { success: true, message: `Task assigned to ${agentId}` };
        }

        if (action === 'delegate') {
            // Agent wants to delegate the task
            if (task.assignedTo !== agentId) {
                return { success: false, reason: 'Can only delegate own tasks' };
            }

            const newAgent = this.findBestAgent(task);
            if (newAgent && newAgent !== agentId) {
                this.reassignTask(taskId, newAgent);
                return { success: true, message: `Task delegated to ${newAgent}` };
            }

            return { success: false, reason: 'No suitable agent found for delegation' };
        }

        return { success: false, reason: 'Invalid action' };
    }

    /**
     * Reassign task to different agent
     */
    reassignTask(taskId, newAgentId) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        // Remove from current agent's workload
        if (task.assignedTo) {
            const oldWorkload = this.agentWorkloads.get(task.assignedTo);
            const taskIndex = oldWorkload.currentTasks.indexOf(taskId);
            if (taskIndex > -1) {
                oldWorkload.currentTasks.splice(taskIndex, 1);
                oldWorkload.workloadScore -= this.getTaskWeight(task);
            }
        }

        // Assign to new agent
        return this.assignTask(taskId, newAgentId);
    }

    /**
     * Update task progress
     */
    updateTaskProgress(taskId, progress, notes = '') {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.progress = Math.min(100, Math.max(0, progress));
        task.lastUpdated = new Date();
        
        if (notes) {
            task.notes.push({
                timestamp: new Date(),
                content: notes,
                author: task.assignedTo
            });
        }

        // Auto-complete if progress reaches 100%
        if (task.progress === 100 && task.status !== 'completed') {
            this.completeTask(taskId);
        }

        return true;
    }

    /**
     * Complete a task
     */
    completeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.status = 'completed';
        task.completedAt = new Date();
        task.progress = 100;

        // Update agent workload
        if (task.assignedTo) {
            const workload = this.agentWorkloads.get(task.assignedTo);
            const taskIndex = workload.currentTasks.indexOf(taskId);
            if (taskIndex > -1) {
                workload.currentTasks.splice(taskIndex, 1);
                workload.completedTasks++;
                workload.workloadScore -= this.getTaskWeight(task);
            }
        }

        // Add to history
        this.taskHistory.push({
            ...task,
            completionTime: new Date() - task.createdAt
        });

        return true;
    }

    /**
     * Escalate task to CEO approval
     */
    escalateTask(taskId, reason) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.escalationLevel++;
        task.escalationReason = reason;
        task.escalatedAt = new Date();
        
        this.addToCEOApprovalQueue(taskId);
        return true;
    }

    /**
     * Add task to CEO approval queue
     */
    addToCEOApprovalQueue(taskId) {
        if (!this.ceoApprovalQueue.includes(taskId)) {
            this.ceoApprovalQueue.push(taskId);
        }
    }

    /**
     * CEO approves or rejects task
     */
    ceoDecision(taskId, approved, feedback = '') {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.ceoApproved = approved;
        task.ceoFeedback = feedback;
        task.ceoDecisionAt = new Date();

        // Remove from approval queue
        const queueIndex = this.ceoApprovalQueue.indexOf(taskId);
        if (queueIndex > -1) {
            this.ceoApprovalQueue.splice(queueIndex, 1);
        }

        if (approved) {
            if (task.status === 'pending') {
                this.autonomousAssignment(taskId);
            }
        } else {
            task.status = 'cancelled';
        }

        return true;
    }

    /**
     * Get task weight for workload calculation
     */
    getTaskWeight(task) {
        const priorityWeights = {
            'low': 5,
            'medium': 10,
            'high': 20,
            'critical': 40
        };
        return priorityWeights[task.priority] || 10;
    }

    /**
     * Estimate task hours based on priority and category
     */
    estimateTaskHours(priority, category) {
        const baseHours = {
            'low': 2,
            'medium': 4,
            'high': 8,
            'critical': 16
        };
        return baseHours[priority] || 4;
    }

    /**
     * Get agent workload summary
     */
    getAgentWorkload(agentId) {
        return this.agentWorkloads.get(agentId);
    }

    /**
     * Get all tasks for an agent
     */
    getAgentTasks(agentId) {
        const tasks = [];
        for (const [taskId, task] of this.tasks) {
            if (task.assignedTo === agentId || task.collaborators.includes(agentId)) {
                tasks.push(task);
            }
        }
        return tasks;
    }

    /**
     * Get tasks requiring CEO approval
     */
    getCEOApprovalQueue() {
        return this.ceoApprovalQueue.map(taskId => this.tasks.get(taskId));
    }

    /**
     * Generate daily summary for CEO
     */
    generateDailySummary() {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayTasks = Array.from(this.tasks.values()).filter(task => 
            task.createdAt >= todayStart
        );
        
        const completedToday = this.taskHistory.filter(task => 
            task.completedAt >= todayStart
        );

        const summary = {
            date: today.toISOString().split('T')[0],
            tasksCreated: todayTasks.length,
            tasksCompleted: completedToday.length,
            pendingApprovals: this.ceoApprovalQueue.length,
            agentWorkloads: Object.fromEntries(this.agentWorkloads),
            topPerformers: this.getTopPerformers(),
            urgentTasks: this.getUrgentTasks(),
            recommendations: this.generateRecommendations()
        };

        return summary;
    }

    /**
     * Get top performing agents
     */
    getTopPerformers() {
        const performers = Array.from(this.agentWorkloads.entries())
            .map(([agentId, workload]) => ({
                agentId,
                completedTasks: workload.completedTasks,
                currentWorkload: workload.workloadScore
            }))
            .sort((a, b) => b.completedTasks - a.completedTasks)
            .slice(0, 3);
        
        return performers;
    }

    /**
     * Get urgent tasks requiring attention
     */
    getUrgentTasks() {
        const urgent = [];
        const now = new Date();
        
        for (const [taskId, task] of this.tasks) {
            if (task.status === 'completed' || task.status === 'cancelled') continue;
            
            // Check for overdue tasks
            if (task.deadline && new Date(task.deadline) < now) {
                urgent.push({ ...task, reason: 'overdue' });
            }
            
            // Check for high priority pending tasks
            if (task.priority === 'critical' && task.status === 'pending') {
                urgent.push({ ...task, reason: 'critical_pending' });
            }
            
            // Check for stalled tasks
            if (task.status === 'in_progress' && task.lastUpdated) {
                const hoursSinceUpdate = (now - new Date(task.lastUpdated)) / (1000 * 60 * 60);
                if (hoursSinceUpdate > 24) {
                    urgent.push({ ...task, reason: 'stalled' });
                }
            }
        }
        
        return urgent;
    }

    /**
     * Generate AI-driven recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Check for workload imbalances
        const workloads = Array.from(this.agentWorkloads.values());
        const avgWorkload = workloads.reduce((sum, w) => sum + w.workloadScore, 0) / workloads.length;
        
        workloads.forEach((workload, index) => {
            const agentId = Array.from(this.agentWorkloads.keys())[index];
            if (workload.workloadScore > avgWorkload * 1.5) {
                recommendations.push({
                    type: 'workload_balance',
                    message: `Consider redistributing tasks from ${agentId} (overloaded)`,
                    priority: 'medium'
                });
            }
        });
        
        // Check for pending CEO approvals
        if (this.ceoApprovalQueue.length > 5) {
            recommendations.push({
                type: 'approval_backlog',
                message: `${this.ceoApprovalQueue.length} tasks awaiting CEO approval`,
                priority: 'high'
            });
        }
        
        return recommendations;
    }
}

module.exports = ATOMTaskManager;