const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    getKids,
    getKid,
    createKid,
    updateKid,
    deleteKid,
} = require('../controllers/kidController');

const router = express.Router();

// Validação para criar/atualizar criança
const kidValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('age')
        .isInt({ min: 1, max: 18 })
        .withMessage('Idade deve ser entre 1 e 18 anos'),
    body('avatar')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Avatar não pode ter mais de 200 caracteres')
];

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de crianças
router.get('/', getKids);
router.get('/:kidId', getKid);
router.post('/', kidValidation, createKid);
router.put('/:kidId', kidValidation, updateKid);
router.delete('/:kidId', deleteKid);

module.exports = router; 