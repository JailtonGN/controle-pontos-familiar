const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const Family = require('../models/Family');

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
async function checkFamilyAssociation() {
    try {
        console.log('🔍 Verificando associações de família...');
        
        // Verificar todas as famílias
        const families = await Family.find({ isActive: true });
        console.log('\n🏠 Famílias encontradas:');
        families.forEach(family => {
            console.log(`   - ${family.name} (ID: ${family._id})`);
        });
        
        // Verificar todos os usuários
        const users = await User.find({});
        console.log('\n👥 Usuários encontrados:');
        users.forEach(user => {
            const familyInfo = user.familyId ? 
                families.find(f => f._id.toString() === user.familyId.toString())?.name || `ID: ${user.familyId}` : 
                'Sem família';
            console.log(`   - ${user.name} (${user.email}) - Família: ${familyInfo}`);
        });
        
        // Verificar usuários sem família
        const usersWithoutFamily = users.filter(user => !user.familyId);
        console.log(`\n⚠️ Usuários sem família: ${usersWithoutFamily.length}`);
        usersWithoutFamily.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
        });
        
        // Verificar usuários com família
        const usersWithFamily = users.filter(user => user.familyId);
        console.log(`\n✅ Usuários com família: ${usersWithFamily.length}`);
        usersWithFamily.forEach(user => {
            const family = families.find(f => f._id.toString() === user.familyId.toString());
            console.log(`   - ${user.name} (${user.email}) -> ${family ? family.name : `ID: ${user.familyId}`}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar associações:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(checkFamilyAssociation);
}

module.exports = { checkFamilyAssociation }; 