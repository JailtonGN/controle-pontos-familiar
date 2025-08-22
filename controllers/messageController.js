const Message = require('../models/Message');
const Kid = require('../models/Kid');
const { validationResult } = require('express-validator');

// Criar nova mensagem
const createMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { kidId, type, title, content } = req.body;
        const parentId = req.user._id;

        // Verificar se a criança existe e pertence à mesma família do usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            familyId: req.user.familyId 
        });
        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada ou não pertence à sua família'
            });
        }

        const message = new Message({
            parentId,
            kidId,
            familyId: req.user.familyId,
            type,
            title,
            content
        });

        await message.save();

        res.status(201).json({
            success: true,
            message: 'Mensagem criada com sucesso',
            data: { message }
        });
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Obter todas as mensagens da família
const getMessages = async (req, res) => {
    try {
        const userFamilyId = req.user.familyId;
        
        // Filtrar mensagens por família (admin vê todas, outros apenas da sua família)
        let messageFilter = { isActive: true };
        if (req.user.role === 'admin') {
            // Admin vê todas as mensagens se não especificar família
        } else {
            messageFilter.familyId = userFamilyId;
        }
        
        const messages = await Message.find(messageFilter)
            .populate('kidId', 'name emoji color')
            .sort({ createdAt: -1 });

        // Formatar dados para o frontend
        const formattedMessages = messages.map(message => ({
            _id: message._id,
            type: message.type,
            title: message.title,
            content: message.content,
            kidName: message.kidId.name,
            kidEmoji: message.kidId.emoji,
            kidColor: message.kidId.color,
            isRead: message.isRead,
            createdAt: message.createdAt
        }));

        res.json({
            success: true,
            data: { messages: formattedMessages }
        });
    } catch (error) {
        console.error('Erro ao obter mensagens:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Obter mensagem específica
const getMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userFamilyId = req.user.familyId;

        // Filtrar por família (admin vê todas, outros apenas da sua família)
        let messageFilter = { _id: id, isActive: true };
        if (req.user.role !== 'admin') {
            messageFilter.familyId = userFamilyId;
        }

        const message = await Message.findOne(messageFilter)
            .populate('kidId', 'name emoji color');

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        res.json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Erro ao obter mensagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Atualizar mensagem
const updateMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const parentId = req.user._id;
        const { type, title, content } = req.body;

        const message = await Message.findOne({ _id: id, parentId, isActive: true });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        if (type) message.type = type;
        if (title) message.title = title;
        if (content) message.content = content;

        await message.save();

        res.json({
            success: true,
            message: 'Mensagem atualizada com sucesso',
            data: { message }
        });
    } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Excluir mensagem (soft delete)
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const parentId = req.user._id;

        const message = await Message.findOne({ _id: id, parentId, isActive: true });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        message.isActive = false;
        await message.save();

        res.json({
            success: true,
            message: 'Mensagem excluída com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir mensagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Marcar mensagem como lida
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const parentId = req.user._id;

        const message = await Message.findOne({ _id: id, parentId, isActive: true });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        message.isRead = true;
        await message.save();

        res.json({
            success: true,
            message: 'Mensagem marcada como lida'
        });
    } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Obter mensagens por tipo
const getMessagesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const userFamilyId = req.user.familyId;

        // Filtrar por família (admin vê todas, outros apenas da sua família)
        let messageFilter = { type, isActive: true };
        if (req.user.role !== 'admin') {
            messageFilter.familyId = userFamilyId;
        }

        const messages = await Message.find(messageFilter)
        .populate('kidId', 'name emoji color')
        .sort({ createdAt: -1 });

        const formattedMessages = messages.map(message => ({
            _id: message._id,
            type: message.type,
            title: message.title,
            content: message.content,
            kidName: message.kidId.name,
            kidEmoji: message.kidId.emoji,
            kidColor: message.kidId.color,
            isRead: message.isRead,
            createdAt: message.createdAt
        }));

        res.json({
            success: true,
            data: { messages: formattedMessages }
        });
    } catch (error) {
        console.error('Erro ao obter mensagens por tipo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    createMessage,
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    getMessagesByType
}; 