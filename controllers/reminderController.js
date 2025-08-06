const { validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const Kid = require('../models/Kid');

// @desc    Criar novo lembrete (público - para crianças)
// @route   POST /api/reminders
// @access  Public
const createReminder = async (req, res) => {
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

        const { kidId, title, message, type, priority } = req.body;

        // Verificar se a criança existe
        const kid = await Kid.findById(kidId);
        if (!kid || !kid.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Criança não encontrada'
            });
        }

        // Criar novo lembrete
        const reminder = new Reminder({
            kidId,
            title,
            message,
            type: type || 'request',
            priority: priority || 'medium'
        });

        await reminder.save();

        res.status(201).json({
            success: true,
            message: 'Lembrete enviado com sucesso',
            data: {
                reminder
            }
        });

    } catch (error) {
        console.error('Erro ao criar lembrete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter todos os lembretes do usuário
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
    try {
        const { status, type, priority, limit = 20, page = 1 } = req.query;

        let query = { isActive: true };

        // Filtrar por status
        if (status) {
            query.status = status;
        }

        // Filtrar por tipo
        if (type) {
            query.type = type;
        }

        // Filtrar por prioridade
        if (priority) {
            query.priority = priority;
        }

        // Calcular skip para paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Buscar lembretes
        const reminders = await Reminder.find(query)
            .populate({
                path: 'kidId',
                select: 'name age avatar',
                match: { parentId: req.user._id }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Filtrar lembretes que pertencem ao usuário
        const userReminders = reminders.filter(reminder => reminder.kidId);

        const total = await Reminder.countDocuments({
            ...query,
            'kid.parentId': req.user._id
        });

        res.json({
            success: true,
            data: {
                reminders: userReminders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter lembretes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter lembretes não lidos
// @route   GET /api/reminders/unread
// @access  Private
const getUnreadReminders = async (req, res) => {
    try {
        const reminders = await Reminder.getUnreadReminders(req.user._id);

        res.json({
            success: true,
            data: {
                reminders,
                total: reminders.length
            }
        });

    } catch (error) {
        console.error('Erro ao obter lembretes não lidos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter estatísticas de lembretes
// @route   GET /api/reminders/stats
// @access  Private
const getReminderStats = async (req, res) => {
    try {
        const stats = await Reminder.getReminderStats(req.user._id);

        // Formatar estatísticas
        const formattedStats = {
            unread: 0,
            read: 0,
            responded: 0,
            dismissed: 0,
            total: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.json({
            success: true,
            data: {
                stats: formattedStats
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas de lembretes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter um lembrete específico
// @route   GET /api/reminders/:reminderId
// @access  Private
const getReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        const reminder = await Reminder.findById(reminderId)
            .populate({
                path: 'kidId',
                select: 'name age avatar',
                match: { parentId: req.user._id }
            });

        if (!reminder || !reminder.kidId) {
            return res.status(404).json({
                success: false,
                message: 'Lembrete não encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                reminder
            }
        });

    } catch (error) {
        console.error('Erro ao obter lembrete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Marcar lembrete como lido
// @route   PUT /api/reminders/:reminderId/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { reminderId } = req.params;

        // Verificar se o lembrete existe e pertence ao usuário
        const reminder = await Reminder.findById(reminderId)
            .populate({
                path: 'kidId',
                select: 'parentId',
                match: { parentId: req.user._id }
            });

        if (!reminder || !reminder.kidId) {
            return res.status(404).json({
                success: false,
                message: 'Lembrete não encontrado'
            });
        }

        await reminder.markAsRead();

        res.json({
            success: true,
            message: 'Lembrete marcado como lido',
            data: {
                reminder
            }
        });

    } catch (error) {
        console.error('Erro ao marcar lembrete como lido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Responder a um lembrete
// @route   PUT /api/reminders/:reminderId/respond
// @access  Private
const respondToReminder = async (req, res) => {
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

        const { reminderId } = req.params;
        const { message } = req.body;

        // Verificar se o lembrete existe e pertence ao usuário
        const reminder = await Reminder.findById(reminderId)
            .populate({
                path: 'kidId',
                select: 'parentId',
                match: { parentId: req.user._id }
            });

        if (!reminder || !reminder.kidId) {
            return res.status(404).json({
                success: false,
                message: 'Lembrete não encontrado'
            });
        }

        await reminder.respond(message, req.user._id);

        res.json({
            success: true,
            message: 'Resposta enviada com sucesso',
            data: {
                reminder
            }
        });

    } catch (error) {
        console.error('Erro ao responder lembrete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Descartar lembrete
// @route   PUT /api/reminders/:reminderId/dismiss
// @access  Private
const dismissReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        // Verificar se o lembrete existe e pertence ao usuário
        const reminder = await Reminder.findById(reminderId)
            .populate({
                path: 'kidId',
                select: 'parentId',
                match: { parentId: req.user._id }
            });

        if (!reminder || !reminder.kidId) {
            return res.status(404).json({
                success: false,
                message: 'Lembrete não encontrado'
            });
        }

        await reminder.dismiss();

        res.json({
            success: true,
            message: 'Lembrete descartado com sucesso',
            data: {
                reminder
            }
        });

    } catch (error) {
        console.error('Erro ao descartar lembrete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter lembretes por criança
// @route   GET /api/reminders/kid/:kidId
// @access  Private
const getRemindersByKid = async (req, res) => {
    try {
        const { kidId } = req.params;
        const { limit = 20 } = req.query;

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

        const reminders = await Reminder.getRemindersByKid(kidId, parseInt(limit));

        res.json({
            success: true,
            data: {
                reminders,
                kid: {
                    name: kid.name,
                    age: kid.age,
                    avatar: kid.avatar
                },
                total: reminders.length
            }
        });

    } catch (error) {
        console.error('Erro ao obter lembretes por criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    createReminder,
    getReminders,
    getUnreadReminders,
    getReminderStats,
    getReminder,
    markAsRead,
    respondToReminder,
    dismissReminder,
    getRemindersByKid
}; 