const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    createMessage, getMessages, getMessage,
    updateMessage, deleteMessage, markAsRead, getMessagesByType
} = require('../controllers/messageController');

const router = express.Router();

router.use(authenticateToken); // Aplicar autenticação a todas as rotas

// Validação para criação e atualização de mensagens
const messageValidation = [
    body('kidId').isMongoId().withMessage('ID da criança deve ser válido'),
    body('type').isIn(['motivation', 'reminder', 'praise', 'task']).withMessage('Tipo deve ser válido'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Título deve ter entre 1 e 100 caracteres'),
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Conteúdo deve ter entre 1 e 500 caracteres')
];

// Rotas
router.post('/', messageValidation, createMessage);
router.get('/', getMessages);
router.get('/type/:type', getMessagesByType);
router.get('/:id', getMessage);
router.put('/:id', messageValidation, updateMessage);
router.delete('/:id', deleteMessage);
router.patch('/:id/read', markAsRead);

module.exports = router; 