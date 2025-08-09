const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Kid = require('../models/Kid');

// Gerar token JWT
const generateToken = (userId) => {
    try {
        console.log('Gerando token para userId:', userId); // Debug
        console.log('JWT_SECRET disponível:', !!process.env.JWT_SECRET); // Debug
        
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );
        
        console.log('Token gerado com sucesso'); // Debug
        return token;
    } catch (error) {
        console.error('Erro ao gerar token:', error);
        throw error;
    }
};

// @desc    Registrar novo usuário (somente admin)
// @route   POST /api/auth/register
// @access  Private (Admin)
const register = async (req, res) => {
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

        const { name, email, password, role } = req.body;

        // Verificar se o email já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Criar novo usuário
        let userRole = 'parent';
        // Se a rota estiver protegida por admin, permitir definir o role explicitamente
        if (req.user && req.user.role === 'admin') {
            if (role && ['parent', 'admin'].includes(role)) {
                userRole = role;
            }
        }

        const user = new User({ name, email, password, role: userRole });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: {
                user: user.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Fazer login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        console.log('Login iniciado:', { email: req.body.email }); // Debug
        
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Erros de validação:', errors.array()); // Debug
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        console.log('Dados recebidos:', { email, password: password ? '***' : 'undefined' }); // Debug

        // Buscar usuário por email
        console.log('Buscando usuário por email:', email); // Debug
        const user = await User.findOne({ email });
        console.log('Usuário encontrado:', user ? 'Sim' : 'Não'); // Debug
        
        if (!user) {
            console.log('Usuário não encontrado'); // Debug
            return res.status(401).json({
                success: false,
                message: 'Email ou senha inválidos'
            });
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Conta desativada'
            });
        }

        // Verificar senha
        console.log('Verificando senha...'); // Debug
        const isPasswordValid = await user.comparePassword(password);
        console.log('Senha válida:', isPasswordValid); // Debug
        
        if (!isPasswordValid) {
            console.log('Senha inválida'); // Debug
            return res.status(401).json({
                success: false,
                message: 'Email ou senha inválidos'
            });
        }

        // Atualizar último login (não falhar se der erro)
        try {
            await user.updateLastLogin();
        } catch (error) {
            console.error('Erro ao atualizar último login:', error);
            // Continua o processo mesmo se falhar
        }

        // Gerar token
        console.log('Gerando token...'); // Debug
        const token = generateToken(user._id);
        console.log('Token gerado com sucesso'); // Debug

        console.log('Enviando resposta de sucesso...'); // Debug
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: user.toPublicJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        
        // Verificar se é um erro de validação de senha
        if (error.message === 'Erro ao comparar senhas') {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha inválidos'
            });
        }
        
        // Verificar se é um erro de MongoDB (incluindo timeout)
        if (error.name === 'MongoError' || error.name === 'MongoServerError' || error.message.includes('buffering timed out')) {
            console.error('Erro de MongoDB:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.'
            });
        }
        
        // Verificar se é um erro de JWT
        if (error.name === 'JsonWebTokenError') {
            console.error('Erro de JWT:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro na geração do token'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter perfil do usuário
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        res.json({
            success: true,
            data: {
                user: user.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
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

        const { name, email, preferences } = req.body;

        // Verificar se o email já existe (se foi alterado)
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
        }

        // Atualizar usuário
        const user = await User.findById(req.user._id);
        if (name) user.name = name;
        if (email) user.email = email;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: {
                user: user.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
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

        const { currentPassword, newPassword } = req.body;

        // Buscar usuário com senha
        const user = await User.findById(req.user._id);
        
        // Verificar senha atual
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Atualizar senha
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Verificar token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: req.user.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Login da criança
// @route   POST /api/auth/kid/login
// @access  Public
const kidLogin = async (req, res) => {
    try {
        console.log('🔍 [KID LOGIN] Iniciando login da criança...');
        console.log('📊 [KID LOGIN] Dados recebidos:', {
            kidId: req.body.kidId,
            name: req.body.name,
            pin: req.body.pin ? '***' : 'undefined'
        });

        const { kidId, name, pin } = req.body;

        if (!pin) {
            return res.status(400).json({
                success: false,
                message: 'PIN é obrigatório'
            });
        }

        let kid = null;

        if (kidId) {
            // Caminho original: login por ID da criança
            kid = await Kid.findById(kidId);
            if (!kid || !kid.isActive) {
                console.log('❌ [KID LOGIN] Criança não encontrada por ID:', kidId);
                return res.status(404).json({
                    success: false,
                    message: 'Criança não encontrada'
                });
            }

            console.log('✅ [KID LOGIN] Criança encontrada por ID:', kid.name);

            // Verificar PIN
            if (kid.pin !== pin) {
                console.log('❌ [KID LOGIN] PIN incorreto para ID fornecido');
                return res.status(401).json({
                    success: false,
                    message: 'PIN incorreto'
                });
            }
        } else if (name) {
            // Novo caminho: login por nome + PIN (case-insensitive)
            const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const nameRegex = new RegExp('^' + escapeRegExp(name.trim()) + '$', 'i');

            kid = await Kid.findOne({
                name: nameRegex,
                pin: pin,
                isActive: true
            });

            if (!kid) {
                console.log('❌ [KID LOGIN] Criança não encontrada por nome+PIN');
                return res.status(401).json({
                    success: false,
                    message: 'Nome ou PIN incorretos'
                });
            }

            console.log('✅ [KID LOGIN] Criança autenticada por nome:', kid.name);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Informe o nome da criança e PIN, ou o ID e PIN'
            });
        }

        // Gerar token para criança
        const token = jwt.sign(
            { 
                kidId: kid._id,
                type: 'kid'
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        console.log('✅ [KID LOGIN] Token gerado com sucesso');

        res.json({
            success: true,
            message: 'Login da criança realizado com sucesso',
            data: {
                kid: {
                    _id: kid._id,
                    name: kid.name,
                    age: kid.age,
                    emoji: kid.emoji,
                    color: kid.color,
                    totalPoints: kid.totalPoints,
                    currentLevel: kid.currentLevel
                },
                token
            }
        });

    } catch (error) {
        console.error('❌ [KID LOGIN] Erro no login da criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Verificar token da criança
// @route   GET /api/auth/kid/verify
// @access  Private (Kid)
const verifyKidToken = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token da criança válido',
            data: {
                kid: req.kid
            }
        });

    } catch (error) {
        console.error('Erro ao verificar token da criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// @desc    Obter perfil da criança
// @route   GET /api/auth/kid/profile
// @access  Private (Kid)
const getKidProfile = async (req, res) => {
    try {
        const kid = await Kid.findById(req.kid._id);
        
        res.json({
            success: true,
            data: {
                kid: {
                    _id: kid._id,
                    name: kid.name,
                    age: kid.age,
                    emoji: kid.emoji,
                    color: kid.color,
                    totalPoints: kid.totalPoints,
                    currentLevel: kid.currentLevel,
                    levelProgress: kid.getLevelProgress()
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter perfil da criança:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    verifyToken,
    kidLogin,
    verifyKidToken,
    getKidProfile
}; 