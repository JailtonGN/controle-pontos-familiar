const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
    createFamily,
    getFamilies,
    getFamilyById,
    updateFamily,
    deleteFamily,
    getFamilyStats
} = require('../controllers/familyController');

const router = express.Router();

// Validação para criação/atualização de família
const familyValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome da família deve ter entre 2 e 100 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descrição não pode ter mais de 500 caracteres')
];

// Todas as rotas requerem autenticação e privilégios de admin
router.use(authenticateToken, requireAdmin);

// Criar nova família
router.post('/', familyValidation, createFamily);

// Listar todas as famílias
router.get('/', getFamilies);

// Obter família por ID
router.get('/:id', getFamilyById);

// Atualizar família
router.put('/:id', familyValidation, updateFamily);

// Excluir família
router.delete('/:id', deleteFamily);

// Obter estatísticas da família
router.get('/:id/stats', getFamilyStats);

module.exports = router; 