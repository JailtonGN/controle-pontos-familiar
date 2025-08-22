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
async function ensureAllUsersHaveFamily() {
    try {
        console.log('🔍 Verificando se todos os usuários têm família...');
        
        // 1. Verificar todas as famílias
        const families = await Family.find({ isActive: true });
        console.log('\n🏠 Famílias encontradas:');
        families.forEach(family => {
            console.log(`   - ${family.name} (ID: ${family._id})`);
        });
        
        // 2. Encontrar usuários sem família
        const usersWithoutFamily = await User.find({ familyId: { $exists: false } });
        console.log(`\n⚠️ Usuários sem família: ${usersWithoutFamily.length}`);
        
        if (usersWithoutFamily.length > 0) {
            console.log('👥 Usuários que precisam de família:');
            usersWithoutFamily.forEach(user => {
                console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
            
            // 3. Associar usuários a famílias
            for (const user of usersWithoutFamily) {
                let familyToAssign = null;
                
                if (user.role === 'admin') {
                    // Admin vai para Família ADM
                    familyToAssign = families.find(f => f.name === 'Família ADM');
                    if (!familyToAssign) {
                        console.error('❌ Família ADM não encontrada para admin:', user.name);
                        continue;
                    }
                } else {
                    // Usuários normais vão para Família Azevedo
                    familyToAssign = families.find(f => f.name === 'Família Azevedo');
                    if (!familyToAssign) {
                        console.error('❌ Família Azevedo não encontrada para usuário:', user.name);
                        continue;
                    }
                }
                
                console.log(`🔄 Associando usuário ${user.name} à família ${familyToAssign.name}...`);
                user.familyId = familyToAssign._id;
                await user.save();
                console.log(`✅ Usuário ${user.name} associado à família ${familyToAssign.name}`);
            }
        }
        
        // 4. Verificar resultado final
        const allUsers = await User.find({}).populate('familyId', 'name');
        console.log('\n📊 Resultado final:');
        allUsers.forEach(user => {
            const familyName = user.familyId ? user.familyId.name : 'Sem família';
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Família: ${familyName}`);
        });
        
        const usersStillWithoutFamily = allUsers.filter(user => !user.familyId);
        if (usersStillWithoutFamily.length === 0) {
            console.log('\n✅ Todos os usuários estão corretamente associados a famílias!');
        } else {
            console.log(`\n⚠️ Ainda há ${usersStillWithoutFamily.length} usuários sem família!`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao garantir famílias:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(ensureAllUsersHaveFamily);
}

module.exports = { ensureAllUsersHaveFamily }; 