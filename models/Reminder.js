const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do pai é obrigatório']
    },
    kidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kid',
        required: [true, 'ID da criança é obrigatório']
    },
    title: {
        type: String,
        required: [true, 'Título do lembrete é obrigatório'],
        trim: true,
        maxlength: [100, 'Título não pode ter mais de 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'Descrição do lembrete é obrigatória'],
        trim: true,
        maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
    },
    date: {
        type: Date,
        required: [true, 'Data do lembrete é obrigatória']
    },
    time: {
        type: String,
        required: [true, 'Horário do lembrete é obrigatório'],
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Horário deve estar no formato HH:MM'
        }
    },
    repeat: {
        type: String,
        required: [true, 'Tipo de repetição é obrigatório'],
        enum: {
            values: ['none', 'daily', 'weekly', 'monthly'],
            message: 'Repetição deve ser "none", "daily", "weekly" ou "monthly"'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastTriggered: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Índices
reminderSchema.index({ parentId: 1 });
reminderSchema.index({ kidId: 1 });
reminderSchema.index({ date: 1 });
reminderSchema.index({ isActive: 1 });
reminderSchema.index({ repeat: 1 });

module.exports = mongoose.model('Reminder', reminderSchema); 