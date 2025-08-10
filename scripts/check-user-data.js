const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const Kid = require('../models/Kid');
const Activity = require('../models/Activity');

// Conectar ao MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Função principal
async function checkUserData() {
    try {
        console.log('🔍 Verificando dados do usuário...');
        
        // Verificar se o usuário existe
        const user = await User.findOne({ email: 'deejatmax2010@gmail.com' });
        if (!user) {
            console.log('❌ Usuário deejatmax2010@gmail.com não encontrado');
            
            // Listar todos os usuários
            const allUsers = await User.find({});
            console.log('\n👥 Todos os usuários cadastrados:');
            allUsers.forEach(u => {
                console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
            });
            return;
        }
        
        console.log('✅ Usuário encontrado:', user.name, `(${user.email})`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Família: ${user.familyId || 'Sem família'}`);
        
        // Verificar crianças
        const kids = await Kid.find({ parentId: user._id });
        console.log(`\n👶 Crianças criadas por ${user.name} (${kids.length} encontradas):`);
        if (kids.length === 0) {
            console.log('   - Nenhuma criança encontrada');
        } else {
            kids.forEach(kid => {
                console.log(`   - ${kid.name} (${kid.age} anos) - ID: ${kid._id}`);
                console.log(`     Família: ${kid.familyId || 'Sem família'}`);
            });
        }
        
        // Verificar atividades
        const activities = await Activity.find({ parentId: user._id });
        console.log(`\n🎯 Atividades criadas por ${user.name} (${activities.length} encontradas):`);
        if (activities.length === 0) {
            console.log('   - Nenhuma atividade encontrada');
        } else {
            activities.forEach(activity => {
                console.log(`   - ${activity.name} (${activity.type}) - ID: ${activity._id}`);
                console.log(`     Família: ${activity.familyId || 'Sem família'}`);
            });
        }
        
        // Verificar se há crianças/atividades sem parentId
        const allKids = await Kid.find({});
        const allActivities = await Activity.find({});
        
        console.log(`\n📊 Dados gerais:`);
        console.log(`   - Total de crianças no sistema: ${allKids.length}`);
        console.log(`   - Total de atividades no sistema: ${allActivities.length}`);
        
        if (allKids.length > 0) {
            console.log('\n👶 Todas as crianças:');
            allKids.forEach(kid => {
                const parent = allUsers.find(u => u._id.toString() === kid.parentId?.toString());
                console.log(`   - ${kid.name} (${kid.age} anos) - Pai: ${parent?.name || 'N/A'} (${kid.parentId})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(checkUserData);
}

module.exports = { checkUserData }; 