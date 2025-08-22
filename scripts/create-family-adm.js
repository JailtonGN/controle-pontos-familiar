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
async function createFamilyADM() {
    try {
        console.log('👑 Criando Família ADM...');
        
        // 1. Verificar se a família ADM já existe
        let admFamily = await Family.findOne({ name: 'Família ADM' });
        
        if (admFamily) {
            console.log('⚠️ Família ADM já existe:', admFamily._id);
        } else {
            // 2. Encontrar um usuário admin para criar a família
            const adminUser = await User.findOne({ role: 'admin' });
            
            if (!adminUser) {
                console.error('❌ Nenhum usuário admin encontrado para criar a família');
                return;
            }
            
            console.log(`👑 Usuário admin encontrado para criar família: ${adminUser.name}`);
            
            // 3. Criar a família ADM
            admFamily = new Family({
                name: 'Família ADM',
                description: 'Família para administradores do sistema',
                isActive: true,
                createdBy: adminUser._id
            });
            
            await admFamily.save();
            console.log(`✅ Família ADM criada com sucesso: ${admFamily._id}`);
        }
        
        // 4. Associar todos os usuários admin à família ADM
        const adminUsers = await User.find({ role: 'admin' });
        console.log(`\n👑 Encontrados ${adminUsers.length} usuários admin para associar:`);
        
        for (const adminUser of adminUsers) {
            if (!adminUser.familyId || adminUser.familyId.toString() !== admFamily._id.toString()) {
                console.log(`🔄 Associando admin ${adminUser.name} à família ADM...`);
                adminUser.familyId = admFamily._id;
                await adminUser.save();
                console.log(`✅ Admin ${adminUser.name} associado à família ADM`);
            } else {
                console.log(`✅ Admin ${adminUser.name} já está associado à família ADM`);
            }
        }
        
        // 5. Verificar resultado final
        const allUsers = await User.find({}).populate('familyId', 'name');
        console.log('\n📊 Resultado final:');
        allUsers.forEach(user => {
            const familyName = user.familyId ? user.familyId.name : 'Sem família';
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Família: ${familyName}`);
        });
        
        console.log('\n🎉 Família ADM criada e configurada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao criar família ADM:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(createFamilyADM);
}

module.exports = { createFamilyADM }; 