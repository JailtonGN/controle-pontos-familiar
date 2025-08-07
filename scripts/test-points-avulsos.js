const mongoose = require('mongoose');
const Point = require('../models/Point');
require('dotenv').config();

async function testPointsAvulsos() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // Buscar pontos avulsos (sem activityId)
        const pontosAvulsos = await Point.find({ 
            activityId: null,
            isActive: true 
        }).populate('kidId', 'name').populate('awardedBy', 'name');

        console.log('\n📊 Pontos Avulsos encontrados:', pontosAvulsos.length);
        
        pontosAvulsos.forEach((ponto, index) => {
            console.log(`\n--- Ponto ${index + 1} ---`);
            console.log(`Criança: ${ponto.kidId?.name || 'N/A'}`);
            console.log(`Pontos: ${ponto.points}`);
            console.log(`Tipo: ${ponto.type}`);
            console.log(`Motivo (reason): ${ponto.reason || 'Não informado'}`);
            console.log(`Observações (notes): ${ponto.notes || 'Não informado'}`);
            console.log(`Data: ${ponto.date}`);
            console.log(`Concedido por: ${ponto.awardedBy?.name || 'N/A'}`);
        });

        // Testar criação de um ponto avulso
        console.log('\n🧪 Testando criação de ponto avulso...');
        
        // Buscar uma criança para teste
        const Kid = require('../models/Kid');
        const User = require('../models/User');
        
        const kid = await Kid.findOne({ isActive: true });
        const user = await User.findOne({ isActive: true });
        
        if (!kid || !user) {
            console.log('❌ Não foi possível encontrar criança ou usuário para teste');
            return;
        }

        const novoPonto = new Point({
            kidId: kid._id,
            activityId: null, // Ponto avulso
            points: 10,
            reason: 'Comportamento exemplar',
            notes: 'Criança ajudou muito hoje',
            awardedBy: user._id,
            type: 'add'
        });

        await novoPonto.save();
        console.log('✅ Ponto avulso criado com sucesso!');
        console.log('Motivo salvo:', novoPonto.reason);

        await mongoose.disconnect();
        console.log('✅ Desconectado do MongoDB');

    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

testPointsAvulsos(); 