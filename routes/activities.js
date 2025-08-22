const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByType
} = require('../controllers/activityController');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Validação para criação e atualização de atividades
const activityValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nome deve ter entre 1 e 100 caracteres'),
    body('type')
        .isIn(['positive', 'negative'])
        .withMessage('Tipo deve ser "positive" ou "negative"'),
    body('points')
        .isInt({ min: 1 })
        .withMessage('Pontos deve ser um número inteiro maior que 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descrição não pode ter mais de 500 caracteres')
];

// Rotas
router.post('/', activityValidation, createActivity);
router.get('/', getActivities);
router.get('/type/:type', getActivitiesByType);
router.get('/:id', getActivity);
router.put('/:id', activityValidation, updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router; 