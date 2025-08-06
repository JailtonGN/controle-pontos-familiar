const { validationResult } = require('express-validator');
const Point = require('../models/Point');
const Kid = require('../models/Kid');
const Activity = require('../models/Activity');

// @desc    Adicionar pontos para uma criança
// @route   POST /api/points/add
// @access  Private
const addPoints = async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { kidId, activityId, points, notes, reason } = req.body;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        let activity = null;
        let pointsToAdd = points;

        // Se activityId foi fornecido, verificar se a atividade existe
        if (activityId) {
            activity = await Activity.findById(activityId);
            if (!activity || !activity.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Atividade não encontrada'
                });
            }
            // Usar pontos da atividade se não fornecidos no request
            pointsToAdd = points || activity.points;
        } else {
            // Pontos avulsos - verificar se points foi fornecido
            if (!points || points < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade de pontos é obrigatória para pontos avulsos'
                });
            }
            pointsToAdd = points;
        }

        // Criar registro de pontos
        const pointRecord = new Point({
            kidId,
            activityId: activityId || null,
            points: pointsToAdd,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} adicionados`,
            awardedBy: req.user._id,
            type: 'add'
        });

        await pointRecord.save();

        // Buscar a criança atualizada
        const updatedKid = await Kid.findById(kidId);

        res.status(201).json({
            success: true,
            message: 'Pontos adicionados com sucesso',
            data: {
                point: pointRecord,
                kid: updatedKid,
                activity: activity ? {
                    name: activity.name,
                    icon: activity.icon,
                    color: activity.color
                } : null
            }
        });

    } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Remover pontos de uma criança
// @route   POST /api/points/remove
// @access  Private
const removePoints = async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { kidId, activityId, points, notes, reason } = req.body;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Se activityId for fornecido, buscar a atividade e usar seus pontos
        let pointsToRemove = points;
        let activity = null;
        
        if (activityId) {
            activity = await Activity.findById(activityId);
            if (!activity || !activity.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Atividade não encontrada'
                });
            }
            pointsToRemove = points || activity.points;
        } else {
            // Pontos avulsos - verificar se points foi fornecido
            if (!points || points < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade de pontos é obrigatória para pontos avulsos'
                });
            }
            pointsToRemove = points;
        }

        // Criar registro de remoção de pontos
        const pointRecord = new Point({
            kidId,
            activityId: activityId || null,
            points: pointsToRemove,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} removidos`,
            awardedBy: req.user._id,
            type: 'remove'
        });

        await pointRecord.save();

        // Buscar a criança atualizada
        const updatedKid = await Kid.findById(kidId);

        res.json({
            success: true,
            message: 'Pontos removidos com sucesso',
            data: {
                point: pointRecord,
                kid: updatedKid,
                activity: activity ? {
                    name: activity.name,
                    icon: activity.icon,
                    color: activity.color
                } : null
            }
        });

    } catch (error) {
        console.error('Erro ao remover pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter histórico de pontos de uma criança
// @route   GET /api/points/history/:kidId
// @access  Private
const getPointHistory = async (req, res) => {
    try {
        const { kidId } = req.params;
        const { limit = 50, page = 1 } = req.query;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Calcular skip para paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Buscar histórico de pontos
        const points = await Point.getPointHistory(kidId, parseInt(limit));
        const total = await Point.countDocuments({ 
            kidId, 
            isActive: true 
        });

        res.json({
            success: true,
            data: {
                points,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter histórico de pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter estatísticas de pontos por categoria
// @route   GET /api/points/stats/:kidId
// @access  Private
const getPointStats = async (req, res) => {
    try {
        const { kidId } = req.params;
        const { period = 'month' } = req.query;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Obter estatísticas
        const stats = await Point.getPointsStats(kidId, period);

        res.json({
            success: true,
            data: {
                stats,
                kid: {
                    name: kid.name,
                    totalPoints: kid.totalPoints,
                    currentLevel: kid.currentLevel,
                    levelProgress: kid.getLevelProgress()
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas de pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter pontos por categoria
// @route   GET /api/points/by-category/:kidId/:category
// @access  Private
const getPointsByCategory = async (req, res) => {
    try {
        const { kidId, category } = req.params;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Obter pontos por categoria
        const points = await Point.getPointsByCategory(kidId, category);

        res.json({
            success: true,
            data: {
                points,
                category
            }
        });

    } catch (error) {
        console.error('Erro ao obter pontos por categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter histórico geral de pontos de todas as crianças do usuário
// @route   GET /api/points/history
// @access  Private
const getGeneralHistory = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;

        // Buscar todas as crianças do usuário
        const kids = await Kid.find({ 
            parentId: req.user._id,
            isActive: true 
        });

        if (kids.length === 0) {
            return res.json({
                success: true,
                data: {
                    history: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
        }

        // Obter IDs das crianças
        const kidIds = kids.map(kid => kid._id);

        // Calcular skip para paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Buscar histórico de pontos de todas as crianças
        const points = await Point.find({
            kidId: { $in: kidIds },
            isActive: true
        })
        .populate('kidId', 'name age avatar')
        .populate('activityId', 'name icon color category')
        .populate('awardedBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Contar total de registros
        const total = await Point.countDocuments({ 
            kidId: { $in: kidIds },
            isActive: true 
        });

        res.json({
            success: true,
            data: {
                history: points,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter histórico geral de pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Deletar um registro de pontos
// @route   DELETE /api/points/:pointId
// @access  Private
const deletePoint = async (req, res) => {
    try {
        const { pointId } = req.params;

        // Buscar o registro de pontos
        const point = await Point.findById(pointId);
        if (!point) {
            return res.status(404).json({
                success: false,
                message: 'Registro de pontos não encontrado'
            });
        }

        // Verificar se a criança pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: point.kidId, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado'
            });
        }

        // Marcar como inativo (soft delete)
        point.isActive = false;
        await point.save();

        // Recalcular pontos da criança
        const allActivePoints = await Point.find({
            kidId: point.kidId,
            isActive: true
        });

        let newTotalPoints = 0;
        allActivePoints.forEach(p => {
            if (p.type === 'add') {
                newTotalPoints += p.points;
            } else {
                newTotalPoints -= p.points;
            }
        });

        // Atualizar pontos da criança
        kid.totalPoints = newTotalPoints;
        kid.currentLevel = Math.max(1, Math.floor(newTotalPoints / 100) + 1);
        await kid.save();

        res.json({
            success: true,
            message: 'Registro de pontos deletado com sucesso',
            data: {
                kid: {
                    totalPoints: kid.totalPoints,
                    currentLevel: kid.currentLevel
                }
            }
        });

    } catch (error) {
        console.error('Erro ao deletar registro de pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    addPoints,
    removePoints,
    getPointHistory,
    getGeneralHistory,
    getPointStats,
    getPointsByCategory,
    deletePoint
}; 