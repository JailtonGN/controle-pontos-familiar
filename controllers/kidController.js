const { validationResult } = require('express-validator');
const Kid = require('../models/Kid');
const Point = require('../models/Point');

// @desc    Obter todas as crianças do usuário
// @route   GET /api/kids
// @access  Private
const getKids = async (req, res) => {
    try {
        const kids = await Kid.find({ 
            parentId: req.user._id,
            isActive: true 
        }).sort({ name: 1 });

        res.json({
            success: true,
            data: {
                kids,
                total: kids.length
            }
        });

    } catch (error) {
        console.error('Erro ao obter crianças:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter uma criança específica
// @route   GET /api/kids/:kidId
// @access  Private
const getKid = async (req, res) => {
    try {
        const { id } = req.params;

        const kid = await Kid.findOne({ 
            _id: id, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        res.json({
            success: true,
            data: {
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao obter criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Criar nova criança
// @route   POST /api/kids
// @access  Private
const createKid = async (req, res) => {
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

        const { name, age, avatar, emoji, color, pin, preferences } = req.body;

        // Criar nova criança
        const kid = new Kid({
            name,
            age,
            avatar,
            emoji,
            color,
            pin,
            parentId: req.user._id,
            preferences
        });

        await kid.save();

        res.status(201).json({
            success: true,
            message: 'Criança criada com sucesso',
            data: {
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao criar criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Atualizar criança
// @route   PUT /api/kids/:kidId
// @access  Private
const updateKid = async (req, res) => {
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

        const { id } = req.params;
        const { name, age, avatar, emoji, color, pin, preferences } = req.body;

        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: id, 
            parentId: req.user._id,
            isActive: true 
        });

        if (!kid) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Atualizar dados
        if (name) kid.name = name;
        if (age) kid.age = age;
        if (avatar !== undefined) kid.avatar = avatar;
        if (emoji !== undefined) kid.emoji = emoji;
        if (color) kid.color = color;
        if (pin) kid.pin = pin;
        if (preferences) kid.preferences = { ...kid.preferences, ...preferences };

        await kid.save();

        res.json({
            success: true,
            message: 'Criança atualizada com sucesso',
            data: {
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Deletar criança (soft delete)
// @route   DELETE /api/kids/:kidId
// @access  Private
const deleteKid = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔍 [DELETE KID] Iniciando exclusão...');
        console.log('📋 [DELETE KID] Parâmetros:', { kidId: id, userId: req.user._id });
        
        // Verificar se a criança existe e pertence ao usuário
        const kid = await Kid.findOne({ 
            _id: id, 
            parentId: req.user._id,
            isActive: true 
        });
        
        if (!kid) {
            console.log('❌ [DELETE KID] Criança não encontrada');
            console.log('🔍 [DELETE KID] Verificando se a criança existe...');
            
            // Verificar se a criança existe (sem verificar parentId)
            const kidExists = await Kid.findById(id);
            if (kidExists) {
                console.log('⚠️ [DELETE KID] Criança existe mas não pertence ao usuário');
                console.log('📋 [DELETE KID] Criança parentId:', kidExists.parentId);
                console.log('📋 [DELETE KID] Usuário atual:', req.user._id);
            } else {
                console.log('❌ [DELETE KID] Criança não existe no banco');
            }
            
            return res.status(404).json({ 
                success: false, 
                message: 'Criança não encontrada' 
            });
        }
        
        console.log('✅ [DELETE KID] Criança encontrada:', kid.name);
        
        // Deletar a criança
        await Kid.deleteOne({ _id: id });
        console.log('✅ [DELETE KID] Criança deletada');
        
        // Deletar pontos relacionados
        const deletedPoints = await Point.deleteMany({ kidId: id });
        console.log('✅ [DELETE KID] Pontos deletados:', deletedPoints.deletedCount);
        
        res.json({ 
            success: true, 
            message: 'Criança e pontos relacionados removidos com sucesso' 
        });
        
    } catch (error) {
        console.error('❌ [DELETE KID] Erro ao remover criança:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

// @desc    Adicionar objetivo para uma criança
// @route   POST /api/kids/:kidId/goals
// @access  Private
const addGoal = async (req, res) => {
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

        const { kidId } = req.params;
        const { title, description, targetPoints, deadline } = req.body;

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

        // Criar novo objetivo
        const newGoal = {
            title,
            description,
            targetPoints,
            deadline: deadline ? new Date(deadline) : null
        };

        kid.goals.push(newGoal);
        await kid.save();

        res.status(201).json({
            success: true,
            message: 'Objetivo adicionado com sucesso',
            data: {
                goal: newGoal,
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao adicionar objetivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Atualizar objetivo de uma criança
// @route   PUT /api/kids/:kidId/goals/:goalId
// @access  Private
const updateGoal = async (req, res) => {
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

        const { kidId, goalId } = req.params;
        const { title, description, targetPoints, deadline } = req.body;

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

        // Encontrar e atualizar o objetivo
        const goal = kid.goals.id(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Objetivo não encontrado'
            });
        }

        if (title) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (targetPoints) goal.targetPoints = targetPoints;
        if (deadline !== undefined) goal.deadline = deadline ? new Date(deadline) : null;

        await kid.save();

        res.json({
            success: true,
            message: 'Objetivo atualizado com sucesso',
            data: {
                goal,
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar objetivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Deletar objetivo de uma criança
// @route   DELETE /api/kids/:kidId/goals/:goalId
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const { kidId, goalId } = req.params;

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

        // Encontrar e remover o objetivo
        const goal = kid.goals.id(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Objetivo não encontrado'
            });
        }

        goal.remove();
        await kid.save();

        res.json({
            success: true,
            message: 'Objetivo removido com sucesso',
            data: {
                kid
            }
        });

    } catch (error) {
        console.error('Erro ao deletar objetivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter objetivos de uma criança
// @route   GET /api/kids/:kidId/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const { kidId } = req.params;
        const { status } = req.query; // 'active', 'completed', 'all'

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

        let goals;
        switch (status) {
            case 'active':
                goals = kid.getActiveGoals();
                break;
            case 'completed':
                goals = kid.getCompletedGoals();
                break;
            default:
                goals = kid.goals;
        }

        res.json({
            success: true,
            data: {
                goals,
                total: goals.length
            }
        });

    } catch (error) {
        console.error('Erro ao obter objetivos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    getKids,
    getKid,
    createKid,
    updateKid,
    deleteKid,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoals
}; 