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
async function verifyFamilyRequirements() {
    try {
        console.log('🔍 Verificando requisitos de família...');
        
        // 1. Verificar todas as famílias
        const families = await Family.find({ isActive: true });
        console.log('\n🏠 Famílias encontradas:');
        families.forEach(family => {
            console.log(`   - ${family.name} (ID: ${family._id}) - Ativa: ${family.isActive}`);
        });
        
        // 2. Verificar todos os usuários
        const users = await User.find({}).populate('familyId', 'name isActive');
        console.log('\n👥 Usuários encontrados:');
        
        let usersWithoutFamily = 0;
        let usersWithInactiveFamily = 0;
        
        users.forEach(user => {
            const familyName = user.familyId ? user.familyId.name : 'Sem família';
            const familyActive = user.familyId ? user.familyId.isActive : false;
            
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Família: ${familyName} - Ativa: ${familyActive}`);
            
            if (!user.familyId) {
                usersWithoutFamily++;
            } else if (!familyActive) {
                usersWithInactiveFamily++;
            }
        });
        
        // 3. Resumo
        console.log('\n📊 Resumo:');
        console.log(`   - Total de usuários: ${users.length}`);
        console.log(`   - Usuários com família: ${users.length - usersWithoutFamily}`);
        console.log(`   - Usuários sem família: ${usersWithoutFamily}`);
        console.log(`   - Usuários com família inativa: ${usersWithInactiveFamily}`);
        
        if (usersWithoutFamily > 0) {
            console.log('\n⚠️ ATENÇÃO: Existem usuários sem família!');
        }
        
        if (usersWithInactiveFamily > 0) {
            console.log('\n⚠️ ATENÇÃO: Existem usuários com família inativa!');
        }
        
        if (usersWithoutFamily === 0 && usersWithInactiveFamily === 0) {
            console.log('\n✅ Todos os usuários estão corretamente associados a famílias ativas!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar requisitos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(verifyFamilyRequirements);
}

module.exports = { verifyFamilyRequirements }; 