const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authenticateKidToken, requireAdmin } = require('../middleware/auth');
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword, 
    verifyToken,
    kidLogin,
    verifyKidToken,
    getKidProfile
} = require('../controllers/authController');

const router = express.Router();

// Validação para registro
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validação para login
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória')
];

// Validação para atualização de perfil
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido')
];

// Validação para alteração de senha
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Senha atual é obrigatória'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

// Registro agora restrito a administradores
router.post('/register', authenticateToken, requireAdmin, registerValidation, register);
router.post('/login', loginValidation, login);

// Rotas protegidas
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.get('/verify', authenticateToken, verifyToken);

// Rotas de administração (apenas admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find({})
            .select('-password')
            .populate({
                path: 'familyId',
                select: 'name isActive',
                match: { isActive: true }
            })
            .sort({ createdAt: -1 });
        
        console.log('👥 [USERS] Usuários encontrados:', users.length);
        users.forEach(user => {
            console.log(`👤 [USERS] ${user.name} - familyId:`, user.familyId);
        });
        
        // Converter para JSON e garantir que o familyId seja incluído
        const usersData = users.map(user => {
            const userData = user.toObject();
            if (userData.familyId && typeof userData.familyId === 'object') {
                userData.familyId = {
                    _id: userData.familyId._id,
                    name: userData.familyId.name
                };
            }
            return userData;
        });
        
        res.json({
            success: true,
            data: { users: usersData }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

router.put('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, password, role, isActive, familyId } = req.body;
        
        const User = require('../models/User');
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Verificar se o email já existe (se foi alterado)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
        }
        
        // Verificar se a família foi fornecida (obrigatória)
        if (!familyId || familyId === '') {
            return res.status(400).json({
                success: false,
                message: 'Família é obrigatória para todos os usuários'
            });
        }
        
        // Verificar se a família existe e está ativa
        const Family = require('../models/Family');
        const family = await Family.findById(familyId);
        if (!family || !family.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Família não encontrada ou inativa'
            });
        }
        
        // Determinar o role final do usuário
        const finalRole = role || user.role;
        
        // Validar Família ADM: apenas admins podem ser atribuídos a ela
        if (family.name === 'Família ADM' && finalRole !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Apenas usuários com perfil Administrador podem ser atribuídos à Família ADM. Para usuários com perfil Pai/Mãe, crie uma nova família ou selecione uma família existente.'
            });
        }
        
        // Atualizar campos
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        user.familyId = familyId; // Sempre definir a família
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: { user: user.toPublicJSON() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const User = require('../models/User');
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Não permitir excluir o próprio usuário
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível excluir sua própria conta'
            });
        }
        
        await User.findByIdAndDelete(userId);
        
        res.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rotas para crianças
router.post('/kid/login', kidLogin);
router.get('/kid/verify', authenticateKidToken, verifyKidToken);
router.get('/kid/profile', authenticateKidToken, getKidProfile);

module.exports = router; 