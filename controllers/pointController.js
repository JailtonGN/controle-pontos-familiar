const { validationResult } = require('express-validator');
const Point = require('../models/Point');
const Kid = require('../models/Kid');
const Activity = require('../models/Activity');

// @desc    Adicionar pontos para uma criança
// @route   POST /api/points/add
// @access  Private
const addPoints = async (req, res) => {
    try {
        console.log('🔍 [ADD POINTS] Iniciando adição de pontos...');
        console.log('📊 [ADD POINTS] Dados recebidos:', {
            kidId: req.body.kidId,
            activityId: req.body.activityId,
            points: req.body.points,
            notes: req.body.notes,
            reason: req.body.reason
        });

        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ [ADD POINTS] Erros de validação:', errors.array());
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
            console.log('❌ [ADD POINTS] Criança não encontrada:', kidId);
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        console.log('✅ [ADD POINTS] Criança encontrada:', kid.name);

        let activity = null;
        let pointsToAdd = points;

        // Se activityId foi fornecido, verificar se a atividade existe
        if (activityId) {
            console.log('🔍 [ADD POINTS] Buscando atividade:', activityId);
            activity = await Activity.findById(activityId);
            if (!activity || !activity.isActive) {
                console.log('❌ [ADD POINTS] Atividade não encontrada:', activityId);
                return res.status(404).json({
                    success: false,
                    message: 'Atividade não encontrada'
                });
            }
            // Usar pontos da atividade se não fornecidos no request
            pointsToAdd = points || activity.points;
            console.log('✅ [ADD POINTS] Atividade encontrada:', activity.name, 'Pontos:', pointsToAdd);
        } else {
            // Pontos avulsos - verificar se points foi fornecido
            console.log('🔍 [ADD POINTS] Pontos avulsos - verificando pontos:', points);
            if (!points || points < 1) {
                console.log('❌ [ADD POINTS] Pontos inválidos para pontos avulsos:', points);
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade de pontos é obrigatória para pontos avulsos'
                });
            }
            pointsToAdd = points;
            console.log('✅ [ADD POINTS] Pontos avulsos configurados:', pointsToAdd);
        }

        // Criar registro de pontos
        console.log('🔍 [ADD POINTS] Criando registro de pontos...');
        console.log('📊 [ADD POINTS] Dados do registro:', {
            kidId,
            activityId: activityId || null,
            points: pointsToAdd,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} adicionados`,
            awardedBy: req.user._id,
            type: 'add'
        });
        
        const pointRecord = new Point({
            kidId,
            activityId: activityId || null,
            points: pointsToAdd,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} adicionados`,
            awardedBy: req.user._id,
            type: 'add'
        });

        console.log('💾 [ADD POINTS] Salvando registro...');
        try {
            await pointRecord.save();
            console.log('✅ [ADD POINTS] Registro salvo com sucesso');
        } catch (saveError) {
            console.error('❌ [ADD POINTS] Erro ao salvar registro:', saveError);
            throw saveError;
        }

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
        console.error('❌ [ADD POINTS] Erro ao adicionar pontos:', error);
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
        console.log('🔍 [REMOVE POINTS] Iniciando remoção de pontos...');
        console.log('📊 [REMOVE POINTS] Dados recebidos:', {
            kidId: req.body.kidId,
            activityId: req.body.activityId,
            points: req.body.points,
            notes: req.body.notes,
            reason: req.body.reason
        });

        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ [REMOVE POINTS] Erros de validação:', errors.array());
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
            console.log('❌ [REMOVE POINTS] Criança não encontrada:', kidId);
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        console.log('✅ [REMOVE POINTS] Criança encontrada:', kid.name);

        // Se activityId for fornecido, buscar a atividade e usar seus pontos
        let pointsToRemove = points;
        let activity = null;
        
        if (activityId) {
            console.log('🔍 [REMOVE POINTS] Buscando atividade:', activityId);
            activity = await Activity.findById(activityId);
            if (!activity || !activity.isActive) {
                console.log('❌ [REMOVE POINTS] Atividade não encontrada:', activityId);
                return res.status(404).json({
                    success: false,
                    message: 'Atividade não encontrada'
                });
            }
            pointsToRemove = points || activity.points;
            console.log('✅ [REMOVE POINTS] Atividade encontrada:', activity.name, 'Pontos:', pointsToRemove);
        } else {
            // Pontos avulsos - verificar se points foi fornecido
            console.log('🔍 [REMOVE POINTS] Pontos avulsos - verificando pontos:', points);
            if (!points || points < 1) {
                console.log('❌ [REMOVE POINTS] Pontos inválidos para pontos avulsos:', points);
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade de pontos é obrigatória para pontos avulsos'
                });
            }
            pointsToRemove = points;
            console.log('✅ [REMOVE POINTS] Pontos avulsos configurados:', pointsToRemove);
        }

        // Criar registro de remoção de pontos
        console.log('🔍 [REMOVE POINTS] Criando registro de remoção...');
        console.log('📊 [REMOVE POINTS] Dados do registro:', {
            kidId,
            activityId: activityId || null,
            points: pointsToRemove,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} removidos`,
            awardedBy: req.user._id,
            type: 'remove'
        });
        
        const pointRecord = new Point({
            kidId,
            activityId: activityId || null,
            points: pointsToRemove,
            notes: notes || reason || `Pontos ${activity ? 'da atividade' : 'avulsos'} removidos`,
            awardedBy: req.user._id,
            type: 'remove'
        });

        console.log('💾 [REMOVE POINTS] Salvando registro...');
        try {
            await pointRecord.save();
            console.log('✅ [REMOVE POINTS] Registro salvo com sucesso');
        } catch (saveError) {
            console.error('❌ [REMOVE POINTS] Erro ao salvar registro:', saveError);
            throw saveError;
        }

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
        console.error('❌ [REMOVE POINTS] Erro ao remover pontos:', error);
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
        kid.currentLevel = Math.max(1, Math.floor(newTotalPoints / 500) + 1);
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

// @desc    Apagar todos os pontos de todas as crianças
// @route   DELETE /api/points/delete-all
// @access  Private
const deleteAllPoints = async (req, res) => {
    try {
        // Buscar todas as crianças do usuário
        const kids = await Kid.find({ 
            parentId: req.user._id,
            isActive: true 
        });

        if (kids.length === 0) {
            return res.json({
                success: true,
                message: 'Nenhuma criança encontrada'
            });
        }

        // Obter IDs das crianças
        const kidIds = kids.map(kid => kid._id);

        // Marcar todos os pontos como inativos
        await Point.updateMany(
            { kidId: { $in: kidIds } },
            { isActive: false }
        );

        // Zerar pontos de todas as crianças
        await Kid.updateMany(
            { _id: { $in: kidIds } },
            { 
                totalPoints: 0,
                currentLevel: 1
            }
        );

        res.json({
            success: true,
            message: 'Todos os pontos foram apagados com sucesso',
            data: {
                kidsAffected: kids.length,
                pointsDeleted: await Point.countDocuments({ kidId: { $in: kidIds } })
            }
        });

    } catch (error) {
        console.error('Erro ao apagar todos os pontos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter histórico por mês específico
// @route   GET /api/points/history-by-month
// @access  Private
const getHistoryByMonth = async (req, res) => {
    try {
        const { month, kidId } = req.query;
        
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Mês é obrigatório'
            });
        }

        let kidIds;
        
        if (kidId) {
            // Verificar se a criança pertence ao usuário
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
            
            kidIds = [kid._id];
        } else {
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
                        month: month,
                        startDate: null,
                        endDate: null
                    }
                });
            }

            // Obter IDs das crianças
            kidIds = kids.map(kid => kid._id);
        }

        // Parsear mês (formato: YYYY-MM)
        const [year, monthNum] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

        // Buscar pontos do mês específico
        const points = await Point.find({
            kidId: { $in: kidIds },
            date: {
                $gte: startDate,
                $lte: endDate
            },
            isActive: true
        })
        .populate('kidId', 'name age avatar emoji color')
        .populate('activityId', 'name icon color category')
        .populate('awardedBy', 'name')
        .sort({ date: -1 });

        res.json({
            success: true,
            data: {
                history: points,
                month: month,
                startDate: startDate,
                endDate: endDate
            }
        });

    } catch (error) {
        console.error('Erro ao obter histórico por mês:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Apagar todo o histórico de pontos
// @route   DELETE /api/points/delete-history
// @access  Private
const deleteAllHistory = async (req, res) => {
    try {
        // Buscar todas as crianças do usuário
        const kids = await Kid.find({ 
            parentId: req.user._id,
            isActive: true 
        });

        if (kids.length === 0) {
            return res.json({
                success: true,
                message: 'Nenhuma criança encontrada'
            });
        }

        // Obter IDs das crianças
        const kidIds = kids.map(kid => kid._id);

        // Deletar fisicamente todos os registros de pontos
        const deleteResult = await Point.deleteMany({ kidId: { $in: kidIds } });

        // Zerar pontos de todas as crianças
        await Kid.updateMany(
            { _id: { $in: kidIds } },
            { 
                totalPoints: 0,
                currentLevel: 1
            }
        );

        res.json({
            success: true,
            message: 'Todo o histórico foi apagado com sucesso',
            data: {
                kidsAffected: kids.length,
                recordsDeleted: deleteResult.deletedCount
            }
        });

    } catch (error) {
        console.error('Erro ao apagar histórico:', error);
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
    deletePoint,
    deleteAllPoints,
    deleteAllHistory,
    getHistoryByMonth
}; 