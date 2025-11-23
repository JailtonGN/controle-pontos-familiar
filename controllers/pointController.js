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

        const { kidId, activityId, points, notes, reason, date } = req.body;

        // Verificar se a criança existe e pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode adicionar pontos para qualquer criança
            kid = await Kid.findOne({ _id: kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode adicionar pontos para crianças da sua família
            kid = await Kid.findOne({
                _id: kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode adicionar pontos para suas próprias crianças
            kid = await Kid.findOne({
                _id: kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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
            notes: notes || `Pontos ${activity ? 'da atividade' : 'avulsos'} adicionados`,
            reason: reason || null,
            awardedBy: req.user._id,
            type: 'add',
            date: date ? new Date(date) : new Date()
        });

        console.log('💾 [ADD POINTS] Salvando registro...');
        try {
            await pointRecord.save();
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
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { kidId, activityId, points, notes, reason, date } = req.body;

        // Verificar se a criança existe e pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode remover pontos de qualquer criança
            kid = await Kid.findOne({ _id: kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode remover pontos de crianças da sua família
            kid = await Kid.findOne({
                _id: kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode remover pontos de suas próprias crianças
            kid = await Kid.findOne({
                _id: kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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
            notes: notes || `Pontos ${activity ? 'da atividade' : 'avulsos'} removidos`,
            reason: reason || null,
            awardedBy: req.user._id,
            type: 'remove',
            date: date ? new Date(date) : new Date()
        });

        try {
            await pointRecord.save();
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

        // Verificar se a criança existe e pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode ver histórico de qualquer criança
            kid = await Kid.findOne({ _id: kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode ver histórico de crianças da sua família
            kid = await Kid.findOne({
                _id: kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode ver histórico de suas próprias crianças
            kid = await Kid.findOne({
                _id: kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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

        // Verificar se a criança existe e pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode ver estatísticas de qualquer criança
            kid = await Kid.findOne({ _id: kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode ver estatísticas de crianças da sua família
            kid = await Kid.findOne({
                _id: kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode ver estatísticas de suas próprias crianças
            kid = await Kid.findOne({
                _id: kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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

        // Verificar se a criança existe e pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode ver pontos de qualquer criança
            kid = await Kid.findOne({ _id: kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode ver pontos de crianças da sua família
            kid = await Kid.findOne({
                _id: kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode ver pontos de suas próprias crianças
            kid = await Kid.findOne({
                _id: kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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

// @desc    Obter histórico geral de pontos de todas as crianças do usuário (com filtros opcionais)
// @route   GET /api/points/history
// @access  Private
const getGeneralHistory = async (req, res) => {
    try {
        const { limit = 50, page = 1, kidId, date, startDate, endDate } = req.query;

        // Buscar todas as crianças do usuário ou família
        let kids;

        if (req.user.role === 'admin') {
            // Admin vê todas as crianças
            kids = await Kid.find({ isActive: true });
        } else if (req.user.familyId) {
            // Usuário vê crianças da sua família
            kids = await Kid.find({ familyId: req.user.familyId, isActive: true });
        } else {
            // Usuário sem família vê apenas suas próprias crianças
            kids = await Kid.find({ parentId: req.user._id, isActive: true });
        }

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

        // Obter IDs das crianças (ou uma específica, se filtrada e pertencer ao usuário)
        let kidIds = kids.map(kid => kid._id);
        if (kidId) {
            const belongs = kidIds.some(id => id.toString() === kidId);
            if (!belongs) {
                return res.status(404).json({ success: false, message: 'Criança não encontrada' });
            }
            kidIds = [kidId];
        }

        // Calcular skip para paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Construir query de filtros
        const query = { kidId: { $in: kidIds }, isActive: true };

        // Filtro de data específica (mantido para compatibilidade)
        if (date) {
            const [y, m, d] = String(date).split('-').map(Number);
            if (y && m && d) {
                const start = new Date(y, m - 1, d, 0, 0, 0, 0);
                const end = new Date(y, m - 1, d, 23, 59, 59, 999);
                query.date = { $gte: start, $lte: end };
            }
        }
        // Filtro de período (startDate e endDate)
        else if (startDate || endDate) {
            const dateFilter = {};

            if (startDate) {
                // Garantir que a data seja tratada como local, sem conversão de fuso horário
                const [year, month, day] = startDate.split('-').map(Number);
                const start = new Date(year, month - 1, day, 0, 0, 0, 0);
                dateFilter.$gte = start;
            }

            if (endDate) {
                // Garantir que a data seja tratada como local, sem conversão de fuso horário
                const [year, month, day] = endDate.split('-').map(Number);
                const end = new Date(year, month - 1, day, 23, 59, 59, 999);
                dateFilter.$lte = end;
            }

            query.date = dateFilter;

            console.log('📅 [HISTORY FILTER] Aplicando filtro de período:', {
                startDate: startDate || 'Não definida',
                endDate: endDate || 'Não definida',
                startDateProcessed: dateFilter.$gte ? dateFilter.$gte.toISOString() : 'N/A',
                endDateProcessed: dateFilter.$lte ? dateFilter.$lte.toISOString() : 'N/A',
                dateFilter
            });
        }

        // Buscar histórico de pontos
        const points = await Point.find(query)
            .populate('kidId', 'name age avatar')
            .populate('activityId', 'name icon color category')
            .populate('awardedBy', 'name')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Contar total de registros
        const total = await Point.countDocuments(query);

        console.log('📊 [HISTORY RESULT] Resultado da consulta:', {
            totalFound: total,
            returned: points.length,
            filters: {
                kidId: kidId || 'Todas',
                date: date || 'Não definida',
                startDate: startDate || 'Não definida',
                endDate: endDate || 'Não definida'
            }
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

// @desc    Atualizar um registro de pontos
// @route   PUT /api/points/:pointId
// @access  Private
const updatePoint = async (req, res) => {
    try {
        const { pointId } = req.params;
        const { date, points, reason, notes, activityId } = req.body;

        // Buscar o registro de pontos
        const point = await Point.findById(pointId);
        if (!point) {
            return res.status(404).json({
                success: false,
                message: 'Registro de pontos não encontrado'
            });
        }

        // Verificar permissão (mesma lógica do delete)
        let kid;
        if (req.user.role === 'admin') {
            kid = await Kid.findOne({ _id: point.kidId, isActive: true });
        } else if (req.user.familyId) {
            kid = await Kid.findOne({ _id: point.kidId, familyId: req.user.familyId, isActive: true });
        } else {
            kid = await Kid.findOne({ _id: point.kidId, parentId: req.user._id, isActive: true });
        }

        if (!kid) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado'
            });
        }

        // Atualizar campos
        if (date) point.date = new Date(date);
        if (reason) point.reason = reason;
        if (notes) point.notes = notes;

        // Se activityId mudou, atualizar
        if (activityId && activityId !== point.activityId?.toString()) {
            const activity = await Activity.findById(activityId);
            if (activity) {
                point.activityId = activityId;
                // Se points não foi passado explicitamente, usar da nova atividade
                if (!points) {
                    point.points = activity.points;
                }
            }
        }

        // Se points mudou, atualizar
        if (points !== undefined) {
            point.points = parseInt(points);
        }

        await point.save();

        // Recalcular pontos da criança (recalculo total para garantir consistência)
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

        // Atualizar criança
        kid.totalPoints = newTotalPoints;
        kid.currentLevel = Math.max(1, Math.floor(newTotalPoints / 500) + 1);
        await kid.save();

        res.json({
            success: true,
            message: 'Registro atualizado com sucesso',
            data: {
                point,
                kid: {
                    totalPoints: kid.totalPoints,
                    currentLevel: kid.currentLevel
                }
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar registro de pontos:', error);
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

        // Verificar se a criança pertence ao usuário ou família
        let kid;

        if (req.user.role === 'admin') {
            // Admin pode deletar pontos de qualquer criança
            kid = await Kid.findOne({ _id: point.kidId, isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode deletar pontos de crianças da sua família
            kid = await Kid.findOne({
                _id: point.kidId,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode deletar pontos de suas próprias crianças
            kid = await Kid.findOne({
                _id: point.kidId,
                parentId: req.user._id,
                isActive: true
            });
        }

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
        // Buscar todas as crianças do usuário ou família
        let kids;

        if (req.user.role === 'admin') {
            // Admin pode deletar pontos de todas as crianças
            kids = await Kid.find({ isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode deletar pontos de crianças da sua família
            kids = await Kid.find({
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode deletar pontos de suas próprias crianças
            kids = await Kid.find({
                parentId: req.user._id,
                isActive: true
            });
        }

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
            // Verificar se a criança pertence ao usuário ou família
            let kid;

            if (req.user.role === 'admin') {
                // Admin pode ver histórico de qualquer criança
                kid = await Kid.findOne({ _id: kidId, isActive: true });
            } else if (req.user.familyId) {
                // Usuário pode ver histórico de crianças da sua família
                kid = await Kid.findOne({
                    _id: kidId,
                    familyId: req.user.familyId,
                    isActive: true
                });
            } else {
                // Usuário sem família só pode ver histórico de suas próprias crianças
                kid = await Kid.findOne({
                    _id: kidId,
                    parentId: req.user._id,
                    isActive: true
                });
            }

            if (!kid) {
                return res.status(404).json({
                    success: false,
                    message: 'Criança não encontrada'
                });
            }

            kidIds = [kid._id];
        } else {
            // Buscar todas as crianças do usuário ou família
            let kids;

            if (req.user.role === 'admin') {
                // Admin vê todas as crianças
                kids = await Kid.find({ isActive: true });
            } else if (req.user.familyId) {
                // Usuário vê crianças da sua família
                kids = await Kid.find({
                    familyId: req.user.familyId,
                    isActive: true
                });
            } else {
                // Usuário sem família vê apenas suas próprias crianças
                kids = await Kid.find({
                    parentId: req.user._id,
                    isActive: true
                });
            }

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
            .sort({ date: 1 }); // Ordenação crescente: do início para o fim do mês

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
        // Buscar todas as crianças do usuário ou família
        let kids;

        if (req.user.role === 'admin') {
            // Admin pode deletar histórico de todas as crianças
            kids = await Kid.find({ isActive: true });
        } else if (req.user.familyId) {
            // Usuário pode deletar histórico de crianças da sua família
            kids = await Kid.find({
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode deletar histórico de suas próprias crianças
            kids = await Kid.find({
                parentId: req.user._id,
                isActive: true
            });
        }

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
    updatePoint,
    deleteAllPoints,
    deleteAllHistory,
    getHistoryByMonth
}; 