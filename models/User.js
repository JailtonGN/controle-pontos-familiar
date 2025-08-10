const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['parent', 'admin'],
        default: 'parent'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: [true, 'Família é obrigatória para todos os usuários']
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    }
}, {
    timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    // Só hash a senha se ela foi modificada (ou é nova)
    if (!this.isModified('password')) return next();

    try {
        // Hash da senha com salt rounds
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Erro ao comparar senhas');
    }
};

// Método para atualizar último login
userSchema.methods.updateLastLogin = async function() {
    try {
        this.lastLogin = new Date();
        await this.save();
        return true;
    } catch (error) {
        // Erro ao atualizar último login - não falhar o login
        return false;
    }
};

// Método para obter dados públicos do usuário (sem senha)
userSchema.methods.toPublicJSON = function() {
    try {
        const user = this.toObject();
        delete user.password;
        return user;
    } catch (error) {
        // Erro ao converter usuário para JSON - retornar objeto básico
        return {
            _id: this._id,
            name: this.name,
            email: this.email,
            role: this.role,
            isActive: this.isActive
        };
    }
};

// Índices
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema); 