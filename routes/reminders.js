const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    createReminder,
    getReminders,
    getUnreadReminders,
    getReminderStats,
    getReminder,
    markAsRead,
    respondToReminder,
    dismissReminder,
    getRemindersByKid
} = require('../controllers/reminderController');

const router = express.Router();

// Validação para criar lembrete
const createReminderValidation = [
    body('kidId')
        .isMongoId()
        .withMessage('ID da criança inválido'),
    body('title')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Título deve ter entre 2 e 100 caracteres'),
    body('message')
        .trim()
        .isLength({ min: 5, max: 1000 })
        .withMessage('Mensagem deve ter entre 5 e 1000 caracteres'),
    body('type')
        .optional()
        .isIn(['request', 'question', 'reminder', 'achievement', 'other'])
        .withMessage('Tipo inválido'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Prioridade inválida')
];

// Validação para responder lembrete
const respondReminderValidation = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Resposta deve ter entre 1 e 1000 caracteres')
];

// Rota pública para criar lembretes (para crianças)
router.post('/', createReminderValidation, createReminder);

// Rotas protegidas (para pais)
router.use(authenticateToken);

router.get('/', getReminders);
router.get('/unread', getUnreadReminders);
router.get('/stats', getReminderStats);
router.get('/kid/:kidId', getRemindersByKid);
router.get('/:reminderId', getReminder);
router.put('/:reminderId/read', markAsRead);
router.put('/:reminderId/respond', respondReminderValidation, respondToReminder);
router.put('/:reminderId/dismiss', dismissReminder);

module.exports = router; 