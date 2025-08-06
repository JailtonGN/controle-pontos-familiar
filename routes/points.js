const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    addPoints,
    removePoints,
    getPointHistory,
    getGeneralHistory,
    getPointStats,
    getPointsByCategory,
    deletePoint
} = require('../controllers/pointController');

const router = express.Router();

// Validação para adicionar pontos
const addPointsValidation = [
    body('kidId')
        .isMongoId()
        .withMessage('ID da criança inválido'),
    body('activityId')
        .isMongoId()
        .withMessage('ID da atividade inválido'),
    body('points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Pontos devem ser entre 1 e 100'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações não podem ter mais de 500 caracteres')
];

// Validação para remover pontos
const removePointsValidation = [
    body('kidId')
        .isMongoId()
        .withMessage('ID da criança inválido'),
    body('activityId')
        .optional()
        .isMongoId()
        .withMessage('ID da atividade inválido'),
    body('points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Pontos devem ser entre 1 e 100'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações não podem ter mais de 500 caracteres')
];

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de pontos
router.post('/add', addPointsValidation, addPoints);
router.post('/remove', removePointsValidation, removePoints);
router.get('/history', getGeneralHistory);
router.get('/history/:kidId', getPointHistory);
router.get('/stats/:kidId', getPointStats);
router.get('/by-category/:kidId/:category', getPointsByCategory);
router.delete('/:pointId', deletePoint);

module.exports = router; 