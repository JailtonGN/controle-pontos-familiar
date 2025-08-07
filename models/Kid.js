const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título do objetivo é obrigatório'],
        trim: true,
        maxlength: [100, 'Título não pode ter mais de 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
    },
    targetPoints: {
        type: Number,
        required: [true, 'Pontos alvo são obrigatórios'],
        min: [1, 'Pontos alvo deve ser pelo menos 1']
    },
    currentPoints: {
        type: Number,
        default: 0,
        min: [0, 'Pontos atuais não podem ser negativos']
    },
    deadline: {
        type: Date,
        default: null
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const kidSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome da criança é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
    },
    age: {
        type: Number,
        required: [true, 'Idade é obrigatória'],
        min: [1, 'Idade deve ser pelo menos 1'],
        max: [18, 'Idade deve ser no máximo 18']
    },
    avatar: {
        type: String,
        default: null
    },
    emoji: {
        type: String,
        default: null,
        maxlength: [2, 'Emoji deve ter no máximo 2 caracteres']
    },
    color: {
        type: String,
        default: '#3B82F6',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Cor deve ser um código hexadecimal válido'
        }
    },
    pin: {
        type: String,
        required: [true, 'PIN é obrigatório'],
        minlength: [4, 'PIN deve ter 4 dígitos'],
        maxlength: [4, 'PIN deve ter 4 dígitos'],
        validate: {
            validator: function(v) {
                return /^[0-9]{4}$/.test(v);
            },
            message: 'PIN deve conter apenas números'
        }
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    currentLevel: {
        type: Number,
        default: 1,
        min: [1, 'Nível atual deve ser pelo menos 1']
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do pai é obrigatório']
    },
    goals: [goalSchema],
    preferences: {
        favoriteActivities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity'
        }],
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Método para adicionar pontos
kidSchema.methods.addPoints = async function(points, activityId = null) {
    this.totalPoints += points;
    
    // Calcular novo nível (a cada 500 pontos = 1 nível)
    const newLevel = Math.floor(this.totalPoints / 500) + 1;
    if (newLevel > this.currentLevel) {
        this.currentLevel = newLevel;
    }
    
    // Atualizar pontos nos objetivos ativos
    if (this.goals && this.goals.length > 0) {
        for (let goal of this.goals) {
            if (!goal.isCompleted && goal.deadline && new Date() <= goal.deadline) {
                goal.currentPoints += points;
                if (goal.currentPoints >= goal.targetPoints) {
                    goal.isCompleted = true;
                    goal.completedAt = new Date();
                }
            }
        }
    }
    
    return await this.save();
};

// Método para remover pontos
kidSchema.methods.removePoints = async function(points) {
    this.totalPoints -= points;
    
    // Recalcular nível (permitir nível 1 mesmo com pontos negativos)
    this.currentLevel = Math.max(1, Math.floor(this.totalPoints / 500) + 1);
    
    return await this.save();
};

// Método para obter progresso do nível atual
kidSchema.methods.getLevelProgress = function() {
    const pointsInCurrentLevel = this.totalPoints % 500;
    const progressPercentage = (pointsInCurrentLevel / 500) * 100;
    
    return {
        currentLevel: this.currentLevel,
        pointsInCurrentLevel,
        pointsForNextLevel: 500 - pointsInCurrentLevel,
        progressPercentage: Math.round(progressPercentage)
    };
};

// Método para obter objetivos ativos
kidSchema.methods.getActiveGoals = function() {
    return this.goals.filter(goal => 
        !goal.isCompleted && 
        (!goal.deadline || new Date() <= goal.deadline)
    );
};

// Método para obter objetivos completados
kidSchema.methods.getCompletedGoals = function() {
    return this.goals.filter(goal => goal.isCompleted);
};

// Índices
kidSchema.index({ parentId: 1 });
kidSchema.index({ isActive: 1 });
kidSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('Kid', kidSchema); 