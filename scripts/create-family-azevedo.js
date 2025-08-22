const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Family = require('../models/Family');
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
async function createFamilyAzevedo() {
    try {
        console.log('🏠 Iniciando criação da Família Azevedo...');
        
        // 1. Primeiro, encontrar um usuário admin para ser o criador da família
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ Nenhum usuário admin encontrado para criar a família');
            return;
        }
        console.log('👑 Usuário admin encontrado para criar família:', adminUser.name);
        
        // 2. Criar a família Azevedo
        const familyData = {
            name: 'Família Azevedo',
            description: 'Família compartilhada para todos os usuários Azevedo',
            isActive: true,
            createdBy: adminUser._id
        };
        
        const family = new Family(familyData);
        await family.save();
        console.log('✅ Família Azevedo criada com sucesso:', family._id);
        
        // 3. Encontrar todos os usuários (exceto admin) para associar à família
        const users = await User.find({ role: { $ne: 'admin' } });
        console.log(`👥 Encontrados ${users.length} usuários para associar à família`);
        
        // 4. Associar usuários à família
        for (const user of users) {
            user.familyId = family._id;
            await user.save();
            console.log(`✅ Usuário ${user.name} (${user.email}) associado à família Azevedo`);
        }
        
        // 5. Encontrar todas as crianças criadas pelo usuário deejaymax2010@gmail.com
        const targetUser = await User.findOne({ email: 'deejaymax2010@gmail.com' });
        if (!targetUser) {
            console.log('⚠️ Usuário deejaymax2010@gmail.com não encontrado');
        } else {
            console.log('👤 Usuário alvo encontrado:', targetUser.name);
            
            // Encontrar todas as crianças criadas por este usuário
            const kids = await Kid.find({ parentId: targetUser._id });
            console.log(`👶 Encontradas ${kids.length} crianças criadas pelo usuário`);
            
            // Associar todas as crianças à família Azevedo
            for (const kid of kids) {
                kid.familyId = family._id;
                await kid.save();
                console.log(`✅ Criança ${kid.name} associada à família Azevedo`);
            }
            
            // 6. Encontrar todas as atividades criadas por este usuário
            const activities = await Activity.find({ parentId: targetUser._id });
            console.log(`🎯 Encontradas ${activities.length} atividades criadas pelo usuário`);
            
            // Associar todas as atividades à família Azevedo
            for (const activity of activities) {
                activity.familyId = family._id;
                await activity.save();
                console.log(`✅ Atividade ${activity.name} associada à família Azevedo`);
            }
        }
        
        console.log('\n🎉 Família Azevedo criada com sucesso!');
        console.log(`📊 Resumo:`);
        console.log(`   - Família ID: ${family._id}`);
        console.log(`   - Família Nome: ${family.name}`);
        console.log(`   - Criador: ${adminUser.name}`);
        console.log(`   - Usuários associados: ${users.length}`);
        
        const kidsCount = await Kid.countDocuments({ familyId: family._id });
        const activitiesCount = await Activity.countDocuments({ familyId: family._id });
        
        console.log(`   - Crianças associadas: ${kidsCount}`);
        console.log(`   - Atividades associadas: ${activitiesCount}`);
        
        if (users.length > 0) {
            console.log('\n👥 Usuários associados à família:');
            users.forEach(user => {
                console.log(`   - ${user.name} (${user.email})`);
            });
        }
        
        if (targetUser) {
            console.log('\n👶 Crianças do usuário deejatmax2010@gmail.com:');
            const kids = await Kid.find({ familyId: family._id });
            kids.forEach(kid => {
                console.log(`   - ${kid.name} (${kid.age} anos)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar família Azevedo:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(createFamilyAzevedo);
}

module.exports = { createFamilyAzevedo }; 