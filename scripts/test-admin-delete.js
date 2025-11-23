const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Point = require('../models/Point');
const Kid = require('../models/Kid');
const User = require('../models/User');

async function testAdminDelete() {
    try {
        console.log('🧪 Testando funcionalidade de exclusão administrativa...\n');

        // 1. Buscar um usuário admin
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ Nenhum usuário admin encontrado. Criando um...');
            // Aqui você poderia criar um admin de teste se necessário
            return;
        }
        console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})`);

        // 2. Buscar uma criança
        const kid = await Kid.findOne({ isActive: true });
        if (!kid) {
            console.log('❌ Nenhuma criança encontrada para teste');
            return;
        }
        console.log(`✅ Criança encontrada: ${kid.name}`);

        // 3. Buscar pontos da criança
        const points = await Point.find({ 
            kidId: kid._id, 
            isActive: true 
        }).limit(5);
        
        if (points.length === 0) {
            console.log('❌ Nenhum ponto encontrado para teste');
            return;
        }
        
        console.log(`✅ Encontrados ${points.length} registros de pontos:`);
        points.forEach((point, index) => {
            console.log(`   ${index + 1}. ${point.type === 'add' ? '➕' : '➖'} ${point.points} pontos - ${new Date(point.date).toLocaleDateString('pt-BR')}`);
        });

        // 4. Simular exclusão (apenas mostrar o que seria excluído)
        const pointToDelete = points[0];
        console.log(`\n🎯 Simulando exclusão do registro:`);
        console.log(`   ID: ${pointToDelete._id}`);
        console.log(`   Criança: ${kid.name}`);
        console.log(`   Pontos: ${pointToDelete.points}`);
        console.log(`   Tipo: ${pointToDelete.type}`);
        console.log(`   Data: ${new Date(pointToDelete.date).toLocaleString('pt-BR')}`);

        // 5. Calcular impacto
        const currentTotal = kid.totalPoints;
        let newTotal = currentTotal;
        
        if (pointToDelete.type === 'add') {
            newTotal -= pointToDelete.points;
        } else {
            newTotal += pointToDelete.points;
        }

        console.log(`\n📊 Impacto da exclusão:`);
        console.log(`   Pontos atuais: ${currentTotal}`);
        console.log(`   Pontos após exclusão: ${newTotal}`);
        console.log(`   Diferença: ${newTotal - currentTotal}`);

        // 6. Verificar permissões
        console.log(`\n🔐 Verificação de permissões:`);
        console.log(`   Usuário: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Pode excluir: ${admin.role === 'admin' ? '✅ SIM' : '❌ NÃO'}`);

        console.log(`\n✅ Teste concluído com sucesso!`);
        console.log(`\n📝 Para testar na prática:`);
        console.log(`   1. Faça login como admin`);
        console.log(`   2. Acesse /admin-points`);
        console.log(`   3. Encontre o registro ID: ${pointToDelete._id}`);
        console.log(`   4. Clique em "Excluir"`);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    testAdminDelete();
}

module.exports = { testAdminDelete };