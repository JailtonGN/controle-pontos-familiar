const rateLimit = require('express-rate-limit');

// Rate limiting para adição de pontos
const pointsRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // Máximo 30 adições de pontos por minuto por IP
    message: {
        success: false,
        message: 'Muitas tentativas de adicionar pontos. Tente novamente em 1 minuto.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Corrigir keyGenerator para IPv6
    keyGenerator: (req) => {
        if (req.user) {
            return `user_${req.user._id}`;
        }
        // Usar o IP do request de forma segura
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});

// Rate limiting mais restritivo para operações críticas
const strictRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests por 15 minutos
    message: {
        success: false,
        message: 'Muitas requisições. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        if (req.user) {
            return `user_${req.user._id}`;
        }
        // Usar o IP do request de forma segura
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});

module.exports = {
    pointsRateLimit,
    strictRateLimit
};