const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome da atividade é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
    },
    type: {
        type: String,
        required: [true, 'Tipo da atividade é obrigatório'],
        enum: {
            values: ['positive', 'negative'],
            message: 'Tipo deve ser "positive" ou "negative"'
        }
    },
    points: {
        type: Number,
        required: [true, 'Pontos são obrigatórios'],
        min: [1, 'Pontos deve ser pelo menos 1']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
    },
    icon: {
        type: String,
        default: '🎯',
        maxlength: [2, 'Ícone deve ter no máximo 2 caracteres']
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
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: false,
        default: null
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do pai é obrigatório']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Método estático para obter atividades padrão
activitySchema.statics.getDefaultActivities = function() {
    return [
        // Comportamento
        {
            name: 'Bom comportamento',
            type: 'positive',
            points: 10,
            description: 'Demonstrar bom comportamento em casa',
            icon: '😊',
            color: '#10B981',
            parentId: null // Será definido pelo usuário
        },
        {
            name: 'Ajudar em casa',
            type: 'positive',
            points: 15,
            description: 'Ajudar com tarefas domésticas',
            icon: '🏠',
            color: '#3B82F6',
            parentId: null
        },
        {
            name: 'Fazer lição de casa',
            type: 'positive',
            points: 20,
            description: 'Completar tarefas escolares',
            icon: '📚',
            color: '#8B5CF6',
            parentId: null
        },
        {
            name: 'Ler um livro',
            type: 'positive',
            points: 15,
            description: 'Ler por pelo menos 20 minutos',
            icon: '📖',
            color: '#F59E0B',
            parentId: null
        },
        {
            name: 'Fazer exercícios',
            type: 'positive',
            points: 12,
            description: 'Praticar atividade física',
            icon: '🏃',
            color: '#EF4444',
            parentId: null
        },
        {
            name: 'Comer frutas/verduras',
            type: 'positive',
            points: 8,
            description: 'Consumir alimentos saudáveis',
            icon: '🥗',
            color: '#10B981',
            parentId: null
        },
        {
            name: 'Ser gentil',
            type: 'positive',
            points: 10,
            description: 'Ser gentil com familiares e amigos',
            icon: '🤗',
            color: '#F472B6',
            parentId: null
        },
        {
            name: 'Organizar quarto',
            type: 'positive',
            points: 12,
            description: 'Manter o quarto organizado',
            icon: '🧹',
            color: '#6B7280',
            parentId: null
        },
        // Atividades negativas
        {
            name: 'Mau comportamento',
            type: 'negative',
            points: 10,
            description: 'Comportamento inadequado',
            icon: '😞',
            color: '#EF4444',
            parentId: null
        },
        {
            name: 'Não fazer lição',
            type: 'negative',
            points: 15,
            description: 'Não completar tarefas escolares',
            icon: '❌',
            color: '#DC2626',
            parentId: null
        },
        {
            name: 'Desobedecer',
            type: 'negative',
            points: 12,
            description: 'Não seguir instruções dos pais',
            icon: '🙅',
            color: '#F59E0B',
            parentId: null
        }
    ];
};

// Índices
activitySchema.index({ parentId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ isActive: 1 });

module.exports = mongoose.model('Activity', activitySchema); 