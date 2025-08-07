const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authenticateKidToken } = require('../middleware/auth');
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

// Rotas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Rotas protegidas
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.get('/verify', authenticateToken, verifyToken);

// Rotas para crianças
router.post('/kid/login', kidLogin);
router.get('/kid/verify', authenticateKidToken, verifyKidToken);
router.get('/kid/profile', authenticateKidToken, getKidProfile);

module.exports = router; 