const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome da família é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome da família não pode ter mais de 100 caracteres'],
        unique: true,
        validate: {
            validator: async function(value) {
                // Verificar se já existe uma família com este nome (exceto esta mesma família)
                const Family = this.constructor;
                const existingFamily = await Family.findOne({ 
                    name: value,
                    _id: { $ne: this._id } // Excluir esta família da busca (para updates)
                });
                return !existingFamily;
            },
            message: 'Já existe uma família com este nome'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do administrador que criou a família é obrigatório']
    }
}, {
    timestamps: true
});

// Método para obter dados públicos da família
familySchema.methods.toPublicJSON = function() {
    try {
        const family = this.toObject();
        return family;
    } catch (error) {
        console.error('Erro ao converter família para JSON:', error);
        return {
            _id: this._id,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            createdAt: this.createdAt
        };
    }
};

// Índices
familySchema.index({ name: 1 }, { unique: true });
familySchema.index({ isActive: 1 });
familySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Family', familySchema); 