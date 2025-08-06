const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
    type: {
        type: String,
        required: [true, 'Tipo da mensagem é obrigatório'],
        enum: {
            values: ['motivation', 'reminder', 'praise', 'task'],
            message: 'Tipo deve ser "motivation", "reminder", "praise" ou "task"'
        }
    },
    title: {
        type: String,
        required: [true, 'Título da mensagem é obrigatório'],
        trim: true,
        maxlength: [100, 'Título não pode ter mais de 100 caracteres']
    },
    content: {
        type: String,
        required: [true, 'Conteúdo da mensagem é obrigatório'],
        trim: true,
        maxlength: [500, 'Conteúdo não pode ter mais de 500 caracteres']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices
messageSchema.index({ parentId: 1 });
messageSchema.index({ kidId: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ isActive: 1 });

module.exports = mongoose.model('Message', messageSchema); 