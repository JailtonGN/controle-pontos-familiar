const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');

// @desc    Criar nova atividade
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados inválidos',
                errors: errors.array() 
            });
        }

        const { name, type, points, description, familyId } = req.body;

        const activity = new Activity({
            name,
            type,
            points,
            description,
            parentId: req.user._id,
            familyId: familyId || req.user.familyId // Usar família do usuário se não especificada
        });

        await activity.save();

        res.status(201).json({
            success: true,
            message: 'Atividade criada com sucesso!',
            data: { activity }
        });
    } catch (error) {
        console.error('Erro ao criar atividade:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter todas as atividades do usuário
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        let activities;
        
        if (req.user.role === 'admin') {
            // Admin vê todas as atividades
            activities = await Activity.find({ isActive: true }).sort({ createdAt: -1 });
        } else if (req.user.familyId) {
            // Usuário vê atividades da sua família
            activities = await Activity.find({ 
                familyId: req.user.familyId,
                isActive: true 
            }).sort({ createdAt: -1 });
        } else {
            // Usuário sem família vê apenas suas próprias atividades
            activities = await Activity.find({ 
                parentId: req.user._id,
                isActive: true 
            }).sort({ createdAt: -1 });
        }

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Erro ao obter atividades:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter atividade específica
// @route   GET /api/activities/:id
// @access  Private
const getActivity = async (req, res) => {
    try {
        let activity;
        
        if (req.user.role === 'admin') {
            // Admin pode ver qualquer atividade
            activity = await Activity.findOne({
                _id: req.params.id,
                isActive: true
            });
        } else if (req.user.familyId) {
            // Usuário pode ver atividades da sua família
            activity = await Activity.findOne({
                _id: req.params.id,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode ver suas próprias atividades
            activity = await Activity.findOne({
                _id: req.params.id,
                parentId: req.user._id,
                isActive: true
            });
        }

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Atividade não encontrada'
            });
        }

        res.json({
            success: true,
            data: { activity }
        });
    } catch (error) {
        console.error('Erro ao obter atividade:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Atualizar atividade
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados inválidos',
                errors: errors.array() 
            });
        }

        const { name, type, points, description, familyId } = req.body;

        let activity;
        
        if (req.user.role === 'admin') {
            // Admin pode atualizar qualquer atividade
            activity = await Activity.findOne({
                _id: req.params.id,
                isActive: true
            });
        } else if (req.user.familyId) {
            // Usuário pode atualizar atividades da sua família
            activity = await Activity.findOne({
                _id: req.params.id,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode atualizar suas próprias atividades
            activity = await Activity.findOne({
                _id: req.params.id,
                parentId: req.user._id,
                isActive: true
            });
        }

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Atividade não encontrada'
            });
        }

        // Atualizar campos
        if (name) activity.name = name;
        if (type) activity.type = type;
        if (points) activity.points = points;
        if (description !== undefined) activity.description = description;

        await activity.save();

        res.json({
            success: true,
            message: 'Atividade atualizada com sucesso!',
            data: { activity }
        });
    } catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Excluir atividade
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
    try {
        let activity;
        
        if (req.user.role === 'admin') {
            // Admin pode deletar qualquer atividade
            activity = await Activity.findOne({
                _id: req.params.id,
                isActive: true
            });
        } else if (req.user.familyId) {
            // Usuário pode deletar atividades da sua família
            activity = await Activity.findOne({
                _id: req.params.id,
                familyId: req.user.familyId,
                isActive: true
            });
        } else {
            // Usuário sem família só pode deletar suas próprias atividades
            activity = await Activity.findOne({
                _id: req.params.id,
                parentId: req.user._id,
                isActive: true
            });
        }

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Atividade não encontrada'
            });
        }

        // Soft delete - marcar como inativa
        activity.isActive = false;
        await activity.save();

        res.json({
            success: true,
            message: 'Atividade excluída com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao excluir atividade:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter atividades por tipo
// @route   GET /api/activities/type/:type
// @access  Private
const getActivitiesByType = async (req, res) => {
    try {
        const { type } = req.params;
        
        if (!['positive', 'negative'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo deve ser "positive" ou "negative"'
            });
        }

        let activities;
        
        if (req.user.role === 'admin') {
            // Admin vê todas as atividades do tipo
            activities = await Activity.find({
                type,
                isActive: true
            }).sort({ name: 1 });
        } else if (req.user.familyId) {
            // Usuário vê atividades da sua família do tipo
            activities = await Activity.find({
                familyId: req.user.familyId,
                type,
                isActive: true
            }).sort({ name: 1 });
        } else {
            // Usuário sem família vê apenas suas próprias atividades do tipo
            activities = await Activity.find({
                parentId: req.user._id,
                type,
                isActive: true
            }).sort({ name: 1 });
        }

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Erro ao obter atividades por tipo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByType
}; 