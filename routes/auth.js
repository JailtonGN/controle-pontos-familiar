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
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

router.put('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, password, role, isActive } = req.body;
        
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
        
        // Atualizar campos
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: { user: user.toPublicJSON() }
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
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
        console.error('Erro ao excluir usuário:', error);
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