const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do pai é obrigatório']
    },
    kidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kid',
        default: null
    },
    type: {
        type: String,
        required: [true, 'Tipo da notificação é obrigatório'],
        enum: {
                    values: ['points', 'activity', 'message', 'system'],
        message: 'Tipo deve ser "points", "activity", "message" ou "system"'
        }
    },
    title: {
        type: String,
        required: [true, 'Título da notificação é obrigatório'],
        trim: true,
        maxlength: [100, 'Título não pode ter mais de 100 caracteres']
    },
    message: {
        type: String,
        required: [true, 'Mensagem da notificação é obrigatória'],
        trim: true,
        maxlength: [500, 'Mensagem não pode ter mais de 500 caracteres']
    },
    status: {
        type: String,
        enum: {
            values: ['unread', 'read', 'dismissed'],
            message: 'Status deve ser "unread", "read" ou "dismissed"'
        },
        default: 'unread'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Índices
notificationSchema.index({ parentId: 1 });
notificationSchema.index({ kidId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isActive: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 