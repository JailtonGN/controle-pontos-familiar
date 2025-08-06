const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    kidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kid',
        required: [true, 'ID da criança é obrigatório']
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: function() {
            return this.type === 'add';
        },
        default: null
    },
    points: {
        type: Number,
        required: [true, 'Quantidade de pontos é obrigatória'],
        min: [1, 'Pontos devem ser pelo menos 1']
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Observações não podem ter mais de 500 caracteres']
    },
    awardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID do usuário que concedeu os pontos é obrigatório']
    },
    type: {
        type: String,
        enum: ['add', 'remove'],
        default: 'add'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware para atualizar pontos da criança quando um ponto é adicionado
pointSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const Kid = require('./Kid');
            const kid = await Kid.findById(this.kidId);
            
            if (kid) {
                if (this.type === 'add') {
                    await kid.addPoints(this.points);
                } else if (this.type === 'remove') {
                    await kid.removePoints(this.points);
                }
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Método estático para obter pontos por período
pointSchema.statics.getPointsByPeriod = async function(kidId, startDate, endDate) {
    return this.find({
        kidId,
        date: {
            $gte: startDate,
            $lte: endDate
        },
        isActive: true
    }).populate('activityId', 'name icon color category')
      .populate('awardedBy', 'name')
      .sort({ date: -1 });
};

// Método estático para obter estatísticas de pontos
pointSchema.statics.getPointsStats = async function(kidId, period = 'month') {
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const points = await this.find({
        kidId,
        date: { $gte: startDate },
        isActive: true
    });

    const totalPoints = points.reduce((sum, point) => {
        return sum + (point.type === 'add' ? point.points : -point.points);
    }, 0);

    const pointsByCategory = {};
    points.forEach(point => {
        if (point.activityId && point.activityId.category) {
            const category = point.activityId.category;
            if (!pointsByCategory[category]) {
                pointsByCategory[category] = 0;
            }
            pointsByCategory[category] += point.type === 'add' ? point.points : -point.points;
        }
    });

    return {
        totalPoints,
        pointsByCategory,
        totalActivities: points.length,
        period
    };
};

// Método estático para obter pontos por categoria
pointSchema.statics.getPointsByCategory = async function(kidId, category) {
    return this.aggregate([
        {
            $match: {
                kidId: mongoose.Types.ObjectId(kidId),
                isActive: true
            }
        },
        {
            $lookup: {
                from: 'activities',
                localField: 'activityId',
                foreignField: '_id',
                as: 'activity'
            }
        },
        {
            $unwind: '$activity'
        },
        {
            $match: {
                'activity.category': category
            }
        },
        {
            $group: {
                _id: '$activityId',
                totalPoints: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'add'] },
                            '$points',
                            { $multiply: ['$points', -1] }
                        ]
                    }
                },
                activityName: { $first: '$activity.name' },
                activityIcon: { $first: '$activity.icon' },
                activityColor: { $first: '$activity.color' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { totalPoints: -1 }
        }
    ]);
};

// Método estático para obter histórico de pontos
pointSchema.statics.getPointHistory = async function(kidId, limit = 50) {
    return this.find({
        kidId,
        isActive: true
    })
    .populate('activityId', 'name icon color category')
    .populate('awardedBy', 'name')
    .sort({ date: -1 })
    .limit(limit);
};

// Método estático para obter pontos do dia
pointSchema.statics.getTodayPoints = async function(kidId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.find({
        kidId,
        date: {
            $gte: startOfDay,
            $lt: endOfDay
        },
        isActive: true
    })
    .populate('activityId', 'name icon color')
    .populate('awardedBy', 'name')
    .sort({ date: -1 });
};

// Índices
pointSchema.index({ kidId: 1, date: -1 });
pointSchema.index({ activityId: 1 });
pointSchema.index({ awardedBy: 1 });
pointSchema.index({ type: 1 });

module.exports = mongoose.model('Point', pointSchema); 