const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authenticateKidToken } = require('../middleware/auth');
const Point = require('../models/Point');
const {
    addPoints,
    removePoints,
    getPointHistory,
    getGeneralHistory,
    getPointStats,
    getPointsByCategory,
    deletePoint,
    deleteAllPoints,
    deleteAllHistory,
    getHistoryByMonth
} = require('../controllers/pointController');

const router = express.Router();

// Validação para adicionar pontos
const addPointsValidation = [
    body('kidId')
        .isMongoId()
        .withMessage('ID da criança inválido'),
    body('activityId')
        .optional()
        .isMongoId()
        .withMessage('ID da atividade inválido'),
    body('points')
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage('Pontos devem ser entre 1 e 500')
        .custom((value, { req }) => {
            // Se não há activityId (pontos avulsos), points é obrigatório
            if (!req.body.activityId && (!value || value < 1)) {
                throw new Error('Quantidade de pontos é obrigatória para pontos avulsos');
            }
            return true;
        }),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações não podem ter mais de 500 caracteres'),
    body('reason')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Motivo deve ter entre 1 e 200 caracteres')
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
        .isInt({ min: 1, max: 500 })
        .withMessage('Pontos devem ser entre 1 e 500')
        .custom((value, { req }) => {
            // Se não há activityId (pontos avulsos), points é obrigatório
            if (!req.body.activityId && (!value || value < 1)) {
                throw new Error('Quantidade de pontos é obrigatória para pontos avulsos');
            }
            return true;
        }),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações não podem ter mais de 500 caracteres'),
    body('reason')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Motivo deve ter entre 1 e 200 caracteres')
];

// Rota para histórico da criança (autenticação da criança) - DEVE VIR ANTES das rotas protegidas
router.get('/kid/:kidId/history', authenticateKidToken, async (req, res) => {
    try {
        const { kidId } = req.params;
        const { page = 1, limit = 20, date } = req.query;

        console.log('🔎 [KID HISTORY] Requisição recebida:', {
            kidId,
            queryDate: date,
            page: Number(page),
            limit: Number(limit)
        });

        // Verificar se a criança está acessando seus próprios dados
        if (req.kid._id.toString() !== kidId) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado'
            });
        }

        const query = { kidId };
        if (date) {
            const [y, m, d] = String(date).split('-').map(Number);
            if (y && m && d) {
                const start = new Date(y, m - 1, d, 0, 0, 0, 0);
                const end = new Date(y, m - 1, d, 23, 59, 59, 999);
                query.date = { $gte: start, $lte: end };
                console.log('🗓️  [KID HISTORY] Filtro de data aplicado:', { start, end });
            } else {
                console.log('⚠️  [KID HISTORY] Data inválida recebida:', date);
            }
        }

        const points = await Point.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('activityId', 'name emoji')
            .populate('awardedBy', 'name');

        const total = await Point.countDocuments(query);

        console.log('✅ [KID HISTORY] Consulta concluída:', {
            returned: points.length,
            total,
            hasNext: page * limit < total
        });

        res.json({
            success: true,
            data: {
                points,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar histórico de pontos da criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de configuração (DEVEM VIR ANTES das rotas com parâmetros dinâmicos)
router.delete('/delete-all', deleteAllPoints);
router.delete('/delete-history', deleteAllHistory);
router.get('/history-by-month', getHistoryByMonth);

// Rotas de pontos
router.post('/add', addPointsValidation, addPoints);
router.post('/remove', removePointsValidation, removePoints);
router.get('/history', getGeneralHistory);
router.get('/history/:kidId', getPointHistory);
router.get('/stats/:kidId', getPointStats);
router.get('/by-category/:kidId/:category', getPointsByCategory);
router.delete('/:pointId', deletePoint);

module.exports = router; 