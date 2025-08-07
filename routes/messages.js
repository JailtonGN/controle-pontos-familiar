const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authenticateKidToken } = require('../middleware/auth');
const Message = require('../models/Message');
const {
    createMessage, getMessages, getMessage,
    updateMessage, deleteMessage, markAsRead, getMessagesByType
} = require('../controllers/messageController');

const router = express.Router();

// Validação para criação e atualização de mensagens
const messageValidation = [
    body('kidId').isMongoId().withMessage('ID da criança deve ser válido'),
    body('type').isIn(['motivation', 'praise', 'task', 'kid_to_parent']).withMessage('Tipo deve ser válido'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Título deve ter entre 1 e 100 caracteres'),
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Conteúdo deve ter entre 1 e 500 caracteres')
];

// ROTAS ESPECÍFICAS PRIMEIRO (antes das rotas com parâmetros)

// Rota para obter mensagens das crianças (para os pais)
router.get('/kids', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 [PARENT MESSAGES] Buscando mensagens das crianças...');
        console.log('🔍 [PARENT MESSAGES] User ID:', req.user._id);
        
        const messages = await Message.find({ type: 'kid_to_parent' })
            .sort({ createdAt: -1 })
            .populate('kidId', 'name emoji');

        console.log(`📊 [PARENT MESSAGES] Encontradas ${messages.length} mensagens`);
        console.log('📊 [PARENT MESSAGES] Mensagens:', messages);

        const formattedMessages = messages.map(message => ({
            _id: message._id,
            content: message.content,
            type: message.type,
            isRead: message.isRead || false,
            createdAt: message.createdAt,
            kidName: message.kidId ? message.kidId.name : 'Criança'
        }));

        console.log('📊 [PARENT MESSAGES] Mensagens formatadas:', formattedMessages);

        res.json({
            success: true,
            data: {
                messages: formattedMessages
            }
        });

    } catch (error) {
        console.error('❌ [PARENT MESSAGES] Erro ao buscar mensagens das crianças:', error);
        console.error('❌ [PARENT MESSAGES] Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para apagar mensagem das crianças
router.delete('/kids/:id', async (req, res) => {
    try {
        console.log('🔍 [DELETE MESSAGE] Iniciando exclusão da mensagem...');
        console.log('🔍 [DELETE MESSAGE] URL da requisição:', req.url);
        console.log('🔍 [DELETE MESSAGE] Parâmetros:', req.params);
        
        const { id } = req.params;
        
        console.log('📊 [DELETE MESSAGE] ID da mensagem:', id);
        console.log('📊 [DELETE MESSAGE] Tipo de ID:', typeof id);
        
        // Verificar se o ID é válido
        if (!id || id === 'undefined') {
            console.log('❌ [DELETE MESSAGE] ID inválido');
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        
        console.log('📊 [DELETE MESSAGE] Buscando mensagem com ID:', id);
        
        const message = await Message.findOne({ _id: id, type: 'kid_to_parent' });

        if (!message) {
            console.log('❌ [DELETE MESSAGE] Mensagem não encontrada');
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        console.log('📊 [DELETE MESSAGE] Mensagem encontrada:', {
            _id: message._id,
            content: message.content,
            type: message.type
        });
        console.log('📊 [DELETE MESSAGE] Deletando...');

        // Deletar a mensagem do banco de dados
        console.log('📊 [DELETE MESSAGE] Executando findByIdAndDelete com ID:', id);
        const deleteResult = await Message.findByIdAndDelete(id);
        
        console.log('📊 [DELETE MESSAGE] Resultado da exclusão:', deleteResult);

        if (!deleteResult) {
            console.log('❌ [DELETE MESSAGE] Mensagem não foi encontrada para deletar');
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }

        console.log('✅ [DELETE MESSAGE] Mensagem deletada com sucesso');
        
        // Verificar se realmente foi deletada
        const remainingMessage = await Message.findById(id);
        console.log('📊 [DELETE MESSAGE] Mensagem ainda existe após delete?', !!remainingMessage);

        res.json({
            success: true,
            message: 'Mensagem apagada com sucesso'
        });
    } catch (error) {
        console.error('❌ [DELETE MESSAGE] Erro ao apagar mensagem:', error);
        console.error('❌ [DELETE MESSAGE] Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para criança enviar mensagem (deve vir ANTES do middleware de autenticação de pais)
router.post('/kid/send', authenticateKidToken, async (req, res) => {
    try {
        console.log('🔍 [KID MESSAGE] Criança enviando mensagem...');
        console.log('📊 [KID MESSAGE] Dados recebidos:', {
            content: req.body.content,
            kidId: req.body.kidId
        });
        console.log('📊 [KID MESSAGE] Kid ID do token:', req.kid._id);

        const { content, kidId } = req.body;

        // Verificar se a criança está enviando sua própria mensagem
        if (req.kid._id.toString() !== kidId) {
            console.log('❌ [KID MESSAGE] Tentativa de enviar mensagem para outra criança');
            return res.status(403).json({
                success: false,
                message: 'Acesso negado'
            });
        }

        // Validar conteúdo
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Conteúdo da mensagem é obrigatório'
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Mensagem muito longa (máximo 500 caracteres)'
            });
        }

        // Criar mensagem
        const message = new Message({
            kidId: req.kid._id,
            content: content.trim(),
            type: 'kid_to_parent'
        });

        console.log('📊 [KID MESSAGE] Mensagem a ser salva:', message);

        await message.save();

        console.log('✅ [KID MESSAGE] Mensagem enviada com sucesso');

        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso',
            data: {
                message: {
                    _id: message._id,
                    content: message.content,
                    type: message.type,
                    createdAt: message.createdAt
                }
            }
        });

    } catch (error) {
        console.error('❌ [KID MESSAGE] Erro ao enviar mensagem:', error);
        console.error('❌ [KID MESSAGE] Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ROTAS COM PARÂMETROS DEPOIS

// Aplicar autenticação para todas as outras rotas
router.use(authenticateToken);

// Rotas básicas
router.post('/', messageValidation, createMessage);
router.get('/', getMessages);
router.get('/type/:type', getMessagesByType);
router.get('/:id', getMessage);
router.put('/:id', messageValidation, updateMessage);
router.delete('/:id', deleteMessage);
router.patch('/:id/read', markAsRead);

// Rota para marcar mensagem das crianças como lida
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        
        const message = await Message.findOne({ _id: id, type: 'kid_to_parent' });

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
});

module.exports = router; 