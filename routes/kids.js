const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authenticateKidToken } = require('../middleware/auth');
const {
    createKid,
    getKids,
    getKid,
    updateKid,
    deleteKid
} = require('../controllers/kidController');

const router = express.Router();

// Validações
const kidValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
    body('age').isInt({ min: 1, max: 18 }).withMessage('Idade deve ser entre 1 e 18 anos'),
    body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji é obrigatório'),
    body('color').trim().isLength({ min: 3, max: 7 }).withMessage('Cor é obrigatória'),
    body('pin').optional().isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN deve ter 4 dígitos numéricos')
];

// Rotas públicas
router.get('/public', async (req, res) => {
    try {
        const Kid = require('../models/Kid');
        const kids = await Kid.find({ isActive: true })
            .select('name age emoji color')
            .sort({ name: 1 });

        res.json({
            success: true,
            data: {
                kids
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rotas protegidas
router.post('/', authenticateToken, kidValidation, createKid);
router.get('/', authenticateToken, getKids);
router.get('/:id', authenticateToken, getKid);
router.put('/:id', authenticateToken, kidValidation, updateKid);
router.delete('/:id', authenticateToken, deleteKid);

// Rota específica para crianças verem apenas seus próprios dados
router.get('/kid/own', authenticateKidToken, async (req, res) => {
    try {
        // A criança já está disponível em req.kid
        const kid = req.kid;

        res.json({
            success: true,
            data: {
                kids: [kid] // Retorna apenas a própria criança
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 