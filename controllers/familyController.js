const Family = require('../models/Family');
const User = require('../models/User');
const Kid = require('../models/Kid');

// @desc    Criar nova família
// @route   POST /api/families
// @access  Private (Admin)
const createFamily = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Verificar se o nome da família já existe
        const existingFamily = await Family.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isActive: true 
        });

        if (existingFamily) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma família com este nome'
            });
        }

        // Criar nova família
        const family = new Family({
            name,
            description,
            createdBy: req.user._id
        });

        await family.save();

        res.status(201).json({
            success: true,
            message: 'Família criada com sucesso',
            data: {
                family: family.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro ao criar família:', error);
        
        // Tratar erros específicos
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }
        
        // Tratar erro de duplicação (índice único)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma família com este nome'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Listar todas as famílias
// @route   GET /api/families
// @access  Private (Admin)
const getFamilies = async (req, res) => {
    try {
        const families = await Family.find({ isActive: true })
            .populate('createdBy', 'name email')
            .sort({ name: 1 });

        // Para cada família, buscar estatísticas
        const familiesWithStats = await Promise.all(families.map(async (family) => {
            // Contar membros
            const memberCount = await User.countDocuments({ 
                familyId: family._id, 
                isActive: true 
            });
            
            // Contar crianças
            const kidCount = await Kid.countDocuments({ 
                familyId: family._id, 
                isActive: true 
            });
            
            return {
                ...family.toObject(),
                memberCount,
                kidCount
            };
        }));

        res.json({
            success: true,
            data: { families: familiesWithStats }
        });

    } catch (error) {
        console.error('Erro ao listar famílias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter família por ID
// @route   GET /api/families/:id
// @access  Private (Admin)
const getFamilyById = async (req, res) => {
    try {
        const { id } = req.params;

        const family = await Family.findById(id)
            .populate('createdBy', 'name email');

        if (!family || !family.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Família não encontrada'
            });
        }

        // Buscar membros da família
        const members = await User.find({ familyId: id, isActive: true })
            .select('-password')
            .sort({ name: 1 });

        // Buscar crianças da família
        const kids = await Kid.find({ familyId: id, isActive: true })
            .sort({ name: 1 });

        res.json({
            success: true,
            data: {
                family: family.toPublicJSON(),
                members,
                kids
            }
        });

    } catch (error) {
        console.error('Erro ao obter família:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Atualizar família
// @route   PUT /api/families/:id
// @access  Private (Admin)
const updateFamily = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        const family = await Family.findById(id);
        if (!family) {
            return res.status(404).json({
                success: false,
                message: 'Família não encontrada'
            });
        }

        // Proteger Família ADM contra alterações no nome
        if (family.name === 'Família ADM' && name && name !== 'Família ADM') {
            return res.status(403).json({
                success: false,
                message: 'A Família ADM não pode ter seu nome alterado'
            });
        }

        // Verificar se o nome já existe (se foi alterado)
        if (name && name !== family.name) {
            const existingFamily = await Family.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                isActive: true,
                _id: { $ne: id }
            });

            if (existingFamily) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe uma família com este nome'
                });
            }
        }

        // Atualizar campos
        if (name !== undefined) family.name = name;
        if (description !== undefined) family.description = description;
        if (isActive !== undefined) family.isActive = isActive;

        await family.save();

        res.json({
            success: true,
            message: 'Família atualizada com sucesso',
            data: {
                family: family.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar família:', error);
        
        // Tratar erros específicos
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }
        
        // Tratar erro de duplicação (índice único)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma família com este nome'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Excluir família
// @route   DELETE /api/families/:id
// @access  Private (Admin)
const deleteFamily = async (req, res) => {
    try {
        const { id } = req.params;

        const family = await Family.findById(id);
        if (!family) {
            return res.status(404).json({
                success: false,
                message: 'Família não encontrada'
            });
        }

        // Proteger Família ADM contra exclusão
        if (family.name === 'Família ADM') {
            return res.status(403).json({
                success: false,
                message: 'A Família ADM não pode ser excluída'
            });
        }

        // Verificar se há usuários ou crianças na família
        const userCount = await User.countDocuments({ familyId: id, isActive: true });
        const kidCount = await Kid.countDocuments({ familyId: id, isActive: true });

        if (userCount > 0 || kidCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Não é possível excluir a família. Ela possui ${userCount} usuário(s) e ${kidCount} criança(s) associada(s).`
            });
        }

        // Desativar família em vez de excluir
        family.isActive = false;
        await family.save();

        res.json({
            success: true,
            message: 'Família desativada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir família:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter estatísticas da família
// @route   GET /api/families/:id/stats
// @access  Private (Admin)
const getFamilyStats = async (req, res) => {
    try {
        const { id } = req.params;

        const family = await Family.findById(id);
        if (!family || !family.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Família não encontrada'
            });
        }

        // Contar membros ativos
        const memberCount = await User.countDocuments({ familyId: id, isActive: true });

        // Contar crianças ativas
        const kidCount = await Kid.countDocuments({ familyId: id, isActive: true });

        // Calcular total de pontos da família
        const kids = await Kid.find({ familyId: id, isActive: true });
        const totalPoints = kids.reduce((sum, kid) => sum + kid.totalPoints, 0);

        // Calcular nível médio das crianças
        const averageLevel = kids.length > 0 
            ? Math.round(kids.reduce((sum, kid) => sum + kid.currentLevel, 0) / kids.length)
            : 0;

        res.json({
            success: true,
            data: {
                family: family.toPublicJSON(),
                stats: {
                    memberCount,
                    kidCount,
                    totalPoints,
                    averageLevel
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas da família:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    createFamily,
    getFamilies,
    getFamilyById,
    updateFamily,
    deleteFamily,
    getFamilyStats
}; 