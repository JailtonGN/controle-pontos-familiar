const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Kid = require('../models/Kid');

// Middleware para autenticar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Pegar o token do header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido'
            });
        }

        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Buscar o usuário no banco
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado ou inativo'
            });
        }

        // Adicionar o usuário ao request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Middleware opcional para autenticação (não bloqueia se não houver token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Se houver erro, apenas continua sem usuário autenticado
        next();
    }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        });
    }
    next();
};

// Middleware para autenticar token da criança
const authenticateKidToken = async (req, res, next) => {
    try {
        // Pegar o token do header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido'
            });
        }

        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Verificar se é um token de criança
        if (decoded.type !== 'kid') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido para criança'
            });
        }
        
        // Buscar a criança no banco
        const kid = await Kid.findById(decoded.kidId);
        
        if (!kid || !kid.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Criança não encontrada ou inativa'
            });
        }

        // Adicionar a criança ao request
        req.kid = kid;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        console.error('❌ [KID AUTH] Erro na autenticação da criança:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    authenticateKidToken
}; 