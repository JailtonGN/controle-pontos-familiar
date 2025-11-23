const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Point = require('../models/Point');
const Kid = require('../models/Kid');

async function removeDuplicatePoints() {
    try {
        console.log('🔍 Procurando pontos duplicados...');
        
        // Encontrar duplicatas baseado em: kidId, activityId, points, awardedBy, date (mesmo minuto)
        const duplicates = await Point.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: {
                        kidId: '$kidId',
                        activityId: '$activityId',
                        points: '$points',
                        awardedBy: '$awardedBy',
                        type: '$type',
                        // Agrupar por data (ignorando segundos/milissegundos)
                        dateMinute: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:%M',
                                date: '$date'
                            }
                        }
                    },
                    count: { $sum: 1 },
                    docs: { $push: '$_id' }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        console.log(`📊 Encontradas ${duplicates.length} grupos de duplicatas`);

        let totalRemoved = 0;
        let kidsToRecalculate = new Set();

        for (const duplicate of duplicates) {
            console.log(`🔄 Processando grupo com ${duplicate.count} duplicatas...`);
            
            // Manter apenas o primeiro registro, remover os outros
            const docsToRemove = duplicate.docs.slice(1);
            
            for (const docId of docsToRemove) {
                const point = await Point.findById(docId);
                if (point) {
                    console.log(`❌ Removendo duplicata: ${point.points} pontos para criança ${point.kidId}`);
                    await Point.findByIdAndDelete(docId);
                    kidsToRecalculate.add(point.kidId.toString());
                    totalRemoved++;
                }
            }
        }

        console.log(`✅ Removidas ${totalRemoved} duplicatas`);
        console.log(`🔄 Recalculando pontos para ${kidsToRecalculate.size} crianças...`);

        // Recalcular pontos totais para as crianças afetadas
        for (const kidId of kidsToRecalculate) {
            await recalculateKidPoints(kidId);
        }

        console.log('✅ Processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro ao remover duplicatas:', error);
    } finally {
        mongoose.connection.close();
    }
}

async function recalculateKidPoints(kidId) {
    try {
        const kid = await Kid.findById(kidId);
        if (!kid) return;

        // Buscar todos os pontos ativos da criança
        const points = await Point.find({ kidId, isActive: true });
        
        let totalPoints = 0;
        points.forEach(point => {
            if (point.type === 'add') {
                totalPoints += point.points;
            } else {
                totalPoints -= point.points;
            }
        });

        // Atualizar criança
        kid.totalPoints = totalPoints;
        kid.currentLevel = Math.max(1, Math.floor(totalPoints / 500) + 1);
        await kid.save();

        console.log(`✅ Recalculado: ${kid.name} - ${totalPoints} pontos`);
        
    } catch (error) {
        console.error(`❌ Erro ao recalcular pontos para criança ${kidId}:`, error);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    removeDuplicatePoints();
}

module.exports = { removeDuplicatePoints, recalculateKidPoints };